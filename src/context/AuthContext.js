import React, { createContext, useState, useContext, useEffect } from 'react';
import SecureStorage from '../services/secureStorage';
import api from '../api/api';
import UserService from '../modules/user/services/user.service';
import RecipeService from '../modules/recipe/services/recipe.service'; // Add this
import { Alert } from 'react-native';

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
        api.defaults.headers.Authorization = `Bearer ${token}`;
        
        const statusResult = await UserService.getUserStatus();
        if (statusResult.success) {
          const { status, message } = statusResult.status;
          if (status === 'banned' || status === 'suspended') {
            console.log('User is', status, ':', message);
            await logout(true);
            return;
          }
        }
        
        // ✅ Get user profile with saved recipes
        const response = await api.get('/users/profile');
        if (response.data && response.data.role !== 'admin') {
          console.log('✅ User profile loaded:', response.data);
          console.log('📚 Saved recipes from profile:', response.data.savedRecipes);
          setUser(response.data); // This now includes savedRecipes!
        } else {
          await SecureStorage.removeToken();
          delete api.defaults.headers.Authorization;
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStorage.removeToken();
      delete api.defaults.headers.Authorization;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      if (userData.role === 'admin') {
        return { success: false, error: 'This app is for users only' };
      }
      
      // ✅ After login, fetch full profile with saved recipes
      const profileResponse = await api.get('/users/profile');
      const fullUserData = profileResponse.data;
      console.log('✅ Full user data after login:', fullUserData);
      console.log('📚 Saved recipes after login:', fullUserData.savedRecipes);
      
      await SecureStorage.storeToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(fullUserData);
      return { success: true, user: fullUserData };
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
      const { token, user: userDataResponse } = response.data;
      
      // ✅ After registration, fetch full profile with saved recipes
      const profileResponse = await api.get('/users/profile');
      const fullUserData = profileResponse.data;
      
      await SecureStorage.storeToken(token);
      api.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(fullUserData);
      return { success: true, user: fullUserData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = async (silent = false) => {
    try {
      await UserService.logout();
    } catch (error) {
      console.error('Backend logout error:', error);
    } finally {
      await SecureStorage.removeToken();
      delete api.defaults.headers.Authorization;
      setUser(null);
    }
  };

  // Check user status periodically
  useEffect(() => {
    if (!user) return;
    
    const checkUserStatus = async () => {
      try {
        const statusResult = await UserService.getUserStatus();
        if (statusResult.success) {
          const { status, message } = statusResult.status;
          
          if (status === 'banned' || status === 'suspended') {
            console.log('User status changed:', status, message);
            await logout();
            Alert.alert('Account Status', message);
          }
        }
      } catch (error) {
        console.error('Periodic status check failed:', error);
      }
    };
    
    const interval = setInterval(checkUserStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    setUser: updateUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};