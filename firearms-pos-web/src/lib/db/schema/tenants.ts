import {
  pgTable,
  serial,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Tenants (one per business)
export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  logoUrl: text('logo_url'),
  subscriptionStatus: text('subscription_status', {
    enum: ['trial', 'active', 'suspended', 'cancelled'],
  })
    .notNull()
    .default('trial'),
  subscriptionPlan: text('subscription_plan', {
    enum: ['basic', 'pro', 'enterprise'],
  })
    .notNull()
    .default('basic'),
  trialEndsAt: timestamp('trial_ends_at').notNull(),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  kuickpayCustomerId: text('kuickpay_customer_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  priceMonthly: numeric('price_monthly', { precision: 12, scale: 2 }).notNull(),
  priceYearly: numeric('price_yearly', { precision: 12, scale: 2 }),
  maxBranches: integer('max_branches').notNull(),
  maxUsers: integer('max_users').notNull(),
  maxProducts: integer('max_products'),
  features: jsonb('features').default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Subscription Invoices
export const subscriptionInvoices = pgTable('subscription_invoices', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  planId: integer('plan_id')
    .notNull()
    .references(() => subscriptionPlans.id),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: text('status', {
    enum: ['pending', 'paid', 'failed', 'refunded'],
  })
    .notNull()
    .default('pending'),
  kuickpayReference: text('kuickpay_reference'),
  kuickpayTransactionId: text('kuickpay_transaction_id'),
  billingPeriodStart: timestamp('billing_period_start').notNull(),
  billingPeriodEnd: timestamp('billing_period_end').notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// Payment Submissions (tenant submits payment proof for admin verification)
export const paymentSubmissions = pgTable('payment_submissions', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id')
    .notNull()
    .references(() => tenants.id),
  planSlug: text('plan_slug', {
    enum: ['basic', 'pro', 'enterprise'],
  }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  transactionId: text('transaction_id').notNull(),
  paymentType: text('payment_type', {
    enum: ['jazzcash', 'easypaisa', 'bank_transfer', 'nayapay'],
  }).notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  senderAccount: text('sender_account').notNull(),
  receiverAccount: text('receiver_account').notNull(),
  notes: text('notes'),
  status: text('status', {
    enum: ['pending', 'approved', 'rejected'],
  })
    .notNull()
    .default('pending'),
  adminNotes: text('admin_notes'),
  // Business stats snapshot at submission time
  statsBranches: integer('stats_branches').notNull().default(0),
  statsUsers: integer('stats_users').notNull().default(0),
  statsProducts: integer('stats_products').notNull().default(0),
  statsCustomers: integer('stats_customers').notNull().default(0),
  statsRevenue: numeric('stats_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  statsExpenses: numeric('stats_expenses', { precision: 12, scale: 2 }).notNull().default('0'),
  statsNetProfit: numeric('stats_net_profit', { precision: 12, scale: 2 }).notNull().default('0'),
  statsTotalSales: integer('stats_total_sales').notNull().default(0),
  statsMonthRevenue: numeric('stats_month_revenue', { precision: 12, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  subscriptionInvoices: many(subscriptionInvoices),
  paymentSubmissions: many(paymentSubmissions),
}))

export const subscriptionInvoicesRelations = relations(
  subscriptionInvoices,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [subscriptionInvoices.tenantId],
      references: [tenants.id],
    }),
    plan: one(subscriptionPlans, {
      fields: [subscriptionInvoices.planId],
      references: [subscriptionPlans.id],
    }),
  })
)

export const paymentSubmissionsRelations = relations(
  paymentSubmissions,
  ({ one }) => ({
    tenant: one(tenants, {
      fields: [paymentSubmissions.tenantId],
      references: [tenants.id],
    }),
  })
)
