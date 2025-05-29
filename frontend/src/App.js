import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import { useAuth } from './contexts/AuthContext';
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

const { Content } = Layout;

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products/*" element={<ProductsPage />} />
              <Route path="/inventory/*" element={<InventoryPage />} />
              <Route path="/orders/*" element={<OrdersPage />} />
              <Route path="/customers/*" element={<CustomersPage />} />
              <Route path="/reports/*" element={<ReportsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Content>
        </MainLayout>
      )}
    </div>
  );
}

export default App;
