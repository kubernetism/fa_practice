import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { branches } from "./branches";
import { users } from "./users";

export const businessSettings = sqliteTable("business_settings", {
  // Primary Key
  settingId: integer("setting_id").primaryKey({ autoIncrement: true }),

  // Branch Association (NULL = Global Settings)
  branchId: integer("branch_id").references(() => branches.id),

  // Business Information
  businessName: text("business_name").notNull(),
  businessRegistrationNo: text("business_registration_no"),
  businessType: text("business_type"), // Retail, Wholesale, Mixed
  businessAddress: text("business_address"),
  businessCity: text("business_city"),
  businessState: text("business_state"),
  businessCountry: text("business_country"),
  businessPostalCode: text("business_postal_code"),
  businessPhone: text("business_phone"),
  businessEmail: text("business_email"),
  businessWebsite: text("business_website"),
  businessLogo: text("business_logo"), // Base64 or file path

  // Tax Configuration
  taxId: text("tax_id"),
  taxRate: real("tax_rate").default(0),
  taxName: text("tax_name").default("GST"),
  isTaxInclusive: integer("is_tax_inclusive", { mode: "boolean" }).default(false),
  secondaryTaxRate: real("secondary_tax_rate").default(0),
  secondaryTaxName: text("secondary_tax_name"),

  // Currency Settings
  currencySymbol: text("currency_symbol").default("Rs."),
  currencyCode: text("currency_code").default("PKR"),
  currencyPosition: text("currency_position").default("prefix"), // prefix or suffix
  decimalPlaces: integer("decimal_places").default(2),
  thousandSeparator: text("thousand_separator").default(","),
  decimalSeparator: text("decimal_separator").default("."),

  // Receipt/Invoice Settings
  receiptHeader: text("receipt_header"),
  receiptFooter: text("receipt_footer"),
  receiptLogo: text("receipt_logo"),
  invoicePrefix: text("invoice_prefix").default("INV"),
  invoiceNumberFormat: text("invoice_number_format").default("sequential"), // sequential, date-based
  invoiceStartingNumber: integer("invoice_starting_number").default(1),
  showTaxOnReceipt: integer("show_tax_on_receipt", { mode: "boolean" }).default(true),
  showQRCodeOnReceipt: integer("show_qr_code_on_receipt", { mode: "boolean" }).default(false),

  // Receipt Customization Settings
  receiptFormat: text("receipt_format").default("pdf"), // pdf | thermal
  receiptPrimaryColor: text("receipt_primary_color").default("#1e40af"),
  receiptSecondaryColor: text("receipt_secondary_color").default("#64748b"),
  receiptFontSize: text("receipt_font_size").default("medium"), // small | medium | large
  receiptCustomField1Label: text("receipt_custom_field_1_label"),
  receiptCustomField1Value: text("receipt_custom_field_1_value"),
  receiptCustomField2Label: text("receipt_custom_field_2_label"),
  receiptCustomField2Value: text("receipt_custom_field_2_value"),
  receiptCustomField3Label: text("receipt_custom_field_3_label"),
  receiptCustomField3Value: text("receipt_custom_field_3_value"),
  receiptTermsAndConditions: text("receipt_terms_and_conditions"),
  receiptShowBusinessLogo: integer("receipt_show_business_logo", { mode: "boolean" }).default(true),
  receiptAutoDownload: integer("receipt_auto_download", { mode: "boolean" }).default(true),

  // Inventory Settings
  lowStockThreshold: integer("low_stock_threshold").default(10),
  enableStockTracking: integer("enable_stock_tracking", { mode: "boolean" }).default(true),
  allowNegativeStock: integer("allow_negative_stock", { mode: "boolean" }).default(false),
  stockValuationMethod: text("stock_valuation_method").default("FIFO"), // FIFO, LIFO, Average
  autoReorderEnabled: integer("auto_reorder_enabled", { mode: "boolean" }).default(false),
  autoReorderQuantity: integer("auto_reorder_quantity").default(50),

  // Payment Settings
  defaultPaymentMethod: text("default_payment_method").default("Cash"),
  allowedPaymentMethods: text("allowed_payment_methods").default("Cash,Card,Bank Transfer,COD"),
  enableCashDrawer: integer("enable_cash_drawer", { mode: "boolean" }).default(true),
  openingCashBalance: real("opening_cash_balance").default(0),

  // Sales Settings
  enableDiscounts: integer("enable_discounts", { mode: "boolean" }).default(true),
  maxDiscountPercentage: real("max_discount_percentage").default(50),
  requireCustomerForSale: integer("require_customer_for_sale", { mode: "boolean" }).default(false),
  enableCustomerLoyalty: integer("enable_customer_loyalty", { mode: "boolean" }).default(false),
  loyaltyPointsRatio: real("loyalty_points_ratio").default(1),

  // Expense Settings
  expenseApprovalRequired: integer("expense_approval_required", { mode: "boolean" }).default(false),
  expenseApprovalLimit: real("expense_approval_limit").default(10000),

  // Purchase Reversal Settings
  purchaseReversalMaxDays: integer("purchase_reversal_max_days").notNull().default(90),

  // Return/Refund Settings
  enableReturns: integer("enable_returns", { mode: "boolean" }).default(true),
  returnWindowDays: integer("return_window_days").default(30),
  requireReceiptForReturn: integer("require_receipt_for_return", { mode: "boolean" }).default(true),
  refundMethod: text("refund_method").default("Original Payment Method"),

  // Notification Settings
  enableEmailNotifications: integer("enable_email_notifications", { mode: "boolean" }).default(false),
  notificationEmail: text("notification_email"),
  lowStockNotifications: integer("low_stock_notifications", { mode: "boolean" }).default(true),
  dailySalesReport: integer("daily_sales_report", { mode: "boolean" }).default(false),

  // Working Hours
  workingDaysStart: text("working_days_start").default("Monday"),
  workingDaysEnd: text("working_days_end").default("Saturday"),
  openingTime: text("opening_time").default("09:00"),
  closingTime: text("closing_time").default("18:00"),

  // Backup Settings
  autoBackupEnabled: integer("auto_backup_enabled", { mode: "boolean" }).default(true),
  autoBackupFrequency: text("auto_backup_frequency").default("daily"),
  backupRetentionDays: integer("backup_retention_days").default(30),

  // System Preferences
  dateFormat: text("date_format").default("DD/MM/YYYY"),
  timeFormat: text("time_format").default("24-hour"),
  language: text("language").default("en"),
  timezone: text("timezone").default("UTC"),

  // Security Settings (Admin Only)
  sessionTimeoutMinutes: integer("session_timeout_minutes").default(60),
  requirePasswordChange: integer("require_password_change", { mode: "boolean" }).default(false),
  passwordChangeIntervalDays: integer("password_change_interval_days").default(90),
  enableAuditLogs: integer("enable_audit_logs", { mode: "boolean" }).default(true),

  // Status & Metadata
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  notes: text("notes"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

// Relations
export const businessSettingsRelations = relations(businessSettings, ({ one }) => ({
  branch: one(branches, {
    fields: [businessSettings.branchId],
    references: [branches.id],
  }),
  createdByUser: one(users, {
    fields: [businessSettings.createdBy],
    references: [users.id],
  }),
}));

// Type definitions
export type BusinessSettings = typeof businessSettings.$inferSelect;
export type InsertBusinessSettings = typeof businessSettings.$inferInsert;
