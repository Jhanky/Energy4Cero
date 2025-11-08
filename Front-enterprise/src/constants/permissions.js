// Constantes de permisos del sistema

export const PERMISSIONS = {
  // Permisos de usuarios
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete'
  },
  
  // Permisos de roles
  ROLES: {
    CREATE: 'roles.create',
    READ: 'roles.read',
    UPDATE: 'roles.update',
    DELETE: 'roles.delete'
  },
  
  // Permisos de proyectos
  PROJECTS: {
    CREATE: 'projects.create',
    READ: 'projects.read',
    UPDATE: 'projects.update',
    DELETE: 'projects.delete'
  },
  
  // Permisos financieros
  FINANCIAL: {
    READ: 'financial.read',
    UPDATE: 'financial.update',
    REPORTS: 'financial.reports'
  },
  
  // Permisos comerciales
  COMMERCIAL: {
    READ: 'commercial.read',
    UPDATE: 'commercial.update',
    REPORTS: 'commercial.reports'
  },
  
  // Permisos de configuración
  SETTINGS: {
    READ: 'settings.read',
    UPDATE: 'settings.update'
  },
  
  // Permisos de reportes
  REPORTS: {
    CREATE: 'reports.create',
    READ: 'reports.read',
    UPDATE: 'reports.update',
    DELETE: 'reports.delete'
  },
  
  // Permisos de soporte
  SUPPORT: {
    READ: 'support.read',
    UPDATE: 'support.update',
    DELETE: 'support.delete'
  }
};

// Grupos de permisos por módulo
export const PERMISSION_GROUPS = {
  USERS: {
    name: 'Usuarios',
    icon: '👥',
    permissions: [
      PERMISSIONS.USERS.CREATE,
      PERMISSIONS.USERS.READ,
      PERMISSIONS.USERS.UPDATE,
      PERMISSIONS.USERS.DELETE
    ]
  },
  
  ROLES: {
    name: 'Roles',
    icon: '👑',
    permissions: [
      PERMISSIONS.ROLES.CREATE,
      PERMISSIONS.ROLES.READ,
      PERMISSIONS.ROLES.UPDATE,
      PERMISSIONS.ROLES.DELETE
    ]
  },
  
  PROJECTS: {
    name: 'Proyectos',
    icon: '🏗️',
    permissions: [
      PERMISSIONS.PROJECTS.CREATE,
      PERMISSIONS.PROJECTS.READ,
      PERMISSIONS.PROJECTS.UPDATE,
      PERMISSIONS.PROJECTS.DELETE
    ]
  },
  
  FINANCIAL: {
    name: 'Finanzas',
    icon: '💰',
    permissions: [
      PERMISSIONS.FINANCIAL.READ,
      PERMISSIONS.FINANCIAL.UPDATE,
      PERMISSIONS.FINANCIAL.REPORTS
    ]
  },
  
  COMMERCIAL: {
    name: 'Comercial',
    icon: '📈',
    permissions: [
      PERMISSIONS.COMMERCIAL.READ,
      PERMISSIONS.COMMERCIAL.UPDATE,
      PERMISSIONS.COMMERCIAL.REPORTS
    ]
  },
  
  SETTINGS: {
    name: 'Configuración',
    icon: '⚙️',
    permissions: [
      PERMISSIONS.SETTINGS.READ,
      PERMISSIONS.SETTINGS.UPDATE
    ]
  },
  
  REPORTS: {
    name: 'Reportes',
    icon: '📊',
    permissions: [
      PERMISSIONS.REPORTS.CREATE,
      PERMISSIONS.REPORTS.READ,
      PERMISSIONS.REPORTS.UPDATE,
      PERMISSIONS.REPORTS.DELETE
    ]
  },
  
  SUPPORT: {
    name: 'Soporte',
    icon: '🔧',
    permissions: [
      PERMISSIONS.SUPPORT.READ,
      PERMISSIONS.SUPPORT.UPDATE,
      PERMISSIONS.SUPPORT.DELETE
    ]
  }
};

// Descripciones legibles de permisos
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSIONS.USERS.CREATE]: 'Crear nuevos usuarios',
  [PERMISSIONS.USERS.READ]: 'Ver usuarios',
  [PERMISSIONS.USERS.UPDATE]: 'Editar usuarios',
  [PERMISSIONS.USERS.DELETE]: 'Eliminar usuarios',
  
  [PERMISSIONS.ROLES.CREATE]: 'Crear nuevos roles',
  [PERMISSIONS.ROLES.READ]: 'Ver roles',
  [PERMISSIONS.ROLES.UPDATE]: 'Editar roles',
  [PERMISSIONS.ROLES.DELETE]: 'Eliminar roles',
  
  [PERMISSIONS.PROJECTS.CREATE]: 'Crear nuevos proyectos',
  [PERMISSIONS.PROJECTS.READ]: 'Ver proyectos',
  [PERMISSIONS.PROJECTS.UPDATE]: 'Editar proyectos',
  [PERMISSIONS.PROJECTS.DELETE]: 'Eliminar proyectos',
  
  [PERMISSIONS.FINANCIAL.READ]: 'Ver información financiera',
  [PERMISSIONS.FINANCIAL.UPDATE]: 'Editar información financiera',
  [PERMISSIONS.FINANCIAL.REPORTS]: 'Generar reportes financieros',
  
  [PERMISSIONS.COMMERCIAL.READ]: 'Ver información comercial',
  [PERMISSIONS.COMMERCIAL.UPDATE]: 'Editar información comercial',
  [PERMISSIONS.COMMERCIAL.REPORTS]: 'Generar reportes comerciales',
  
  [PERMISSIONS.SETTINGS.READ]: 'Ver configuración del sistema',
  [PERMISSIONS.SETTINGS.UPDATE]: 'Editar configuración del sistema',
  
  [PERMISSIONS.REPORTS.CREATE]: 'Crear nuevos reportes',
  [PERMISSIONS.REPORTS.READ]: 'Ver reportes',
  [PERMISSIONS.REPORTS.UPDATE]: 'Editar reportes',
  [PERMISSIONS.REPORTS.DELETE]: 'Eliminar reportes',
  
  [PERMISSIONS.SUPPORT.READ]: 'Ver tickets de soporte',
  [PERMISSIONS.SUPPORT.UPDATE]: 'Responder tickets de soporte',
  [PERMISSIONS.SUPPORT.DELETE]: 'Eliminar tickets de soporte'
};

// Función para obtener descripción legible de un permiso
export const getPermissionDescription = (permission) => {
  return PERMISSION_DESCRIPTIONS[permission] || permission;
};

// Función para obtener grupo de un permiso
export const getPermissionGroup = (permission) => {
  const parts = permission.split('.');
  if (parts.length < 2) return null;
  
  const module = parts[0].toUpperCase();
  return PERMISSION_GROUPS[module] || null;
};

// Función para verificar si un permiso es válido
export const isValidPermission = (permission) => {
  return Object.values(PERMISSIONS).some(group => 
    Object.values(group).includes(permission)
  );
};