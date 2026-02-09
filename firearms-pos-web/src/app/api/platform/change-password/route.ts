import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { platformAdmins } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

export async function POST(request: Request) {
  try {
    const session = await getPlatformAdmin()
    const { currentPassword, newPassword } = await request.json()

    const admin = await db.query.platformAdmins.findFirst({
      where: eq(platformAdmins.email, session.user.email),
    })

    if (!admin) {
      return NextResponse.json({ success: false, message: 'Admin not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(currentPassword, admin.password)
    if (!valid) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await db
      .update(platformAdmins)
      .set({ password: hashed, updatedAt: new Date() })
      .where(eq(platformAdmins.id, admin.id))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
