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
