import api from './api';

const batteryService = {
  async getBatteries(params = {}) {
    try {
      const response = await api.get('/batteries', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBattery(id) {
    try {
      const response = await api.get(`/batteries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createBattery(batteryData) {
    try {
      const response = await api.post('/batteries', batteryData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateBattery(id, batteryData) {
    try {
      // Laravel expects PUT/PATCH for multipart/form-data to be POST with _method field
      const formData = new FormData();
      for (const key in batteryData) {
        formData.append(key, batteryData[key]);
      }
      formData.append('_method', 'PUT');

      const response = await api.post(`/batteries/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteBattery(id) {
    try {
      const response = await api.delete(`/batteries/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async toggleBatteryStatus(id) {
    try {
      const response = await api.patch(`/batteries/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getBatteryStatistics() {
    try {
      const response = await api.get('/batteries/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default batteryService;
