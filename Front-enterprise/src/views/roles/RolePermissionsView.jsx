import React from 'react';
import { 
  Shield, 
  Users, 
  Building, 
  FileText, 
  DollarSign, 
  BarChart, 
  Settings, 
  HelpCircle,
  Check,
  X
} from 'lucide-react';
import { PERMISSION_GROUPS, getPermissionDescription } from '../../constants/permissions';

const RolePermissionsView = ({ 
  permissions = [], 
  showDescriptions = true,
  showIcons = true,
  compact = false
}) => {
  // Agrupar permisos por categoría
  const groupedPermissions = {};
  
  permissions.forEach(permission => {
    const parts = permission.split('.');
    const category = parts[0];
    
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = {
        ...PERMISSION_GROUPS[category.toUpperCase()] || {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          icon: '🔒',
          permissions: []
        },
        permissions: []
      };
    }
    
    groupedPermissions[category].permissions.push({
      id: permission,
      action: parts[1],
      description: getPermissionDescription(permission)
    });
  });

  // Obtener icono para categoría
  const getCategoryIcon = (categoryName) => {
    switch (categoryName.toLowerCase()) {
      case 'users': return Users;
      case 'roles': return Shield;
      case 'projects': return Building;
      case 'financial': return DollarSign;
      case 'commercial': return BarChart;
      case 'settings': return Settings;
      case 'reports': return FileText;
      case 'support': return HelpCircle;
      default: return Shield;
    }
  };

  if (Object.keys(groupedPermissions).length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-600">
          Este rol no tiene permisos asignados
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${compact ? 'space-y-2' : ''}`}>
      {Object.entries(groupedPermissions).map(([categoryName, group]) => {
        const Icon = getCategoryIcon(group.name);
        
        return (
          <div 
            key={categoryName} 
            className={`border border-slate-200 rounded-lg overflow-hidden ${compact ? 'text-sm' : ''}`}
          >
            {/* Cabecera del grupo */}
            <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50 ${compact ? 'px-3 py-2' : ''}`}>
              {showIcons && (
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Icon className={`w-4 h-4 text-white ${compact ? 'w-3 h-3' : ''}`} />
                </div>
              )}
              <div>
                <h4 className={`font-semibold text-slate-900 ${compact ? 'text-sm' : ''}`}>
                  {group.name}
                </h4>
                <p className={`text-slate-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {group.permissions.length} permisos
                </p>
              </div>
            </div>
            
            {/* Lista de permisos */}
            <div className={`p-4 ${compact ? 'p-3' : ''}`}>
              <div className={`space-y-2 ${compact ? 'space-y-1' : ''}`}>
                {group.permissions.map(permission => (
                  <div 
                    key={permission.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border ${compact ? 'p-2 text-sm' : ''}`}
                  >
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {permission.action}
                      </p>
                      {showDescriptions && (
                        <p className={`text-slate-600 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RolePermissionsView;