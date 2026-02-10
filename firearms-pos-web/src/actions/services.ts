'use server'

import { db } from '@/lib/db'
import { services, serviceCategories } from '@/lib/db/schema'
import { eq, and, desc, count, ilike, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { sanitizeInput } from '@/lib/validation/sanitize'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getServices(filters?: { categoryId?: number; active?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(services.tenantId, tenantId)]
  if (filters?.categoryId) {
    conditions.push(eq(services.categoryId, filters.categoryId))
  }
  if (filters?.active === 'active') {
    conditions.push(eq(services.isActive, true))
  } else if (filters?.active === 'inactive') {
    conditions.push(eq(services.isActive, false))
  }

  const data = await db
    .select({
      service: services,
      categoryName: serviceCategories.name,
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(and(...conditions))
    .orderBy(services.code)

  return { success: true, data }
}

export async function getServiceCategories() {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.tenantId, tenantId))
    .orderBy(serviceCategories.name)

  return { success: true, data }
}

export async function createServiceCategory(data: { name: string; description?: string }) {
  const tenantId = await getTenantId()

  const [category] = await db
    .insert(serviceCategories)
    .values({
      tenantId,
      name: data.name,
      description: data.description || null,
    })
    .returning()

  return { success: true, data: category }
}

export async function createService(data: {
  code: string
  name: string
  description?: string
  categoryId?: number
  price: string
  pricingType: string
  estimatedDuration?: number
  isTaxable: boolean
  taxRate?: string
}) {
  const tenantId = await getTenantId()

  const clean = sanitizeInput(data)

  const [service] = await db
    .insert(services)
    .values({
      tenantId,
      code: clean.code,
      name: clean.name,
      description: clean.description || null,
      categoryId: data.categoryId || null,
      price: data.price,
      pricingType: data.pricingType as any,
      estimatedDuration: data.estimatedDuration || 60,
      isTaxable: data.isTaxable,
      taxRate: data.taxRate || '0',
    })
    .returning()

  return { success: true, data: service }
}

export async function updateService(
  id: number,
  data: {
    name?: string
    description?: string
    categoryId?: number
    price?: string
    pricingType?: string
    estimatedDuration?: number
    isTaxable?: boolean
    taxRate?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const [service] = await db
    .update(services)
    .set({
      ...data,
      pricingType: data.pricingType as any,
      updatedAt: new Date(),
    })
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))
    .returning()

  if (!service) return { success: false, message: 'Service not found' }

  return { success: true, data: service }
}

export async function getActiveServices() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      service: services,
      categoryName: serviceCategories.name,
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(and(eq(services.tenantId, tenantId), eq(services.isActive, true)))
    .orderBy(services.name)

  return { success: true, data }
}

export async function getServiceById(id: number) {
  const tenantId = await getTenantId()

  const [service] = await db
    .select({
      service: services,
      categoryName: serviceCategories.name,
    })
    .from(services)
    .leftJoin(serviceCategories, eq(services.categoryId, serviceCategories.id))
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))

  if (!service) return { success: false, message: 'Service not found' }
  return { success: true, data: service }
}

export async function getServiceByCode(code: string) {
  const tenantId = await getTenantId()

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.tenantId, tenantId), eq(services.code, code)))

  if (!service) return { success: false, message: 'Service not found' }
  return { success: true, data: service }
}

export async function searchServices(query: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(services)
    .where(
      and(
        eq(services.tenantId, tenantId),
        eq(services.isActive, true),
        or(
          ilike(services.name, `%${query}%`),
          ilike(services.code, `%${query}%`)
        )
      )
    )
    .limit(20)

  return { success: true, data }
}

export async function deleteServiceCategory(id: number) {
  const tenantId = await getTenantId()

  // Check if category has services
  const serviceCount = await db
    .select({ count: count() })
    .from(services)
    .where(and(eq(services.tenantId, tenantId), eq(services.categoryId, id)))

  if (Number(serviceCount[0].count) > 0) {
    return { success: false, message: 'Cannot delete category with associated services' }
  }

  await db
    .delete(serviceCategories)
    .where(and(eq(serviceCategories.id, id), eq(serviceCategories.tenantId, tenantId)))

  return { success: true }
}

export async function getActiveServiceCategories() {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(serviceCategories)
    .where(and(eq(serviceCategories.tenantId, tenantId), eq(serviceCategories.isActive, true)))
    .orderBy(serviceCategories.name)

  return { success: true, data }
}

export async function deleteService(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))

  return { success: true }
}
