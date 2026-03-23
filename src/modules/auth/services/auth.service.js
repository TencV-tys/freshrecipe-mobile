import api from '../../../api/api';
import SecureStorage from '../../../services/secureStorage';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;
      
      await SecureStorage.storeToken(token);
      
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, ...user } = response.data;
      
      await SecureStorage.storeToken(token);
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async logout() {
    await SecureStorage.removeToken();
    return { success: true };
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/users/profile');
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false };
    }
  }
}

export default new AuthService();