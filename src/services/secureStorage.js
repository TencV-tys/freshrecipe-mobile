import * as SecureStore from 'expo-secure-store';

class SecureStorage {
  // Store token securely (like HttpOnly cookie)
  async storeToken(token) {
    try {
      await SecureStore.setItemAsync('auth_token', token);
      console.log('✅ Token stored securely');
      return true;
    } catch (error) {
      console.error('❌ Error storing token:', error);
      return false;
    }
  }

  // Get token securely
  async getToken() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        console.log('🔑 Token retrieved');
      }
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  }

  // Remove token (logout)
  async removeToken() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      console.log('✅ Token removed');
      return true;
    } catch (error) {
      console.error('❌ Error removing token:', error);
      return false;
    }
  }

  // Check if token exists
  async hasToken() {
    const token = await this.getToken();
    return token !== null;
  }
}

export default new SecureStorage();