-- Create vouchers table
CREATE TABLE IF NOT EXISTS `vouchers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL UNIQUE,
	`description` text,
	`discount_amount` real NOT NULL,
	`expires_at` text,
	`is_used` integer DEFAULT 0 NOT NULL,
	`used_at` text,
	`used_in_sale_id` integer,
	`created_by` integer,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` text NOT NULL DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`used_in_sale_id`) REFERENCES `sales`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `vouchers_code_idx` ON `vouchers` (`code`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `vouchers_is_used_idx` ON `vouchers` (`is_used`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `vouchers_is_active_idx` ON `vouchers` (`is_active`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `vouchers_created_at_idx` ON `vouchers` (`created_at`);