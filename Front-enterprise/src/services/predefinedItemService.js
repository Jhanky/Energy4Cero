import api from './api';

const predefinedItemService = {
  // Obtener ítems predefinidos
  getPredefinedItems: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/predefined-items?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener ítems predefinidos: ${error.message}`);
    }
  },

  // Obtener ítems activos para selector
  getActiveItems: async () => {
    try {
      const response = await api.get('/predefined-items/active');
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener ítems activos: ${error.message}`);
    }
  },

  // Crear ítem predefinido
  createPredefinedItem: async (data) => {
    try {
      const response = await api.post('/predefined-items', data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear ítem: ${error.message}`);
    }
  },

  // Obtener ítem por ID
  getPredefinedItem: async (id) => {
    try {
      const response = await api.get(`/predefined-items/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al obtener ítem: ${error.message}`);
    }
  },

  // Actualizar ítem predefinido
  updatePredefinedItem: async (id, data) => {
    try {
      const response = await api.put(`/predefined-items/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(`Error al actualizar ítem: ${error.message}`);
    }
  },

  // Eliminar ítem predefinido
  deletePredefinedItem: async (id) => {
    try {
      const response = await api.delete(`/predefined-items/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al eliminar ítem: ${error.message}`);
    }
  },

  // Cambiar estado del ítem
  toggleStatus: async (id) => {
    try {
      const response = await api.patch(`/predefined-items/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }
};

export default predefinedItemService;
