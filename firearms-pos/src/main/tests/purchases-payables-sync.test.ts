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
vi.mock('./auth-ipc', () => ({
  getCurrentSession: () => ({ userId: 1, role: 'admin', branchId: 1 }),
}))

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
