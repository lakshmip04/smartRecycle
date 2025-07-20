import api, { API_ENDPOINTS } from '../config/api';

class CollectionService {
  // Get collector's collections from Oracle Autonomous Database
  async getMyCollections(collectorId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.collections.list}?collectorId=${collectorId}`);
      
      console.log('✅ Collections fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch collections:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch collections' 
      };
    }
  }

  // Mark material as collected
  async markAsCollected(collectionId, collectionData = {}) {
    try {
      const response = await api.post(`${API_ENDPOINTS.collections.markCollected}/${collectionId}`, {
        ...collectionData,
        collectedAt: new Date().toISOString(),
      });
      
      console.log('✅ Material marked as collected successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to mark as collected:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to mark as collected' 
      };
    }
  }

  // Create new collection record
  async createCollection(collectionData) {
    try {
      const response = await api.post(API_ENDPOINTS.collections.create, collectionData);
      
      console.log('✅ Collection created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to create collection:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create collection' 
      };
    }
  }

  // Update collection information
  async updateCollection(collectionId, updateData) {
    try {
      const response = await api.put(`${API_ENDPOINTS.collections.update}/${collectionId}`, updateData);
      
      console.log('✅ Collection updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to update collection:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update collection' 
      };
    }
  }

  // Get collection statistics
  async getCollectionStats(collectorId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.collections.list}/stats?collectorId=${collectorId}`);
      
      console.log('✅ Collection stats fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch collection stats:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch collection stats' 
      };
    }
  }

  // Get collections by status
  async getCollectionsByStatus(status, filters = {}) {
    try {
      const params = new URLSearchParams({ status, ...filters }).toString();
      const response = await api.get(`${API_ENDPOINTS.collections.list}?${params}`);
      
      console.log('✅ Collections by status fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch collections by status:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch collections by status' 
      };
    }
  }
}

export default new CollectionService(); 