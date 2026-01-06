import { ipcMain } from 'electron'
import { getRawDatabase } from '../db'

export function registerManualMigrationHandlers(): void {
  // Debug handler to check if todos table exists
  ipcMain.handle('migration:check-todos-table', async () => {
    try {
      const db = getRawDatabase()
      const tableCheck = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='todos'`
      ).get()

      return {
        success: true,
        exists: !!tableCheck,
        message: tableCheck ? 'Todos table exists' : 'Todos table does NOT exist'
      }
    } catch (error) {
      return { success: false, message: `Check failed: ${error}` }
    }
  })

  ipcMain.handle('migration:create-todos-table', async () => {
    try {
      const db = getRawDatabase()

      // Check if table already exists
      const tableCheck = db.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='todos'`
      ).get()

      if (tableCheck) {
        return { success: true, message: 'Todos table already exists' }
      }

      // Create the todos table
      const migrationSQL = `
        CREATE TABLE IF NOT EXISTS "todos" (
          "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          "title" text NOT NULL,
          "description" text,
          "status" text DEFAULT 'pending' NOT NULL,
          "priority" text DEFAULT 'medium' NOT NULL,
          "due_date" text,
          "created_by" integer NOT NULL,
          "assigned_to" integer NOT NULL,
          "assigned_to_role" text NOT NULL,
          "branch_id" integer,
          "completed_at" text,
          "created_at" text NOT NULL,
          "updated_at" text NOT NULL,
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
          FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action,
          FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON UPDATE no action ON DELETE no action
        );

        CREATE INDEX IF NOT EXISTS "todos_assigned_to_idx" ON "todos" ("assigned_to");
        CREATE INDEX IF NOT EXISTS "todos_assigned_to_role_idx" ON "todos" ("assigned_to_role");
        CREATE INDEX IF NOT EXISTS "todos_status_idx" ON "todos" ("status");
        CREATE INDEX IF NOT EXISTS "todos_created_by_idx" ON "todos" ("created_by");
        CREATE INDEX IF NOT EXISTS "todos_branch_idx" ON "todos" ("branch_id");
      `

      db.exec(migrationSQL)

      console.log('Todos table created successfully via manual migration')

      return { success: true, message: 'Todos table created successfully' }
    } catch (error) {
      console.error('Manual migration error:', error)
      return { success: false, message: `Migration failed: ${error}` }
    }
  })
}
