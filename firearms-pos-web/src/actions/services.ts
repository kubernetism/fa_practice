'use server'

import { db } from '@/lib/db'
import { services, serviceCategories } from '@/lib/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

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

  const [service] = await db
    .insert(services)
    .values({
      tenantId,
      code: data.code,
      name: data.name,
      description: data.description || null,
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

export async function deleteService(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(services)
    .where(and(eq(services.id, id), eq(services.tenantId, tenantId)))

  return { success: true }
}
