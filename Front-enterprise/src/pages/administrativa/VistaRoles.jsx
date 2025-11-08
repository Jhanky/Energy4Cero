import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users,
  Key,
  CheckSquare,
  Settings,
  AlertCircle,
  Loader2
} from 'lucide-react';
import dataService from '../../services/dataService';
import apiService from '../../services/api';
import RolModal from './RolModal';
import RolDeleteModal from './RolDeleteModal';
import { Notification } from '../../shared/ui';

const VistaRoles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedRole, setSelectedRole] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [],
    is_active: true
  });

  // Estados para notificaciones y carga
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permisos disponibles (desde el backend)
  const [availablePermissions, setAvailablePermissions] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.is_active = statusFilter === 'active' ? 'true' : 'false';

      const [rolesResponse, permissionsResponse] = await Promise.all([
        dataService.getRoles(params),
        apiService.getAvailablePermissions()
      ]);

      if (rolesResponse && rolesResponse.success) {
        let rolesData = [];
        
        if (rolesResponse.data && rolesResponse.data.roles) {
          rolesData = rolesResponse.data.roles;
        } else if (rolesResponse.data && Array.isArray(rolesResponse.data)) {
          rolesData = rolesResponse.data;
        } else if (Array.isArray(rolesResponse)) {
          rolesData = rolesResponse;
        }
        
        const formattedRoles = rolesData.map(role => ({
          ...role,
          id: role.role_id,  // Asegurar que exista un campo 'id' para compatibilidad
          status: role.is_active ? 'active' : 'inactive',
          users_count: role.users_count || 0
        }));
        
        setRoles(formattedRoles);
      } else {
        setError(rolesResponse?.message || 'Error al cargar roles');
      }

      if (permissionsResponse && permissionsResponse.success) {
        setAvailablePermissions(permissionsResponse.data?.permissions || {});
      } else {
        
      }

    } catch (err) {
      setError(err.message || 'Error al cargar datos');
      showNotification('error', err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter]);

  // Filtrar roles
  const rolesFiltrados = roles.filter(rol => {
    const cumpleBusqueda = 
      rol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rol.description && rol.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      rol.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleEstado = !statusFilter || rol.status === statusFilter;

    return cumpleBusqueda && cumpleEstado;
  });

  const getRoleColor = (slug) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'comercial': 'bg-blue-100 text-blue-800',
      'supervisor': 'bg-purple-100 text-purple-800',
      'administrador': 'bg-red-100 text-red-800',
      'gerente': 'bg-blue-100 text-blue-800',
      'contador': 'bg-yellow-100 text-yellow-800',
      'ingeniero': 'bg-green-100 text-green-800',
      'tecnico': 'bg-indigo-100 text-indigo-800'
    };
    return colors[slug] || 'bg-gray-100 text-gray-800';
  };

  const getPermissionLabel = (permission) => {
    // Mapeo de permisos
    const labels = {
      'users.create': 'Crear usuarios',
      'users.read': 'Ver usuarios',
      'users.update': 'Editar usuarios',
      'users.delete': 'Eliminar usuarios',
      'roles.create': 'Crear roles',
      'roles.read': 'Ver roles',
      'roles.update': 'Editar roles',
      'roles.delete': 'Eliminar roles',
      'projects.create': 'Crear proyectos',
      'projects.read': 'Ver proyectos',
      'projects.update': 'Editar proyectos',
      'projects.delete': 'Eliminar proyectos',
      'financial.read': 'Ver finanzas',
      'financial.update': 'Editar finanzas',
      'financial.reports': 'Reportes financieros',
      'commercial.read': 'Ver comercial',
      'commercial.update': 'Editar comercial',
      'commercial.reports': 'Reportes comerciales',
      'settings.read': 'Ver configuración',
      'settings.update': 'Editar configuración',
      'reports.create': 'Crear reportes',
      'reports.read': 'Ver reportes',
      'reports.update': 'Editar reportes',
      'reports.delete': 'Eliminar reportes',
      'support.read': 'Ver soporte',
      'support.update': 'Editar soporte',
      'support.delete': 'Eliminar soporte'
    };
    return labels[permission] || permission;
  };

  // Funciones para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funciones para modales
  const handleCreate = () => {
    setModalMode('create');
    setSelectedRole(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      permissions: [],
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (rol) => {
    setModalMode('edit');
    setSelectedRole(rol);
    setFormData({
      name: rol.name,
      slug: rol.slug,
      description: rol.description,
      permissions: rol.permissions || [],
      is_active: rol.is_active !== undefined ? rol.is_active : rol.status === 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (rol) => {
    setRoleToDelete(rol);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  // Funciones CRUD (conectadas al backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones previas
      if (!formData.name?.trim()) {
        throw new Error('El nombre del rol es obligatorio');
      }
      
      if (!formData.slug?.trim()) {
        throw new Error('El slug es obligatorio');
      }
      
      // Asegurar que el slug cumpla con las reglas del backend (solo minúsculas, números y guiones)
      const slugPattern = /^[a-z0-9\-]+$/;
      if (!slugPattern.test(formData.slug)) {
        throw new Error('El slug solo puede contener letras minúsculas, números y guiones');
      }

      let response;
      if (modalMode === 'create') {
        response = await apiService.createRole({
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase(),
          description: formData.description?.trim() || null,
          permissions: formData.permissions || [],
          is_active: formData.is_active
        });
      } else {
        response = await apiService.updateRole(selectedRole.role_id, {
          name: formData.name.trim(),
          slug: formData.slug.trim().toLowerCase(),
          description: formData.description?.trim() || null,
          permissions: formData.permissions || [],
          is_active: formData.is_active
        });
      }

      if (response && response.success) {
        showNotification('success', modalMode === 'create' ? 'Rol creado exitosamente' : 'Rol actualizado exitosamente');
        closeModal();
        loadData(); // Recargar la lista de roles
      } else if (response && response.errors) {
        // Mostrar errores de validación específicos
        const errorMessages = Object.values(response.errors).flat();
        throw new Error(errorMessages.join(', ') || response?.message || 'Error en la validación de datos');
      } else {
        throw new Error(response?.message || response?.error || 'Error al procesar el rol');
      }
    } catch (error) {
      showNotification('error', error.message || 'Error al procesar el rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      const response = await apiService.deleteRole(roleToDelete.role_id);
      
      if (response && response.success) {
        showNotification('success', 'Rol eliminado exitosamente');
        closeDeleteModal();
        loadData(); // Recargar la lista de roles
      } else {
        throw new Error(response?.message || response?.error || 'Error al eliminar el rol');
      }
    } catch (error) {
      showNotification('error', error.message || 'Error al eliminar el rol');
    }
  };

  // Calcular estadísticas de roles
  const stats = {
    total: roles.length,
    active: roles.filter(role => role.is_active).length,
    inactive: roles.filter(role => !role.is_active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roles y Permisos</h1>
          <p className="text-slate-600 mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Rol
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error de carga</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Roles</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total}
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
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Usuarios Asignados</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : roles.reduce((acc, r) => acc + (r.users_count || 0), 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Permisos Totales</p>
              <p className="text-2xl font-bold text-orange-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : [...new Set(roles.flatMap(r => r.permissions || []))].length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Roles ({loading ? '...' : rolesFiltrados.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-slate-600">Cargando roles...</span>
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
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rolesFiltrados.map((rol) => (
                  <tr key={rol.role_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center ${getRoleColor(rol.slug)}`}>
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{rol.name}</p>
                          <p className="text-sm text-slate-600">@{rol.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{rol.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(rol.permissions || []).slice(0, 3).map((permission, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {getPermissionLabel(permission)}
                          </span>
                        ))}
                        {rol.permissions && rol.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-600">
                            +{rol.permissions.length - 3} más
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium">{rol.users_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rol.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {rol.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(rol)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar rol"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(rol)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar rol"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && rolesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No se encontraron roles</p>
          </div>
        )}
      </div>

      {/* Modal de Rol */}
      <RolModal
        show={showModal}
        mode={modalMode}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        availablePermissions={availablePermissions}
      />

      {/* Modal de Confirmación de Eliminación */}
      <RolDeleteModal
        show={showDeleteModal}
        rol={roleToDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />

      {/* Notificación Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaRoles;