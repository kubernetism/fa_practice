import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getDatabase } from '../db'
import { users, branches } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'

interface SessionData {
  userId: number
  username: string
  fullName: string
  email: string
  role: string
  permissions: string[]
  branchId: number | null
  branchName: string | null
}

let currentSession: SessionData | null = null

export function registerAuthHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('auth:login', async (_, username: string, password: string) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      })

      if (!user) {
        return { success: false, message: 'Invalid username or password' }
      }

      if (!user.isActive) {
        return { success: false, message: 'Account is deactivated' }
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return { success: false, message: 'Invalid username or password' }
      }

      // Get branch info
      let branchName: string | null = null
      if (user.branchId) {
        const branch = await db.query.branches.findFirst({
          where: eq(branches.id, user.branchId),
        })
        branchName = branch?.name ?? null
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLogin: new Date().toISOString() })
        .where(eq(users.id, user.id))

      // Create session
      currentSession = {
        userId: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: (user.permissions as string[]) ?? [],
        branchId: user.branchId,
        branchName,
      }

      // Audit log
      await createAuditLog({
        userId: user.id,
        branchId: user.branchId,
        action: 'login',
        entityType: 'auth',
        entityId: user.id,
        description: `User ${user.username} logged in`,
      })

      return {
        success: true,
        user: currentSession,
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'An error occurred during login' }
    }
  })

  ipcMain.handle('auth:logout', async () => {
    if (currentSession) {
      await createAuditLog({
        userId: currentSession.userId,
        branchId: currentSession.branchId,
        action: 'logout',
        entityType: 'auth',
        entityId: currentSession.userId,
        description: `User ${currentSession.username} logged out`,
      })
    }
    currentSession = null
    return { success: true }
  })

  ipcMain.handle('auth:get-current-user', async () => {
    return currentSession
  })

  ipcMain.handle('auth:change-password', async (_, userId: number, currentPassword: string, newPassword: string) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      })

      if (!user) {
        return { success: false, message: 'User not found' }
      }

      const validPassword = await bcrypt.compare(currentPassword, user.password)
      if (!validPassword) {
        return { success: false, message: 'Current password is incorrect' }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await db
        .update(users)
        .set({
          password: hashedPassword,
          updatedAt: new Date().toISOString()
        })
        .where(eq(users.id, userId))

      await createAuditLog({
        userId: currentSession?.userId,
        branchId: currentSession?.branchId,
        action: 'update',
        entityType: 'user',
        entityId: userId,
        description: 'Password changed',
      })

      return { success: true, message: 'Password changed successfully' }
    } catch (error) {
      console.error('Change password error:', error)
      return { success: false, message: 'An error occurred while changing password' }
    }
  })

  ipcMain.handle('auth:check-permission', async (_, permission: string) => {
    if (!currentSession) return false
    if (currentSession.role === 'admin') return true
    if (currentSession.permissions.includes('*')) return true
    return currentSession.permissions.includes(permission)
  })
}

export function getCurrentSession(): SessionData | null {
  return currentSession
}
