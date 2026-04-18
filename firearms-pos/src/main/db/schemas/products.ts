import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core'
import { categories } from './categories'
import { firearmModels } from './firearm-models'
import { firearmCalibers } from './firearm-calibers'
import { firearmShapes } from './firearm-shapes'
import { firearmDesigns } from './firearm-designs'
import { suppliers } from './suppliers'

export const products = sqliteTable(
  'products',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    categoryId: integer('category_id').references(() => categories.id),
    brand: text('brand'),
    costPrice: real('cost_price').notNull().default(0),
    sellingPrice: real('selling_price').notNull().default(0),
    reorderLevel: integer('reorder_level').notNull().default(10),
    unit: text('unit').notNull().default('pcs'),
    isSerialTracked: integer('is_serial_tracked', { mode: 'boolean' }).notNull().default(false),
    isTaxable: integer('is_taxable', { mode: 'boolean' }).notNull().default(true),
    taxRate: real('tax_rate').notNull().default(0),
    barcode: text('barcode'),
    imageUrl: text('image_url'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    // Firearm-specific fields (all nullable)
    make: text('make'), // 'local' | 'imported'
    madeYear: integer('made_year'),
    madeCountry: text('made_country'),
    firearmModelId: integer('firearm_model_id').references(() => firearmModels.id),
    caliberId: integer('caliber_id').references(() => firearmCalibers.id),
    shapeId: integer('shape_id').references(() => firearmShapes.id),
    designId: integer('design_id').references(() => firearmDesigns.id),
    defaultSupplierId: integer('default_supplier_id').references(() => suppliers.id),
    createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
    updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    idxFirearmModel: index('idx_products_firearm_model').on(table.firearmModelId),
    idxCaliber: index('idx_products_caliber').on(table.caliberId),
    idxDefaultSupplier: index('idx_products_default_supplier').on(table.defaultSupplierId),
  }),
)

export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
