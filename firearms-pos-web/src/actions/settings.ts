'use server'

import { db } from '@/lib/db'
import { settings, businessSettings } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getSettings(category?: string) {
  const tenantId = await getTenantId()

  const conditions = [eq(settings.tenantId, tenantId)]
  if (category) {
    conditions.push(eq(settings.category, category as any))
  }

  const data = await db
    .select()
    .from(settings)
    .where(and(...conditions))
    .orderBy(settings.key)

  return { success: true, data }
}

export async function getSetting(key: string) {
  const tenantId = await getTenantId()

  const [setting] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.tenantId, tenantId), eq(settings.key, key)))

  return { success: true, data: setting ?? null }
}

export async function upsertSetting(input: {
  key: string
  value: any
  category?: string
  description?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null

  const existing = await db
    .select({ id: settings.id })
    .from(settings)
    .where(and(eq(settings.tenantId, tenantId), eq(settings.key, input.key)))

  if (existing.length > 0) {
    const [updated] = await db
      .update(settings)
      .set({
        value: input.value,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(eq(settings.tenantId, tenantId), eq(settings.key, input.key)))
      .returning()
    return { success: true, data: updated }
  }

  const [created] = await db
    .insert(settings)
    .values({
      tenantId,
      key: input.key,
      value: input.value,
      category: (input.category as any) ?? 'general',
      description: input.description || null,
      updatedBy: userId,
    })
    .returning()

  return { success: true, data: created }
}

export async function getBusinessSettings() {
  const tenantId = await getTenantId()

  const [data] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))

  return { success: true, data: data ?? null }
}

export async function updateBusinessSettings(input: Record<string, any>) {
  const tenantId = await getTenantId()

  const existing = await db
    .select({ settingId: businessSettings.settingId })
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))

  if (existing.length > 0) {
    const [updated] = await db
      .update(businessSettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(businessSettings.tenantId, tenantId))
      .returning()
    return { success: true, data: updated }
  }

  const [created] = await db
    .insert(businessSettings)
    .values({
      tenantId,
      businessName: input.businessName || 'My Business',
      ...input,
    })
    .returning()

  return { success: true, data: created }
}
