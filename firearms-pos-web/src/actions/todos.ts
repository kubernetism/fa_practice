'use server'

import { db } from '@/lib/db'
import { todos, users } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getTodos(filters?: { status?: string; priority?: string }) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const conditions = [eq(todos.tenantId, tenantId)]
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(todos.status, filters.status as any))
  }
  if (filters?.priority && filters.priority !== 'all') {
    conditions.push(eq(todos.priority, filters.priority as any))
  }

  const data = await db
    .select({
      todo: todos,
      assignedToName: users.fullName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.assignedTo, users.id))
    .where(and(...conditions))
    .orderBy(desc(todos.createdAt))

  return { success: true, data }
}

export async function getTodoSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalTodos: count(),
      pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'pending')`,
      inProgressCount: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'in_progress')`,
      completedCount: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'completed')`,
      urgentCount: sql<number>`COUNT(*) FILTER (WHERE ${todos.priority} = 'urgent' AND ${todos.status} != 'completed')`,
    })
    .from(todos)
    .where(eq(todos.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function createTodo(data: {
  title: string
  description?: string
  priority: string
  assignedTo: number
  assignedToRole: string
  branchId?: number
  dueDate?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [todo] = await db
    .insert(todos)
    .values({
      tenantId,
      title: data.title,
      description: data.description || null,
      priority: data.priority as any,
      createdBy: userId,
      assignedTo: data.assignedTo,
      assignedToRole: data.assignedToRole as any,
      branchId: data.branchId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    })
    .returning()

  return { success: true, data: todo }
}

export async function updateTodoStatus(id: number, status: string) {
  const tenantId = await getTenantId()

  const updateData: any = {
    status: status as any,
    updatedAt: new Date(),
  }
  if (status === 'completed') {
    updateData.completedAt = new Date()
  }

  const [todo] = await db
    .update(todos)
    .set(updateData)
    .where(and(eq(todos.id, id), eq(todos.tenantId, tenantId)))
    .returning()

  if (!todo) return { success: false, message: 'Todo not found' }

  return { success: true, data: todo }
}

export async function getTodoById(id: number) {
  const tenantId = await getTenantId()

  const [todo] = await db
    .select({
      todo: todos,
      assignedToName: users.fullName,
    })
    .from(todos)
    .leftJoin(users, eq(todos.assignedTo, users.id))
    .where(and(eq(todos.id, id), eq(todos.tenantId, tenantId)))

  if (!todo) return { success: false, message: 'Todo not found' }
  return { success: true, data: todo }
}

export async function updateTodo(
  id: number,
  data: {
    title?: string
    description?: string
    priority?: string
    status?: string
    assignedTo?: number
    assignedToRole?: string
    branchId?: number | null
    dueDate?: string | null
  }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.status !== undefined) {
    updateData.status = data.status
    if (data.status === 'completed') updateData.completedAt = new Date()
  }
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
  if (data.assignedToRole !== undefined) updateData.assignedToRole = data.assignedToRole
  if (data.branchId !== undefined) updateData.branchId = data.branchId
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null

  const [todo] = await db
    .update(todos)
    .set(updateData)
    .where(and(eq(todos.id, id), eq(todos.tenantId, tenantId)))
    .returning()

  if (!todo) return { success: false, message: 'Todo not found' }
  return { success: true, data: todo }
}

export async function getTodoCounts() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      pending: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'pending')`,
      inProgress: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'in_progress')`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${todos.status} = 'completed')`,
      overdue: sql<number>`COUNT(*) FILTER (WHERE ${todos.dueDate} IS NOT NULL AND ${todos.dueDate}::date < CURRENT_DATE AND ${todos.status} != 'completed')`,
    })
    .from(todos)
    .where(eq(todos.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getAssignableUsers() {
  const tenantId = await getTenantId()

  const data = await db
    .select({
      id: users.id,
      name: users.fullName,
      role: users.role,
    })
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)))
    .orderBy(users.fullName)

  return { success: true, data }
}

export async function deleteTodo(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.tenantId, tenantId)))

  return { success: true }
}
