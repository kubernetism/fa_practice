import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { PageLoader } from "@/components/ui/page-loader";

// Only login and setup are lazily loaded standalone (not keep-alive)
const LoginScreen = lazy(() =>
  import("@/screens/login").then((m) => ({ default: m.LoginScreen })),
);
const SetupWizardScreen = lazy(() =>
  import("@/screens/setup-wizard").then((m) => ({
    default: m.SetupWizardScreen,
  })),
);

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// All authenticated routes — KeepAliveOutlet in MainLayout handles
// lazy loading, rendering, and keep-alive for these paths.
const KEEP_ALIVE_PATHS = [
  "dashboard",
  "pos",
  "products",
  "services",
  "inventory",
  "sales",
  "purchases",
  "returns",
  "customers",
  "suppliers",
  "expenses",
  "commissions",
  "users",
  "branches",
  "reports",
  "audit-reports",
  "referral-persons",
  "receivables",
  "payables",
  "cash-register",
  "chart-of-accounts",
  "audit",
  "settings",
  "database",
  "settings/license",
  "tax-collections",
  "categories-management",
  "discount-management",
  "journals",
  "vouchers",
  "reversals",
  "developer",
];

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
        {KEEP_ALIVE_PATHS.map((path) => (
          <Route key={path} path={path} element={null} />
        ))}
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
