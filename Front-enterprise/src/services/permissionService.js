import api from './api';

class PermissionService {
  /**
   * Obtener todos los permisos disponibles
   */
  async getAllPermissions() {
    try {
      const response = await api.get('/roles/permissions');
      return response.data;
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Obtener permisos por categoría
   */
  async getPermissionsByCategory(category) {
    try {
      const allPermissions = await this.getAllPermissions();
      if (allPermissions.success && allPermissions.data.permissions[category]) {
        return allPermissions.data.permissions[category];
      }
      return [];
    } catch (error) {
      
      throw error;
    }
  }

  /**
   * Verificar si un permiso existe
   */
  isPermissionValid(permission) {
    const validPermissions = [
      // Permisos de usuarios
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      
      // Permisos de roles
      'roles.create',
      'roles.read',
      'roles.update',
      'roles.delete',
      
      // Permisos de proyectos
      'projects.create',
      'projects.read',
      'projects.update',
      'projects.delete',
      
      // Permisos financieros
      'financial.read',
      'financial.update',
      'financial.reports',
      
      // Permisos comerciales
      'commercial.read',
      'commercial.update',
      'commercial.reports',
      
      // Permisos de configuración
      'settings.read',
      'settings.update',
      
      // Permisos de reportes
      'reports.create',
      'reports.read',
      'reports.update',
      'reports.delete',
      
      // Permisos de soporte
      'support.read',
      'support.update',
      'support.delete',
    ];
    
    return validPermissions.includes(permission);
  }

  /**
   * Obtener categorías de permisos
   */
  getPermissionCategories() {
    return [
      { 
        key: 'users', 
        name: 'Usuarios', 
        icon: '👥',
        description: 'Gestión de usuarios del sistema'
      },
      { 
        key: 'roles', 
        name: 'Roles', 
        icon: '👑',
        description: 'Gestión de roles y permisos'
      },
      { 
        key: 'projects', 
        name: 'Proyectos', 
        icon: '🏗️',
        description: 'Gestión de proyectos fotovoltaicos'
      },
      { 
        key: 'financial', 
        name: 'Finanzas', 
        icon: '💰',
        description: 'Gestión financiera'
      },
      { 
        key: 'commercial', 
        name: 'Comercial', 
        icon: '📈',
        description: 'Gestión comercial y cotizaciones'
      },
      { 
        key: 'settings', 
        name: 'Configuración', 
        icon: '⚙️',
        description: 'Configuración del sistema'
      },
      { 
        key: 'reports', 
        name: 'Reportes', 
        icon: '📊',
        description: 'Generación de reportes'
      },
      { 
        key: 'support', 
        name: 'Soporte', 
        icon: '🔧',
        description: 'Soporte técnico'
      }
    ];
  }

  /**
   * Obtener descripción legible para cada permiso
   */
  getPermissionDescriptions() {
    return {
      'users.create': 'Crear nuevos usuarios',
      'users.read': 'Ver usuarios',
      'users.update': 'Editar usuarios',
      'users.delete': 'Eliminar usuarios',
      'roles.create': 'Crear nuevos roles',
      'roles.read': 'Ver roles',
      'roles.update': 'Editar roles',
      'roles.delete': 'Eliminar roles',
      'projects.create': 'Crear nuevos proyectos',
      'projects.read': 'Ver proyectos',
      'projects.update': 'Editar proyectos',
      'projects.delete': 'Eliminar proyectos',
      'financial.read': 'Ver información financiera',
      'financial.update': 'Editar información financiera',
      'financial.reports': 'Generar reportes financieros',
      'commercial.read': 'Ver información comercial',
      'commercial.update': 'Editar información comercial',
      'commercial.reports': 'Generar reportes comerciales',
      'settings.read': 'Ver configuración del sistema',
      'settings.update': 'Editar configuración del sistema',
      'reports.create': 'Crear nuevos reportes',
      'reports.read': 'Ver reportes',
      'reports.update': 'Editar reportes',
      'reports.delete': 'Eliminar reportes',
      'support.read': 'Ver tickets de soporte',
      'support.update': 'Responder tickets de soporte',
      'support.delete': 'Eliminar tickets de soporte'
    };
  }

  /**
   * Agrupar permisos por categoría
   */
  groupPermissionsByCategory(permissions = []) {
    const grouped = {};
    const categories = this.getPermissionCategories();
    const descriptions = this.getPermissionDescriptions();
    
    // Inicializar todas las categorías
    categories.forEach(cat => {
      grouped[cat.key] = {
        category: cat,
        permissions: []
      };
    });
    
    // Agrupar permisos existentes
    permissions.forEach(permission => {
      const categoryKey = permission.split('.')[0];
      const description = descriptions[permission] || permission;
      
      if (grouped[categoryKey]) {
        grouped[categoryKey].permissions.push({
          id: permission,
          name: permission,
          description: description,
          category: categoryKey
        });
      }
    });
    
    return grouped;
  }
}

// Crear una instancia única del servicio
const permissionService = new PermissionService();

export default permissionService;