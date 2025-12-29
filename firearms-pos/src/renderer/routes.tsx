import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/main-layout'
import { LoginScreen } from '@/screens/login'
import { DashboardScreen } from '@/screens/dashboard'
import { POSScreen } from '@/screens/pos'
import { ProductsScreen } from '@/screens/products'
import { InventoryScreen } from '@/screens/inventory'

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
        <Route path="sales" element={<PlaceholderScreen title="Sales History" />} />
        <Route path="inventory" element={<InventoryScreen />} />
        <Route path="purchases" element={<PlaceholderScreen title="Purchase Orders" />} />
        <Route path="returns" element={<PlaceholderScreen title="Returns" />} />
        <Route path="customers" element={<PlaceholderScreen title="Customers" />} />
        <Route path="suppliers" element={<PlaceholderScreen title="Suppliers" />} />
        <Route path="expenses" element={<PlaceholderScreen title="Expenses" />} />
        <Route path="commissions" element={<PlaceholderScreen title="Commissions" />} />
        <Route path="users" element={<PlaceholderScreen title="Users" />} />
        <Route path="branches" element={<PlaceholderScreen title="Branches" />} />
        <Route path="reports" element={<PlaceholderScreen title="Reports" />} />
        <Route path="audit" element={<PlaceholderScreen title="Audit Logs" />} />
        <Route path="settings" element={<PlaceholderScreen title="Settings" />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
