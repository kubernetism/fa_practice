'use server'

import { db } from '@/lib/db'
import { referralPersons } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getReferralPersons() {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(referralPersons)
    .where(eq(referralPersons.tenantId, tenantId))
    .orderBy(desc(referralPersons.createdAt))

  return { success: true, data }
}

export async function createReferralPerson(data: {
  branchId: number
  name: string
  contact?: string
  address?: string
  notes?: string
  commissionRate?: string
}) {
  const tenantId = await getTenantId()

  const [person] = await db
    .insert(referralPersons)
    .values({
      tenantId,
      branchId: data.branchId,
      name: data.name,
      contact: data.contact || null,
      address: data.address || null,
      notes: data.notes || null,
      commissionRate: data.commissionRate || null,
    })
    .returning()

  return { success: true, data: person }
}

export async function updateReferralPerson(
  id: number,
  data: {
    name?: string
    contact?: string
    address?: string
    notes?: string
    commissionRate?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const updateData: Record<string, any> = { updatedAt: new Date() }
  if (data.name !== undefined) updateData.name = data.name
  if (data.contact !== undefined) updateData.contact = data.contact
  if (data.address !== undefined) updateData.address = data.address
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  await db
    .update(referralPersons)
    .set(updateData)
    .where(and(eq(referralPersons.id, id), eq(referralPersons.tenantId, tenantId)))

  return { success: true }
}

export async function deleteReferralPerson(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(referralPersons)
    .where(and(eq(referralPersons.id, id), eq(referralPersons.tenantId, tenantId)))

  return { success: true }
}
