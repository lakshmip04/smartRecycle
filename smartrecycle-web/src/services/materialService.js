import api, { API_ENDPOINTS } from '../config/api';

class MaterialService {
  // Get all available materials from Oracle Autonomous Database
  async getAvailableMaterials(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`${API_ENDPOINTS.materials.list}?${params}`);
      
      console.log('✅ Materials fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch materials:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch materials' 
      };
    }
  }

  // Get specific material details
  async getMaterialDetails(materialId) {
    try {
      const response = await api.get(`${API_ENDPOINTS.materials.list}/${materialId}`);
      
      console.log('✅ Material details fetched successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to fetch material details:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch material details' 
      };
    }
  }

  // Create new material post
  async createMaterial(materialData) {
    try {
      const response = await api.post(API_ENDPOINTS.materials.create, materialData);
      
      console.log('✅ Material created successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to create material:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create material' 
      };
    }
  }

  // Claim material for collection
  async claimMaterial(materialId, collectorData = {}) {
    try {
      const response = await api.post(`${API_ENDPOINTS.materials.claim}/${materialId}`, collectorData);
      
      console.log('✅ Material claimed successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to claim material:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to claim material' 
      };
    }
  }

  // Upload material image to Oracle Object Storage
  async uploadMaterialImage(materialId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('materialId', materialId);

      const response = await api.post(API_ENDPOINTS.materials.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Material image uploaded successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to upload material image:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to upload image' 
      };
    }
  }

  // Update material information
  async updateMaterial(materialId, updateData) {
    try {
      const response = await api.put(`${API_ENDPOINTS.materials.update}/${materialId}`, updateData);
      
      console.log('✅ Material updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to update material:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update material' 
      };
    }
  }

  // Delete material
  async deleteMaterial(materialId) {
    try {
      const response = await api.delete(`${API_ENDPOINTS.materials.delete}/${materialId}`);
      
      console.log('✅ Material deleted successfully');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to delete material:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete material' 
      };
    }
  }
}

export default new MaterialService(); 