import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RegisterClubPage from "./pages/RegisterClubPage";
import HallsPage from "./pages/HallsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ServicesPage from "./pages/ServicesPage";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import SettingsPage from "./pages/SettingsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ClientsPage from "./pages/ClientsPage";
import FinancePage from "./pages/FinancePage";
import PurchasesPage from "./pages/PurchasesPage";
import CertificatePage from "./pages/CertificatesPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterClubPage />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/halls" element={<HallsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/finances" element={<FinancePage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/certificates" element={<CertificatePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;