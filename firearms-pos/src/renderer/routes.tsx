import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { PageLoader } from '@/components/ui/page-loader'

// Lazy load all page components for better performance
const LoginScreen = lazy(() => import('@/screens/login').then(m => ({ default: m.LoginScreen })))
const DashboardScreen = lazy(() => import('@/screens/dashboard').then(m => ({ default: m.DashboardScreen })))
const POSScreen = lazy(() => import('@/screens/pos').then(m => ({ default: m.POSScreen })))
const ProductsScreen = lazy(() => import('@/screens/products').then(m => ({ default: m.ProductsScreen })))
const InventoryScreen = lazy(() => import('@/screens/inventory').then(m => ({ default: m.InventoryScreen })))
const SalesHistoryScreen = lazy(() => import('@/screens/sales').then(m => ({ default: m.SalesHistoryScreen })))
const PurchasesScreen = lazy(() => import('@/screens/purchases').then(m => ({ default: m.PurchasesScreen })))
const ReturnsScreen = lazy(() => import('@/screens/returns').then(m => ({ default: m.ReturnsScreen })))
const CustomersScreen = lazy(() => import('@/screens/customers').then(m => ({ default: m.CustomersScreen })))
const SuppliersScreen = lazy(() => import('@/screens/suppliers'))
const ExpensesScreen = lazy(() => import('@/screens/expenses'))
const CommissionsScreen = lazy(() => import('@/screens/commissions'))
const UsersScreen = lazy(() => import('@/screens/users'))
const BranchesScreen = lazy(() => import('@/screens/branches'))
const ReportsScreen = lazy(() => import('@/screens/reports'))
const PosTabsScreen = lazy(() => import('@/screens/pos-tabs').then(m => ({ default: m.PosTabsScreen })))
const TabDetailScreen = lazy(() => import('@/screens/pos-tabs/tab-detail').then(m => ({ default: m.TabDetailScreen })))
const TabCheckoutScreen = lazy(() => import('@/screens/pos-tabs/checkout').then(m => ({ default: m.TabCheckoutScreen })))
const AuditReportsScreen = lazy(() => import('@/screens/reports/audit-reports'))
const ReferralPersonsScreen = lazy(() => import('@/screens/referral-persons'))
const AccountPayablesScreen = lazy(() => import('@/screens/account-payables').then(m => ({ default: m.AccountPayablesScreen })))
const AccountReceivablesScreen = lazy(() => import('@/screens/account-receivables').then(m => ({ default: m.AccountReceivablesScreen })))
const CashRegisterScreen = lazy(() => import('@/screens/cash-register'))
const ChartOfAccountsScreen = lazy(() => import('@/screens/chart-of-accounts'))
const BusinessSettingsScreen = lazy(() => import('@/screens/business-settings').then(m => ({ default: m.BusinessSettingsScreen })))
const AuditLogsScreen = lazy(() => import('@/screens/audit-logs').then(m => ({ default: m.AuditLogsScreen })))
const DatabaseViewerScreen = lazy(() => import('@/screens/database-viewer').then(m => ({ default: m.DatabaseViewerScreen })))
const LicenseSettingsScreen = lazy(() => import('@/screens/license-settings').then(m => ({ default: m.LicenseSettingsScreen })))
const SetupWizardScreen = lazy(() => import('@/screens/setup-wizard').then(m => ({ default: m.SetupWizardScreen })))

// Wrapper component for lazy loaded routes
function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/setup"
        element={
          <LazyRoute>
            <SetupWizardScreen />
          </LazyRoute>
        }
      />
      <Route
        path="/login"
        element={
          <LazyRoute>
            <LoginScreen />
          </LazyRoute>
        }
      />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <LazyRoute>
              <DashboardScreen />
            </LazyRoute>
          }
        />
        <Route
          path="pos"
          element={
            <LazyRoute>
              <POSScreen />
            </LazyRoute>
          }
        />
        <Route
          path="products"
          element={
            <LazyRoute>
              <ProductsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <LazyRoute>
              <InventoryScreen />
            </LazyRoute>
          }
        />
        <Route
          path="sales"
          element={
            <LazyRoute>
              <SalesHistoryScreen />
            </LazyRoute>
          }
        />
        <Route
          path="purchases"
          element={
            <LazyRoute>
              <PurchasesScreen />
            </LazyRoute>
          }
        />
        <Route
          path="returns"
          element={
            <LazyRoute>
              <ReturnsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="customers"
          element={
            <LazyRoute>
              <CustomersScreen />
            </LazyRoute>
          }
        />
        <Route
          path="suppliers"
          element={
            <LazyRoute>
              <SuppliersScreen />
            </LazyRoute>
          }
        />
        <Route
          path="expenses"
          element={
            <LazyRoute>
              <ExpensesScreen />
            </LazyRoute>
          }
        />
        <Route
          path="commissions"
          element={
            <LazyRoute>
              <CommissionsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="users"
          element={
            <LazyRoute>
              <UsersScreen />
            </LazyRoute>
          }
        />
        <Route
          path="branches"
          element={
            <LazyRoute>
              <BranchesScreen />
            </LazyRoute>
          }
        />
        <Route
          path="reports"
          element={
            <LazyRoute>
              <ReportsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="pos-tabs"
          element={
            <LazyRoute>
              <PosTabsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="pos-tabs/:tabId"
          element={
            <LazyRoute>
              <TabDetailScreen />
            </LazyRoute>
          }
        />
        <Route
          path="pos-tabs/:tabId/checkout"
          element={
            <LazyRoute>
              <TabCheckoutScreen />
            </LazyRoute>
          }
        />
        <Route
          path="audit-reports"
          element={
            <LazyRoute>
              <AuditReportsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="referral-persons"
          element={
            <LazyRoute>
              <ReferralPersonsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="receivables"
          element={
            <LazyRoute>
              <AccountReceivablesScreen />
            </LazyRoute>
          }
        />
        <Route
          path="payables"
          element={
            <LazyRoute>
              <AccountPayablesScreen />
            </LazyRoute>
          }
        />
        <Route
          path="cash-register"
          element={
            <LazyRoute>
              <CashRegisterScreen />
            </LazyRoute>
          }
        />
        <Route
          path="chart-of-accounts"
          element={
            <LazyRoute>
              <ChartOfAccountsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="audit"
          element={
            <LazyRoute>
              <AuditLogsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="settings"
          element={
            <LazyRoute>
              <BusinessSettingsScreen />
            </LazyRoute>
          }
        />
        <Route
          path="database"
          element={
            <LazyRoute>
              <DatabaseViewerScreen />
            </LazyRoute>
          }
        />
        <Route
          path="settings/license"
          element={
            <LazyRoute>
              <LicenseSettingsScreen />
            </LazyRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
