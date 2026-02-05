'use server'

import { db } from '@/lib/db'
import { users, tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function signupAction(data: {
  businessName: string
  fullName: string
  email: string
  password: string
}) {
  // Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  })

  if (existingUser) {
    return { success: false, message: 'Email already in use' }
  }

  // Create tenant
  const slug = data.businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const trialEndsAt = new Date()
  trialEndsAt.setDate(trialEndsAt.getDate() + 14)

  const [tenant] = await db
    .insert(tenants)
    .values({
      name: data.businessName,
      slug: `${slug}-${Date.now()}`,
      subscriptionStatus: 'trial',
      subscriptionPlan: 'basic',
      trialEndsAt,
    })
    .returning()

  // Hash password and create admin user
  const hashedPassword = await bcrypt.hash(data.password, 12)

  await db.insert(users).values({
    tenantId: tenant.id,
    username: data.email.split('@')[0],
    email: data.email,
    password: hashedPassword,
    fullName: data.fullName,
    role: 'admin',
    permissions: ['*'],
    isActive: true,
  })

  return { success: true }
}
