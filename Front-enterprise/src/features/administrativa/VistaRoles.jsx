import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Key,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import RolModal from './RolModal';
import RolDeleteModal from './RolDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import dataService from '../../services/dataService';

const VistaRoles = () => {
  // Estados para datos del backend
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });

  // Estados de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

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

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Cargar datos cuando cambien los filtros o búsqueda
  useEffect(() => {
    if (debouncedSearchTerm !== '' || Object.keys(filters).length > 0) {
      loadRoles();
    }
  }, [debouncedSearchTerm, filters]);

  // Función para cargar datos iniciales
  const loadData = async () => {
    await Promise.all([loadRoles(), loadPermissions()]);
  };

  // Función para cargar roles con paginación
  const loadRoles = async (page = 1, perPage = pagination.per_page) => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...filters
      };

      const response = await dataService.getRoles(params);

      if (response.success) {
        setRoles(response.data.roles || []);
        setStats(response.data.stats || {});
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 15,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0
        });
      } else {
        showNotification('error', 'Error al cargar roles: ' + response.message);
      }
    } catch (error) {
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar permisos disponibles
  const loadPermissions = async () => {
    try {
      const response = await dataService.getAvailablePermissions();
      if (response.success) {
        setAvailablePermissions(response.data?.permissions || {});
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

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

  const handleEdit = (role) => {
    setModalMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
    setShowModal(true);
  };

  const handleView = (role) => {
    setModalMode('view');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let response;
      
      if (modalMode === 'create') {
        response = await dataService.createRole(formData);
      } else {
        response = await dataService.updateRole(selectedRole.id, formData);
      }

      if (response.success) {
        setShowModal(false);
        
        // Actualización optimista del estado en lugar de recargar todo
        if (modalMode === 'create') {
          // Agregamos el nuevo rol al estado
          const newRole = response.data || { ...formData, id: Date.now() };
          setRoles(prevRoles => [...prevRoles, newRole]);
        } else {
          // Actualizamos el rol existente en el estado
          setRoles(prevRoles => 
            prevRoles.map(r => 
              r.id === selectedRole.id 
                ? { ...r, ...formData }
                : r
            )
          );
        }
      } else {
        showNotification('error', response.message || 'Error al procesar la solicitud');
      }
      
    } catch (error) {
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funciones para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funciones para modales
  const closeModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  // Función para cambiar estado del rol
  const handleToggleStatus = async (role) => {
    try {
      const response = await dataService.toggleRoleStatus(role.role_id);
      if (response.success) {
        showNotification('success', `Rol ${role.is_active ? 'desactivado' : 'activado'} exitosamente`);
        loadRoles(); // Recargar datos
      } else {
        showNotification('error', response.message || 'Error al cambiar estado del rol');
      }
    } catch (error) {
      showNotification('error', 'Error al cambiar estado del rol: ' + error.message);
    }
  };

  // Función para eliminar rol
  const handleDelete = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      const response = await dataService.deleteRole(roleToDelete.role_id);
      if (response.success) {
        showNotification('success', 'Rol eliminado exitosamente');
        closeDeleteModal();
        loadRoles(); // Recargar datos
      } else {
        showNotification('error', response.message || 'Error al eliminar el rol');
      }
    } catch (error) {
      showNotification('error', 'Error al eliminar el rol: ' + error.message);
    }
  };

  const handlePermissionChange = (permission) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];

    setFormData({ ...formData, permissions: newPermissions });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const getPermissionLabel = (permission) => {
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
      'tasks.create': 'Crear tareas',
      'tasks.read': 'Ver tareas',
      'tasks.update': 'Editar tareas',
      'tasks.delete': 'Eliminar tareas',
      'inventory.create': 'Crear elementos de inventario',
      'inventory.read': 'Ver inventario',
      'inventory.update': 'Editar inventario',
      'inventory.delete': 'Eliminar elementos de inventario',
      'support.create': 'Crear tickets de soporte',
      'support.read': 'Ver soporte',
      'support.update': 'Editar soporte',
      'support.delete': 'Eliminar soporte',
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
      'reports.delete': 'Eliminar reportes'
    };
    return labels[permission] || permission;
  };

  // Los filtros se manejan en el backend, no necesitamos filtrado local

  const getRoleColor = (slug) => {
    const colors = {
      'administrador': 'red',
      'gerente': 'blue',
      'contador': 'purple',
      'ingeniero': 'green',
      'tecnico': 'orange'
    };
    
    return colors[slug] || 'gray';
  };

  // Convertir la estructura de permisos del backend a un formato plano para etiquetas
  const flatPermissions = {};
  if (availablePermissions && typeof availablePermissions === 'object') {
    Object.entries(availablePermissions).forEach(([module, permissions]) => {
      if (permissions && typeof permissions === 'object') {
        Object.entries(permissions).forEach(([action, permissionKey]) => {
          // Crear etiquetas descriptivas para los permisos
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
            'tasks.create': 'Crear tareas',
            'tasks.read': 'Ver tareas',
            'tasks.update': 'Editar tareas',
            'tasks.delete': 'Eliminar tareas',
            'inventory.create': 'Crear elementos de inventario',
            'inventory.read': 'Ver inventario',
            'inventory.update': 'Editar inventario',
            'inventory.delete': 'Eliminar elementos de inventario',
            'support.create': 'Crear tickets de soporte',
            'support.read': 'Ver soporte',
            'support.update': 'Editar soporte',
            'support.delete': 'Eliminar soporte',
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
            'reports.delete': 'Eliminar reportes'
          };
          flatPermissions[permissionKey] = labels[permissionKey] || permissionKey;
        });
      }
    });
  }

  const groupedPermissions = Object.entries(flatPermissions).reduce((groups, [key, label]) => {
    const category = key.split('.')[0];
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push({ key, label });
    return groups;
  }, {});

  // Debug del estado


  if (loading) {
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-slate-600">Cargando roles...</p>
      </div>
    );
  }

  if (error) {
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.inactive}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600" />
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

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <AdvancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar roles..."
              loading={loading && searchTerm.length > 0}
              className="flex-1 min-w-[200px]"
            />
            <AdvancedFilters
              filters={filters}
              onFilterChange={setFilters}
              filterOptions={[
                {
                  key: 'status',
                  label: 'Estado',
                  options: [
                    { value: 'active', label: 'Activos' },
                    { value: 'inactive', label: 'Inactivos' }
                  ]
                }
              ]}
            />
          </div>

          {/* Tabla */}
          <div className="rounded-md border transition-opacity duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={6} rows={pagination.per_page || 15} asRows={true} />
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron roles
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((rol) => (
                    <TableRow key={rol.role_id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center ${getRoleColor(rol.slug)}`}>
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{rol.name}</p>
                            <p className="text-sm text-slate-600">@{rol.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-slate-600">{rol.description}</p>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">{rol.users_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rol.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {rol.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <AdvancedPagination
            pagination={pagination}
            onPageChange={(page) => loadRoles(page)}
            onPerPageChange={(perPage) => loadRoles(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

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
