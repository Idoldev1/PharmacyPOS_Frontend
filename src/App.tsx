import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "./constants/routes";
import { useAuthStore } from "./store/authStore";
import { AppShell } from "./components/layout/AppShell";

import AuthPage from "./pages/auth";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import DashboardPage from "./pages/dashboard";
import SalesPage from "./pages/sales";
import CheckoutPage from "./pages/checkout";
import PrescriptionsPage from "./pages/prescriptions";
import PatientsPage from "./pages/patients";
import InventoryPage from "./pages/inventory";
import BillingPage from "./pages/billing";
import InsurancePage from "./pages/insurance";
import SuppliersPage from "./pages/suppliers";
import ReportsPage from "./pages/reports";
import SettingsPage from "./pages/settings";
import ProfilePage from "./pages/profile";
import { Permissions } from "./constants/permissions";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <AppShell>{children}</AppShell> : <Navigate to={ROUTES.LOGIN} replace />;
};

interface PermissionRouteProps {
  children: React.ReactNode;
  anyPermission: string[];
}

const PermissionRoute = ({ children, anyPermission }: PermissionRouteProps) => {
  const userPermissions = useAuthStore((s) => s.user?.permissions ?? []);
  const permSet = new Set(userPermissions);
  const hasAccess = anyPermission.some((p) => permSet.has(p));
  return hasAccess ? <>{children}</> : <Navigate to={ROUTES.DASHBOARD} replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<AuthPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route
            path={ROUTES.SALES}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Sales.Create]}>
                  <SalesPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PRESCRIPTIONS}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Prescriptions.View]}>
                  <PrescriptionsPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PATIENTS}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Patients.View, Permissions.Patients.ViewBasic]}>
                  <PatientsPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.INVENTORY}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Inventory.View, Permissions.Inventory.ViewStockOnly]}>
                  <InventoryPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Sales.Complete]}>
                  <CheckoutPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BILLING}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Billing.View]}>
                  <BillingPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.INSURANCE} element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
          <Route
            path={ROUTES.SUPPLIERS}
            element={
              <ProtectedRoute>
                <PermissionRoute anyPermission={[Permissions.Suppliers.View]}>
                  <SuppliersPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.REPORTS}
            element={
              <ProtectedRoute>
                <PermissionRoute
                  anyPermission={[
                    Permissions.Reports.ViewAll, Permissions.Reports.ViewFinancial,
                    Permissions.Reports.ViewOperational, Permissions.Reports.ViewInventory,
                    Permissions.Reports.ViewPrescription, Permissions.Reports.ViewPersonalSales,
                  ]}
                >
                  <ReportsPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <ProtectedRoute>
                <PermissionRoute
                  anyPermission={[
                    Permissions.Settings.View, Permissions.Settings.ManageSystem,
                    Permissions.Settings.ManageUsers, Permissions.Settings.ManageDrugCatalog,
                  ]}
                >
                  <SettingsPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
          <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
