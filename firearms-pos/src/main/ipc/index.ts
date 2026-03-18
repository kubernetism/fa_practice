import { registerAuthHandlers } from './auth-ipc'
import { registerProductHandlers } from './products-ipc'
import { registerCategoryHandlers } from './categories-ipc'
import { registerInventoryHandlers } from './inventory-ipc'
import { registerCustomerHandlers } from './customers-ipc'
import { registerSupplierHandlers } from './suppliers-ipc'
import { registerSalesHandlers } from './sales-ipc'

import { registerPurchaseHandlers } from './purchases-ipc'
import { registerReturnHandlers } from './returns-ipc'
import { registerBranchHandlers } from './branches-ipc'
import { registerUserHandlers } from './users-ipc'
import { registerExpenseHandlers } from './expenses-ipc'
import { registerCommissionHandlers } from './commissions-ipc'
import { registerAuditHandlers } from './audit-ipc'
import { registerSettingsHandlers } from './settings-ipc'
import { registerBusinessSettingsHandlers } from './business-settings-ipc'
import { registerReportHandlers } from './reports-ipc'
import { registerLicenseHandlers } from './license-ipc'
import { registerDatabaseViewerHandlers } from './database-viewer-ipc'
import { registerAccountReceivablesHandlers } from './account-receivables-ipc'
import { registerAccountPayablesHandlers } from './account-payables-ipc'
import { registerReferralPersonHandlers } from './referral-persons-ipc'
import { registerCashRegisterHandlers } from './cash-register-ipc'
import { registerChartOfAccountsHandlers } from './chart-of-accounts-ipc'
import { registerReceiptHandlers } from './receipt-ipc'
import { registerTodosHandlers } from './todos-ipc'
import { registerManualMigrationHandlers } from './manual-migration-ipc'
import { registerMessagesHandlers } from './messages-ipc'
import { registerDashboardHandlers } from './dashboard-ipc'
import { registerSetupHandlers } from './setup-ipc'
import { registerDatabaseResetHandlers } from './database-reset-ipc'
import { registerBackupHandlers } from './backup-ipc'
import { registerTaxCollectionsHandlers } from './tax-collections-ipc'
import { registerDiscountManagementHandlers } from './discount-management-ipc'
import { registerInventoryCountsHandlers } from './inventory-counts-ipc'
import { registerServicesHandlers } from './services-ipc'
import { registerVoucherHandlers } from './vouchers-ipc'
import { registerReversalHandlers } from './reversal-ipc'
import { registerClipboardHandlers } from './clipboard-ipc'
import { registerShellHandlers } from './shell-ipc'

// Re-export lock state from the centralized module
export { isApplicationLocked, setApplicationLocked, checkLockGuard } from '../utils/app-lock-state'

export function registerAllHandlers(): void {
  registerAuthHandlers()
  registerProductHandlers()
  registerCategoryHandlers()
  registerInventoryHandlers()
  registerCustomerHandlers()
  registerSupplierHandlers()
  registerSalesHandlers()
  registerPurchaseHandlers()
  registerReturnHandlers()
  registerBranchHandlers()
  registerUserHandlers()
  registerExpenseHandlers()
  registerCommissionHandlers()
  registerAuditHandlers()
  registerSettingsHandlers()
  registerBusinessSettingsHandlers()
  registerReportHandlers()
  registerLicenseHandlers()
  registerDatabaseViewerHandlers()
  registerAccountReceivablesHandlers()
  registerAccountPayablesHandlers()
  registerReferralPersonHandlers()
  registerCashRegisterHandlers()
  registerChartOfAccountsHandlers()
  registerReceiptHandlers()
  registerTodosHandlers()
  registerManualMigrationHandlers()
  registerMessagesHandlers()
  registerDashboardHandlers()
  registerSetupHandlers()
  registerDatabaseResetHandlers()
  registerBackupHandlers()
  registerTaxCollectionsHandlers()
  registerDiscountManagementHandlers()
  registerInventoryCountsHandlers()
  registerServicesHandlers()
  registerVoucherHandlers()
  registerReversalHandlers()
  registerClipboardHandlers()
  registerShellHandlers()

  console.log('All IPC handlers registered')
}

/**
 * Register only license-related handlers.
 * Used when the application starts in locked mode (DB is encrypted).
 */
export function registerLicenseOnlyHandlers(): void {
  registerLicenseHandlers()
  console.log('License-only IPC handlers registered (application locked)')
}
