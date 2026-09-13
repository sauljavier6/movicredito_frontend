import { Navigate, Route, Routes } from "react-router-dom";
import { History, Landmark } from "lucide-react";

import AppLayout from "../components/layouts/AppLayout";
import AuthLayout from "../components/layouts/AuthLayout";
import FormLayout from "../components/layouts/FormLayout";

import AuthPage from "../pages/auth/AuthPage";
import ApplicationsPage from "../pages/admin/applicationspage/ApplicationsPage";
import CollectionsPage from "../pages/admin/collectionspage/CollectionsPage";
import CustomerPage from "../pages/admin/customerpage/CustomerPage";
import DeviceActionsPage from "../pages/admin/deviceactionspage/DeviceActionsPage";
import DevicesPage from "../pages/admin/devicespage/DevicesPage";
import FinancedPage from "../pages/admin/financedpage/FinancedPage";
import FinancingPlansPage from "../pages/admin/financingplanspage/FinancingPlansPage";
import HomePage from "../pages/admin/homepage/HomePage";
import InventoryPage from "../pages/admin/inventorypage/InventoryPage";
import PaymentsPage from "../pages/admin/paymentspage/PaymentsPage";
import PhonesPage from "../pages/admin/phonespage/PhonesPage";
import AdminModulePage from "../pages/admin/shared/AdminModulePage";
import CatalogoPage from "../pages/customer/catalogopage/CatalogoPage";
import FormPage from "../pages/customer/formpage/FormPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<FormLayout />}>
        <Route index element={<CatalogoPage />} />
        <Route path="formulario" element={<FormPage />} />
      </Route>

      <Route path="/login" element={<AuthLayout />}>
        <Route index element={<AuthPage />} />
      </Route>

      <Route path="/admin" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="clientes" element={<CustomerPage />} />
        <Route path="solicitudes" element={<ApplicationsPage />} />
        <Route path="catalogo" element={<PhonesPage />} />
        <Route path="planes-financiamiento" element={<FinancingPlansPage />} />
        <Route path="creditos" element={<FinancedPage />} />
        <Route path="pagos" element={<PaymentsPage />} />
        <Route path="inventario" element={<InventoryPage />} />
        <Route path="dispositivos" element={<DevicesPage />} />
        <Route path="ordenes-dispositivo" element={<DeviceActionsPage />} />
        <Route path="cobranza" element={<CollectionsPage />} />
        <Route path="reportes" element={<AdminModulePage title="Reportes" description="Visualiza colocación, cartera, recuperación, mora, inventario y desempeño de la operación." icon={<Landmark size={24} />} />} />
        <Route path="auditoria" element={<AdminModulePage title="Auditoría" description="Consulta acciones sensibles como aprobaciones, cambios de crédito, asignaciones y bloqueos de dispositivos." icon={<History size={24} />} />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
