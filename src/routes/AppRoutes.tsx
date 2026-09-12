import { Navigate, Route, Routes } from "react-router-dom";
import {
  Boxes,
  ClipboardCheck,
  History,
  Landmark,
  Smartphone,
} from "lucide-react";

import AppLayout from "../components/layouts/AppLayout";
import AuthLayout from "../components/layouts/AuthLayout";
import FormLayout from "../components/layouts/FormLayout";

import AuthPage from "../pages/auth/AuthPage";
import CollectionsPage from "../pages/admin/collectionspage/CollectionsPage";
import CustomerPage from "../pages/admin/customerpage/CustomerPage";
import FinancedPage from "../pages/admin/financedpage/FinancedPage";
import HomePage from "../pages/admin/homepage/HomePage";
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
        <Route
          path="solicitudes"
          element={
            <AdminModulePage
              title="Solicitudes de crédito"
              description="Revisa expedientes, documentación, análisis de riesgo y decisiones de aprobación o rechazo."
              icon={<ClipboardCheck size={24} />}
            />
          }
        />
        <Route path="catalogo" element={<PhonesPage />} />
        <Route path="creditos" element={<FinancedPage />} />
        <Route path="pagos" element={<PaymentsPage />} />
        <Route
          path="inventario"
          element={
            <AdminModulePage
              title="Inventario"
              description="Administra equipos por modelo, capacidad, color, IMEI, número de serie y estado de asignación."
              icon={<Boxes size={24} />}
            />
          }
        />
        <Route
          path="dispositivos"
          element={
            <AdminModulePage
              title="Dispositivos"
              description="Controla el vínculo entre equipo, cliente y crédito, además del estado de protección del dispositivo."
              icon={<Smartphone size={24} />}
            />
          }
        />
        <Route path="cobranza" element={<CollectionsPage />} />
        <Route
          path="reportes"
          element={
            <AdminModulePage
              title="Reportes"
              description="Visualiza colocación, cartera, recuperación, mora, inventario y desempeño de la operación."
              icon={<Landmark size={24} />}
            />
          }
        />
        <Route
          path="auditoria"
          element={
            <AdminModulePage
              title="Auditoría"
              description="Consulta acciones sensibles como aprobaciones, cambios de crédito, asignaciones y bloqueos de dispositivos."
              icon={<History size={24} />}
            />
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
