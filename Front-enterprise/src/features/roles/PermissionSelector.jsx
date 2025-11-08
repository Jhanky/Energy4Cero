import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, X } from 'lucide-react';

const PermissionSelector = ({ 
  permissions = [], 
  selected = [], 
  onChange, 
  disabled = false,
  readonly = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState({});

  // Agrupar permisos por categoría
  const groupedPermissions = {};
  permissions.forEach(permission => {
    const parts = permission.split('.');
    const category = parts[0];
    const action = parts[1];
    
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = {
        name: category,
        icon: getCategoryIcon(category),
        color: getCategoryColor(category),
        permissions: []
      };
    }
    
    groupedPermissions[category].permissions.push({
      id: permission,
      name: action,
      label: getActionLabel(action)
    });
  });

  // Obtener icono para categoría
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'users': return '👥';
      case 'roles': return '👑';
      case 'projects': return '🏗️';
      case 'financial': return '💰';
      case 'commercial': return '📈';
      case 'settings': return '⚙️';
      case 'reports': return '📊';
      case 'support': return '🔧';
      default: return '🔒';
    }
  };

  // Obtener color para categoría
  const getCategoryColor = (category) => {
    switch (category) {
      case 'users': return 'bg-blue-100 text-blue-800';
      case 'roles': return 'bg-purple-100 text-purple-800';
      case 'projects': return 'bg-orange-100 text-orange-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'commercial': return 'bg-yellow-100 text-yellow-800';
      case 'settings': return 'bg-gray-100 text-gray-800';
      case 'reports': return 'bg-indigo-100 text-indigo-800';
      case 'support': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // Obtener etiqueta legible para acción
  const getActionLabel = (action) => {
    switch (action) {
      case 'create': return 'Crear';
      case 'read': return 'Leer';
      case 'update': return 'Editar';
      case 'delete': return 'Eliminar';
      case 'write': return 'Escribir';
      case 'reports': return 'Reportes';
      default: return action;
    }
  };

  // Alternar expansión de categoría
  const toggleCategory = (category) => {
    if (readonly || disabled) return;
    
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Manejar cambio de permiso individual
  const handlePermissionToggle = (permissionId) => {
    if (readonly || disabled) return;
    
    const newSelected = [...selected];
    const index = newSelected.indexOf(permissionId);
    
    if (index >= 0) {
      newSelected.splice(index, 1);
    } else {
      newSelected.push(permissionId);
    }
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Seleccionar todos los permisos de una categoría
  const selectAllCategory = (category) => {
    if (readonly || disabled) return;
    
    const categoryPermissions = groupedPermissions[category].permissions;
    const newSelected = [...selected];
    
    categoryPermissions.forEach(perm => {
      if (!newSelected.includes(perm.id)) {
        newSelected.push(perm.id);
      }
    });
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Deseleccionar todos los permisos de una categoría
  const deselectAllCategory = (category) => {
    if (readonly || disabled) return;
    
    const categoryPermissions = groupedPermissions[category].permissions;
    const newSelected = selected.filter(
      permId => !categoryPermissions.some(perm => perm.id === permId)
    );
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Verificar si todos los permisos de una categoría están seleccionados
  const isCategoryFullySelected = (category) => {
    const categoryPermissions = groupedPermissions[category].permissions;
    return categoryPermissions.every(perm => selected.includes(perm.id));
  };

  // Verificar si algunos permisos de una categoría están seleccionados
  const isCategoryPartiallySelected = (category) => {
    const categoryPermissions = groupedPermissions[category].permissions;
    return categoryPermissions.some(perm => selected.includes(perm.id)) &&
           !categoryPermissions.every(perm => selected.includes(perm.id));
  };

  if (Object.keys(groupedPermissions).length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p>No hay permisos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Object.entries(groupedPermissions).map(([category, group]) => {
        const isExpanded = expandedCategories[category];
        const isFullySelected = isCategoryFullySelected(category);
        const isPartiallySelected = isCategoryPartiallySelected(category);
        
        return (
          <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Cabecera de categoría */}
            <div 
              className={`flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${
                readonly || disabled ? 'cursor-default' : ''
              }`}
              onClick={() => toggleCategory(category)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${group.color}`}>
                  <span className="text-sm">{group.icon}</span>
                </div>
                
                <div>
                  <h4 className="font-medium text-slate-900 capitalize">
                    {group.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {group.permissions.length} permisos
                  </p>
                </div>
              </div>
              
              {!readonly && !disabled && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      isFullySelected ? deselectAllCategory(category) : selectAllCategory(category);
                    }}
                    className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                      isFullySelected
                        ? 'bg-green-100 text-green-800'
                        : isPartiallySelected
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isFullySelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                </div>
              )}
            </div>
            
            {/* Lista de permisos */}
            {isExpanded && (
              <div className="p-4 border-t border-slate-200 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.permissions.map(perm => {
                    const isSelected = selected.includes(perm.id);
                    
                    if (readonly) {
                      return (
                        <div 
                          key={perm.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-green-50 border-green-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                            {isSelected ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {perm.label}
                            </p>
                            <p className="text-xs text-slate-500">
                              {perm.id}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return (
                      <label 
                        key={perm.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePermissionToggle(perm.id)}
                          disabled={disabled}
                          className="sr-only"
                        />
                        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border">
                          {isSelected && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {perm.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {perm.id}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PermissionSelector;