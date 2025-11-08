import React from 'react';

const RolePermissionsBadge = ({ permissions = [], maxVisible = 3 }) => {
  // Definir iconos para diferentes categorías de permisos
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'users':
        return '👥';
      case 'roles':
        return '👑';
      case 'projects':
        return '🏗️';
      case 'financial':
        return '💰';
      case 'commercial':
        return '📈';
      case 'settings':
        return '⚙️';
      case 'reports':
        return '📊';
      case 'support':
        return '🔧';
      default:
        return '🔒';
    }
  };

  // Definir nombres legibles para categorías
  const getCategoryName = (category) => {
    switch (category) {
      case 'users':
        return 'Usuarios';
      case 'roles':
        return 'Roles';
      case 'projects':
        return 'Proyectos';
      case 'financial':
        return 'Finanzas';
      case 'commercial':
        return 'Comercial';
      case 'settings':
        return 'Configuración';
      case 'reports':
        return 'Reportes';
      case 'support':
        return 'Soporte';
      default:
        return category;
    }
  };

  // Definir nombres legibles para acciones
  const getActionName = (action) => {
    switch (action) {
      case 'create':
        return 'Crear';
      case 'read':
        return 'Leer';
      case 'update':
        return 'Editar';
      case 'delete':
        return 'Eliminar';
      case 'reports':
        return 'Reportes';
      case 'write':
        return 'Escribir';
      default:
        return action;
    }
  };

  // Agrupar permisos por categoría
  const groupedPermissions = {};
  permissions.forEach(permission => {
    if (typeof permission === 'string') {
      const parts = permission.split('.');
      const category = parts[0];
      const action = parts[1];
      
      if (!groupedPermissions[category]) {
        groupedPermissions[category] = {
          icon: getCategoryIcon(category),
          name: getCategoryName(category),
          actions: []
        };
      }
      
      if (action && !groupedPermissions[category].actions.includes(action)) {
        groupedPermissions[category].actions.push(action);
      }
    }
  });

  // Mostrar solo las primeras categorías
  const visibleCategories = Object.keys(groupedPermissions).slice(0, maxVisible);
  const remainingCount = Math.max(0, Object.keys(groupedPermissions).length - maxVisible);

  if (permissions.length === 0) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        Sin permisos
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {visibleCategories.map((category, index) => {
        const group = groupedPermissions[category];
        const actions = group.actions.slice(0, 2);
        const remainingActions = Math.max(0, group.actions.length - 2);
        
        return (
          <span 
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
            title={`${group.name}: ${group.actions.map(getActionName).join(', ')}`}
          >
            <span className="mr-1">{group.icon}</span>
            <span>{group.name}</span>
            {actions.length > 0 && (
              <span className="ml-1 text-slate-500">
                ({actions.map(getActionName).join(', ')}
                {remainingActions > 0 && ` +${remainingActions}`})
              </span>
            )}
          </span>
        );
      })}
      
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
          +{remainingCount} más
        </span>
      )}
    </div>
  );
};

export default RolePermissionsBadge;