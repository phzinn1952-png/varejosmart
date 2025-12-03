
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import { UserRole } from './types';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const POS = lazy(() => import('./pages/POS'));
const Products = lazy(() => import('./pages/Products'));
const SpecDoc = lazy(() => import('./pages/SpecDoc'));
const Login = lazy(() => import('./pages/Login'));
const Tenants = lazy(() => import('./pages/admin/Tenants'));
const AdminFinancial = lazy(() => import('./pages/admin/Financial'));
const Plans = lazy(() => import('./pages/admin/Plans'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Team = lazy(() => import('./pages/Team'));
const Suppliers = lazy(() => import('./pages/Suppliers'));
const PriceCalculator = lazy(() => import('./pages/PriceCalculator'));
const WhatsAppConfig = lazy(() => import('./pages/WhatsAppConfig'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      <p className="text-slate-600 font-medium">Carregando...</p>
    </div>
  </div>
);

// Wrapper component to handle auth logic and role based routing
const AppRoutes = React.memo(() => {
  const { isAuthenticated, user } = useAppContext();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Force Password Change Check
  if (user?.mustChangePassword) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="*" element={<Navigate to="/change-password" replace />} />
          </Routes>
        </Suspense>
      );
  }

  // Master Admin Routing
  if (user?.role === UserRole.MASTER) {
    return (
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/admin/tenants" element={<Tenants />} />
            <Route path="/admin/plans" element={<Plans />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/spec" element={<SpecDoc />} />
            {/* Default redirect for master */}
            <Route path="*" element={<Navigate to="/admin/tenants" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    );
  }

  // Standard Operator/Manager Routing
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/calculator" element={<PriceCalculator />} />
          <Route path="/whatsapp" element={<WhatsAppConfig />} />
          <Route path="/spec" element={<SpecDoc />} />

          {/* Only Managers can see Team page */}
          {user?.role === UserRole.MANAGER && (
            <Route path="/team" element={<Team />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
});

const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
