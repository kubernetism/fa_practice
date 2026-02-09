import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users, tenants, platformAdmins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        })

        if (!user || !user.isActive || !user.password) return null

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        // Check tenant status
        const tenant = await db.query.tenants.findFirst({
          where: eq(tenants.id, user.tenantId),
        })

        if (!tenant) return null
        if (tenant.subscriptionStatus === 'cancelled') return null

        // Update last login
        await db
          .update(users)
          .set({ lastLogin: new Date() })
          .where(eq(users.id, user.id))

        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          tenantId: user.tenantId,
          role: user.role,
          branchId: user.branchId,
          permissions: user.permissions as string[],
          subscriptionStatus: tenant.subscriptionStatus,
          trialEndsAt: tenant.trialEndsAt?.toISOString() ?? null,
        }
      },
    }),
    Credentials({
      id: 'platform-credentials',
      name: 'Platform Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const admin = await db.query.platformAdmins.findFirst({
          where: eq(platformAdmins.email, email),
        })

        if (!admin || !admin.isActive) return null

        const passwordMatch = await bcrypt.compare(password, admin.password)
        if (!passwordMatch) return null

        await db
          .update(platformAdmins)
          .set({ lastLogin: new Date() })
          .where(eq(platformAdmins.id, admin.id))

        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.fullName,
          isPlatformAdmin: true,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const email = user.email!

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        })

        if (existingUser) {
          // Existing user — check tenant status
          const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, existingUser.tenantId),
          })
          if (!tenant || tenant.subscriptionStatus === 'cancelled') return false
          if (!existingUser.isActive) return false

          // Update last login and image
          await db
            .update(users)
            .set({ lastLogin: new Date(), image: user.image ?? null })
            .where(eq(users.id, existingUser.id))

          return true
        }

        // New Google user — auto-provision tenant + admin user
        const name = user.name || email.split('@')[0]
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 15)

        const [tenant] = await db
          .insert(tenants)
          .values({
            name: `${name}'s Business`,
            slug: `${slug}-${Date.now()}`,
            subscriptionStatus: 'trial',
            subscriptionPlan: 'basic',
            trialEndsAt,
          })
          .returning()

        await db.insert(users).values({
          tenantId: tenant.id,
          username: email.split('@')[0],
          email,
          fullName: name,
          image: user.image ?? null,
          provider: 'google',
          role: 'admin',
          permissions: ['*'],
          isActive: true,
        })
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'platform-credentials') {
        // Platform admin provider
        token.isPlatformAdmin = true
        token.tenantId = 0
        token.role = 'admin'
        token.branchId = null
        token.permissions = ['*']
        token.subscriptionStatus = 'active'
        token.trialEndsAt = null
      } else if (user && account?.provider === 'credentials') {
        // Credentials provider — data already set from authorize()
        token.tenantId = (user as any).tenantId
        token.role = (user as any).role
        token.branchId = (user as any).branchId
        token.permissions = (user as any).permissions
        token.subscriptionStatus = (user as any).subscriptionStatus
        token.trialEndsAt = (user as any).trialEndsAt
      } else if (account?.provider === 'google') {
        // Google provider — fetch user data from DB
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, token.email!),
        })
        if (dbUser) {
          token.sub = String(dbUser.id)
          token.tenantId = dbUser.tenantId
          token.role = dbUser.role
          token.branchId = dbUser.branchId
          token.permissions = dbUser.permissions as string[]
          token.picture = dbUser.image

          const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, dbUser.tenantId),
          })
          token.subscriptionStatus = tenant?.subscriptionStatus ?? 'trial'
          token.trialEndsAt = tenant?.trialEndsAt?.toISOString() ?? null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        ;(session as any).tenantId = token.tenantId
        ;(session as any).role = token.role
        ;(session as any).branchId = token.branchId
        ;(session as any).permissions = token.permissions
        ;(session as any).subscriptionStatus = token.subscriptionStatus
        ;(session as any).trialEndsAt = token.trialEndsAt
        ;(session as any).isPlatformAdmin = token.isPlatformAdmin ?? false
        ;(session as any).isImpersonating = token.isImpersonating ?? false
        ;(session as any).impersonatedTenantName = token.impersonatedTenantName ?? null
      }
      return session
    },
  },
})
