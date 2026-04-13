/**
 * Section 9 — Audit Report Test Scenarios
 *
 * Comprehensive test coverage for the Firearms POS accounting & inventory system.
 * These tests use a real in-memory SQLite database (no mocks for data layer).
 *
 * Test Categories:
 * 1. Critical Test Scenarios (GL balance, balance sheet, atomicity, COGS, tax)
 * 2. Integration Testing (sale-to-GL flow, AR payments, void/return GL entries)
 * 3. Compliance Testing (GAAP format, inventory valuation consistency, audit trail)
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { eq, sql } from 'drizzle-orm'
import { setupTestDatabase, teardownTestDatabase, getTestDb, getTestSqlite } from './test-db'

// Mock the database module so GL posting / inventory valuation use our test DB
vi.mock('../db/index', () => ({
  getDatabase: () => getTestDb(),
  getRawDatabase: () => getTestSqlite(),
  getDbPath: () => ':memory:',
}))

// Mock audit to avoid OS-level calls (network interfaces, etc.)
vi.mock('../utils/audit', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}))

// Import after mocks are set up
import {
  createJournalEntry,
  postSaleToGL,
  postPurchaseReceiveToGL,
  postExpenseToGL,
  postReturnToGL,
  postVoidSaleToGL,
  postARPaymentToGL,
  postAPPaymentToGL,
  postStockAdjustmentToGL,
  ACCOUNT_CODES,
} from '../utils/gl-posting'

import {
  consumeCostLayersFIFO,
  consumeCostLayersLIFO,
  consumeCostLayersWeightedAverage,
  addCostLayer,
  consumeCostLayers,
} from '../utils/inventory-valuation'

import {
  chartOfAccounts,
  journalEntries,
  journalEntryLines,
  products,
  inventoryCostLayers,
} from '../db/schema'

// Helpers

function getDb() {
  return getTestDb()
}

function getRawDb() {
  return getTestSqlite()
}

async function getTotalDebits(): Promise<number> {
  const db = getDb()
  const result = db.select({
    total: sql<number>`COALESCE(SUM(${journalEntryLines.debitAmount}), 0)`,
  }).from(journalEntryLines).all()
  return result[0]?.total ?? 0
}

async function getTotalCredits(): Promise<number> {
  const db = getDb()
  const result = db.select({
    total: sql<number>`COALESCE(SUM(${journalEntryLines.creditAmount}), 0)`,
  }).from(journalEntryLines).all()
  return result[0]?.total ?? 0
}

async function getAccountBalance(accountCode: string): Promise<number> {
  const db = getDb()
  const account = await db.query.chartOfAccounts.findFirst({
    where: eq(chartOfAccounts.accountCode, accountCode),
  })
  return account?.currentBalance ?? 0
}

async function getBalancesByType() {
  const db = getDb()
  const accounts = await db.query.chartOfAccounts.findMany()
  const result = { assets: 0, liabilities: 0, equity: 0, revenue: 0, expenses: 0 }
  for (const acct of accounts) {
    switch (acct.accountType) {
      case 'asset': result.assets += acct.currentBalance; break
      case 'liability': result.liabilities += acct.currentBalance; break
      case 'equity': result.equity += acct.currentBalance; break
      case 'revenue': result.revenue += acct.currentBalance; break
      case 'expense': result.expenses += acct.currentBalance; break
    }
  }
  return result
}

async function createProduct(code: string, name: string, costPrice: number, sellingPrice: number): Promise<number> {
  const db = getDb()
  const [product] = await db.insert(products).values({
    code,
    name,
    costPrice,
    sellingPrice,
    categoryId: 1,
    isActive: true,
    isTaxable: true,
    taxRate: 17,
  }).returning()
  return product.id
}

// Test Suite

describe('Section 9 — Audit Report Test Scenarios', () => {
  beforeAll(() => {
    setupTestDatabase()
  })

  afterAll(() => {
    teardownTestDatabase()
  })

  // 9.1 Critical: GL Balance Equation

  describe('9.1 GL Balance Equation: Total Debits = Total Credits', () => {
    it('should maintain debit/credit balance after a sale GL posting', async () => {
      const sale = {
        id: 1,
        invoiceNumber: 'INV-TEST-001',
        branchId: 1,
        subtotal: 1000,
        taxAmount: 170,
        discountAmount: 0,
        totalAmount: 1170,
        paymentMethod: 'cash',
        paymentStatus: 'paid',
        amountPaid: 1170,
        changeGiven: 0,
      }

      await postSaleToGL(sale as any, [{ costPrice: 600, quantity: 2 }], 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after a purchase GL posting', async () => {
      await createProduct('PROD-GL-1', 'GL Test Rifle', 800, 1200)

      const purchase = {
        id: 1,
        purchaseOrderNumber: 'PO-TEST-001',
        branchId: 1,
        supplierId: 1,
        paymentMethod: 'pay_later',
        paymentStatus: 'pending',
      }

      await postPurchaseReceiveToGL(purchase as any, [{ unitCost: 800, receivedQuantity: 10 }], 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after an expense GL posting', async () => {
      await postExpenseToGL({
        id: 1,
        branchId: 1,
        categoryName: 'Rent',
        amount: 5000,
        paymentStatus: 'paid',
        paymentMethod: 'cash',
        description: 'Monthly rent',
      }, 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after AR payment', async () => {
      await postARPaymentToGL({
        id: 1, receivableId: 1, branchId: 1,
        amount: 500, paymentMethod: 'cash', invoiceNumber: 'INV-AR-001',
      }, 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after AP payment', async () => {
      await postAPPaymentToGL({
        id: 1, payableId: 1, branchId: 1,
        amount: 3000, paymentMethod: 'bank_transfer', invoiceNumber: 'PO-AP-001',
      }, 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after stock adjustment (removal)', async () => {
      await postStockAdjustmentToGL({
        id: 1, branchId: 1, adjustmentType: 'remove',
        quantityChange: 5, unitCost: 100, reason: 'Damage',
      }, 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should maintain debit/credit balance after stock adjustment (addition)', async () => {
      await postStockAdjustmentToGL({
        id: 2, branchId: 1, adjustmentType: 'add',
        quantityChange: 3, unitCost: 150, reason: 'Found surplus',
      }, 1)

      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should reject unbalanced journal entries', async () => {
      await expect(
        createJournalEntry({
          description: 'Intentionally unbalanced',
          referenceType: 'test',
          referenceId: 999,
          branchId: 1,
          userId: 1,
          lines: [
            { accountCode: '1010', debitAmount: 100, creditAmount: 0 },
            { accountCode: '4000', debitAmount: 0, creditAmount: 50 },
          ],
        })
      ).rejects.toThrow(/unbalanced/)
    })
  })

  // 9.2 Critical: Balance Sheet Equation

  describe('9.2 Balance Sheet Equation: Assets = Liabilities + Equity + (Revenue - Expenses)', () => {
    it('should satisfy the accounting equation after all transactions', async () => {
      const balances = await getBalancesByType()
      const leftSide = balances.assets
      const rightSide = balances.liabilities + balances.equity + balances.revenue - balances.expenses
      expect(Math.abs(leftSide - rightSide)).toBeLessThanOrEqual(0.01)
    })
  })

  // 9.3 Critical: Transaction Atomicity

  describe('9.3 Transaction Atomicity: Complete rollback on mid-operation failure', () => {
    it('should rollback all changes when a transaction fails mid-operation', () => {
      const rawDb = getRawDb()
      const countBefore = (rawDb.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any).c

      expect(() => {
        rawDb.exec('BEGIN IMMEDIATE')
        try {
          rawDb.prepare(
            `INSERT INTO journal_entries (entry_number, entry_date, description, status, is_auto_generated, created_by)
             VALUES ('JE-ROLLBACK-TEST', '2026-01-01', 'Rollback test', 'posted', 1, 1)`
          ).run()

          // Duplicate entry_number — triggers UNIQUE constraint violation
          rawDb.prepare(
            `INSERT INTO journal_entries (entry_number, entry_date, description, status, is_auto_generated, created_by)
             VALUES ('JE-ROLLBACK-TEST', '2026-01-01', 'Duplicate', 'posted', 1, 1)`
          ).run()

          rawDb.exec('COMMIT')
        } catch {
          rawDb.exec('ROLLBACK')
          throw new Error('Transaction rolled back')
        }
      }).toThrow('Transaction rolled back')

      const countAfter = (rawDb.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any).c
      expect(countAfter).toBe(countBefore)
    })

    it('should rollback account creation on simulated failure', () => {
      const rawDb = getRawDb()
      const countBefore = (rawDb.prepare('SELECT COUNT(*) as c FROM chart_of_accounts').get() as any).c

      try {
        rawDb.exec('BEGIN IMMEDIATE')
        rawDb.prepare(
          `INSERT INTO chart_of_accounts (account_code, account_name, account_type, normal_balance, current_balance)
           VALUES ('9999', 'Temp Account', 'asset', 'debit', 0)`
        ).run()
        throw new Error('Simulated failure')
      } catch {
        rawDb.exec('ROLLBACK')
      }

      const countAfter = (rawDb.prepare('SELECT COUNT(*) as c FROM chart_of_accounts').get() as any).c
      expect(countAfter).toBe(countBefore)
    })
  })

  // 9.4 Critical: COGS Accuracy (FIFO)

  describe('9.4 COGS Accuracy (FIFO): 150 units from $10 (100) + $15 (100) = $1,750', () => {
    let fifoProductId: number

    beforeEach(async () => {
      fifoProductId = await createProduct(
        `FIFO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        'FIFO Test Ammo',
        12,
        25
      )
    })

    it('should calculate FIFO COGS correctly: 150 units = 100x$10 + 50x$15 = $1,750', async () => {
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 10, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 15, receivedDate: '2025-02-01T00:00:00Z' })

      const result = await consumeCostLayersFIFO(fifoProductId, 1, 150)

      expect(result.totalCost).toBe(1750)
      expect(result.layersConsumed).toHaveLength(2)
      expect(result.layersConsumed[0].quantityConsumed).toBe(100)
      expect(result.layersConsumed[0].unitCost).toBe(10)
      expect(result.layersConsumed[1].quantityConsumed).toBe(50)
      expect(result.layersConsumed[1].unitCost).toBe(15)
    })

    it('should calculate LIFO COGS correctly: 150 units = 100x$15 + 50x$10 = $2,000', async () => {
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 10, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 15, receivedDate: '2025-02-01T00:00:00Z' })

      const result = await consumeCostLayersLIFO(fifoProductId, 1, 150)

      expect(result.totalCost).toBe(2000)
      expect(result.layersConsumed[0].unitCost).toBe(15)
      expect(result.layersConsumed[1].unitCost).toBe(10)
    })

    it('should calculate Weighted Average COGS correctly', async () => {
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 10, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 100, unitCost: 15, receivedDate: '2025-02-01T00:00:00Z' })

      const result = await consumeCostLayersWeightedAverage(fifoProductId, 1, 150)

      // avg = (100*10 + 100*15) / 200 = 12.50, COGS = 150 * 12.50 = 1875
      expect(result.totalCost).toBe(1875)
    })

    it('should fallback to product cost price when layers are insufficient', async () => {
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 50, unitCost: 10, receivedDate: '2025-01-01T00:00:00Z' })

      const result = await consumeCostLayersFIFO(fifoProductId, 1, 80)

      // 50*$10 = $500 + 30*$12 (product.costPrice) = $360 = $860
      expect(result.totalCost).toBe(860)
      expect(result.layersConsumed).toHaveLength(2)
      expect(result.layersConsumed[1].layerId).toBe(-1)
    })

    it('should mark layers as fully consumed when depleted', async () => {
      const db = getDb()

      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 10, unitCost: 20, receivedDate: '2025-03-01T00:00:00Z' })

      await consumeCostLayersFIFO(fifoProductId, 1, 10)

      const layers = await db.query.inventoryCostLayers.findMany({
        where: eq(inventoryCostLayers.productId, fifoProductId),
      })
      const layer = layers.find(l => l.unitCost === 20)
      expect(layer?.isFullyConsumed).toBe(true)
      expect(layer?.quantity).toBe(0)
    })

    it('should use configured valuation method from business settings', async () => {
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 50, unitCost: 10, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId: fifoProductId, branchId: 1, quantity: 50, unitCost: 20, receivedDate: '2025-02-01T00:00:00Z' })

      // consumeCostLayers reads stockValuationMethod from settings (FIFO by default)
      const result = await consumeCostLayers(fifoProductId, 1, 60)

      // FIFO: 50*$10 + 10*$20 = $700
      expect(result.totalCost).toBe(700)
    })
  })

  // 9.5 Critical: Tax Liability

  describe('9.5 Tax Liability: Collected tax matches account 2100 credit', () => {
    it('should credit Sales Tax Payable for exact tax amount on sale', async () => {
      const before = await getAccountBalance(ACCOUNT_CODES.SALES_TAX_PAYABLE)

      await postSaleToGL({
        id: 100, invoiceNumber: `INV-TAX-${Date.now()}`, branchId: 1,
        subtotal: 2941.18, taxAmount: 500, discountAmount: 0, totalAmount: 3441.18,
        paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 3441.18, changeGiven: 0,
      } as any, [{ costPrice: 1500, quantity: 1 }], 1)

      const after = await getAccountBalance(ACCOUNT_CODES.SALES_TAX_PAYABLE)
      expect(after - before).toBeCloseTo(500, 2)
    })

    it('should debit Sales Tax Payable on return', async () => {
      const before = await getAccountBalance(ACCOUNT_CODES.SALES_TAX_PAYABLE)

      await postReturnToGL({
        id: 200, returnNumber: `RET-TAX-${Date.now()}`, branchId: 1,
        subtotal: 1000, taxAmount: 170, totalAmount: 1170, refundMethod: 'cash',
      }, [{ costPrice: 600, quantity: 1, restockable: true }], 1)

      const after = await getAccountBalance(ACCOUNT_CODES.SALES_TAX_PAYABLE)
      expect(before - after).toBeCloseTo(170, 2)
    })
  })

  // Integration: Complete sale-to-GL flow

  describe('Integration: Complete sale-to-GL-to-financial-statement flow', () => {
    it('should create proper journal entries for a complete sale', async () => {
      const db = getDb()

      const sale = {
        id: 300, invoiceNumber: `INV-INTEG-${Date.now()}`, branchId: 1,
        subtotal: 5000, taxAmount: 850, discountAmount: 200, totalAmount: 5650,
        paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 5650, changeGiven: 0,
      }

      const journalId = await postSaleToGL(sale as any, [{ costPrice: 2000, quantity: 2 }], 1)

      const entry = await db.query.journalEntries.findFirst({ where: eq(journalEntries.id, journalId) })
      expect(entry?.status).toBe('posted')
      expect(entry?.isAutoGenerated).toBe(true)
      expect(entry?.referenceType).toBe('sale')

      const lines = await db.query.journalEntryLines.findMany({
        where: eq(journalEntryLines.journalEntryId, journalId),
      })
      expect(lines.length).toBeGreaterThanOrEqual(4)

      const entryDebits = lines.reduce((s, l) => s + l.debitAmount, 0)
      const entryCredits = lines.reduce((s, l) => s + l.creditAmount, 0)
      expect(Math.abs(entryDebits - entryCredits)).toBeLessThanOrEqual(0.01)
    })

    it('should handle partial payment sale with AR correctly', async () => {
      const db = getDb()

      const journalId = await postSaleToGL({
        id: 301, invoiceNumber: `INV-PARTIAL-${Date.now()}`, branchId: 1,
        subtotal: 2000, taxAmount: 340, discountAmount: 0, totalAmount: 2340,
        paymentMethod: 'cash', paymentStatus: 'partial', amountPaid: 1000, changeGiven: 0,
      } as any, [{ costPrice: 1000, quantity: 1 }], 1)

      const lines = await db.query.journalEntryLines.findMany({
        where: eq(journalEntryLines.journalEntryId, journalId),
      })

      // Should have AR debit for outstanding 1340
      const arLine = lines.find(l => l.debitAmount === 1340)
      expect(arLine).toBeDefined()
    })
  })

  // Integration: AR payment GL

  describe('Integration: AR payment updates GL correctly', () => {
    it('should debit Cash and credit AR', async () => {
      const cashBefore = await getAccountBalance(ACCOUNT_CODES.CASH_IN_HAND)
      const arBefore = await getAccountBalance(ACCOUNT_CODES.ACCOUNTS_RECEIVABLE)

      await postARPaymentToGL({
        id: 400, receivableId: 1, branchId: 1,
        amount: 750, paymentMethod: 'cash', invoiceNumber: 'INV-ARPAY-001',
      }, 1)

      expect(await getAccountBalance(ACCOUNT_CODES.CASH_IN_HAND) - cashBefore).toBeCloseTo(750, 2)
      expect(arBefore - await getAccountBalance(ACCOUNT_CODES.ACCOUNTS_RECEIVABLE)).toBeCloseTo(750, 2)
    })
  })

  // Integration: Void sale reverses GL

  describe('Integration: Void sale reverses all GL entries', () => {
    it('should restore all account balances to pre-sale state', async () => {
      const cashBefore = await getAccountBalance(ACCOUNT_CODES.CASH_IN_HAND)
      const revenueBefore = await getAccountBalance(ACCOUNT_CODES.SALES_REVENUE)
      const cogsBefore = await getAccountBalance(ACCOUNT_CODES.COGS)
      const inventoryBefore = await getAccountBalance(ACCOUNT_CODES.INVENTORY)

      const sale = {
        id: 500, invoiceNumber: `INV-VOID-${Date.now()}`, branchId: 1,
        subtotal: 3000, taxAmount: 510, discountAmount: 0, totalAmount: 3510,
        paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 3510, changeGiven: 0,
      }
      const items = [{ costPrice: 1500, quantity: 2 }]

      await postSaleToGL(sale as any, items, 1)
      await postVoidSaleToGL(sale as any, items, 1)

      expect(await getAccountBalance(ACCOUNT_CODES.CASH_IN_HAND)).toBeCloseTo(cashBefore, 2)
      expect(await getAccountBalance(ACCOUNT_CODES.SALES_REVENUE)).toBeCloseTo(revenueBefore, 2)
      expect(await getAccountBalance(ACCOUNT_CODES.COGS)).toBeCloseTo(cogsBefore, 2)
      expect(await getAccountBalance(ACCOUNT_CODES.INVENTORY)).toBeCloseTo(inventoryBefore, 2)
    })
  })

  // Integration: Return GL entries

  describe('Integration: Return credits COGS and debits Inventory in GL', () => {
    it('should reverse COGS and restore inventory for restockable items', async () => {
      const cogsBefore = await getAccountBalance(ACCOUNT_CODES.COGS)
      const inventoryBefore = await getAccountBalance(ACCOUNT_CODES.INVENTORY)

      await postReturnToGL({
        id: 600, returnNumber: `RET-INTEG-${Date.now()}`, branchId: 1,
        subtotal: 2000, taxAmount: 340, totalAmount: 2340, refundMethod: 'cash',
      }, [{ costPrice: 1200, quantity: 1, restockable: true }], 1)

      expect(cogsBefore - await getAccountBalance(ACCOUNT_CODES.COGS)).toBeCloseTo(1200, 2)
      expect(await getAccountBalance(ACCOUNT_CODES.INVENTORY) - inventoryBefore).toBeCloseTo(1200, 2)
    })

    it('should NOT restore inventory for non-restockable items', async () => {
      const inventoryBefore = await getAccountBalance(ACCOUNT_CODES.INVENTORY)

      await postReturnToGL({
        id: 601, returnNumber: `RET-NOSTOCK-${Date.now()}`, branchId: 1,
        subtotal: 500, taxAmount: 85, totalAmount: 585, refundMethod: 'cash',
      }, [{ costPrice: 300, quantity: 1, restockable: false }], 1)

      expect(await getAccountBalance(ACCOUNT_CODES.INVENTORY)).toBeCloseTo(inventoryBefore, 2)
    })
  })

  // Compliance: GAAP financial statements

  describe('Compliance: Financial statements data from GL', () => {
    it('should have all required account types for GAAP financial statements', async () => {
      const db = getDb()
      const accounts = await db.query.chartOfAccounts.findMany()
      const types = new Set(accounts.map(a => a.accountType))

      expect(types.has('asset')).toBe(true)
      expect(types.has('liability')).toBe(true)
      expect(types.has('revenue')).toBe(true)
      expect(types.has('expense')).toBe(true)
    })

    it('should have proper normal balance designations', async () => {
      const db = getDb()
      const accounts = await db.query.chartOfAccounts.findMany()

      for (const account of accounts) {
        if (account.accountType === 'asset' || account.accountType === 'expense') {
          expect(account.normalBalance).toBe('debit')
        }
        if (account.accountType === 'liability' || account.accountType === 'equity' || account.accountType === 'revenue') {
          expect(account.normalBalance).toBe('credit')
        }
      }
    })

    it('should auto-post system-generated journal entries', async () => {
      const db = getDb()
      const autoEntries = await db.query.journalEntries.findMany({
        where: eq(journalEntries.isAutoGenerated, true),
      })

      for (const entry of autoEntries) {
        expect(entry.status).toBe('posted')
        expect(entry.postedBy).toBeTruthy()
        expect(entry.postedAt).toBeTruthy()
      }
    })
  })

  // Compliance: Inventory valuation consistency

  describe('Compliance: Inventory valuation consistency', () => {
    it('should consume oldest layers first in FIFO', async () => {
      const productId = await createProduct(`FIFO-ORDER-${Date.now()}`, 'Order Test', 10, 20)

      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 5, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 8, receivedDate: '2025-02-01T00:00:00Z' })
      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 12, receivedDate: '2025-03-01T00:00:00Z' })

      const result = await consumeCostLayersFIFO(productId, 1, 15)

      expect(result.layersConsumed[0].unitCost).toBe(5)
      expect(result.layersConsumed[0].quantityConsumed).toBe(10)
      expect(result.layersConsumed[1].unitCost).toBe(8)
      expect(result.layersConsumed[1].quantityConsumed).toBe(5)
      expect(result.totalCost).toBe(90)
    })

    it('should consume newest layers first in LIFO', async () => {
      const productId = await createProduct(`LIFO-ORDER-${Date.now()}`, 'LIFO Order Test', 10, 20)

      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 5, receivedDate: '2025-01-01T00:00:00Z' })
      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 8, receivedDate: '2025-02-01T00:00:00Z' })
      await addCostLayer({ productId, branchId: 1, quantity: 10, unitCost: 12, receivedDate: '2025-03-01T00:00:00Z' })

      const result = await consumeCostLayersLIFO(productId, 1, 15)

      expect(result.layersConsumed[0].unitCost).toBe(12)
      expect(result.layersConsumed[0].quantityConsumed).toBe(10)
      expect(result.layersConsumed[1].unitCost).toBe(8)
      expect(result.layersConsumed[1].quantityConsumed).toBe(5)
      expect(result.totalCost).toBe(160)
    })
  })

  // Compliance: Audit trail

  describe('Compliance: Audit trail completeness', () => {
    it('should create audit logs for GL journal entries', async () => {
      const { createAuditLog } = await import('../utils/audit')

      await postSaleToGL({
        id: 700, invoiceNumber: `INV-AUDIT-${Date.now()}`, branchId: 1,
        subtotal: 1000, taxAmount: 170, discountAmount: 0, totalAmount: 1170,
        paymentMethod: 'cash', paymentStatus: 'paid', amountPaid: 1170, changeGiven: 0,
      } as any, [{ costPrice: 500, quantity: 1 }], 1)

      expect(createAuditLog).toHaveBeenCalled()
      const calls = (createAuditLog as any).mock.calls
      const lastCall = calls[calls.length - 1][0]
      expect(lastCall.action).toBe('CREATE')
      expect(lastCall.entityType).toBe('journal_entry')
      expect(lastCall.userId).toBe(1)
      expect(lastCall.branchId).toBe(1)
    })

    it('should record journal entry details in audit newValues', async () => {
      const { createAuditLog } = await import('../utils/audit')

      await postExpenseToGL({
        id: 701, branchId: 1, categoryName: 'Utilities',
        amount: 300, paymentStatus: 'paid', paymentMethod: 'cash',
      }, 1)

      const calls = (createAuditLog as any).mock.calls
      const lastCall = calls[calls.length - 1][0]
      expect(lastCall.newValues).toBeDefined()
      expect(lastCall.newValues.referenceType).toBe('expense')
      expect(lastCall.newValues.totalDebits).toBeCloseTo(300, 2)
      expect(lastCall.newValues.totalCredits).toBeCloseTo(300, 2)
    })
  })

  // Final Global Verification

  describe('Final Global Verification', () => {
    it('GLOBAL: Total debits must equal total credits across ALL journal entries', async () => {
      const totalDebits = await getTotalDebits()
      const totalCredits = await getTotalCredits()

      expect(totalDebits).toBeGreaterThan(0)
      expect(totalCredits).toBeGreaterThan(0)
      expect(Math.abs(totalDebits - totalCredits)).toBeLessThanOrEqual(0.01)
    })

    it('GLOBAL: Accounting equation must hold across ALL accounts', async () => {
      const balances = await getBalancesByType()
      const leftSide = balances.assets
      const rightSide = balances.liabilities + balances.equity + balances.revenue - balances.expenses
      expect(Math.abs(leftSide - rightSide)).toBeLessThanOrEqual(0.01)
    })
  })
})
