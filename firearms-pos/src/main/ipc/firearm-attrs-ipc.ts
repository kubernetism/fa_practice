import { ipcMain } from 'electron'
import { eq, asc, and, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  firearmModels,
  firearmCalibers,
  firearmShapes,
  firearmDesigns,
  type NewFirearmModel,
  type NewFirearmCaliber,
  type NewFirearmShape,
  type NewFirearmDesign,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export type FirearmLookupKind = 'models' | 'calibers' | 'shapes' | 'designs'
type LookupInsert = NewFirearmModel | NewFirearmCaliber | NewFirearmShape | NewFirearmDesign

function tableFor(kind: FirearmLookupKind) {
  switch (kind) {
    case 'models':
      return firearmModels
    case 'calibers':
      return firearmCalibers
    case 'shapes':
      return firearmShapes
    case 'designs':
      return firearmDesigns
  }
}

function entityTypeFor(kind: FirearmLookupKind): string {
  return `firearm_${kind.slice(0, -1)}`
}

export async function createHandler(kind: FirearmLookupKind, data: Partial<LookupInsert>) {
  const db = getDatabase()
  const table = tableFor(kind)
  const session = getCurrentSession()
  const name = (data.name ?? '').trim()
  if (!name) return { success: false, message: 'Name is required' }

  const existing = await db
    .select()
    .from(table)
    .where(sql`lower(${table.name}) = lower(${name})`)
    .limit(1)
  if (existing.length > 0) {
    return { success: false, message: `${kind.slice(0, -1)} "${name}" already exists` }
  }

  const inserted = await db
    .insert(table)
    .values({ name, sortOrder: data.sortOrder ?? 0, isActive: true })
    .returning()
  const row = inserted[0]

  await createAuditLog({
    userId: session?.userId,
    branchId: session?.branchId,
    action: 'create',
    entityType: entityTypeFor(kind),
    entityId: row.id,
    newValues: sanitizeForAudit(row as unknown as Record<string, unknown>),
    description: `Created ${kind.slice(0, -1)}: ${name}`,
  })

  return { success: true, data: row }
}

export async function listHandler(
  kind: FirearmLookupKind,
  opts: { activeOnly?: boolean } = {},
) {
  const db = getDatabase()
  const table = tableFor(kind)
  const rows = await db
    .select()
    .from(table)
    .where(opts.activeOnly ? eq(table.isActive, true) : undefined)
    .orderBy(asc(table.sortOrder), asc(table.name))
  return { success: true, data: rows }
}

export async function updateHandler(
  kind: FirearmLookupKind,
  id: number,
  data: Partial<LookupInsert>,
) {
  const db = getDatabase()
  const table = tableFor(kind)
  const session = getCurrentSession()
  const existing = await db.select().from(table).where(eq(table.id, id)).limit(1)
  if (existing.length === 0) return { success: false, message: `${kind.slice(0, -1)} not found` }

  const next: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (data.name !== undefined) {
    const name = data.name.trim()
    const dup = await db
      .select()
      .from(table)
      .where(and(sql`lower(${table.name}) = lower(${name})`, sql`${table.id} != ${id}`))
      .limit(1)
    if (dup.length > 0) return { success: false, message: `Name "${name}" already in use` }
    next.name = name
  }
  if (data.sortOrder !== undefined) next.sortOrder = data.sortOrder
  if ('isActive' in data) next.isActive = (data as { isActive: boolean }).isActive

  const updated = await db.update(table).set(next).where(eq(table.id, id)).returning()

  await createAuditLog({
    userId: session?.userId,
    branchId: session?.branchId,
    action: 'update',
    entityType: entityTypeFor(kind),
    entityId: id,
    oldValues: sanitizeForAudit(existing[0] as unknown as Record<string, unknown>),
    newValues: sanitizeForAudit(next),
    description: `Updated ${kind.slice(0, -1)} id=${id}`,
  })

  return { success: true, data: updated[0] }
}

export async function deactivateHandler(kind: FirearmLookupKind, id: number) {
  return updateHandler(kind, id, { isActive: false } as Partial<LookupInsert>)
}

export function registerFirearmAttrsHandlers(): void {
  const kinds: FirearmLookupKind[] = ['models', 'calibers', 'shapes', 'designs']
  for (const kind of kinds) {
    ipcMain.handle(
      `firearm-attrs:${kind}:list`,
      async (_e, opts?: { activeOnly?: boolean }) => {
        try {
          return await listHandler(kind, opts ?? {})
        } catch (err) {
          console.error(`firearm-attrs:${kind}:list error`, err)
          return { success: false, message: 'Failed to list records' }
        }
      },
    )
    ipcMain.handle(
      `firearm-attrs:${kind}:create`,
      async (_e, data: Partial<LookupInsert>) => {
        try {
          return await createHandler(kind, data)
        } catch (err) {
          console.error(`firearm-attrs:${kind}:create error`, err)
          return { success: false, message: 'Failed to create record' }
        }
      },
    )
    ipcMain.handle(
      `firearm-attrs:${kind}:update`,
      async (_e, id: number, data: Partial<LookupInsert>) => {
        try {
          return await updateHandler(kind, id, data)
        } catch (err) {
          console.error(`firearm-attrs:${kind}:update error`, err)
          return { success: false, message: 'Failed to update record' }
        }
      },
    )
    ipcMain.handle(`firearm-attrs:${kind}:deactivate`, async (_e, id: number) => {
      try {
        return await deactivateHandler(kind, id)
      } catch (err) {
        console.error(`firearm-attrs:${kind}:deactivate error`, err)
        return { success: false, message: 'Failed to deactivate record' }
      }
    })
  }
}
