'use server'

import { db } from '@/lib/db'
import { branches, users } from '@/lib/db/schema'
import { eq, and, count, ilike, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getBranches(params?: { search?: string; isActive?: boolean }) {
  const tenantId = await getTenantId()

  const conditions = [eq(branches.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(branches.name, `%${params.search}%`),
        ilike(branches.code, `%${params.search}%`)
      )!
    )
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(branches.isActive, params.isActive))
  }

  const data = await db
    .select({
      branch: branches,
      userCount: count(users.id),
    })
    .from(branches)
    .leftJoin(users, and(eq(users.branchId, branches.id), eq(users.isActive, true)))
    .where(and(...conditions))
    .groupBy(branches.id)
    .orderBy(branches.name)

  return { success: true, data }
}

export async function getBranchById(id: number) {
  const tenantId = await getTenantId()

  const [branch] = await db
    .select()
    .from(branches)
    .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)))

  if (!branch) return { success: false, message: 'Branch not found' }
  return { success: true, data: branch }
}

export async function createBranch(input: {
  name: string
  code: string
  address?: string
  phone?: string
  email?: string
  licenseNumber?: string
  isMain?: boolean
}) {
  const tenantId = await getTenantId()

  const existing = await db
    .select({ id: branches.id })
    .from(branches)
    .where(and(eq(branches.tenantId, tenantId), eq(branches.code, input.code)))

  if (existing.length > 0) {
    return { success: false, message: 'Branch code already exists' }
  }

  const [branch] = await db
    .insert(branches)
    .values({
      tenantId,
      name: input.name,
      code: input.code,
      address: input.address || null,
      phone: input.phone || null,
      email: input.email || null,
      licenseNumber: input.licenseNumber || null,
      isMain: input.isMain ?? false,
    })
    .returning()

  return { success: true, data: branch }
}

export async function updateBranch(
  id: number,
  input: {
    name?: string
    address?: string
    phone?: string
    email?: string
    licenseNumber?: string
    isActive?: boolean
    isMain?: boolean
  }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.address !== undefined) updateData.address = input.address
  if (input.phone !== undefined) updateData.phone = input.phone
  if (input.email !== undefined) updateData.email = input.email
  if (input.licenseNumber !== undefined) updateData.licenseNumber = input.licenseNumber
  if (input.isActive !== undefined) updateData.isActive = input.isActive
  if (input.isMain !== undefined) updateData.isMain = input.isMain

  const [branch] = await db
    .update(branches)
    .set(updateData)
    .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)))
    .returning()

  if (!branch) return { success: false, message: 'Branch not found' }
  return { success: true, data: branch }
}

export async function getActiveBranches() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: branches.id,
      name: branches.name,
      code: branches.code,
      isMain: branches.isMain,
    })
    .from(branches)
    .where(and(eq(branches.tenantId, tenantId), eq(branches.isActive, true)))
    .orderBy(branches.name)

  return { success: true, data }
}

export async function deleteBranch(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(branches)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(branches.id, id), eq(branches.tenantId, tenantId)))

  return { success: true }
}
