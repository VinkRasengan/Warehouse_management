import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import { useAuth } from './contexts/AuthContext';
import { setupGlobalErrorHandlers } from './utils/errorHandler';
import MainLayout from './components/Layout/MainLayout';
import LoginPage from './pages/Auth/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import ProductsPage from './pages/Products/ProductsPage';
import InventoryPage from './pages/Inventory/InventoryPage';
import OrdersPage from './pages/Orders/OrdersPage';
import CustomersPage from './pages/Customers/CustomersPage';
import ReportsPage from './pages/Reports/ReportsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import LoadingSpinner from './components/Common/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const { Content } = Layout;

function App() {
  const { user, loading } = useAuth();

  // Setup global error handlers on app start
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <div className="App">
        {!user ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <MainLayout>
            <Content>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/products/*" element={
                  <ProtectedRoute permissions={['products:view']}>
                    <ProductsPage />
                  </ProtectedRoute>
                } />
                <Route path="/inventory/*" element={
                  <ProtectedRoute permissions={['inventory:view']}>
                    <InventoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/*" element={
                  <ProtectedRoute permissions={['orders:view']}>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/customers/*" element={
                  <ProtectedRoute permissions={['customers:view']}>
                    <CustomersPage />
                  </ProtectedRoute>
                } />
                <Route path="/reports/*" element={
                  <ProtectedRoute permissions={['reports:view']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings/*" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Content>
          </MainLayout>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
