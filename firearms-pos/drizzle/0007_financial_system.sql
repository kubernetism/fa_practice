CREATE TABLE IF NOT EXISTS `account_payables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`supplier_id` integer NOT NULL,
	`purchase_id` integer,
	`branch_id` integer NOT NULL,
	`invoice_number` text NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`remaining_amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text,
	`payment_terms` text,
	`notes` text,
	`created_by` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payables_supplier_idx` ON `account_payables` (`supplier_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payables_status_idx` ON `account_payables` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payables_branch_idx` ON `account_payables` (`branch_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payables_due_date_idx` ON `account_payables` (`due_date`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `payable_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`payable_id` integer NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'bank_transfer' NOT NULL,
	`reference_number` text,
	`notes` text,
	`paid_by` integer,
	`payment_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`payable_id`) REFERENCES `account_payables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paid_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payable_payments_payable_idx` ON `payable_payments` (`payable_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `payable_payments_date_idx` ON `payable_payments` (`payment_date`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cash_register_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer NOT NULL,
	`session_date` text NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`closing_balance` real,
	`expected_balance` real,
	`actual_balance` real,
	`variance` real,
	`status` text DEFAULT 'open' NOT NULL,
	`opened_by` integer NOT NULL,
	`closed_by` integer,
	`reconciled_by` integer,
	`opened_at` text NOT NULL,
	`closed_at` text,
	`reconciled_at` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`opened_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reconciled_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `cash_session_branch_date_unique` ON `cash_register_sessions` (`branch_id`,`session_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_session_branch_idx` ON `cash_register_sessions` (`branch_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_session_date_idx` ON `cash_register_sessions` (`session_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_session_status_idx` ON `cash_register_sessions` (`status`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cash_transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` integer NOT NULL,
	`branch_id` integer NOT NULL,
	`transaction_type` text NOT NULL,
	`amount` real NOT NULL,
	`reference_type` text,
	`reference_id` integer,
	`description` text,
	`recorded_by` integer NOT NULL,
	`transaction_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `cash_register_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recorded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_tx_session_idx` ON `cash_transactions` (`session_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_tx_branch_idx` ON `cash_transactions` (`branch_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_tx_type_idx` ON `cash_transactions` (`transaction_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `cash_tx_date_idx` ON `cash_transactions` (`transaction_date`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chart_of_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_code` text NOT NULL,
	`account_name` text NOT NULL,
	`account_type` text NOT NULL,
	`account_sub_type` text,
	`parent_account_id` integer,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_system_account` integer DEFAULT false NOT NULL,
	`normal_balance` text NOT NULL,
	`current_balance` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `chart_of_accounts_account_code_unique` ON `chart_of_accounts` (`account_code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `coa_type_idx` ON `chart_of_accounts` (`account_type`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `coa_parent_idx` ON `chart_of_accounts` (`parent_account_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `coa_active_idx` ON `chart_of_accounts` (`is_active`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_number` text NOT NULL,
	`entry_date` text NOT NULL,
	`description` text NOT NULL,
	`reference_type` text,
	`reference_id` integer,
	`branch_id` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_auto_generated` integer DEFAULT false NOT NULL,
	`created_by` integer NOT NULL,
	`posted_by` integer,
	`posted_at` text,
	`reversed_by` integer,
	`reversed_at` text,
	`reversal_entry_id` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`posted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reversed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `journal_entries_entry_number_unique` ON `journal_entries` (`entry_number`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `je_date_idx` ON `journal_entries` (`entry_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `je_status_idx` ON `journal_entries` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `je_ref_idx` ON `journal_entries` (`reference_type`,`reference_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `journal_entry_lines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`journal_entry_id` integer NOT NULL,
	`account_id` integer NOT NULL,
	`debit_amount` real DEFAULT 0 NOT NULL,
	`credit_amount` real DEFAULT 0 NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `jel_entry_idx` ON `journal_entry_lines` (`journal_entry_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `jel_account_idx` ON `journal_entry_lines` (`account_id`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `account_balances` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`account_id` integer NOT NULL,
	`branch_id` integer,
	`period_type` text NOT NULL,
	`period_date` text NOT NULL,
	`opening_balance` real DEFAULT 0 NOT NULL,
	`debit_total` real DEFAULT 0 NOT NULL,
	`credit_total` real DEFAULT 0 NOT NULL,
	`closing_balance` real DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ab_account_period_idx` ON `account_balances` (`account_id`,`period_type`,`period_date`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `ab_branch_idx` ON `account_balances` (`branch_id`);
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('1000', 'Cash and Cash Equivalents', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('1010', 'Cash in Hand', 'asset', 'cash', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('1020', 'Cash in Bank', 'asset', 'bank', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('1100', 'Accounts Receivable', 'asset', 'accounts_receivable', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('1200', 'Inventory', 'asset', 'inventory', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('2000', 'Accounts Payable', 'liability', 'accounts_payable', 'credit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('3000', 'Owner Capital', 'equity', 'owner_capital', 'credit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('3100', 'Retained Earnings', 'equity', 'retained_earnings', 'credit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('4000', 'Sales Revenue', 'revenue', 'sales_revenue', 'credit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('5000', 'Cost of Goods Sold', 'expense', 'cost_of_goods_sold', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('5100', 'Salaries and Wages', 'expense', 'payroll_expense', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('5200', 'Rent Expense', 'expense', 'rent_expense', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('5300', 'Utilities Expense', 'expense', 'utilities_expense', 'debit', 1, datetime('now'), datetime('now'));
--> statement-breakpoint
INSERT OR IGNORE INTO `chart_of_accounts` (`account_code`, `account_name`, `account_type`, `account_sub_type`, `normal_balance`, `is_system_account`, `created_at`, `updated_at`) VALUES ('5900', 'Other Expenses', 'expense', 'other_expense', 'debit', 0, datetime('now'), datetime('now'));
