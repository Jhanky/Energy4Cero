import api from './api';

const inverterService = {
  async getInverters(params = {}) {
    try {
      const response = await api.get('/inverters', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getInverter(id) {
    try {
      const response = await api.get(`/inverters/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createInverter(inverterData) {
    try {
      const response = await api.post('/inverters', inverterData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateInverter(id, inverterData) {
    try {
      // Laravel expects PUT/PATCH for multipart/form-data to be POST with _method field
      const formData = new FormData();
      for (const key in inverterData) {
        formData.append(key, inverterData[key]);
      }
      formData.append('_method', 'PUT');

      const response = await api.post(`/inverters/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteInverter(id) {
    try {
      const response = await api.delete(`/inverters/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async toggleInverterStatus(id) {
    try {
      const response = await api.patch(`/inverters/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getInverterStatistics() {
    try {
      const response = await api.get('/inverters/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default inverterService;
