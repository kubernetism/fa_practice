import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { platformAdmins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

export async function POST(request: Request) {
  try {
    await getPlatformAdmin()
    const { email, fullName, password } = await request.json()

    const existing = await db.query.platformAdmins.findFirst({
      where: eq(platformAdmins.email, email),
    })

    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already exists' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await db.insert(platformAdmins).values({
      email,
      fullName,
      password: hashed,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
