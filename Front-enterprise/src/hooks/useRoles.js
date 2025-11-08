import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import roleService from '../services/roleService';

/**
 * Hook personalizado para manejar la lógica de roles
 */
const useRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    is_active: '',
    sort_by: 'name',
    sort_order: 'asc',
    per_page: 15
  });

  /**
   * Cargar todos los roles con filtros
   */
  const loadRoles = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestParams = { ...filters, ...params };
      const response = await roleService.getRoles(requestParams);
      
      if (response.success) {
        setRoles(response.data.roles || []);
        return response.data;
      } else {
        throw new Error(response.message || 'Error al cargar roles');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al cargar roles');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar un rol específico por ID
   */
  const loadRole = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.getRole(id);
      
      if (response.success) {
        return response.data.role;
      } else {
        throw new Error(response.message || 'Error al cargar el rol');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al cargar el rol');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear un nuevo rol
   */
  const createRole = async (roleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.createRole(roleData);
      
      if (response.success) {
        toast.success('Rol creado exitosamente');
        // Recargar la lista de roles
        await loadRoles();
        loadStatistics();
        return response.data.role;
      } else {
        throw new Error(response.message || 'Error al crear el rol');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al crear el rol');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un rol existente
   */
  const updateRole = async (id, roleData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.updateRole(id, roleData);
      
      if (response.success) {
        toast.success('Rol actualizado exitosamente');
        // Recargar la lista de roles
        await loadRoles();
        loadStatistics();
        return response.data.role;
      } else {
        throw new Error(response.message || 'Error al actualizar el rol');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al actualizar el rol');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un rol
   */
  const deleteRole = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.deleteRole(id);
      
      if (response.success) {
        toast.success('Rol eliminado exitosamente');
        // Recargar la lista de roles
        await loadRoles();
        loadStatistics();
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar el rol');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al eliminar el rol');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar estado activo/inactivo de un rol
   */
  const toggleRoleStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await roleService.toggleRoleStatus(id);
      
      if (response.success) {
        toast.success(response.message);
        // Recargar la lista de roles
        await loadRoles();
        loadStatistics();
        return response.data.role;
      } else {
        throw new Error(response.message || 'Error al cambiar estado del rol');
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message || 'Error al cambiar estado del rol');
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar estadísticas de roles
   */
  const loadStatistics = async () => {
    try {
      const response = await roleService.getRoleStatistics();
      
      if (response.success) {
        setStats(response.data.statistics || {});
        return response.data.statistics;
      } else {
        throw new Error(response.message || 'Error al cargar estadísticas');
      }
    } catch (error) {
      
      throw error;
    }
  };

  /**
   * Cargar permisos disponibles
   */
  const loadAvailablePermissions = async () => {
    try {
      const response = await roleService.getAvailablePermissions();
      
      if (response.success) {
        return response.data.permissions || {};
      } else {
        throw new Error(response.message || 'Error al cargar permisos disponibles');
      }
    } catch (error) {
      
      throw error;
    }
  };

  /**
   * Actualizar filtros
   */
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  /**
   * Aplicar filtros
   */
  const applyFilters = () => {
    loadRoles();
  };

  /**
   * Limpiar filtros
   */
  const clearFilters = () => {
    setFilters({
      search: '',
      is_active: '',
      sort_by: 'name',
      sort_order: 'asc',
      per_page: 15
    });
    loadRoles({
      search: '',
      is_active: '',
      sort_by: 'name',
      sort_order: 'asc',
      per_page: 15
    });
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    loadRoles();
    loadStatistics();
  }, []);

  return {
    // Estados
    roles,
    loading,
    error,
    stats,
    filters,
    
    // Funciones
    loadRoles,
    loadRole,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    loadStatistics,
    loadAvailablePermissions,
    updateFilters,
    applyFilters,
    clearFilters
  };
};

export default useRoles;