import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5004/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      // For demo purposes, simulate login
      if (credentials.email === 'admin@warehouse.com' && credentials.password === 'admin123') {
        const mockResponse = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 1,
            email: 'admin@warehouse.com',
            name: 'Quản trị viên',
            role: 'admin',
            avatar: null,
            permissions: ['all']
          }
        };
        return mockResponse;
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
    }
  },

  // Verify token
  verifyToken: async (token) => {
    try {
      // For demo purposes, return mock user if token exists
      if (token && token.startsWith('mock-jwt-token-')) {
        return {
          id: 1,
          email: 'admin@warehouse.com',
          name: 'Quản trị viên',
          role: 'admin',
          avatar: null,
          permissions: ['all']
        };
      }
      throw new Error('Invalid token');
    } catch (error) {
      throw new Error('Token không hợp lệ');
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Cập nhật thông tin thất bại');
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Gửi email khôi phục thất bại');
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }
};

export default authService;
