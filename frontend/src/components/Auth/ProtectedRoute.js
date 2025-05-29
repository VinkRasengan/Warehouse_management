import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Result, Button } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import { canAccessRoute } from '../../utils/permissions';

const ProtectedRoute = ({ 
  children, 
  permissions = [], 
  roles = [], 
  fallback = null,
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permissions if specified
  if (permissions.length > 0 && !canAccessRoute(user, permissions)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  // Check roles if specified
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Sorry, your role does not have access to this page."
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  return children;
};

export default ProtectedRoute;
