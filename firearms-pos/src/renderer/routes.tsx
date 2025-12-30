import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { LoginScreen } from '@/screens/login'
import { DashboardScreen } from '@/screens/dashboard'
import { POSScreen } from '@/screens/pos'
import { ProductsScreen } from '@/screens/products'
import { InventoryScreen } from '@/screens/inventory'
import { SalesHistoryScreen } from '@/screens/sales'
import { PurchasesScreen } from '@/screens/purchases'
import { ReturnsScreen } from '@/screens/returns'
import { CustomersScreen } from '@/screens/customers'
import SuppliersScreen from '@/screens/suppliers'
import ExpensesScreen from '@/screens/expenses'
import CommissionsScreen from '@/screens/commissions'
import UsersScreen from '@/screens/users'
import BranchesScreen from '@/screens/branches'

// Placeholder components for other screens
const PlaceholderScreen = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground">This screen is under construction</p>
    </div>
  </div>
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardScreen />} />
        <Route path="pos" element={<POSScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="sales" element={<SalesHistoryScreen />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="purchases" element={<PurchasesScreen />} />
        <Route path="returns" element={<ReturnsScreen />} />
        <Route path="customers" element={<CustomersScreen />} />
        <Route path="suppliers" element={<SuppliersScreen />} />
        <Route path="expenses" element={<ExpensesScreen />} />
        <Route path="commissions" element={<CommissionsScreen />} />
        <Route path="users" element={<UsersScreen />} />
        <Route path="branches" element={<BranchesScreen />} />
        <Route path="reports" element={<PlaceholderScreen title="Reports" />} />
        <Route path="audit" element={<PlaceholderScreen title="Audit Logs" />} />
        <Route path="settings" element={<PlaceholderScreen title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
