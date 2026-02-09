'use server'

import { db } from '@/lib/db'
import { users, branches } from '@/lib/db/schema'
import { eq, and, count, ilike, or, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getUsers(params?: {
  search?: string
  role?: string
  isActive?: boolean
  branchId?: number
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(users.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(users.fullName, `%${params.search}%`),
        ilike(users.email, `%${params.search}%`),
        ilike(users.username, `%${params.search}%`)
      )!
    )
  }
  if (params?.role && params.role !== 'all') {
    conditions.push(eq(users.role, params.role as any))
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(users.isActive, params.isActive))
  }
  if (params?.branchId) {
    conditions.push(eq(users.branchId, params.branchId))
  }

  const data = await db
    .select({
      user: users,
      branchName: branches.name,
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .where(and(...conditions))
    .orderBy(users.fullName)

  return { success: true, data }
}

export async function getUsersSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalUsers: count(),
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${users.isActive} = true)`,
      adminCount: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'admin')`,
      managerCount: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'manager')`,
      cashierCount: sql<number>`COUNT(*) FILTER (WHERE ${users.role} = 'cashier')`,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getUserById(id: number) {
  const tenantId = await getTenantId()

  const [user] = await db
    .select({
      user: users,
      branchName: branches.name,
    })
    .from(users)
    .leftJoin(branches, eq(users.branchId, branches.id))
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))

  if (!user) return { success: false, message: 'User not found' }
  return { success: true, data: user }
}

export async function createUser(input: {
  username: string
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'admin' | 'manager' | 'cashier'
  permissions?: string[]
  branchId?: number
}) {
  const tenantId = await getTenantId()

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.email, input.email)))

  if (existing.length > 0) {
    return { success: false, message: 'Email already exists' }
  }

  const hashed = await bcrypt.hash(input.password, 10)

  const [user] = await db
    .insert(users)
    .values({
      tenantId,
      username: input.username,
      email: input.email,
      password: hashed,
      fullName: input.fullName,
      phone: input.phone || null,
      role: input.role,
      permissions: input.permissions ?? [],
      branchId: input.branchId || null,
      isActive: true,
    })
    .returning()

  return { success: true, data: user }
}

export async function updateUser(
  id: number,
  input: {
    fullName?: string
    phone?: string
    role?: 'admin' | 'manager' | 'cashier'
    permissions?: string[]
    branchId?: number | null
    isActive?: boolean
    password?: string
  }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (input.fullName !== undefined) updateData.fullName = input.fullName
  if (input.phone !== undefined) updateData.phone = input.phone
  if (input.role !== undefined) updateData.role = input.role
  if (input.permissions !== undefined) updateData.permissions = input.permissions
  if (input.branchId !== undefined) updateData.branchId = input.branchId
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.password) {
    updateData.password = await bcrypt.hash(input.password, 10)
  }

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))
    .returning()

  if (!user) return { success: false, message: 'User not found' }
  return { success: true, data: user }
}

export async function deleteUser(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(users.id, id), eq(users.tenantId, tenantId)))

  return { success: true }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth()
  const userId = Number(session?.user?.id)
  const tenantId = await getTenantId()

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))

  if (!user) return { success: false, message: 'User not found' }

  const isValid = await bcrypt.compare(currentPassword, user.password!)
  if (!isValid) return { success: false, message: 'Current password is incorrect' }

  const hashed = await bcrypt.hash(newPassword, 10)
  await db
    .update(users)
    .set({ password: hashed, updatedAt: new Date() })
    .where(eq(users.id, userId))

  return { success: true }
}

export async function updatePermissions(userId: number, permissions: string[]) {
  const tenantId = await getTenantId()

  const [user] = await db
    .update(users)
    .set({ permissions, updatedAt: new Date() })
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))
    .returning()

  if (!user) return { success: false, message: 'User not found' }

  return { success: true, data: user }
}

export async function checkPermission(permission: string): Promise<boolean> {
  const session = await auth()
  const userId = Number(session?.user?.id)
  const tenantId = (session as any)?.tenantId
  if (!tenantId) return false

  const [user] = await db
    .select({ role: users.role, permissions: users.permissions })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.tenantId, tenantId)))

  if (!user) return false
  if (user.role === 'admin') return true

  const perms = (user.permissions as string[]) || []
  return perms.includes(permission)
}
