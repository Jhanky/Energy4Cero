import React from 'react';

const AvailablePermissions = ({ permissions = {}, selected = [], onChange, disabled = false }) => {
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

  // Manejar cambio de selección de permiso
  const handlePermissionToggle = (permission) => {
    if (disabled) return;
    
    const isSelected = selected.includes(permission);
    let newSelected = [];
    
    if (isSelected) {
      // Remover permiso
      newSelected = selected.filter(p => p !== permission);
    } else {
      // Agregar permiso
      newSelected = [...selected, permission];
    }
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Seleccionar todos los permisos de una categoría
  const handleSelectAllCategory = (category) => {
    if (disabled) return;
    
    const categoryPermissions = permissions[category] || [];
    const newSelected = [...selected];
    
    categoryPermissions.forEach(permission => {
      if (!newSelected.includes(permission)) {
        newSelected.push(permission);
      }
    });
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Deseleccionar todos los permisos de una categoría
  const handleDeselectAllCategory = (category) => {
    if (disabled) return;
    
    const categoryPermissions = permissions[category] || [];
    const newSelected = selected.filter(p => !categoryPermissions.includes(p));
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Verificar si todos los permisos de una categoría están seleccionados
  const isCategoryFullySelected = (category) => {
    const categoryPermissions = permissions[category] || [];
    return categoryPermissions.every(p => selected.includes(p));
  };

  // Verificar si algunos permisos de una categoría están seleccionados
  const isCategoryPartiallySelected = (category) => {
    const categoryPermissions = permissions[category] || [];
    return categoryPermissions.some(p => selected.includes(p)) && 
           !categoryPermissions.every(p => selected.includes(p));
  };

  return (
    <div className="space-y-6">
      {Object.entries(permissions).length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p className="text-slate-600">No hay permisos disponibles</p>
        </div>
      ) : (
        Object.entries(permissions).map(([category, categoryPermissions]) => {
          const isFullySelected = isCategoryFullySelected(category);
          const isPartiallySelected = isCategoryPartiallySelected(category);
          const categoryIcon = getCategoryIcon(category);
          const categoryName = getCategoryName(category);
          
          return (
            <div key={category} className="border border-slate-200 rounded-xl overflow-hidden">
              {/* Cabecera de categoría */}
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{categoryIcon}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{categoryName}</h3>
                      <p className="text-sm text-slate-600">
                        {categoryPermissions.length} permisos disponibles
                      </p>
                    </div>
                  </div>
                  
                  {!disabled && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => isFullySelected ? 
                          handleDeselectAllCategory(category) : 
                          handleSelectAllCategory(category)}
                        disabled={disabled}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          isFullySelected
                            ? 'bg-green-100 text-green-800'
                            : isPartiallySelected
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isFullySelected 
                          ? 'Deseleccionar todo' 
                          : isPartiallySelected
                          ? 'Parcialmente seleccionado'
                          : 'Seleccionar todo'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lista de permisos */}
              <div className="p-6">
                {categoryPermissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryPermissions.map((permission) => {
                      const parts = permission.split('.');
                      const action = parts[1];
                      const actionName = getActionName(action);
                      const isSelected = selected.includes(permission);
                      
                      if (disabled) {
                        return (
                          <div 
                            key={permission}
                            className={`flex items-center p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                              {isSelected ? (
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                              ) : (
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-slate-900">
                                {actionName}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {permission}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <label 
                          key={permission}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handlePermissionToggle(permission)}
                            disabled={disabled}
                            className="sr-only"
                          />
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border">
                            {isSelected && (
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-900">
                              {actionName}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {permission}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-500 text-center py-4">
                    No hay permisos disponibles para esta categoría
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AvailablePermissions;