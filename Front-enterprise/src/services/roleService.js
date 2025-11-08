import api from './api';

class RoleService {
  /**
   * Obtener todos los roles con filtros y paginación
   */
  async getRoles(params = {}) {
    try {
      // Convertimos los parámetros a query string
      const queryString = new URLSearchParams(params).toString();
      const endpoint = queryString ? `/roles?${queryString}` : `/roles`;
      const response = await api.request(endpoint);
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Obtener un rol específico por ID
   */
  async getRole(id) {
    try {
      const response = await api.request(`/roles/${id}`);
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Crear un nuevo rol
   */
  async createRole(roleData) {
    try {
      const response = await api.request('/roles', {
        method: 'POST',
        body: JSON.stringify(roleData),
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Actualizar un rol existente
   */
  async updateRole(id, roleData) {
    try {
      const response = await api.request(`/roles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Eliminar un rol
   */
  async deleteRole(id) {
    try {
      const response = await api.request(`/roles/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Cambiar estado activo/inactivo de un rol
   */
  async toggleRoleStatus(id) {
    try {
      const response = await api.request(`/roles/${id}/toggle-status`, {
        method: 'PATCH',
      });
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  async getRoleStatistics() {
    try {
      const response = await api.request('/roles/statistics');
      return response;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Obtener permisos disponibles
   */
  async getAvailablePermissions() {
    try {
      const response = await api.request('/roles/permissions');
      return response;
    } catch (error) {
      
      throw error;
    }
  }
}

// Crear una instancia única del servicio
const roleService = new RoleService();

export default roleService;