import api from './api';

const panelService = {
  async getPanels(params = {}) {
    try {
      const response = await api.get('/panels', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPanel(id) {
    try {
      const response = await api.get(`/panels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPanel(panelData) {
    try {
      // Asegurarse de que los datos se envían como FormData
      let formData;
      if (panelData instanceof FormData) {
        formData = panelData;
      } else {
        formData = new FormData();
        for (const key in panelData) {
          formData.append(key, panelData[key]);
        }
      }
      
      const response = await api.post('/panels', formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePanel(id, panelData) {
    try {
      // Asegurarse de que los datos se envían como FormData
      let formData;
      if (panelData instanceof FormData) {
        formData = panelData;
      } else {
        formData = new FormData();
        for (const key in panelData) {
          formData.append(key, panelData[key]);
        }
      }
      
      // Laravel expects PUT/PATCH for multipart/form-data to be POST with _method field
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT');
      }

      const response = await api.post(`/panels/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  async deletePanel(id) {
    try {
      console.log('🔧 Enviando solicitud DELETE a /panels/', id);
      console.log('🔧 Tipo de ID:', typeof id);
      console.log('🔧 Valor de ID:', id);
      const response = await api.delete(`/panels/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async togglePanelStatus(id) {
    try {
      const response = await api.patch(`/panels/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getPanelStatistics() {
    try {
      const response = await api.get('/panels/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default panelService;
