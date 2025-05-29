import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, hasAnyPermission, hasRole, hasAnyRole } from '../../utils/permissions';

const PermissionGate = ({ 
  children, 
  permission = null,
  permissions = [],
  role = null,
  roles = [],
  requireAll = false,
  fallback = null 
}) => {
  const { user } = useAuth();

  if (!user) {
    return fallback;
  }

  const userPermissions = user.permissions || [];
  const userRole = user.role;

  // Check single permission
  if (permission && !hasPermission(userPermissions, permission)) {
    return fallback;
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll 
      ? permissions.every(p => hasPermission(userPermissions, p))
      : hasAnyPermission(userPermissions, permissions);
    
    if (!hasRequiredPermissions) {
      return fallback;
    }
  }

  // Check single role
  if (role && !hasRole(userRole, role)) {
    return fallback;
  }

  // Check multiple roles
  if (roles.length > 0 && !hasAnyRole(userRole, roles)) {
    return fallback;
  }

  return children;
};

export default PermissionGate;
