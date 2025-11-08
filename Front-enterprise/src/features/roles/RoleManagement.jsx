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
  RefreshCw
} from 'lucide-react';
import roleService from '../../services/roleService';
import useRoles from '../../hooks/useRoles';
import RoleStats from './RoleStats';
import RoleFilters from './RoleFilters';
import RolesTable from './RolesTable';
import RoleForm from './RoleForm';
import RoleDeleteConfirm from './RoleDeleteConfirm';
import Notification from '../ui/Notification';

const RoleManagement = () => {
  const {
    roles,
    loading,
    error,
    stats,
    filters,
    loadRoles,
    loadRole,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleStatus,
    loadStatistics,
    updateFilters,
    applyFilters,
    clearFilters
  } = useRoles();

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // create, edit, view
  const [currentRole, setCurrentRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  
  const [notification, setNotification] = useState(null);

  // Mostrar notificación
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
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
        response = await createRole(roleData);
      } else {
        response = await updateRole(currentRole.id, roleData);
      }
      
      if (response) {
        const message = formMode === 'create' 
          ? 'Rol creado exitosamente' 
          : 'Rol actualizado exitosamente';
          
        showNotification('success', message);
        handleCloseForm();
        loadRoles();
        loadStatistics();
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
      await deleteRole(roleToDelete.id);
      showNotification('success', 'Rol eliminado exitosamente');
      setShowDeleteConfirm(false);
      setRoleToDelete(null);
      loadRoles();
      loadStatistics();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar rol';
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
  const handleToggleRoleStatus = async (role) => {
    try {
      await toggleRoleStatus(role.id);
      showNotification('success', `Rol ${role.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadRoles();
      loadStatistics();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar estado del rol';
      showNotification('error', errorMessage);
      
    }
  };

  // Refrescar datos
  const handleRefresh = () => {
    loadRoles();
    loadStatistics();
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
            onClick={handleRefresh}
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
      <RoleStats stats={stats} />

      {/* Filtros */}
      <RoleFilters
        filters={filters}
        onFilterChange={updateFilters}
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
      <RoleForm
        show={showForm}
        mode={formMode}
        role={currentRole}
        onClose={handleCloseForm}
        onSubmit={handleSaveRole}
        isSubmitting={isSubmitting}
      />

      {/* Confirmación de eliminación */}
      <RoleDeleteConfirm
        show={showDeleteConfirm}
        role={roleToDelete}
        onConfirm={confirmDeleteRole}
        onCancel={cancelDeleteRole}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default RoleManagement;