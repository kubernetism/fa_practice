-- Create messages table
CREATE TABLE IF NOT EXISTS `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`content` text NOT NULL,
	`sender_id` integer NOT NULL,
	`recipient_id` integer,
	`is_read` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `messages_sender_idx` ON `messages` (`sender_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `messages_recipient_idx` ON `messages` (`recipient_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `messages_created_at_idx` ON `messages` (`created_at`);
