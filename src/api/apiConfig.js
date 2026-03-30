import Constants from 'expo-constants';

// Simple function to get the right backend IP
export const getBackendIP = () => {
  // Get Expo's current IP
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (!hostUri) return 'localhost'; // Fallback
  
  const [currentIP] = hostUri.split(':');
  
  // If device is on 192.168.1.x (office WiFi), backend is at 192.168.1.29
  if (currentIP.startsWith('192.168.1.')) {
    return '192.168.1.29';
  }
  
  // If device is on 10.205.101.x (your hotspot), backend is at 10.205.101.2
  if (currentIP.startsWith('10.205.101.')) {
    return '10.205.101.2';
  }

  if (currentIP.startsWith('172.20.161.')) {
    return '172.20.161.2';
  }
  
  // For any other case, use the same IP
  return currentIP;
};

// Export the full API URL
export const API_BASE_URL = `http://${getBackendIP()}:5000`;

export const API_URL = `${API_BASE_URL}/api`;
export const BASE_IP = API_BASE_URL;

// Log it for debugging
console.log('🌐 Backend URL:', API_BASE_URL);
console.log('📡 API URL:', API_URL);