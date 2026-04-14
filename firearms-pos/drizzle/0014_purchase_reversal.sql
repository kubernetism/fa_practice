-- Purchase reversal support: append-only reversal siblings + cascade fields

-- purchases: link to sibling reversal row + reason
ALTER TABLE `purchases` ADD `reversed_by_purchase_id` integer REFERENCES purchases(id);--> statement-breakpoint
ALTER TABLE `purchases` ADD `reverses_purchase_id` integer REFERENCES purchases(id);--> statement-breakpoint
ALTER TABLE `purchases` ADD `reversal_reason` text;--> statement-breakpoint

-- expenses: mark originals as reversed + link to counter-entry
ALTER TABLE `expenses` ADD `is_reversed` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `expenses` ADD `reversal_expense_id` integer REFERENCES expenses(id);--> statement-breakpoint

-- business_settings: admin-configurable age cap for reversals
ALTER TABLE `business_settings` ADD `purchase_reversal_max_days` integer DEFAULT 90 NOT NULL;
