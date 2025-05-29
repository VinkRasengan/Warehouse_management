import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Verify token with backend
        const userData = await authService.verifyToken(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        message.success('Đăng nhập thành công!');
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error(error.message || 'Đăng nhập thất bại!');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    message.success('Đăng xuất thành công!');
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        message.success('Đăng ký thành công!');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      message.error(error.message || 'Đăng ký thất bại!');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      message.success('Cập nhật thông tin thành công!');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      message.error(error.message || 'Cập nhật thông tin thất bại!');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
