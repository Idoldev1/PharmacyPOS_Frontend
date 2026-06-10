import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ROUTES } from "./constants/routes";
import { useAuthStore } from "./store/authStore";
import { AppShell } from "./components/layout/AppShell";

import AuthPage from "./pages/auth";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ChangePasswordPage from "./pages/auth/ChangePasswordPage";
import DashboardPage from "./pages/dashboard";
import SalesPage from "./pages/sales";
import PrescriptionsPage from "./pages/prescriptions";
import PatientsPage from "./pages/patients";
import InventoryPage from "./pages/inventory";
import BillingPage from "./pages/billing";
import InsurancePage from "./pages/insurance";
import SuppliersPage from "./pages/suppliers";
import ReportsPage from "./pages/reports";
import SettingsPage from "./pages/settings";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <AppShell>{children}</AppShell> : <Navigate to={ROUTES.LOGIN} replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<AuthPage />} />
          <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path={ROUTES.SALES} element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
          <Route path={ROUTES.PRESCRIPTIONS} element={<ProtectedRoute><PrescriptionsPage /></ProtectedRoute>} />
          <Route path={ROUTES.PATIENTS} element={<ProtectedRoute><PatientsPage /></ProtectedRoute>} />
          <Route path={ROUTES.INVENTORY} element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path={ROUTES.BILLING} element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
          <Route path={ROUTES.INSURANCE} element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
          <Route path={ROUTES.SUPPLIERS} element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
          <Route path={ROUTES.REPORTS} element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
