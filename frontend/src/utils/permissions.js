// Permission constants
export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: 'products:view',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  
  // Inventory permissions
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_ADJUST: 'inventory:adjust',
  
  // Order permissions
  ORDERS_VIEW: 'orders:view',
  ORDERS_CREATE: 'orders:create',
  ORDERS_UPDATE: 'orders:update',
  ORDERS_DELETE: 'orders:delete',
  ORDERS_PROCESS: 'orders:process',
  
  // Customer permissions
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_CREATE: 'customers:create',
  CUSTOMERS_UPDATE: 'customers:update',
  CUSTOMERS_DELETE: 'customers:delete',
  
  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // Settings permissions
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_UPDATE: 'settings:update',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_ROLES: 'admin:roles',
  ADMIN_SYSTEM: 'admin:system',
};

// Role definitions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
};

// Role permissions mapping
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [ROLES.MANAGER]: [
    // Product management
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    
    // Inventory management
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_ADJUST,
    
    // Order management
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_PROCESS,
    
    // Customer management
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    
    // Reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    
    // Settings
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
  
  [ROLES.STAFF]: [
    // Product view and basic operations
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    
    // Inventory view and updates
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    
    // Order management
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_PROCESS,
    
    // Customer management
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_UPDATE,
    
    // Basic reports
    PERMISSIONS.REPORTS_VIEW,
    
    // Basic settings
    PERMISSIONS.SETTINGS_VIEW,
  ],
  
  [ROLES.VIEWER]: [
    // View only permissions
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

// Permission checker functions
export const hasPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  
  // Admin has all permissions
  if (userPermissions.includes('all') || userPermissions.includes('admin:all')) {
    return true;
  }
  
  return userPermissions.includes(requiredPermission);
};

export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  
  return requiredPermissions.some(permission => 
    hasPermission(userPermissions, permission)
  );
};

export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  
  return requiredPermissions.every(permission => 
    hasPermission(userPermissions, permission)
  );
};

export const hasRole = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) {
    return false;
  }
  
  // Admin can access everything
  if (userRole === ROLES.ADMIN) {
    return true;
  }
  
  return userRole === requiredRole;
};

export const hasAnyRole = (userRole, requiredRoles) => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  
  return requiredRoles.some(role => hasRole(userRole, role));
};

// Get permissions for a role
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Check if user can access a route
export const canAccessRoute = (user, routePermissions) => {
  if (!user) {
    return false;
  }
  
  if (!routePermissions || routePermissions.length === 0) {
    return true;
  }
  
  const userPermissions = user.permissions || getPermissionsForRole(user.role);
  return hasAnyPermission(userPermissions, routePermissions);
};

// Filter menu items based on permissions
export const filterMenuByPermissions = (menuItems, userPermissions) => {
  return menuItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    return hasAnyPermission(userPermissions, item.permissions);
  });
};

// Action permission checker
export const canPerformAction = (user, action) => {
  if (!user) {
    return false;
  }
  
  const userPermissions = user.permissions || getPermissionsForRole(user.role);
  return hasPermission(userPermissions, action);
};
