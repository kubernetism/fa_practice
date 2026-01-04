-- Receipt Customization Settings Migration
ALTER TABLE business_settings ADD COLUMN receipt_format TEXT DEFAULT 'pdf';--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_primary_color TEXT DEFAULT '#1e40af';--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_secondary_color TEXT DEFAULT '#64748b';--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_font_size TEXT DEFAULT 'medium';--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_1_label TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_1_value TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_2_label TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_2_value TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_3_label TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_custom_field_3_value TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_terms_and_conditions TEXT;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_show_business_logo INTEGER DEFAULT 1;--> statement-breakpoint
ALTER TABLE business_settings ADD COLUMN receipt_auto_download INTEGER DEFAULT 1;
