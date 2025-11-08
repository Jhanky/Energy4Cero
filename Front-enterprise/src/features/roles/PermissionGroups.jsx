import React from 'react';
import { 
  Check, 
  X, 
  Plus, 
  Minus,
  Shield,
  Users,
  Building,
  FileText,
  DollarSign,
  BarChart,
  Settings,
  HelpCircle
} from 'lucide-react';

const PermissionGroups = ({ 
  permissions = [], 
  selected = [], 
  onChange,
  readOnly = false,
  showDescriptions = true
}) => {
  // Definir grupos de permisos
  const permissionGroups = {
    users: {
      name: 'Usuarios',
      icon: Users,
      color: 'blue',
      permissions: [
        { id: 'users.create', label: 'Crear usuarios' },
        { id: 'users.read', label: 'Leer usuarios' },
        { id: 'users.update', label: 'Editar usuarios' },
        { id: 'users.delete', label: 'Eliminar usuarios' }
      ]
    },
    roles: {
      name: 'Roles',
      icon: Shield,
      color: 'purple',
      permissions: [
        { id: 'roles.create', label: 'Crear roles' },
        { id: 'roles.read', label: 'Leer roles' },
        { id: 'roles.update', label: 'Editar roles' },
        { id: 'roles.delete', label: 'Eliminar roles' }
      ]
    },
    projects: {
      name: 'Proyectos',
      icon: Building,
      color: 'orange',
      permissions: [
        { id: 'projects.create', label: 'Crear proyectos' },
        { id: 'projects.read', label: 'Leer proyectos' },
        { id: 'projects.update', label: 'Editar proyectos' },
        { id: 'projects.delete', label: 'Eliminar proyectos' }
      ]
    },
    financial: {
      name: 'Finanzas',
      icon: DollarSign,
      color: 'green',
      permissions: [
        { id: 'financial.read', label: 'Leer información financiera' },
        { id: 'financial.update', label: 'Editar información financiera' },
        { id: 'financial.reports', label: 'Generar reportes financieros' }
      ]
    },
    commercial: {
      name: 'Comercial',
      icon: BarChart,
      color: 'yellow',
      permissions: [
        { id: 'commercial.read', label: 'Leer información comercial' },
        { id: 'commercial.update', label: 'Editar información comercial' },
        { id: 'commercial.reports', label: 'Generar reportes comerciales' }
      ]
    },
    settings: {
      name: 'Configuración',
      icon: Settings,
      color: 'gray',
      permissions: [
        { id: 'settings.read', label: 'Leer configuración' },
        { id: 'settings.update', label: 'Editar configuración' }
      ]
    },
    reports: {
      name: 'Reportes',
      icon: FileText,
      color: 'indigo',
      permissions: [
        { id: 'reports.create', label: 'Crear reportes' },
        { id: 'reports.read', label: 'Leer reportes' },
        { id: 'reports.update', label: 'Editar reportes' },
        { id: 'reports.delete', label: 'Eliminar reportes' }
      ]
    },
    support: {
      name: 'Soporte',
      icon: HelpCircle,
      color: 'red',
      permissions: [
        { id: 'support.read', label: 'Leer tickets de soporte' },
        { id: 'support.update', label: 'Responder tickets de soporte' },
        { id: 'support.delete', label: 'Eliminar tickets de soporte' }
      ]
    }
  };

  // Obtener clase de color para grupo
  const getGroupColorClass = (color) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'gray': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Manejar cambio en permiso individual
  const handlePermissionChange = (permissionId) => {
    if (readOnly) return;
    
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

  // Manejar selección/deselección de grupo completo
  const handleGroupToggle = (groupPermissions) => {
    if (readOnly) return;
    
    const allSelected = groupPermissions.every(p => selected.includes(p.id));
    let newSelected = [...selected];
    
    if (allSelected) {
      // Deseleccionar todos los permisos del grupo
      newSelected = newSelected.filter(p => !groupPermissions.some(gp => gp.id === p));
    } else {
      // Seleccionar todos los permisos del grupo
      groupPermissions.forEach(p => {
        if (!newSelected.includes(p.id)) {
          newSelected.push(p.id);
        }
      });
    }
    
    if (onChange) {
      onChange(newSelected);
    }
  };

  // Verificar si un grupo está completamente seleccionado
  const isGroupFullySelected = (groupPermissions) => {
    return groupPermissions.every(p => selected.includes(p.id));
  };

  // Verificar si un grupo está parcialmente seleccionado
  const isGroupPartiallySelected = (groupPermissions) => {
    const selectedCount = groupPermissions.filter(p => selected.includes(p.id)).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  return (
    <div className="space-y-6">
      {Object.entries(permissionGroups).map(([groupName, group]) => {
        const GroupIcon = group.icon;
        const isFullySelected = isGroupFullySelected(group.permissions);
        const isPartiallySelected = isGroupPartiallySelected(group.permissions);
        
        return (
          <div 
            key={groupName} 
            className="border border-slate-200 rounded-xl overflow-hidden"
          >
            {/* Cabecera del grupo */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${getGroupColorClass(group.color).split(' ')[0]} rounded-lg flex items-center justify-center`}>
                    <GroupIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {group.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {group.permissions.length} permisos disponibles
                    </p>
                  </div>
                </div>
                
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleGroupToggle(group.permissions)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                      isFullySelected
                        ? `${getGroupColorClass(group.color).split(' ')[0]} ${getGroupColorClass(group.color).split(' ')[1]}`
                        : isPartiallySelected
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    } border`}
                    title={
                      isFullySelected 
                        ? 'Deseleccionar todos los permisos de este grupo' 
                        : 'Seleccionar todos los permisos de este grupo'
                    }
                  >
                    {isFullySelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Lista de permisos */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.permissions.map((permission) => {
                  const isSelected = selected.includes(permission.id);
                  
                  if (readOnly) {
                    return (
                      <div 
                        key={permission.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                          isSelected
                            ? `${getGroupColorClass(group.color).split(' ')[0]} border-green-200`
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
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {permission.label}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {permission.id}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <label
                      key={permission.id}
                      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? `${getGroupColorClass(group.color).split(' ')[0]} border-green-200`
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePermissionChange(permission.id)}
                        className="sr-only"
                      />
                      <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border">
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {permission.label}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {permission.id}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionGroups;