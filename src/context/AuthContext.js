import React, { createContext, useState, useContext, useEffect } from 'react';
import SecureStorage from '../services/secureStorage';
import api from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await SecureStorage.getToken();
      if (token) {
        const response = await api.get('/users/profile');
        if (response.data && response.data.role !== 'admin') {
          setUser(response.data);
        } else {
          await SecureStorage.removeToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      if (userData.role === 'admin') {
        return { success: false, error: 'This app is for users only' };
      }
      
      await SecureStorage.storeToken(token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;
      
      await SecureStorage.storeToken(token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async () => {
    await SecureStorage.removeToken();
    setUser(null);
  };

  const toggleSaveRecipe = async (recipeId) => {
    try {
      const response = await api.post(`/users/saved/${recipeId}`);
      return { success: true, isSaved: response.data.isSaved };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save recipe',
      };
    }
  };

  // ✅ Add this function to update user data
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    setUser: updateUser,  // ✅ Expose setUser as updateUser
    login,
    register,
    logout,
    toggleSaveRecipe,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};