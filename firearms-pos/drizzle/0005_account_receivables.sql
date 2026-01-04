CREATE TABLE `account_receivables` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_id` integer NOT NULL,
	`sale_id` integer,
	`branch_id` integer NOT NULL,
	`invoice_number` text NOT NULL,
	`total_amount` real NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`remaining_amount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`due_date` text,
	`notes` text,
	`created_by` integer,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `receivables_customer_idx` ON `account_receivables` (`customer_id`);
--> statement-breakpoint
CREATE INDEX `receivables_status_idx` ON `account_receivables` (`status`);
--> statement-breakpoint
CREATE INDEX `receivables_branch_idx` ON `account_receivables` (`branch_id`);
--> statement-breakpoint
CREATE INDEX `receivables_due_date_idx` ON `account_receivables` (`due_date`);
--> statement-breakpoint
CREATE TABLE `receivable_payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`receivable_id` integer NOT NULL,
	`amount` real NOT NULL,
	`payment_method` text DEFAULT 'cash' NOT NULL,
	`reference_number` text,
	`notes` text,
	`received_by` integer,
	`payment_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`receivable_id`) REFERENCES `account_receivables`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`received_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `payments_receivable_idx` ON `receivable_payments` (`receivable_id`);
--> statement-breakpoint
CREATE INDEX `payments_date_idx` ON `receivable_payments` (`payment_date`);
