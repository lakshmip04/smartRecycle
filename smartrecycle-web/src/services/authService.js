import api, { API_ENDPOINTS } from '../config/api';
import { storeAuthData, clearAuthData } from '../utils/auth';

class AuthService {
  // Login with Oracle Cloud backend
  async login(email, password, role) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.login, {
        email,
        password,
        role,
      });

      const { token, user } = response.data;
      
      // Store authentication data
      storeAuthData(token, user.id, user);
      
      console.log('✅ Login successful:', user);
      return { success: true, user };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  }

  // Register new user with Oracle Cloud backend
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.auth.register, userData);
      
      console.log('✅ Registration successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  }

  // Logout and clear Oracle Cloud session
  async logout() {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
      clearAuthData();
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      // Clear local data even if API call fails
      clearAuthData();
      console.error('⚠️ Logout API failed, but local data cleared:', error.message);
      return { success: true };
    }
  }

  // Refresh authentication token
  async refreshToken() {
    try {
      const response = await api.post(API_ENDPOINTS.auth.refresh);
      const { token, user } = response.data;
      
      storeAuthData(token, user.id, user);
      console.log('✅ Token refreshed successfully');
      return { success: true, token };
    } catch (error) {
      console.error('❌ Token refresh failed:', error.response?.data || error.message);
      clearAuthData();
      return { success: false, error: 'Token refresh failed' };
    }
  }

  // Verify token with Oracle Cloud backend
  async verifyToken() {
    try {
      const response = await api.get(API_ENDPOINTS.users.profile);
      console.log('✅ Token verified');
      return { success: true, user: response.data };
    } catch (error) {
      console.error('❌ Token verification failed:', error.response?.data || error.message);
      clearAuthData();
      return { success: false };
    }
  }
}

const authService = new AuthService();
export default authService; 