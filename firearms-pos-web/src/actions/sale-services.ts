'use server'

import { db } from '@/lib/db'
import { saleServices, services, sales } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getSaleServices(saleId: number) {
  const data = await db
    .select({
      saleService: saleServices,
      serviceCode: services.code,
    })
    .from(saleServices)
    .leftJoin(services, eq(saleServices.serviceId, services.id))
    .where(eq(saleServices.saleId, saleId))

  return { success: true, data }
}

export async function addServiceToSale(input: {
  saleId: number
  serviceId: number
  quantity?: number
  hours?: number
  notes?: string
}) {
  const tenantId = await getTenantId()

  // Get service details
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.tenantId, tenantId)))

  if (!service) return { success: false, message: 'Service not found' }

  const quantity = input.quantity ?? 1
  const unitPrice = Number(service.price)
  let totalBeforeTax: number

  if (service.pricingType === 'hourly' && input.hours) {
    totalBeforeTax = unitPrice * input.hours
  } else {
    totalBeforeTax = unitPrice * quantity
  }

  const taxAmount = service.isTaxable ? totalBeforeTax * (Number(service.taxRate) / 100) : 0
  const totalAmount = totalBeforeTax + taxAmount

  const [saleService] = await db
    .insert(saleServices)
    .values({
      saleId: input.saleId,
      serviceId: input.serviceId,
      serviceName: service.name,
      quantity,
      unitPrice: String(unitPrice),
      hours: input.hours ? String(input.hours) : null,
      taxRate: service.taxRate,
      taxAmount: String(taxAmount),
      totalAmount: String(totalAmount),
      notes: input.notes || null,
    })
    .returning()

  return { success: true, data: saleService }
}

export async function removeServiceFromSale(saleServiceId: number) {
  await db
    .delete(saleServices)
    .where(eq(saleServices.id, saleServiceId))

  return { success: true }
}

export async function getServiceRevenue(dateFrom?: string, dateTo?: string) {
  const tenantId = await getTenantId()

  const conditions: any[] = [eq(sales.tenantId, tenantId)]
  if (dateFrom && dateTo) {
    conditions.push(sql`${sales.saleDate} BETWEEN ${new Date(dateFrom)} AND ${new Date(dateTo)}`)
  }

  const data = await db
    .select({
      serviceId: saleServices.serviceId,
      serviceName: saleServices.serviceName,
      totalQuantity: sql<number>`SUM(${saleServices.quantity})`,
      totalRevenue: sql<string>`SUM(${saleServices.totalAmount})`,
      totalTax: sql<string>`SUM(${saleServices.taxAmount})`,
    })
    .from(saleServices)
    .innerJoin(sales, eq(saleServices.saleId, sales.id))
    .where(and(...conditions))
    .groupBy(saleServices.serviceId, saleServices.serviceName)
    .orderBy(sql`SUM(${saleServices.totalAmount}) DESC`)

  return { success: true, data }
}
