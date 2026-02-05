import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { businessName, fullName, email, password } = data

    if (!businessName || !fullName || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 409 }
      )
    }

    // Create tenant
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const [tenant] = await db
      .insert(tenants)
      .values({
        name: businessName,
        slug: `${slug}-${Date.now()}`,
        subscriptionStatus: 'trial',
        subscriptionPlan: 'basic',
        trialEndsAt,
      })
      .returning()

    // Hash password and create admin user
    const hashedPassword = await bcrypt.hash(password, 12)

    await db.insert(users).values({
      tenantId: tenant.id,
      username: email.split('@')[0],
      email,
      password: hashedPassword,
      fullName,
      role: 'admin',
      permissions: ['*'],
      isActive: true,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
