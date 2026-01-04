CREATE TABLE `sales_tabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tab_number` text NOT NULL,
	`branch_id` integer NOT NULL,
	`customer_id` integer,
	`user_id` integer NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`item_count` integer DEFAULT 0 NOT NULL,
	`subtotal` real DEFAULT 0 NOT NULL,
	`discount` real DEFAULT 0 NOT NULL,
	`tax` real DEFAULT 0 NOT NULL,
	`final_amount` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`closed_at` text,
	`closed_by` integer,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`closed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_tabs_tab_number_unique` ON `sales_tabs` (`tab_number`);
--> statement-breakpoint
CREATE INDEX `sales_tabs_branch_idx` ON `sales_tabs` (`branch_id`);
--> statement-breakpoint
CREATE INDEX `sales_tabs_status_idx` ON `sales_tabs` (`status`);
--> statement-breakpoint
CREATE INDEX `sales_tabs_created_idx` ON `sales_tabs` (`created_at`);
--> statement-breakpoint
CREATE TABLE `sales_tab_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tab_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`product_code` text,
	`quantity` integer NOT NULL,
	`selling_price` real NOT NULL,
	`cost_price` real NOT NULL,
	`tax_percent` real DEFAULT 0 NOT NULL,
	`subtotal` real NOT NULL,
	`serial_number` text,
	`batch_number` text,
	`added_at` text NOT NULL,
	FOREIGN KEY (`tab_id`) REFERENCES `sales_tabs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sales_tab_items_tab_idx` ON `sales_tab_items` (`tab_id`);
