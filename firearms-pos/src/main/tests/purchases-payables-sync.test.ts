/**
 * Purchases ↔ Account Payables sync — atomicity, orphan heal, reconcile.
 * Spec: docs/superpowers/specs/2026-04-19-purchases-payables-sync-design.md
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import { setupTestDatabase, teardownTestDatabase, getTestDb, getTestSqlite } from './test-db'

vi.mock('../db/index', () => ({
  getDatabase: () => getTestDb(),
  getRawDatabase: () => getTestSqlite(),
  getDbPath: () => ':memory:',
}))
vi.mock('../utils/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  sanitizeForAudit: (v: unknown) => v,
}))
vi.mock('../utils/gl-posting', () => ({
  postAPPaymentToGL: vi.fn().mockResolvedValue(undefined),
  postPurchaseReceiveToGL: vi.fn().mockResolvedValue(undefined),
  ACCOUNT_CODES: {},
}))
vi.mock('../ipc/auth-ipc', () => ({
  getCurrentSession: () => ({ userId: 1, role: 'admin', branchId: 1 }),
}))
vi.mock('electron', () => {
  const handlers = new Map<string, Function>()
  return {
    ipcMain: {
      handle: (ch: string, fn: Function) => handlers.set(ch, fn),
      _invokeHandlers: handlers,
    },
  }
})

import { accountPayables, payablePayments, purchases, branches, suppliers, users, expenses } from '../db/schema'
import { recordPayableSubmission } from '../utils/payable-payment'
import { withTransaction } from '../utils/db-transaction'

beforeAll(async () => { await setupTestDatabase() })
afterAll(async () => { await teardownTestDatabase() })

async function seedBasicFixtures() {
  const db = getTestDb()
  await db.insert(users).values({ id: 1, username: 'admin', password: 'x', email: 'a@a', fullName: 'A', role: 'admin' })
  await db.insert(branches).values({ id: 1, name: 'Main', code: 'MAIN' })
  await db.insert(suppliers).values({ id: 1, name: 'Sup', contactPerson: null, phone: null, email: null, address: null })
}

describe('recordPayableSubmission helper', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('records a partial payment: updates AP aggregates and returns newStatus=partial', async () => {
    const db = getTestDb()
    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, branchId: 1, invoiceNumber: 'INV-1',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    }).returning()

    const result = await withTransaction(async ({ db: txDb }) => {
      const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
      return recordPayableSubmission(
        txDb,
        fresh!,
        { payableId: payable.id, amount: 40, paymentMethod: 'bank_transfer' },
        { userId: 1, branchId: 1 },
        null
      )
    })

    expect(result.newPaidAmount).toBe(40)
    expect(result.newRemainingAmount).toBe(60)
    expect(result.newStatus).toBe('partial')

    const reread = await db.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
    expect(reread?.paidAmount).toBe(40)
    expect(reread?.remainingAmount).toBe(60)
    expect(reread?.status).toBe('partial')

    const payments = await db.query.payablePayments.findMany({ where: eq(payablePayments.payableId, payable.id) })
    expect(payments).toHaveLength(1)
    expect(payments[0].amount).toBe(40)
  })

  it('rejects when amount exceeds remaining', async () => {
    const db = getTestDb()
    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, branchId: 1, invoiceNumber: 'INV-REJ',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    }).returning()

    await expect(
      withTransaction(async ({ db: txDb }) => {
        const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
        return recordPayableSubmission(
          txDb, fresh!,
          { payableId: payable.id, amount: 150, paymentMethod: 'bank_transfer' },
          { userId: 1, branchId: 1 }, null
        )
      })
    ).rejects.toThrow(/cannot exceed remaining/i)

    const reread = await db.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
    expect(reread?.paidAmount).toBe(0)
    expect(reread?.status).toBe('pending')
  })

  it('full payment flips linked expense from unpaid to paid', async () => {
    const db = getTestDb()
    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, branchId: 1, invoiceNumber: 'INV-EXP',
      totalAmount: 200, paidAmount: 0, remainingAmount: 200, status: 'pending', createdBy: 1,
    }).returning()
    await db.insert(expenses).values({
      title: 'Test expense', amount: 200, branchId: 1, categoryId: null,
      paymentMethod: 'bank_transfer', paymentStatus: 'unpaid',
      payableId: payable.id, expenseDate: '2026-04-19', createdBy: 1,
    })

    const result = await withTransaction(async ({ db: txDb }) => {
      const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
      return recordPayableSubmission(
        txDb, fresh!,
        { payableId: payable.id, amount: 200, paymentMethod: 'bank_transfer' },
        { userId: 1, branchId: 1 }, null
      )
    })

    expect(result.newStatus).toBe('paid')
    expect(result.expenseSync).not.toBeNull()
    expect(result.expenseSync?.oldStatus).toBe('unpaid')
  })
})

describe('payables:record-payment via shared helper (AP tab)', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('full payment marks AP paid and syncs linked purchase.paymentStatus', async () => {
    const db = getTestDb()
    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-T3-FULL', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'ordered',
    }).returning()

    const [payable] = await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-T3-FULL',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    }).returning()

    const result = await withTransaction(async ({ db: txDb }) => {
      const fresh = await txDb.query.accountPayables.findFirst({ where: eq(accountPayables.id, payable.id) })
      return recordPayableSubmission(
        txDb, fresh!,
        { payableId: payable.id, amount: 100, paymentMethod: 'bank_transfer' },
        { userId: 1, branchId: 1 }, null
      )
    })

    expect(result.newStatus).toBe('paid')
    expect(result.purchaseSync?.newStatus).toBe('paid')

    const syncedPurchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(syncedPurchase?.paymentStatus).toBe('paid')
  })
})

describe('purchases:pay-off orphan heal', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('creates an AP row when none exists, records payment, flips purchase to paid', async () => {
    const db = getTestDb()
    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-ORPHAN-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 250, taxAmount: 0, shippingCost: 0, totalAmount: 250,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()

    // Sanity: no AP row yet
    const preAP = await db.query.accountPayables.findMany({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(preAP).toHaveLength(0)

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const payOffHandler = handlers.get('purchases:pay-off')
    expect(payOffHandler).toBeDefined()
    const result = await payOffHandler!({}, purchase.id, { paymentMethod: 'bank_transfer' })

    expect(result.success).toBe(true)
    const postAP = await db.query.accountPayables.findMany({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(postAP).toHaveLength(1)
    expect(postAP[0].status).toBe('paid')
    expect(postAP[0].totalAmount).toBe(250)
    expect(postAP[0].paidAmount).toBe(250)

    const postPurchase = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(postPurchase?.paymentStatus).toBe('paid')

    const payments = await db.query.payablePayments.findMany({ where: eq(payablePayments.payableId, postAP[0].id) })
    expect(payments).toHaveLength(1)
    expect(payments[0].amount).toBe(250)
  })

  it('with existing AP, updates AP to paid and does not create duplicates', async () => {
    const db = getTestDb()
    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-EXIST-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 150, taxAmount: 0, shippingCost: 0, totalAmount: 150,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-EXIST-1',
      totalAmount: 150, paidAmount: 0, remainingAmount: 150, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()
    const handler = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers.get('purchases:pay-off')

    const result = await handler!({}, purchase.id, { paymentMethod: 'bank_transfer' })
    expect(result.success).toBe(true)

    const apRows = await db.query.accountPayables.findMany({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(apRows).toHaveLength(1)
    expect(apRows[0].status).toBe('paid')
    expect(apRows[0].paidAmount).toBe(150)
  })
})

describe('purchases:record-partial-payment', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('records a partial, sets AP and purchase to partial, leaves remainder', async () => {
    const db = getTestDb()
    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-PARTIAL-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 200, taxAmount: 0, shippingCost: 0, totalAmount: 200,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-PARTIAL-1',
      totalAmount: 200, paidAmount: 0, remainingAmount: 200, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const handler = handlers.get('purchases:record-partial-payment')
    expect(handler).toBeDefined()

    const result = await handler!({}, purchase.id, { amount: 75, paymentMethod: 'bank_transfer' })
    expect(result.success).toBe(true)

    const ap = await db.query.accountPayables.findFirst({ where: eq(accountPayables.purchaseId, purchase.id) })
    expect(ap?.status).toBe('partial')
    expect(ap?.paidAmount).toBe(75)
    expect(ap?.remainingAmount).toBe(125)

    const po = await db.query.purchases.findFirst({ where: eq(purchases.id, purchase.id) })
    expect(po?.paymentStatus).toBe('partial')
  })

  it('rejects when amount exceeds remaining', async () => {
    const db = getTestDb()
    const [purchase] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-PARTIAL-REJ', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: purchase.id, branchId: 1, invoiceNumber: 'PO-PARTIAL-REJ',
      totalAmount: 100, paidAmount: 0, remainingAmount: 100, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const handler = handlers.get('purchases:record-partial-payment')
    const result = await handler!({}, purchase.id, { amount: 9_999_999, paymentMethod: 'bank_transfer' })
    expect(result.success).toBe(false)
    expect(result.message).toMatch(/cannot exceed remaining/i)
  })
})

describe('purchases:reconcile-with-payables', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('creates missing AP rows, flips paymentStatus to match AP, flags paid-purchase-unpaid-AP', async () => {
    const db = getTestDb()

    // Case A: pay_later PO missing AP
    const [poMissing] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-A', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'ordered',
    }).returning()

    // Case B: AP.status=partial but purchase.paymentStatus=pending
    const [poDrift] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-B', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 200, taxAmount: 0, shippingCost: 0, totalAmount: 200,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: poDrift.id, branchId: 1, invoiceNumber: 'PO-RECON-B',
      totalAmount: 200, paidAmount: 50, remainingAmount: 150, status: 'partial', createdBy: 1,
    })

    // Case C: purchase.paymentStatus=paid but AP still has remaining (flagged)
    const [poFlagged] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-RECON-C', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 300, taxAmount: 0, shippingCost: 0, totalAmount: 300,
      paymentMethod: 'pay_later', paymentStatus: 'paid', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: poFlagged.id, branchId: 1, invoiceNumber: 'PO-RECON-C',
      totalAmount: 300, paidAmount: 0, remainingAmount: 300, status: 'pending', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:reconcile-with-payables')!({})

    expect(result.success).toBe(true)
    expect(result.created.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-A')
    expect(result.synced.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-B')
    expect(result.flagged.map((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber)).toContain('PO-RECON-C')

    const createdAP = await db.query.accountPayables.findFirst({ where: eq(accountPayables.purchaseId, poMissing.id) })
    expect(createdAP).toBeDefined()
    expect(createdAP?.status).toBe('pending')

    const syncedPO = await db.query.purchases.findFirst({ where: eq(purchases.id, poDrift.id) })
    expect(syncedPO?.paymentStatus).toBe('partial')
  })
})

describe('purchases:get-all aggregates', () => {
  beforeEach(async () => {
    const sqlite = getTestSqlite()
    for (const t of ['online_transactions', 'cash_transactions', 'expenses', 'payable_payments', 'account_payables', 'purchases', 'suppliers', 'branches', 'users']) {
      sqlite.prepare(`DELETE FROM ${t}`).run()
    }
    await seedBasicFixtures()
  })

  it('returns paidAmount and remainingAmount columns from linked AP', async () => {
    const db = getTestDb()
    const [p1] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-AGG-1', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 400, taxAmount: 0, shippingCost: 0, totalAmount: 400,
      paymentMethod: 'pay_later', paymentStatus: 'partial', status: 'received',
    }).returning()
    await db.insert(accountPayables).values({
      supplierId: 1, purchaseId: p1.id, branchId: 1, invoiceNumber: 'PO-AGG-1',
      totalAmount: 400, paidAmount: 150, remainingAmount: 250, status: 'partial', createdBy: 1,
    })

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:get-all')!({}, { limit: 10 })

    expect(result.success).toBe(true)
    const row = result.data.find((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber === 'PO-AGG-1')
    expect(row).toBeDefined()
    expect(row.paidAmount).toBe(150)
    expect(row.remainingAmount).toBe(250)
  })

  it('returns zero paid / full remaining for pay_later PO without AP yet', async () => {
    const db = getTestDb()
    const [p] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-AGG-2', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 100, taxAmount: 0, shippingCost: 0, totalAmount: 100,
      paymentMethod: 'pay_later', paymentStatus: 'pending', status: 'ordered',
    }).returning()

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:get-all')!({}, { limit: 10 })
    const row = result.data.find((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber === 'PO-AGG-2')
    expect(row.paidAmount).toBe(0)
    expect(row.remainingAmount).toBe(100)
  })

  it('returns paid=total / remaining=0 for cash PO marked paid (no AP row)', async () => {
    const db = getTestDb()
    const [p] = await db.insert(purchases).values({
      purchaseOrderNumber: 'PO-AGG-3', supplierId: 1, branchId: 1, userId: 1,
      subtotal: 50, taxAmount: 0, shippingCost: 0, totalAmount: 50,
      paymentMethod: 'cash', paymentStatus: 'paid', status: 'received',
    }).returning()

    const { ipcMain } = await import('electron')
    const { registerPurchaseHandlers } = await import('../ipc/purchases-ipc')
    registerPurchaseHandlers()

    const handlers = (ipcMain as unknown as { _invokeHandlers: Map<string, Function> })._invokeHandlers
    const result = await handlers.get('purchases:get-all')!({}, { limit: 10 })
    const row = result.data.find((r: { purchaseOrderNumber: string }) => r.purchaseOrderNumber === 'PO-AGG-3')
    expect(row.paidAmount).toBe(50)
    expect(row.remainingAmount).toBe(0)
  })
})
