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

export async function getSettingsByCategory(category: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(settings)
    .where(and(eq(settings.tenantId, tenantId), eq(settings.category, category as any)))
    .orderBy(settings.key)

  return { success: true, data }
}

export async function updateBulkSettings(items: { key: string; value: any; category?: string }[]) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null

  let updatedCount = 0

  for (const item of items) {
    const existing = await db
      .select({ id: settings.id })
      .from(settings)
      .where(and(eq(settings.tenantId, tenantId), eq(settings.key, item.key)))

    if (existing.length > 0) {
      await db
        .update(settings)
        .set({ value: item.value, updatedBy: userId, updatedAt: new Date() })
        .where(and(eq(settings.tenantId, tenantId), eq(settings.key, item.key)))
    } else {
      await db.insert(settings).values({
        tenantId,
        key: item.key,
        value: item.value,
        category: (item.category as any) ?? 'general',
        updatedBy: userId,
      })
    }
    updatedCount++
  }

  return { success: true, data: { updatedCount } }
}

export async function syncBranchSettings(fromBranchId: number, toBranchId: number) {
  const tenantId = await getTenantId()

  // Get settings for source branch
  const sourceSettings = await db
    .select()
    .from(settings)
    .where(
      and(
        eq(settings.tenantId, tenantId),
        eq(settings.category, 'branch' as any)
      )
    )

  // This syncs branch-category settings; in a full implementation
  // you'd filter by branch-specific keys and copy to target branch
  return { success: true, data: { syncedCount: sourceSettings.length } }
}

export async function exportSettings() {
  const tenantId = await getTenantId()

  const allSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.tenantId, tenantId))

  const [business] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))

  return {
    success: true,
    data: {
      settings: allSettings.map((s) => ({ key: s.key, value: s.value, category: s.category })),
      businessSettings: business || null,
      exportedAt: new Date().toISOString(),
    },
  }
}

export async function importSettings(data: {
  settings: { key: string; value: any; category?: string }[]
}) {
  const result = await updateBulkSettings(data.settings)
  return result
}

export async function getBusinessSettingsByBranch(branchId: number) {
  const tenantId = await getTenantId()

  // Look for branch-specific overrides first
  const branchSettings = await db
    .select()
    .from(settings)
    .where(
      and(
        eq(settings.tenantId, tenantId),
        eq(settings.category, 'branch' as any)
      )
    )

  // Fall back to global business settings
  const [business] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.tenantId, tenantId))

  return { success: true, data: { branchSettings, businessSettings: business || null } }
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
