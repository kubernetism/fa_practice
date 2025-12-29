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
import { registerReportHandlers } from './reports-ipc'
import { registerLicenseHandlers } from './license-ipc'

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
  registerReportHandlers()
  registerLicenseHandlers()

  console.log('All IPC handlers registered')
}
