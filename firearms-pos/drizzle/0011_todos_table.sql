-- Create todos table
CREATE TABLE IF NOT EXISTS `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` text DEFAULT 'medium' NOT NULL,
	`due_date` text,
	`created_by` integer NOT NULL,
	`assigned_to` integer NOT NULL,
	`assigned_to_role` text NOT NULL,
	`branch_id` integer,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `todos_assigned_to_idx` ON `todos` (`assigned_to`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `todos_assigned_to_role_idx` ON `todos` (`assigned_to_role`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `todos_status_idx` ON `todos` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `todos_created_by_idx` ON `todos` (`created_by`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `todos_branch_idx` ON `todos` (`branch_id`);
