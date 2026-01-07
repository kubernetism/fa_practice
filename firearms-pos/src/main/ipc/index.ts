import { registerAuthHandlers } from './auth-ipc'
import { registerProductHandlers } from './products-ipc'
import { registerCategoryHandlers } from './categories-ipc'
import { registerInventoryHandlers } from './inventory-ipc'
import { registerCustomerHandlers } from './customers-ipc'
import { registerSupplierHandlers } from './suppliers-ipc'
import { registerSalesHandlers } from './sales-ipc'
import { registerSalesTabsHandlers } from './sales-tabs-ipc'
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

export function registerAllHandlers(): void {
  registerAuthHandlers()
  registerProductHandlers()
  registerCategoryHandlers()
  registerInventoryHandlers()
  registerCustomerHandlers()
  registerSupplierHandlers()
  registerSalesHandlers()
  registerSalesTabsHandlers()
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

  console.log('All IPC handlers registered')
}
