import { useAuth } from './useAuth';

/**
 * Hook para manejar verificaciones de permisos y roles de forma más conveniente
 * @returns {Object} Objeto con métodos de verificación y utilidades
 */
export const usePermissions = () => {
  const { hasRole, hasPermission, usuario } = useAuth();

  /**
   * Verificar si el usuario tiene al menos uno de los roles especificados
   * @param {string|string[]} roles - Rol(es) a verificar
   * @returns {boolean} True si tiene al menos uno de los roles
   */
  const hasAnyRole = (roles) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some(role => hasRole(role));
  };

  /**
   * Verificar si el usuario tiene todos los roles especificados
   * @param {string|string[]} roles - Rol(es) a verificar
   * @returns {boolean} True si tiene todos los roles
   */
  const hasAllRoles = (roles) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.every(role => hasRole(role));
  };

  /**
   * Verificar si el usuario tiene al menos uno de los permisos especificados
   * @param {string|string[]} permissions - Permiso(s) a verificar
   * @returns {boolean} True si tiene al menos uno de los permisos
   */
  const hasAnyPermission = (permissions) => {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
    return permissionArray.some(permission => hasPermission(permission));
  };

  /**
   * Verificar si el usuario tiene todos los permisos especificados
   * @param {string|string[]} permissions - Permiso(s) a verificar
   * @returns {boolean} True si tiene todos los permisos
   */
  const hasAllPermissions = (permissions) => {
    const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
    return permissionArray.every(permission => hasPermission(permission));
  };

  /**
   * Verificar si el usuario puede realizar una acción específica
   * @param {string} resource - Recurso (ej: 'users', 'projects')
   * @param {string} action - Acción (ej: 'create', 'read', 'update', 'delete')
   * @returns {boolean} True si puede realizar la acción
   */
  const can = (resource, action) => {
    return hasPermission(`${resource}.${action}`);
  };

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean} True si es administrador
   */
  const isAdmin = () => {
    return hasRole('administrador');
  };

  /**
   * Verificar si el usuario es gerente o superior
   * @returns {boolean} True si es gerente o administrador
   */
  const isManagerOrAbove = () => {
    return hasAnyRole(['administrador', 'gerente']);
  };

  /**
   * Obtener permisos del usuario actual
   * @returns {string[]} Array de permisos del usuario
   */
  const getUserPermissions = () => {
    return usuario?.role?.permissions || [];
  };

  /**
   * Obtener rol del usuario actual
   * @returns {Object|null} Objeto con información del rol
   */
  const getUserRole = () => {
    return usuario?.role || null;
  };

  return {
    // Métodos básicos
    hasRole,
    hasPermission,
    
    // Métodos avanzados
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions,
    can,
    
    // Métodos de conveniencia
    isAdmin,
    isManagerOrAbove,
    
    // Getters
    getUserPermissions,
    getUserRole,
    
    // Estado del usuario
    usuario
  };
};
