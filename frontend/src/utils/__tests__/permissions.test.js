import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasAnyRole,
  getPermissionsForRole,
  canAccessRoute,
  PERMISSIONS,
  ROLES,
} from '../permissions';

describe('Permission Utils', () => {
  describe('hasPermission', () => {
    it('should return true when user has the required permission', () => {
      const userPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      expect(hasPermission(userPermissions, PERMISSIONS.PRODUCTS_VIEW)).toBe(true);
    });

    it('should return false when user does not have the required permission', () => {
      const userPermissions = [PERMISSIONS.PRODUCTS_VIEW];
      expect(hasPermission(userPermissions, PERMISSIONS.ORDERS_VIEW)).toBe(false);
    });

    it('should return true when user has admin permissions', () => {
      const userPermissions = ['all'];
      expect(hasPermission(userPermissions, PERMISSIONS.PRODUCTS_DELETE)).toBe(true);
    });

    it('should return false when userPermissions is null or undefined', () => {
      expect(hasPermission(null, PERMISSIONS.PRODUCTS_VIEW)).toBe(false);
      expect(hasPermission(undefined, PERMISSIONS.PRODUCTS_VIEW)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one required permission', () => {
      const userPermissions = [PERMISSIONS.PRODUCTS_VIEW];
      const requiredPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      expect(hasAnyPermission(userPermissions, requiredPermissions)).toBe(true);
    });

    it('should return false when user has none of the required permissions', () => {
      const userPermissions = [PERMISSIONS.CUSTOMERS_VIEW];
      const requiredPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      expect(hasAnyPermission(userPermissions, requiredPermissions)).toBe(false);
    });

    it('should return true when no permissions are required', () => {
      const userPermissions = [];
      expect(hasAnyPermission(userPermissions, [])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all required permissions', () => {
      const userPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      const requiredPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      expect(hasAllPermissions(userPermissions, requiredPermissions)).toBe(true);
    });

    it('should return false when user is missing some required permissions', () => {
      const userPermissions = [PERMISSIONS.PRODUCTS_VIEW];
      const requiredPermissions = [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.ORDERS_VIEW];
      expect(hasAllPermissions(userPermissions, requiredPermissions)).toBe(false);
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the required role', () => {
      expect(hasRole(ROLES.ADMIN, ROLES.ADMIN)).toBe(true);
    });

    it('should return false when user does not have the required role', () => {
      expect(hasRole(ROLES.STAFF, ROLES.ADMIN)).toBe(false);
    });

    it('should return true when user is admin (admin can access everything)', () => {
      expect(hasRole(ROLES.ADMIN, ROLES.MANAGER)).toBe(true);
    });
  });

  describe('getPermissionsForRole', () => {
    it('should return correct permissions for admin role', () => {
      const permissions = getPermissionsForRole(ROLES.ADMIN);
      expect(permissions).toContain(PERMISSIONS.PRODUCTS_DELETE);
      expect(permissions).toContain(PERMISSIONS.ADMIN_SYSTEM);
    });

    it('should return correct permissions for staff role', () => {
      const permissions = getPermissionsForRole(ROLES.STAFF);
      expect(permissions).toContain(PERMISSIONS.PRODUCTS_VIEW);
      expect(permissions).not.toContain(PERMISSIONS.ADMIN_SYSTEM);
    });

    it('should return empty array for unknown role', () => {
      const permissions = getPermissionsForRole('unknown_role');
      expect(permissions).toEqual([]);
    });
  });

  describe('canAccessRoute', () => {
    it('should return false when user is null', () => {
      expect(canAccessRoute(null, [PERMISSIONS.PRODUCTS_VIEW])).toBe(false);
    });

    it('should return true when no permissions are required', () => {
      const user = { role: ROLES.STAFF };
      expect(canAccessRoute(user, [])).toBe(true);
    });

    it('should return true when user has required permissions', () => {
      const user = { 
        role: ROLES.STAFF,
        permissions: [PERMISSIONS.PRODUCTS_VIEW]
      };
      expect(canAccessRoute(user, [PERMISSIONS.PRODUCTS_VIEW])).toBe(true);
    });

    it('should use role permissions when user permissions are not provided', () => {
      const user = { role: ROLES.ADMIN };
      expect(canAccessRoute(user, [PERMISSIONS.ADMIN_SYSTEM])).toBe(true);
    });
  });
});
