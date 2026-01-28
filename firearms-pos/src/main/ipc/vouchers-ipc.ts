import { ipcMain } from 'electron'
import { eq, like, and, or, desc, sql, lte } from 'drizzle-orm'
import { getDatabase } from '../db'
import { vouchers, type NewVoucher } from '../db/schema'
import { getCurrentSession } from './auth-ipc'

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function registerVoucherHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'vouchers:get-all',
    async (
      _,
      params: {
        page?: number
        limit?: number
        search?: string
        filter?: 'all' | 'active' | 'used' | 'expired'
      }
    ) => {
      try {
        const { page = 1, limit = 20, search, filter = 'all' } = params
        const now = new Date().toISOString()

        const conditions = []

        // Only show non-deleted vouchers by default
        if (filter !== 'all') {
          if (filter === 'active') {
            conditions.push(eq(vouchers.isActive, true))
            conditions.push(eq(vouchers.isUsed, false))
            conditions.push(
              or(
                sql`${vouchers.expiresAt} IS NULL`,
                sql`${vouchers.expiresAt} > ${now}`
              )
            )
          } else if (filter === 'used') {
            conditions.push(eq(vouchers.isUsed, true))
          } else if (filter === 'expired') {
            conditions.push(eq(vouchers.isUsed, false))
            conditions.push(eq(vouchers.isActive, true))
            conditions.push(lte(vouchers.expiresAt, now))
          }
        }

        if (search) {
          conditions.push(
            or(
              like(vouchers.code, `%${search}%`),
              like(vouchers.description, `%${search}%`)
            )
          )
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(vouchers)
          .where(whereClause)

        const total = countResult[0].count

        const data = await db.query.vouchers.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: desc(vouchers.createdAt),
        })

        return {
          success: true,
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      } catch (error) {
        console.error('Get vouchers error:', error)
        return { success: false, message: 'Failed to fetch vouchers' }
      }
    }
  )

  ipcMain.handle(
    'vouchers:create',
    async (
      _,
      data: {
        code?: string
        description?: string
        discountAmount: number
        expiresAt?: string
      }
    ) => {
      try {
        const session = getCurrentSession()

        // Use provided code or generate one
        let code = data.code?.trim().toUpperCase()
        if (!code) {
          code = generateVoucherCode()
        }

        // Validate code uniqueness
        const existing = await db.query.vouchers.findFirst({
          where: eq(vouchers.code, code),
        })
        if (existing) {
          return { success: false, message: 'Voucher code already exists' }
        }

        if (data.discountAmount <= 0) {
          return { success: false, message: 'Discount amount must be greater than 0' }
        }

        const [voucher] = await db
          .insert(vouchers)
          .values({
            code,
            description: data.description || null,
            discountAmount: data.discountAmount,
            expiresAt: data.expiresAt || null,
            createdBy: session?.userId ?? null,
          } as NewVoucher)
          .returning()

        return { success: true, data: voucher }
      } catch (error) {
        console.error('Create voucher error:', error)
        return { success: false, message: 'Failed to create voucher' }
      }
    }
  )

  ipcMain.handle('vouchers:generate-code', async () => {
    try {
      let code = generateVoucherCode()
      // Ensure uniqueness
      let attempts = 0
      while (attempts < 10) {
        const existing = await db.query.vouchers.findFirst({
          where: eq(vouchers.code, code),
        })
        if (!existing) break
        code = generateVoucherCode()
        attempts++
      }
      return { success: true, data: code }
    } catch (error) {
      console.error('Generate voucher code error:', error)
      return { success: false, message: 'Failed to generate code' }
    }
  })

  ipcMain.handle('vouchers:validate', async (_, code: string) => {
    try {
      const voucher = await db.query.vouchers.findFirst({
        where: eq(vouchers.code, code.trim().toUpperCase()),
      })

      if (!voucher) {
        return { success: false, message: 'Invalid voucher code' }
      }

      if (!voucher.isActive) {
        return { success: false, message: 'Voucher has been deactivated' }
      }

      if (voucher.isUsed) {
        return { success: false, message: 'Voucher has already been used' }
      }

      if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
        return { success: false, message: 'Voucher has expired' }
      }

      return {
        success: true,
        data: {
          id: voucher.id,
          code: voucher.code,
          discountAmount: voucher.discountAmount,
          description: voucher.description,
        },
      }
    } catch (error) {
      console.error('Validate voucher error:', error)
      return { success: false, message: 'Failed to validate voucher' }
    }
  })

  ipcMain.handle('vouchers:delete', async (_, id: number) => {
    try {
      const existing = await db.query.vouchers.findFirst({
        where: eq(vouchers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Voucher not found' }
      }

      await db
        .update(vouchers)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(vouchers.id, id))

      return { success: true, message: 'Voucher deactivated successfully' }
    } catch (error) {
      console.error('Delete voucher error:', error)
      return { success: false, message: 'Failed to delete voucher' }
    }
  })
}
