import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import AuthLayout from '../components/layouts/AuthLayout';
import FormLayout from '../components/layouts/FormLayout';

import AuthPage from '../pages/auth/AuthPage';
import HomePage from '../pages/admin/homepage/HomePage';
import CustomerPage from '../pages/admin/customerpage/CustomerPage';
import PhonesPage from '../pages/admin/phonespage/PhonesPage';
import FinancedPage from '../pages/admin/financedpage/FinancedPage';
import CatalogoPage from '../pages/customer/catalogopage/CatalogoPage';
import FormPage from '../pages/customer/formpage/FormPage';


const AppRoutes= () => {

  return (
    <Routes>
      {/* Rutas públicas */}
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
        <Route path="catalogo" element={<PhonesPage />} />   
        <Route path="creditos" element={<FinancedPage />} /> 
      </Route>  

    
      {/* Rutas protegidas
      <Route element={<ProtectedRoute />}>
        
      </Route> */}

      {/* Redirección */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
