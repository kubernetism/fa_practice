import { ipcMain } from 'electron'
import bcrypt from 'bcryptjs'
import { getDatabase, getRawDatabase } from '../db'
import { users, type NewUser } from '../db/schema'
import { eq } from 'drizzle-orm'

export function registerDatabaseResetHandlers(): void {
  const db = getDatabase()

  /**
   * Hard Reset Database - Returns the database to a fresh install state
   * This will delete all data except the default admin user
   * WARNING: This is a DESTRUCTIVE operation and cannot be undone
   */
  ipcMain.handle('database:hard-reset', async (_, confirmationText: string) => {
    try {
      // Verify confirmation text
      if (confirmationText !== 'RESET') {
        return {
          success: false,
          message: 'Confirmation text does not match. Please type "RESET" exactly.'
        }
      }

      const rawDb = getRawDatabase()

      console.log('Starting hard reset...')

      // Disable foreign keys temporarily to avoid constraint issues
      rawDb.pragma('foreign_keys = OFF')

      try {
        // Delete data from all tables in the correct order (respecting dependencies)
        // Start with dependent tables first, then parent tables

        // 1. Delete commission records
        console.log('Deleting commissions...')
        rawDb.prepare('DELETE FROM commissions').run()

        // 2. Delete audit logs
        console.log('Deleting audit logs...')
        rawDb.prepare('DELETE FROM audit_logs').run()

        // 3. Delete messages
        console.log('Deleting messages...')
        rawDb.prepare('DELETE FROM messages').run()

        // 4. Delete todos
        console.log('Deleting todos...')
        rawDb.prepare('DELETE FROM todos').run()

        // 5. Delete account receivables and payables (with payment records first)
        console.log('Deleting receivable payments...')
        rawDb.prepare('DELETE FROM receivable_payments').run()

        console.log('Deleting account receivables...')
        rawDb.prepare('DELETE FROM account_receivables').run()

        console.log('Deleting payable payments...')
        rawDb.prepare('DELETE FROM payable_payments').run()

        console.log('Deleting account payables...')
        rawDb.prepare('DELETE FROM account_payables').run()

        // 6. Delete cash register entries (transactions first, then sessions)
        console.log('Deleting cash transactions...')
        rawDb.prepare('DELETE FROM cash_transactions').run()

        console.log('Deleting cash register sessions...')
        rawDb.prepare('DELETE FROM cash_register_sessions').run()

        // 7. Delete journal entries (lines first, then entries)
        console.log('Deleting journal entry lines...')
        rawDb.prepare('DELETE FROM journal_entry_lines').run()

        console.log('Deleting journal entries...')
        rawDb.prepare('DELETE FROM journal_entries').run()

        // 8. Delete account balances
        console.log('Deleting account balances...')
        rawDb.prepare('DELETE FROM account_balances').run()

        // 9. Delete stock adjustments and transfers
        console.log('Deleting stock adjustments...')
        rawDb.prepare('DELETE FROM stock_adjustments').run()

        console.log('Deleting stock transfers...')
        rawDb.prepare('DELETE FROM stock_transfers').run()

        // 10. Delete return items then returns
        console.log('Deleting return items...')
        rawDb.prepare('DELETE FROM return_items').run()

        console.log('Deleting returns...')
        rawDb.prepare('DELETE FROM returns').run()

        // 11. Delete sales tab items then sales tabs
        console.log('Deleting sales tab items...')
        rawDb.prepare('DELETE FROM sales_tab_items').run()

        console.log('Deleting sales tabs...')
        rawDb.prepare('DELETE FROM sales_tabs').run()

        // 12. Delete sale child tables then sales
        console.log('Deleting sale services...')
        rawDb.prepare('DELETE FROM sale_services').run()

        console.log('Deleting sale items...')
        rawDb.prepare('DELETE FROM sale_items').run()

        console.log('Deleting sale payments...')
        rawDb.prepare('DELETE FROM sale_payments').run()

        console.log('Deleting vouchers...')
        rawDb.prepare('DELETE FROM vouchers').run()

        console.log('Deleting sales...')
        rawDb.prepare('DELETE FROM sales').run()

        // 13. Delete purchases (has items in JSON, no separate table)
        console.log('Deleting purchases...')
        rawDb.prepare('DELETE FROM purchases').run()

        // 14. Delete expenses
        console.log('Deleting expenses...')
        rawDb.prepare('DELETE FROM expenses').run()

        // 15. Delete inventory cost layers, count items, counts, then inventory
        console.log('Deleting inventory cost layers...')
        rawDb.prepare('DELETE FROM inventory_cost_layers').run()

        console.log('Deleting inventory count items...')
        rawDb.prepare('DELETE FROM inventory_count_items').run()

        console.log('Deleting inventory counts...')
        rawDb.prepare('DELETE FROM inventory_counts').run()

        console.log('Deleting inventory...')
        rawDb.prepare('DELETE FROM inventory').run()

        // 16. Delete products
        console.log('Deleting products...')
        rawDb.prepare('DELETE FROM products').run()

        // 17. Delete categories
        console.log('Deleting categories...')
        rawDb.prepare('DELETE FROM categories').run()

        // 17b. Delete services and service categories
        console.log('Deleting services...')
        rawDb.prepare('DELETE FROM services').run()

        console.log('Deleting service categories...')
        rawDb.prepare('DELETE FROM service_categories').run()

        // 18. Delete customers
        console.log('Deleting customers...')
        rawDb.prepare('DELETE FROM customers').run()

        // 19. Delete suppliers
        console.log('Deleting suppliers...')
        rawDb.prepare('DELETE FROM suppliers').run()

        // 20. Delete referral persons
        console.log('Deleting referral persons...')
        rawDb.prepare('DELETE FROM referral_persons').run()

        // 21. Delete chart of accounts
        console.log('Deleting chart of accounts...')
        rawDb.prepare('DELETE FROM chart_of_accounts').run()

        // 22. Delete all users (we'll recreate admin after)
        console.log('Deleting all users...')
        rawDb.prepare('DELETE FROM users').run()

        // 23. Delete business settings
        console.log('Deleting business settings...')
        rawDb.prepare('DELETE FROM business_settings').run()

        // 24. Delete general settings
        console.log('Deleting general settings...')
        rawDb.prepare('DELETE FROM settings').run()

        // 25. Delete branches
        console.log('Deleting branches...')
        rawDb.prepare('DELETE FROM branches').run()

        // 26. Reset application_info to show setup wizard again
        console.log('Resetting application info...')
        rawDb.prepare('UPDATE application_info SET setup_completed = 0').run()

        // Re-enable foreign keys
        rawDb.pragma('foreign_keys = ON')

        console.log('Data deleted. Creating default admin user...')

        // Create the default admin user with hashed password
        const hashedPassword = await bcrypt.hash('admin123', 12)

        await db.insert(users).values({
          username: 'admin',
          password: hashedPassword,
          email: 'admin@example.com',
          fullName: 'Administrator',
          role: 'admin',
          permissions: ['*'],
          isActive: true,
          branchId: null,
        } as NewUser)

        console.log('Default admin user created successfully')
        console.log('Hard reset completed successfully!')

        return {
          success: true,
          message: 'Database has been reset successfully. Please restart the application.'
        }
      } catch (error) {
        // Re-enable foreign keys even if there's an error
        rawDb.pragma('foreign_keys = ON')
        throw error
      }
    } catch (error) {
      console.error('Hard reset error:', error)
      return {
        success: false,
        message: `Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  })

  /**
   * Verify admin credentials before allowing hard reset
   * Returns true if the credentials are valid
   */
  ipcMain.handle('database:verify-admin', async (_, username: string, password: string) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      })

      if (!user) {
        return { success: false, message: 'Invalid credentials' }
      }

      if (user.role !== 'admin') {
        return { success: false, message: 'Only administrators can perform this action' }
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return { success: false, message: 'Invalid credentials' }
      }

      return { success: true }
    } catch (error) {
      console.error('Admin verification error:', error)
      return { success: false, message: 'Failed to verify credentials' }
    }
  })
}
