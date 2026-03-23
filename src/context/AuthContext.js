import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
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
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        const response = await api.get('/users/profile');
        if (response.data && response.data.role !== 'admin') {
          setUser(response.data);
        } else {
          await SecureStore.deleteItemAsync('auth_token');
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
      
      await SecureStore.setItemAsync('auth_token', token);
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
      
      await SecureStore.setItemAsync('auth_token', token);
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
    await SecureStore.deleteItemAsync('auth_token');
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        toggleSaveRecipe,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};