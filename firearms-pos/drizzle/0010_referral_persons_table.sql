-- Create referral_persons table
CREATE TABLE IF NOT EXISTS `referral_persons` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_id` integer NOT NULL,
	`name` text NOT NULL,
	`contact` text,
	`address` text,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`total_commission_earned` real DEFAULT 0 NOT NULL,
	`total_commission_paid` real DEFAULT 0 NOT NULL,
	`commission_rate` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `referral_persons_branch_idx` ON `referral_persons` (`branch_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `referral_persons_name_idx` ON `referral_persons` (`name`);