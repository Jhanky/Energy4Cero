import React from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Shield,
  Users,
  Calendar,
  FileText
} from 'lucide-react';

const RolesTable = ({ 
  roles = [], 
  loading = false, 
  error = null, 
  onView, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
    );
  };

  const getPermissionsBadge = (permissions) => {
    const count = permissions ? permissions.length : 0;
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
        {count} permisos
      </span>
    );
  };

  const getUsersCountBadge = (usersCount) => {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        <Users className="w-3 h-3 mr-1" />
        {usersCount || 0}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Roles</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando roles...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Roles</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-2">Error al cargar roles</p>
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Roles</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No se encontraron roles</p>
            <p className="text-sm text-slate-500 mt-1">Intente ajustar los filtros de búsqueda</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">
          Roles ({roles.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Rol</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Descripción</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Permisos</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Usuarios</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role) => {
              const ToggleIcon = role.is_active ? ToggleRight : ToggleLeft;
              
              return (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{role.name}</p>
                        <p className="text-sm text-slate-600">@{role.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {role.description || 'Sin descripción'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {getPermissionsBadge(role.permissions)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getUsersCountBadge(role.users_count)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(role.is_active)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(role.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(role)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onEdit(role)}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar rol"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onToggleStatus(role)}
                        className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title={role.is_active ? "Desactivar rol" : "Activar rol"}
                      >
                        <ToggleIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onDelete(role)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RolesTable;