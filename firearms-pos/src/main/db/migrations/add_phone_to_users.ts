/**
 * Migration Script: Add phone field to users table
 *
 * This script:
 * 1. Checks if the phone column already exists
 * 2. Adds the phone column if it doesn't exist
 */

import { getDatabase } from '../index'
import { sql } from 'drizzle-orm'

export async function addPhoneToUsers() {
  console.log('Starting migration to add phone field to users table...')
  const db = getDatabase()

  try {
    // Check if phone column already exists
    let columnExists = false
    try {
      const result = await db.all(sql`PRAGMA table_info(users)`)
      columnExists = result.some((col: any) => col.name === 'phone')
    } catch (error) {
      console.error('Error checking for phone column:', error)
    }

    if (columnExists) {
      console.log('Phone column already exists, skipping migration')
      return { success: true, message: 'Phone column already exists' }
    }

    // Add phone column
    console.log('Adding phone column to users table...')
    await db.run(sql`ALTER TABLE users ADD COLUMN phone TEXT`)

    console.log('Phone column added successfully')
    return { success: true, message: 'Phone column added successfully' }
  } catch (error) {
    console.error('Migration failed:', error)
    return { success: false, message: `Migration failed: ${error}` }
  }
}
