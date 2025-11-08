import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, RefreshCw, Download, Upload } from 'lucide-react';
import roleService from '../../services/roleService';
import RoleStats from './RoleStats';
import RoleFilters from './RoleFilters';
import RolesTable from './RolesTable';
import RoleForm from './RoleForm';
import RoleDeleteModal from './RoleDeleteModal';
import Notification from '../ui/Notification';

const RolesManagement = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Estados para el formulario
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create, edit, view
  const [currentRole, setCurrentRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  // Abrir modal de confirmación para eliminar rol
  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de rol
  const handleConfirmDelete = async () => {
    try {
      const response = await roleService.deleteRole(roleToDelete.id);
      
      if (response.success) {
        showNotification('success', 'Rol eliminado exitosamente');
        setShowDeleteModal(false);
        setRoleToDelete(null);
        loadRoles();
        loadStatistics();
      } else {
        const errorMessage = response.message || 'Error al eliminar rol';
        showNotification('error', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar rol';
      showNotification('error', errorMessage);
      
    }
  };

  // Cancelar eliminación de rol
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRoleToDelete(null);
  };

  // Cambiar estado activo/inactivo de un rol
  const handleToggleRoleStatus = async (role) => {
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

  // Refrescar datos
  const handleRefresh = () => {
    loadRoles();
    loadStatistics();
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
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
          <button
            onClick={handleCreateRole}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <RoleStats stats={stats} />

      {/* Filtros */}
      <RoleFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onApplyFilters={applyFilters}
        onClearFilters={clearFilters}
      />

      {/* Tabla de roles */}
      <RolesTable
        roles={roles}
        loading={loading}
        error={error}
        onView={handleViewRole}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        onToggleStatus={handleToggleRoleStatus}
      />

      {/* Formulario de roles */}
      {showForm && (
        <RoleForm
          mode={formMode}
          role={currentRole}
          onSubmit={handleSaveRole}
          onCancel={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      <RoleDeleteModal
        show={showDeleteModal}
        role={roleToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Notificaciones */}
      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default RolesManagement;