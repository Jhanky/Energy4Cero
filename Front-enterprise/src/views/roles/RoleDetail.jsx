import React from 'react';
import { Calendar, User, Users, Shield, FileText, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const RoleDetail = ({ role, onClose, onEdit, onDelete, onToggleStatus }) => {
  if (!role) return null;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener estado del rol
  const getStatusInfo = (isActive) => {
    return {
      label: isActive ? 'Activo' : 'Inactivo',
      color: isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800',
      icon: isActive ? ToggleRight : ToggleLeft
    };
  };

  // Obtener icono para categoría de permiso
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

  // Obtener nombre legible para categoría de permiso
  const getCategoryName = (category) => {
    switch (category) {
      case 'users': return 'Usuarios';
      case 'roles': return 'Roles';
      case 'projects': return 'Proyectos';
      case 'financial': return 'Finanzas';
      case 'commercial': return 'Comercial';
      case 'settings': return 'Configuración';
      case 'reports': return 'Reportes';
      case 'support': return 'Soporte';
      default: return category;
    }
  };

  // Agrupar permisos por categoría
  const groupedPermissions = {};
  (role.permissions || []).forEach(permission => {
    const parts = permission.split('.');
    const category = parts[0];
    const action = parts[1];
    
    if (!groupedPermissions[category]) {
      groupedPermissions[category] = {
        icon: getCategoryIcon(category),
        name: getCategoryName(category),
        permissions: []
      };
    }
    
    groupedPermissions[category].permissions.push({
      id: permission,
      action: action,
      label: getActionLabel(action)
    });
  });

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

  const statusInfo = getStatusInfo(role.is_active);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{role.name}</h2>
                <p className="text-slate-600 mt-1">@{role.slug}</p>
                {role.description && (
                  <p className="text-slate-700 mt-2">{role.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del rol */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Rol</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Nombre</p>
                    <p className="text-slate-900 mt-1">{role.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Slug</p>
                    <p className="text-slate-900 mt-1">@{role.slug}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Estado</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${statusInfo.color}`}>
                      <StatusIcon className="w-4 h-4 mr-1" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Usuarios Asignados</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-900">{role.users_count || 0}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-slate-700">Descripción</p>
                    <p className="text-slate-900 mt-1">{role.description || 'Sin descripción'}</p>
                  </div>
                </div>
              </div>

              {/* Permisos del rol */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Permisos del Rol</h3>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-800">
                    {(role.permissions || []).length} permisos
                  </span>
                </div>
                
                {Object.keys(groupedPermissions).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(([category, group]) => (
                      <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-white px-4 py-3 border-b border-slate-200">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{group.icon}</span>
                            <span className="font-medium text-slate-900">{group.name}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                              {group.permissions.length} permisos
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <div className="flex flex-wrap gap-2">
                            {group.permissions.map(perm => (
                              <span 
                                key={perm.id}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700"
                              >
                                {perm.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Este rol no tiene permisos asignados</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel lateral */}
            <div className="space-y-6">
              {/* Fechas */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Fechas</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Creado</span>
                    </div>
                    <p className="text-sm text-slate-900">{formatDate(role.created_at)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Actualizado</span>
                    </div>
                    <p className="text-sm text-slate-900">{formatDate(role.updated_at)}</p>
                  </div>
                </div>
              </div>

              {/* Usuarios asignados */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Usuarios Asignados</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="font-medium text-slate-900">{role.users_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Activos</span>
                    <span className="font-medium text-green-600">
                      {role.active_users_count || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Inactivos</span>
                    <span className="font-medium text-red-600">
                      {(role.users_count || 0) - (role.active_users_count || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Acciones</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => onEdit(role)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                    <span>Editar Rol</span>
                  </button>
                  
                  <button
                    onClick={() => onToggleStatus(role)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <StatusIcon className="w-5 h-5" />
                    <span>
                      {role.is_active ? 'Desactivar Rol' : 'Activar Rol'}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => onDelete(role)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Eliminar Rol</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleDetail;