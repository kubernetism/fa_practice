/**
 * Migration Script: Transform settings to business_settings
 *
 * This script:
 * 1. Creates the new business_settings table
 * 2. Migrates existing settings data to global settings (branchId = NULL)
 * 3. Preserves backward compatibility with old settings table
 */

import { getDatabase } from "../index";
import { businessSettings } from "../schemas/business_settings";
import { settings } from "../schemas/settings";
import { sql, eq, isNull, and } from "drizzle-orm";

export async function migrateToBusinessSettings() {
  console.log("Starting migration to business_settings table...");
  const db = getDatabase()

  try {
    // Check if business_settings table already exists by trying to query it
    let tableExists = false
    try {
      await db.select({ count: sql<number>`count(*)` }).from(businessSettings).limit(1)
      tableExists = true
    } catch {
      // Table doesn't exist yet
      tableExists = false
    }

    // Check if old settings table has data
    let oldSettingsExist = false
    try {
      const oldSettingsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(settings)
        .limit(1)
      oldSettingsExist = oldSettingsCount && (oldSettingsCount[0]?.count ?? 0) > 0
    } catch {
      oldSettingsExist = false
    }

    console.log(`business_settings table exists: ${tableExists}`)
    console.log(`Old settings table has data: ${oldSettingsExist}`)

    // Check if global settings already exist (branchId = NULL)
    let globalSettingsExists = false
    if (tableExists) {
      try {
        const globalSettings = await db
          .select({ count: sql<number>`count(*)` })
          .from(businessSettings)
          .where(isNull(businessSettings.branchId))
          .limit(1)
        globalSettingsExists = globalSettings && (globalSettings[0]?.count ?? 0) > 0
        console.log(`Global settings already exist: ${globalSettingsExists}`)
      } catch (err) {
        console.error('Error checking global settings:', err)
        globalSettingsExists = false
      }
    }

    // Only create default global settings if they don't exist yet
    if (!globalSettingsExists) {
      console.log("Creating default global settings...");

      // Create default global settings
      await db.insert(businessSettings).values({
        branchId: null,
        businessName: "Firearms Retail POS",
        businessAddress: "",
        businessCity: "",
        businessState: "",
        businessCountry: "Pakistan",
        businessPostalCode: "",
        businessPhone: "",
        businessEmail: "",
        businessWebsite: "",
        taxRate: 0,
        taxName: "GST",
        isTaxInclusive: false,
        secondaryTaxRate: 0,
        currencySymbol: "Rs.",
        currencyCode: "PKR",
        currencyPosition: "prefix",
        decimalPlaces: 2,
        thousandSeparator: ",",
        decimalSeparator: ".",
        invoicePrefix: "INV",
        invoiceNumberFormat: "sequential",
        invoiceStartingNumber: 1,
        showTaxOnReceipt: true,
        showQRCodeOnReceipt: false,
        lowStockThreshold: 10,
        enableStockTracking: true,
        allowNegativeStock: false,
        stockValuationMethod: "FIFO",
        autoReorderEnabled: false,
        autoReorderQuantity: 50,
        defaultPaymentMethod: "Cash",
        allowedPaymentMethods: "Cash,Card,Bank Transfer,COD",
        enableCashDrawer: true,
        openingCashBalance: 0,
        enableDiscounts: true,
        maxDiscountPercentage: 50,
        requireCustomerForSale: false,
        enableCustomerLoyalty: false,
        loyaltyPointsRatio: 1,
        expenseApprovalRequired: false,
        expenseApprovalLimit: 10000,
        enableReturns: true,
        returnWindowDays: 30,
        requireReceiptForReturn: true,
        refundMethod: "Original Payment Method",
        enableEmailNotifications: false,
        lowStockNotifications: true,
        dailySalesReport: false,
        workingDaysStart: "Monday",
        workingDaysEnd: "Saturday",
        openingTime: "09:00",
        closingTime: "18:00",
        autoBackupEnabled: true,
        autoBackupFrequency: "daily",
        backupRetentionDays: 30,
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24-hour",
        language: "en",
        timezone: "UTC",
        sessionTimeoutMinutes: 60,
        requirePasswordChange: false,
        passwordChangeIntervalDays: 90,
        enableAuditLogs: true,
        isActive: true,
        isDefault: true,
      });

      console.log("Default global settings created successfully");
    }

    // If old settings table has data, try to migrate it
    if (oldSettingsExist && (oldSettingsExist[0]?.count ?? 0) > 0) {
      console.log("Attempting to migrate old settings data...");

      try {
        const oldSettings = await db.select().from(settings).all();

        // Map old settings to new format
        const settingMap: Record<string, unknown> = {};
        oldSettings.forEach((setting) => {
          settingMap[setting.key] = setting.value;
        });

        // Update global settings with migrated values
        const updateData: Record<string, unknown> = {};

        if (settingMap.company_name) updateData.businessName = settingMap.company_name;
        if (settingMap.company_address) updateData.businessAddress = settingMap.company_address;
        if (settingMap.company_phone) updateData.businessPhone = settingMap.company_phone;
        if (settingMap.company_email) updateData.businessEmail = settingMap.company_email;
        if (settingMap.tax_rate) updateData.taxRate = parseFloat(settingMap.tax_rate as string);
        if (settingMap.tax_name) updateData.taxName = settingMap.tax_name;
        if (settingMap.currency_symbol) updateData.currencySymbol = settingMap.currency_symbol;
        if (settingMap.currency_code) updateData.currencyCode = settingMap.currency_code;

        if (Object.keys(updateData).length > 0) {
          await db
            .update(businessSettings)
            .set({
              ...updateData,
              updatedAt: new Date().toISOString(),
            })
            .where(isNull(businessSettings.branchId));

          console.log("Old settings migrated successfully");
        }
      } catch (migrationError) {
        console.warn("Could not migrate old settings (may be in different format):", migrationError);
      }
    }

    console.log("Migration completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// NOTE: This migration is called from migrate.ts via runMigrations()
// Do NOT add self-executing code here as it breaks production builds
