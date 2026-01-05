-- Add payment status and related fields to expenses table
ALTER TABLE `expenses` ADD `payment_status` text DEFAULT 'paid' NOT NULL;--> statement-breakpoint
ALTER TABLE `expenses` ADD `supplier_id` integer REFERENCES suppliers(id);--> statement-breakpoint
ALTER TABLE `expenses` ADD `payable_id` integer REFERENCES account_payables(id);--> statement-breakpoint
ALTER TABLE `expenses` ADD `due_date` text;--> statement-breakpoint
ALTER TABLE `expenses` ADD `payment_terms` text;--> statement-breakpoint
CREATE INDEX `expenses_payment_status_idx` ON `expenses` (`payment_status`);--> statement-breakpoint
CREATE INDEX `expenses_supplier_idx` ON `expenses` (`supplier_id`);--> statement-breakpoint
CREATE INDEX `expenses_payable_idx` ON `expenses` (`payable_id`);