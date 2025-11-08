import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import roleService from '../../services/roleService';
import PermissionSelector from './PermissionSelector';
import RolePermissionsBadge from './RolePermissionsBadge';

const RolesCRUD = () => {
  // Estados para la gestión de roles
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Estados para el formulario
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [currentRole, setCurrentRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [],
    is_active: true
  });
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Estados para confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  // Cargar roles al montar el componente
  useEffect(() => {
    loadRoles();
    loadStatistics();
  }, []);

  // Cargar lista de roles
  const loadRoles = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.is_active = statusFilter;
      
      const response = await roleService.getRoles(params);
      if (response.success) {
        setRoles(response.data.roles);
      } else {
        toast.error(response.message || 'Error al cargar roles');
      }
    } catch (error) {
      toast.error('Error de conexión al cargar roles');
      
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      const response = await roleService.getRoleStatistics();
      if (response.success) {
        setStats(response.data.statistics);
      }
    } catch (error) {
      
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar cambios en permisos
  const handlePermissionsChange = (permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions
    }));
  };

  // Abrir modal para crear nuevo rol
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      slug: '',
      description: '',
      permissions: [],
      is_active: true
    });
    setCurrentRole(null);
    setShowModal(true);
  };

  // Abrir modal para editar rol
  const openEditModal = (role) => {
    setModalMode('edit');
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
    setCurrentRole(role);
    setShowModal(true);
  };

  // Abrir modal para ver detalles
  const openViewModal = (role) => {
    setModalMode('view');
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
    setCurrentRole(role);
    setShowModal(true);
  };

  // Cerrar modales
  const closeModal = () => {
    setShowModal(false);
    setCurrentRole(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  // Guardar rol (crear o actualizar)
  const saveRole = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      let response;
      if (modalMode === 'create') {
        response = await roleService.createRole(formData);
      } else {
        response = await roleService.updateRole(currentRole.id, formData);
      }
      
      if (response.success) {
        toast.success(modalMode === 'create' ? 'Rol creado exitosamente' : 'Rol actualizado exitosamente');
        closeModal();
        loadRoles();
        loadStatistics();
      } else {
        toast.error(response.message || 'Error al guardar rol');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al procesar la solicitud';
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de confirmación para eliminar rol
  const openDeleteModal = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  // Eliminar rol
  const deleteRole = async () => {
    try {
      setLoading(true);
      const response = await roleService.deleteRole(roleToDelete.id);
      
      if (response.success) {
        toast.success('Rol eliminado exitosamente');
        closeDeleteModal();
        loadRoles();
        loadStatistics();
      } else {
        toast.error(response.message || 'Error al eliminar rol');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar rol';
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado activo/inactivo
  const toggleRoleStatus = async (role) => {
    try {
      setLoading(true);
      const response = await roleService.toggleRoleStatus(role.id);
      
      if (response.success) {
        toast.success(response.message);
        loadRoles();
        loadStatistics();
      } else {
        toast.error(response.message || 'Error al cambiar estado del rol');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar estado del rol';
      toast.error(errorMessage);
      
    } finally {
      setLoading(false);
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
  };

  // Generar slug automáticamente
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Manejar cambio en nombre para generar slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: modalMode === 'create' ? generateSlug(name) : prev.slug
    }));
  };

  // Renderizar modal de formulario
  const renderFormModal = () => {
    if (!showModal) return null;

    const title = modalMode === 'create' 
      ? 'Crear Nuevo Rol' 
      : modalMode === 'edit' 
        ? 'Editar Rol' 
        : 'Detalles del Rol';

    const isViewMode = modalMode === 'view';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <button 
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={saveRole} className="p-6">
            <div className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleNameChange}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      isViewMode ? 'bg-slate-50' : ''
                    }`}
                    placeholder="Ej: Administrador"
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Slug (Identificador) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      isViewMode ? 'bg-slate-50' : ''
                    }`}
                    placeholder="ej-administrador"
                    disabled={isViewMode}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Usado para identificar el rol en el sistema
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    isViewMode ? 'bg-slate-50' : ''
                  }`}
                  placeholder="Descripción del rol y sus responsabilidades..."
                  disabled={isViewMode}
                />
              </div>

              {!isViewMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      disabled={isViewMode}
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Rol activo
                    </span>
                  </div>
                </div>
              )}

              {isViewMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Estado
                  </label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    formData.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              )}

              {/* Permisos */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Permisos del Rol
                </label>
                
                {isViewMode ? (
                  <div className="border border-slate-200 rounded-lg p-4">
                    <RolePermissionsBadge permissions={formData.permissions} maxVisible={10} />
                  </div>
                ) : (
                  <PermissionSelector 
                    permissions={formData.permissions}
                    onChange={handlePermissionsChange}
                    disabled={isViewMode}
                  />
                )}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
              {isViewMode ? (
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cerrar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        {modalMode === 'create' ? '✅ Crear Rol' : '💾 Guardar Cambios'}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Renderizar modal de confirmación de eliminación
  const renderDeleteModal = () => {
    if (!showDeleteModal || !roleToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  Confirmar Eliminación
                </h3>
                <p className="text-sm text-slate-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
              <button
                onClick={closeDeleteModal}
                className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            <p className="text-slate-700 mb-4">
              ¿Estás seguro de que deseas eliminar el rol{' '}
              <span className="font-semibold text-slate-900">
                {roleToDelete.name}
              </span>?
            </p>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{roleToDelete.name}</p>
                    <p className="text-sm text-slate-600">@{roleToDelete.slug}</p>
                  </div>
                </div>

                <div className="text-sm space-y-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span>{roleToDelete.users_count || 0} usuarios asignados</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span>
                      {(roleToDelete.permissions?.length) || 0} permisos
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roleToDelete.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {roleToDelete.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>⚠️ Advertencia:</strong> Al eliminar este rol, los usuarios asignados 
                perderán sus permisos y no podrán acceder a las funciones correspondientes.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
            <button
              onClick={closeDeleteModal}
              className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={deleteRole}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Eliminar Rol
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Roles</h1>
          <p className="text-slate-600 mt-1">
            Administra los roles y permisos del sistema
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
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
                {loading ? (
                  <svg className="w-6 h-6 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : stats.total_roles || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? (
                  <svg className="w-6 h-6 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : stats.active_roles || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">
                {loading ? (
                  <svg className="w-6 h-6 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : stats.inactive_roles || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? (
                  <svg className="w-6 h-6 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (stats.users_by_role?.Administrador) || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
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
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Roles ({loading ? '...' : roles.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
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
                {roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{role.name}</p>
                          <p className="text-sm text-slate-600">@{role.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{role.description || 'Sin descripción'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <RolePermissionsBadge permissions={role.permissions || []} maxVisible={3} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span className="text-sm font-medium text-slate-900">
                          {role.users_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        role.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(role)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar rol"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => toggleRoleStatus(role)}
                          className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title={role.is_active ? 'Desactivar rol' : 'Activar rol'}
                        >
                          {role.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          )}
                        </button>
                        
                        <button
                          onClick={() => openDeleteModal(role)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar rol"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {roles.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <p className="text-slate-500">No se encontraron roles</p>
          </div>
        )}
      </div>

      {/* Modales */}
      {renderFormModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default RolesCRUD;