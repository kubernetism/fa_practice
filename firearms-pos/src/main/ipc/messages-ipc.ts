import { ipcMain } from 'electron'
import { eq, and, desc, or, isNull, not } from 'drizzle-orm'
import { getDatabase } from '../db'
import { messages, users } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface SendMessageData {
  content: string
  recipientId?: number // If null, broadcast to all users
}

export function registerMessagesHandlers(): void {
  const db = getDatabase()

  // Send a new message
  ipcMain.handle('messages:send', async (_, data: SendMessageData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const [newMessage] = await db
        .insert(messages)
        .values({
          content: data.content,
          senderId: session.userId,
          recipientId: data.recipientId || null,
          isRead: false,
        })
        .returning()

      // Fetch the message with sender info
      const messageWithSender = await db.query.messages.findFirst({
        where: eq(messages.id, newMessage.id),
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          recipient: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      })

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'create',
        entityType: 'message',
        entityId: newMessage.id,
        newValues: {
          content: data.content.substring(0, 100),
          recipientId: data.recipientId,
        },
        description: `Sent message${data.recipientId ? ' to user' : ' to all'}`,
      })

      return { success: true, data: messageWithSender }
    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, message: 'Failed to send message' }
    }
  })

  // Get all messages for current user (sent to them or broadcast)
  ipcMain.handle('messages:get-all', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Get messages where:
      // 1. User is the recipient
      // 2. Or message is broadcast (recipientId is null)
      // 3. Or user is the sender
      const userMessages = await db.query.messages.findMany({
        where: or(
          eq(messages.recipientId, session.userId),
          isNull(messages.recipientId),
          eq(messages.senderId, session.userId)
        ),
        orderBy: [desc(messages.createdAt)],
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          recipient: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
        },
      })

      return { success: true, data: userMessages }
    } catch (error) {
      console.error('Get messages error:', error)
      return { success: false, message: 'Failed to fetch messages' }
    }
  })

  // Mark message as read
  ipcMain.handle('messages:mark-read', async (_, messageId: number) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Check if message exists and user has access
      const existingMessage = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      })

      if (!existingMessage) {
        return { success: false, message: 'Message not found' }
      }

      // User can only mark messages as read if they are the recipient or it's a broadcast
      if (
        existingMessage.recipientId !== null &&
        existingMessage.recipientId !== session.userId
      ) {
        return { success: false, message: 'Access denied' }
      }

      await db
        .update(messages)
        .set({ isRead: true })
        .where(eq(messages.id, messageId))

      return { success: true, message: 'Message marked as read' }
    } catch (error) {
      console.error('Mark message read error:', error)
      return { success: false, message: 'Failed to mark message as read' }
    }
  })

  // Mark all messages as read for current user
  ipcMain.handle('messages:mark-all-read', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Mark messages where user is recipient or broadcast
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.isRead, false),
            or(
              eq(messages.recipientId, session.userId),
              isNull(messages.recipientId)
            )
          )
        )

      return { success: true, message: 'All messages marked as read' }
    } catch (error) {
      console.error('Mark all messages read error:', error)
      return { success: false, message: 'Failed to mark messages as read' }
    }
  })

  // Delete a message (Admin only)
  ipcMain.handle('messages:delete', async (_, messageId: number) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Only admin can delete messages
      if (session.role !== 'admin') {
        return { success: false, message: 'Only administrators can delete messages' }
      }

      const existingMessage = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      })

      if (!existingMessage) {
        return { success: false, message: 'Message not found' }
      }

      await db.delete(messages).where(eq(messages.id, messageId))

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'delete',
        entityType: 'message',
        entityId: messageId,
        oldValues: {
          content: existingMessage.content.substring(0, 100),
        },
        description: 'Deleted message',
      })

      return { success: true, message: 'Message deleted successfully' }
    } catch (error) {
      console.error('Delete message error:', error)
      return { success: false, message: 'Failed to delete message' }
    }
  })

  // Get unread message count for current user
  ipcMain.handle('messages:get-unread-count', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const unreadMessages = await db.query.messages.findMany({
        where: and(
          eq(messages.isRead, false),
          or(
            eq(messages.recipientId, session.userId),
            isNull(messages.recipientId)
          ),
          // Don't count messages sent by the user themselves
          not(eq(messages.senderId, session.userId))
        ),
      })

      return { success: true, data: unreadMessages.length }
    } catch (error) {
      console.error('Get unread count error:', error)
      return { success: false, message: 'Failed to get unread count' }
    }
  })

  // Get all users for sending messages
  ipcMain.handle('messages:get-users', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const allUsers = await db.query.users.findMany({
        columns: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
        where: eq(users.isActive, true),
      })

      // Filter out current user
      const otherUsers = allUsers.filter((u) => u.id !== session.userId)

      return { success: true, data: otherUsers }
    } catch (error) {
      console.error('Get users error:', error)
      return { success: false, message: 'Failed to fetch users' }
    }
  })
}
