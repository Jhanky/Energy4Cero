import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Shield,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  BarChart2,
  PieChart,
  TrendingUp
} from 'lucide-react';
import roleService from '../../services/roleService';
import PermissionGroups from './PermissionGroups';
import Notification from '../ui/Notification';

const RolesDashboard = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Estados para formulario
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create, edit, view
  const [currentRole, setCurrentRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para confirmación de eliminación
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  // Estados para notificaciones
  const [notification, setNotification] = useState(null);

  // Cargar roles y estadísticas al montar el componente
  useEffect(() => {
    loadRoles();
    loadStatistics();
  }, []);

  // Mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cargar lista de roles
  const loadRoles = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        search: searchTerm,
        is_active: statusFilter,
        ...params
      };
      
      const response = await roleService.getRoles(searchParams);
      
      if (response.success) {
        setRoles(response.data.roles || []);
      } else {
        setError(response.message || 'Error al cargar roles');
        showNotification('error', response.message || 'Error al cargar roles');
      }
    } catch (error) {
      setError('Error de conexión al cargar roles');
      showNotification('error', 'Error de conexión al cargar roles');
      
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas de roles
  const loadStatistics = async () => {
    try {
      const response = await roleService.getRoleStatistics();
      
      if (response.success) {
        setStats(response.data.statistics || {});
      }
    } catch (error) {
      
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    loadRoles();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    loadRoles({ search: '', is_active: '' });
  };

  // Abrir formulario para crear nuevo rol
  const handleCreateRole = () => {
    setFormMode('create');
    setCurrentRole(null);
    setShowForm(true);
  };

  // Abrir formulario para editar rol
  const handleEditRole = (role) => {
    setFormMode('edit');
    setCurrentRole(role);
    setShowForm(true);
  };

  // Abrir formulario para ver detalles del rol
  const handleViewRole = (role) => {
    setFormMode('view');
    setCurrentRole(role);
    setShowForm(true);
  };

  // Cerrar formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setCurrentRole(null);
    setIsSubmitting(false);
  };

  // Guardar rol (crear o actualizar)
  const handleSaveRole = async (roleData) => {
    try {
      setIsSubmitting(true);
      
      let response;
      if (formMode === 'create') {
        response = await roleService.createRole(roleData);
      } else {
        response = await roleService.updateRole(currentRole.id, roleData);
      }
      
      if (response.success) {
        const message = formMode === 'create' 
          ? 'Rol creado exitosamente' 
          : 'Rol actualizado exitosamente';
          
        showNotification('success', message);
        handleCloseForm();
        loadRoles();
        loadStatistics();
      } else {
        const errorMessage = response.message || 'Error al guardar rol';
        showNotification('error', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar la solicitud';
      showNotification('error', errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abrir confirmación para eliminar rol
  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setShowDeleteConfirm(true);
  };

  // Confirmar eliminación de rol
  const confirmDeleteRole = async () => {
    try {
      setIsSubmitting(true);
      const response = await roleService.deleteRole(roleToDelete.id);
      
      if (response.success) {
        showNotification('success', 'Rol eliminado exitosamente');
        setShowDeleteConfirm(false);
        setRoleToDelete(null);
        loadRoles();
        loadStatistics();
      } else {
        const errorMessage = response.message || 'Error al eliminar rol';
        showNotification('error', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar rol';
      showNotification('error', errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar eliminación de rol
  const cancelDeleteRole = () => {
    setShowDeleteConfirm(false);
    setRoleToDelete(null);
    setIsSubmitting(false);
  };

  // Cambiar estado activo/inactivo de un rol
  const toggleRoleStatus = async (role) => {
    try {
      setLoading(true);
      const response = await roleService.toggleRoleStatus(role.id);
      
      if (response.success) {
        showNotification('success', response.message);
        loadRoles();
        loadStatistics();
      } else {
        showNotification('error', response.message || 'Error al cambiar estado del rol');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar estado del rol';
      showNotification('error', errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Formatear precio
  const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Obtener clase de color para estado
  const getStatusClass = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Obtener icono para estado
  const getStatusIcon = (isActive) => {
    return isActive ? ToggleRight : ToggleLeft;
  };

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Roles</h1>
          <p className="text-slate-600 mt-1">
            Administra los roles y permisos del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadRoles}
            disabled={loading}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
          <button
            onClick={handleCreateRole}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Roles</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  stats.total || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  stats.active || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  stats.inactive || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Usuarios Asignados</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? (
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  Object.values(stats.users_by_role || {}).reduce((sum, count) => sum + count, 0) || 0
                )}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Roles ({loading ? '...' : roles.length})
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-slate-600">Cargando roles...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={loadRoles}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
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
                  const StatusIcon = getStatusIcon(role.is_active);
                  
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
                        <p className="text-sm text-slate-600">
                          {role.description || 'Sin descripción'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {(role.permissions?.length) || 0} permisos
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-900">
                            {role.users_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleRoleStatus(role)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${getStatusClass(role.is_active)}`}
                          title={role.is_active ? 'Desactivar rol' : 'Activar rol'}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {role.is_active ? 'Activo' : 'Inactivo'}
                        </button>
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
                            onClick={() => handleViewRole(role)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar rol"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteRole(role)}
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
        )}

        {roles.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No se encontraron roles</p>
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="mt-2 text-green-600 hover:text-green-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Formulario de roles */}
      {showForm && (
        <RoleFormModal
          show={showForm}
          mode={formMode}
          role={currentRole}
          onClose={handleCloseForm}
          onSubmit={handleSaveRole}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <RoleDeleteConfirmation
          show={showDeleteConfirm}
          role={roleToDelete}
          onConfirm={confirmDeleteRole}
          onCancel={cancelDeleteRole}
          isDeleting={isSubmitting}
        />
      )}
    </div>
  );
};

export default RolesDashboard;