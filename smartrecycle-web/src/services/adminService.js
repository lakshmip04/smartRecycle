import api, { API_ENDPOINTS } from '../config/api';

class AdminService {
  // Get dashboard analytics from Oracle Autonomous Database
  async getDashboardStats() {
    try {
      const response = await api.get(API_ENDPOINTS.analytics.dashboard);
      
      console.log('✅ Dashboard stats fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch dashboard stats:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch dashboard stats' 
      };
    }
  }

  // User Management
  async getUsers(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${API_ENDPOINTS.users.list}?${params}`);
      
      console.log('✅ Users fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch users:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch users' 
      };
    }
  }

  async approveUser(userId) {
    try {
      const response = await api.post(`${API_ENDPOINTS.users.approve}/${userId}`);
      
      console.log('✅ User approved successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to approve user:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to approve user' 
      };
    }
  }

  async deleteUser(userId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.users.delete}/${userId}`);
      
      console.log('✅ User deleted successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to delete user:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  }

  // Collector Management
  async getCollectors(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${API_ENDPOINTS.collectors.list}?${params}`);
      
      console.log('✅ Collectors fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch collectors:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch collectors' 
      };
    }
  }

  async approveCollector(collectorId) {
    try {
      const response = await api.post(`${API_ENDPOINTS.collectors.approve}/${collectorId}`);
      
      console.log('✅ Collector approved successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to approve collector:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to approve collector' 
      };
    }
  }

  async deleteCollector(collectorId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.collectors.delete}/${collectorId}`);
      
      console.log('✅ Collector deleted successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to delete collector:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete collector' 
      };
    }
  }

  // AI Classification Management
  async getAIStats() {
    try {
      const response = await api.get(API_ENDPOINTS.ai.stats);
      
      console.log('✅ AI stats fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch AI stats:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch AI stats' 
      };
    }
  }

  async classifyMaterial(materialImage) {
    try {
      const formData = new FormData();
      formData.append('image', materialImage);

      const response = await api.post(API_ENDPOINTS.ai.classify, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Material classified successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to classify material:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to classify material' 
      };
    }
  }

  // Analytics and Reports
  async getAnalyticsReports(dateRange = {}) {
    try {
      const params = new URLSearchParams(dateRange).toString();
      const response = await api.get(`${API_ENDPOINTS.analytics.reports}?${params}`);
      
      console.log('✅ Analytics reports fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch analytics reports:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch analytics reports' 
      };
    }
  }

  // System Health Check
  async getSystemHealth() {
    try {
      const response = await api.get('/api/v1/system/health');
      
      console.log('✅ System health fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch system health:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch system health' 
      };
    }
  }
}

export default new AdminService(); 