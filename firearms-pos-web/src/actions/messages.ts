'use server'

import { db } from '@/lib/db'
import { messages, users } from '@/lib/db/schema'
import { eq, and, desc, sql, count, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getMessages() {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const data = await db
    .select({
      message: messages,
      senderName: users.fullName,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(
      and(
        eq(messages.tenantId, tenantId),
        or(eq(messages.recipientId, userId), eq(messages.senderId, userId))
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(100)

  return { success: true, data }
}

export async function getUnreadCount() {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const result = await db
    .select({ unread: count() })
    .from(messages)
    .where(
      and(
        eq(messages.tenantId, tenantId),
        eq(messages.recipientId, userId),
        eq(messages.isRead, false)
      )
    )

  return { success: true, data: result[0] }
}

export async function sendMessage(data: { recipientId: number; content: string }) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [message] = await db
    .insert(messages)
    .values({
      tenantId,
      senderId: userId,
      recipientId: data.recipientId,
      content: data.content,
    })
    .returning()

  return { success: true, data: message }
}

export async function markAsRead(messageId: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.id, messageId),
        eq(messages.tenantId, tenantId),
        eq(messages.recipientId, userId)
      )
    )

  return { success: true }
}

export async function getTeamMembers() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: users.id,
      name: users.fullName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(users.firstName)

  return { success: true, data }
}
