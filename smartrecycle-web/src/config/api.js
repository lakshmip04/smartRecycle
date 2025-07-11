import axios from 'axios';

// Oracle Cloud Infrastructure (OCI) Compute Instance endpoint
// Replace with your actual OCI Compute instance IP/domain
const BASE_URL = 'http://YOUR_OCI_COMPUTE_IP:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Materials
  GET_AVAILABLE_MATERIALS: '/materials/available',
  GET_MATERIAL_DETAILS: '/materials',
  CLAIM_MATERIAL: '/materials/claim',
  
  // Collections
  GET_MY_COLLECTIONS: '/collections/my',
  MARK_COLLECTED: '/collections/collected',
  
  // Profile
  GET_PROFILE: '/profile',
  UPDATE_PROFILE: '/profile',
};

export default api; 