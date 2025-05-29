import authService from '../authService';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    post: jest.fn(),
    put: jest.fn(),
  })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user data for valid demo credentials', async () => {
      const credentials = {
        email: 'admin@warehouse.com',
        password: 'admin123'
      };

      const result = await authService.login(credentials);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('admin@warehouse.com');
      expect(result.user.role).toBe('admin');
    });

    it('should throw error for invalid credentials', async () => {
      const credentials = {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      };

      await expect(authService.login(credentials)).rejects.toThrow('Email hoặc mật khẩu không đúng');
    });

    it('should throw error for missing credentials', async () => {
      const credentials = {
        email: '',
        password: ''
      };

      await expect(authService.login(credentials)).rejects.toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should return user data for valid mock token', async () => {
      const token = 'mock-jwt-token-123456789';
      
      const result = await authService.verifyToken(token);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result.email).toBe('admin@warehouse.com');
    });

    it('should throw error for invalid token', async () => {
      const token = 'invalid-token';

      await expect(authService.verifyToken(token)).rejects.toThrow('Token không hợp lệ');
    });

    it('should throw error for null token', async () => {
      await expect(authService.verifyToken(null)).rejects.toThrow('Token không hợp lệ');
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage', async () => {
      localStorage.setItem('token', 'test-token');
      
      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should not throw error even if logout API fails', async () => {
      // This should not throw an error
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });
});
