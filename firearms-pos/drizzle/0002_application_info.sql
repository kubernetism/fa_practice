CREATE TABLE `application_info` (
	`info_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`installation_date` text NOT NULL,
	`first_run_date` text NOT NULL,
	`trial_start_date` text NOT NULL,
	`trial_end_date` text NOT NULL,
	`is_licensed` integer DEFAULT false,
	`license_start_date` text,
	`license_end_date` text,
	`machine_id` text NOT NULL,
	`license_key` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `application_info_machine_id_idx` ON `application_info` (`machine_id`);
--> statement-breakpoint
CREATE TABLE `license_history` (
	`history_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`license_id` integer NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`activated_by` integer,
	`activated_at` text NOT NULL,
	`expires_at` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`license_id`) REFERENCES `application_info`(`info_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`activated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `license_history_license_id_idx` ON `license_history` (`license_id`);
--> statement-breakpoint
CREATE INDEX `license_history_activated_by_idx` ON `license_history` (`activated_by`);
