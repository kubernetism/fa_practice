import { ipcMain } from 'electron'
import { eq, and, desc, or } from 'drizzle-orm'
import { getDatabase } from '../db'
import { todos, users, type NewTodo } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface CreateTodoData {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  assignedTo: number
  branchId?: number
}

interface UpdateTodoData {
  id: number
  title?: string
  description?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
}

export function registerTodosHandlers(): void {
  const db = getDatabase()

  // Create a new todo
  ipcMain.handle('todos:create', async (_, data: CreateTodoData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Get the assigned user to determine their role
      const assignedUser = await db.query.users.findFirst({
        where: eq(users.id, data.assignedTo),
      })

      if (!assignedUser) {
        return { success: false, message: 'Assigned user not found' }
      }

      const [newTodo] = await db
        .insert(todos)
        .values({
          title: data.title,
          description: data.description,
          priority: data.priority || 'medium',
          dueDate: data.dueDate,
          createdBy: session.userId,
          assignedTo: data.assignedTo,
          assignedToRole: assignedUser.role,
          branchId: data.branchId || session.branchId,
          status: 'pending',
        })
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'create',
        entityType: 'todo',
        entityId: newTodo.id,
        newValues: {
          title: data.title,
          assignedTo: data.assignedTo,
        },
        description: `Created todo: ${data.title}`,
      })

      return { success: true, data: newTodo }
    } catch (error) {
      console.error('Create todo error:', error)
      return { success: false, message: 'Failed to create todo' }
    }
  })

  // Get all todos for current user (role-based filtering)
  ipcMain.handle('todos:get-all', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Role-based filtering: users can only see todos assigned to their role
      const userTodos = await db.query.todos.findMany({
        where: and(
          eq(todos.assignedToRole, session.role),
          eq(todos.assignedTo, session.userId)
        ),
        orderBy: [desc(todos.createdAt)],
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          assignee: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          branch: true,
        },
      })

      return { success: true, data: userTodos }
    } catch (error) {
      console.error('Get todos error:', error)
      return { success: false, message: 'Failed to fetch todos' }
    }
  })

  // Get todo by ID
  ipcMain.handle('todos:get-by-id', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const todo = await db.query.todos.findFirst({
        where: eq(todos.id, id),
        with: {
          creator: {
            columns: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          assignee: {
            columns: {
              id: true,
              username: true,
              fullName: true,
              role: true,
            },
          },
          branch: true,
        },
      })

      if (!todo) {
        return { success: false, message: 'Todo not found' }
      }

      // Verify user has access to this todo (must be assigned to them)
      if (todo.assignedTo !== session.userId) {
        return { success: false, message: 'Access denied' }
      }

      return { success: true, data: todo }
    } catch (error) {
      console.error('Get todo error:', error)
      return { success: false, message: 'Failed to fetch todo' }
    }
  })

  // Update a todo
  ipcMain.handle('todos:update', async (_, data: UpdateTodoData) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Check if todo exists and user has access
      const existingTodo = await db.query.todos.findFirst({
        where: eq(todos.id, data.id),
      })

      if (!existingTodo) {
        return { success: false, message: 'Todo not found' }
      }

      // Only assigned user can update the todo
      if (existingTodo.assignedTo !== session.userId) {
        return { success: false, message: 'Access denied' }
      }

      const updateData: Partial<NewTodo> = {
        updatedAt: new Date().toISOString(),
      }

      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined) updateData.description = data.description
      if (data.status !== undefined) {
        updateData.status = data.status
        if (data.status === 'completed') {
          updateData.completedAt = new Date().toISOString()
        }
      }
      if (data.priority !== undefined) updateData.priority = data.priority
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate

      const [updatedTodo] = await db
        .update(todos)
        .set(updateData)
        .where(eq(todos.id, data.id))
        .returning()

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'update',
        entityType: 'todo',
        entityId: data.id,
        oldValues: {
          status: existingTodo.status,
          priority: existingTodo.priority,
        },
        newValues: {
          status: data.status,
          priority: data.priority,
        },
        description: `Updated todo: ${existingTodo.title}`,
      })

      return { success: true, data: updatedTodo }
    } catch (error) {
      console.error('Update todo error:', error)
      return { success: false, message: 'Failed to update todo' }
    }
  })

  // Delete a todo
  ipcMain.handle('todos:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Check if todo exists and user has access
      const existingTodo = await db.query.todos.findFirst({
        where: eq(todos.id, id),
      })

      if (!existingTodo) {
        return { success: false, message: 'Todo not found' }
      }

      // Only creator or assigned user can delete the todo
      if (
        existingTodo.createdBy !== session.userId &&
        existingTodo.assignedTo !== session.userId
      ) {
        return { success: false, message: 'Access denied' }
      }

      await db.delete(todos).where(eq(todos.id, id))

      await createAuditLog({
        userId: session.userId,
        branchId: session.branchId,
        action: 'delete',
        entityType: 'todo',
        entityId: id,
        oldValues: {
          title: existingTodo.title,
        },
        description: `Deleted todo: ${existingTodo.title}`,
      })

      return { success: true, message: 'Todo deleted successfully' }
    } catch (error) {
      console.error('Delete todo error:', error)
      return { success: false, message: 'Failed to delete todo' }
    }
  })

  // Get todo counts by status for current user
  ipcMain.handle('todos:get-counts', async () => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      const userTodos = await db.query.todos.findMany({
        where: and(
          eq(todos.assignedToRole, session.role),
          eq(todos.assignedTo, session.userId)
        ),
      })

      const counts = {
        total: userTodos.length,
        pending: userTodos.filter((t) => t.status === 'pending').length,
        in_progress: userTodos.filter((t) => t.status === 'in_progress').length,
        completed: userTodos.filter((t) => t.status === 'completed').length,
        cancelled: userTodos.filter((t) => t.status === 'cancelled').length,
      }

      return { success: true, data: counts }
    } catch (error) {
      console.error('Get todo counts error:', error)
      return { success: false, message: 'Failed to fetch todo counts' }
    }
  })

  // Get users of same role for assignment (when creating todos)
  ipcMain.handle('todos:get-assignable-users', async (_, role?: string) => {
    try {
      const session = getCurrentSession()

      if (!session) {
        return { success: false, message: 'Unauthorized' }
      }

      // Get users of specified role or current user's role
      const targetRole = role || session.role

      const assignableUsers = await db.query.users.findMany({
        where: eq(users.role, targetRole as 'admin' | 'manager' | 'cashier'),
        columns: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
      })

      return { success: true, data: assignableUsers }
    } catch (error) {
      console.error('Get assignable users error:', error)
      return { success: false, message: 'Failed to fetch assignable users' }
    }
  })
}
