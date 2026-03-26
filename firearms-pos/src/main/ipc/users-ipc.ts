import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getDatabase } from '../db'
import { users, type NewUser } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerUserHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'users:get-all',
    async (_, params: PaginationParams & { search?: string; role?: string; isActive?: boolean }) => {
      try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, role, isActive } = params || {}

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(users.username, `%${search}%`),
              like(users.fullName, `%${search}%`),
              like(users.email, `%${search}%`)
            )
          )
        }

        if (role) {
          conditions.push(eq(users.role, role as 'admin' | 'manager' | 'cashier'))
        }

        if (isActive !== undefined) {
          conditions.push(eq(users.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(users)
          .where(whereClause)

        const total = countResult[0].count

        const orderColumn = users[sortBy as keyof typeof users] ?? users.createdAt
        const data = await db.query.users.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any),
          columns: {
            password: false, // Exclude password
          },
        })

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get users error:', error)
        return { success: false, message: 'Failed to fetch users' }
      }
    }
  )

  ipcMain.handle('users:get-by-id', async (_, id: number) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
        columns: {
          password: false,
        },
      })

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      return { success: true, data: user }
    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, message: 'Failed to fetch user' }
    }
  })

  ipcMain.handle('users:create', async (_, data: NewUser) => {
    try {
      const session = getCurrentSession()

      // Check for duplicate username
      const existingUsername = await db.query.users.findFirst({
        where: eq(users.username, data.username),
      })

      if (existingUsername) {
        return { success: false, message: 'Username already exists' }
      }

      // Check for duplicate email
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, data.email),
      })

      if (existingEmail) {
        return { success: false, message: 'Email already exists' }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12)

      const result = await db
        .insert(users)
        .values({
          ...data,
          password: hashedPassword,
        })
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
          permissions: users.permissions,
          isActive: users.isActive,
          branchId: users.branchId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })

      const newUser = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'user',
        entityId: newUser.id,
        newValues: sanitizeForAudit({ ...data, password: '[REDACTED]' }),
        description: `Created user: ${data.username}`,
      })

      return { success: true, data: newUser }
    } catch (error) {
      console.error('Create user error:', error)
      return { success: false, message: 'Failed to create user' }
    }
  })

  ipcMain.handle('users:update', async (_, id: number, data: Partial<NewUser>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.users.findFirst({
        where: eq(users.id, id),
      })

      if (!existing) {
        return { success: false, message: 'User not found' }
      }

      // Check for duplicate username if username is being changed
      if (data.username && data.username !== existing.username) {
        const duplicate = await db.query.users.findFirst({
          where: eq(users.username, data.username),
        })
        if (duplicate) {
          return { success: false, message: 'Username already exists' }
        }
      }

      // Check for duplicate email if email is being changed
      if (data.email && data.email !== existing.email) {
        const duplicate = await db.query.users.findFirst({
          where: eq(users.email, data.email),
        })
        if (duplicate) {
          return { success: false, message: 'Email already exists' }
        }
      }

      // Hash password if provided
      const updateData = { ...data }
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12)
      }

      const result = await db
        .update(users)
        .set({ ...updateData, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))
        .returning({
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName,
          role: users.role,
          permissions: users.permissions,
          isActive: users.isActive,
          branchId: users.branchId,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'user',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit({ ...data, password: data.password ? '[CHANGED]' : undefined }),
        description: `Updated user: ${existing.username}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update user error:', error)
      return { success: false, message: 'Failed to update user' }
    }
  })

  ipcMain.handle('users:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.users.findFirst({
        where: eq(users.id, id),
      })

      if (!existing) {
        return { success: false, message: 'User not found' }
      }

      // Prevent deleting own account
      if (session?.userId === id) {
        return { success: false, message: 'Cannot deactivate your own account' }
      }

      await db
        .update(users)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'user',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated user: ${existing.username}`,
      })

      return { success: true, message: 'User deactivated successfully' }
    } catch (error) {
      console.error('Delete user error:', error)
      return { success: false, message: 'Failed to delete user' }
    }
  })

  ipcMain.handle('users:update-permissions', async (_, id: number, permissions: string[]) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.users.findFirst({
        where: eq(users.id, id),
      })

      if (!existing) {
        return { success: false, message: 'User not found' }
      }

      await db
        .update(users)
        .set({ permissions, updatedAt: new Date().toISOString() })
        .where(eq(users.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'user',
        entityId: id,
        oldValues: { permissions: existing.permissions },
        newValues: { permissions },
        description: `Updated permissions for user: ${existing.username}`,
      })

      return { success: true, message: 'Permissions updated successfully' }
    } catch (error) {
      console.error('Update permissions error:', error)
      return { success: false, message: 'Failed to update permissions' }
    }
  })
}
