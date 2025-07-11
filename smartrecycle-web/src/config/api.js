import axios from 'axios';
import { OCI_CONFIG, OCI_API_ENDPOINTS } from './oracle-cloud';

// Create axios instance with Oracle Cloud configuration
const api = axios.create({
  baseURL: OCI_CONFIG.apiGateway.baseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Oracle Cloud specific headers
    config.headers['X-OCI-Region'] = OCI_CONFIG.region;
    config.headers['X-OCI-Compartment-Id'] = OCI_CONFIG.compartmentId;
    
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message);
    
    // Handle common Oracle Cloud errors
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      console.error('Access forbidden - check your Oracle Cloud permissions');
    } else if (error.response?.status >= 500) {
      console.error('Oracle Cloud server error - check your backend services');
    }
    
    return Promise.reject(error);
  }
);

// Export API endpoints
export const API_ENDPOINTS = OCI_API_ENDPOINTS;

// Export Oracle Cloud configuration
export { OCI_CONFIG };

export default api; 