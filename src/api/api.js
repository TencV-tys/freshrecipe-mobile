import axios from 'axios';
import SecureStorage from '../services/secureStorage';

// Get your computer's IP address

export const IP = '10.205.101.2'; // CHANGE THIS TO YOUR IP
export const API_URL = `http://${IP}:5000/api`;

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token from secure storage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStorage.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Token added to request:', config.url);
      }
    } catch (error) {
      console.error('Error adding token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 unauthorized
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('⏰ Token expired, clearing...');
      await SecureStorage.removeToken();
    }
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;