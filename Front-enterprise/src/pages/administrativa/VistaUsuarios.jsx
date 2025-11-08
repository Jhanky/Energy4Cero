import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Shield,
  Calendar,
  Loader2
} from 'lucide-react';
import UsuarioModal from './UsuarioModal';
import UsuarioDeleteModal from './UsuarioDeleteModal';
import { Notification } from '../../shared/ui';
import dataService from '../../services/dataService';

const VistaUsuarios = () => {
  // Estados para datos del backend
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    by_role: {},
    by_department: {}
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    phone: '',
    position: '',
    status: 'active'
  });

  // Estados para notificaciones y carga
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos del backend
  const loadData = async () => {
    try {
      setLoading(true);

      
      // Cargar usuarios y roles en paralelo
      const [usersResponse, rolesResponse] = await Promise.all([
        dataService.getUsers(),
        dataService.getRoles()
      ]);



      if (usersResponse.success) {
        setUsuarios(usersResponse.data.users || []);
        setStats(usersResponse.data.stats || {});
      } else {
        showNotification('error', 'Error al cargar usuarios: ' + usersResponse.message);
      }

      if (rolesResponse.success) {
        setRoles(rolesResponse.data.roles || []);
      } else {
        showNotification('error', 'Error al cargar roles: ' + rolesResponse.message);
      }

    } catch (error) {
      
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Filtrar usuarios
  const usuariosFiltrados = usuarios.filter(usuario => {
    const cumpleBusqueda = 
      usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (usuario.position && usuario.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const cumpleRol = !roleFilter || usuario.role?.slug === roleFilter;
    const cumpleEstado = !statusFilter || 
      (statusFilter === 'active' && usuario.is_active) ||
      (statusFilter === 'inactive' && !usuario.is_active);

    return cumpleBusqueda && cumpleRol && cumpleEstado;
  });

  const getRoleColor = (roleSlug) => {
    const colors = {
      'administrador': 'bg-red-100 text-red-800',
      'gerente': 'bg-purple-100 text-purple-800',
      'comercial': 'bg-blue-100 text-blue-800',
      'contador': 'bg-yellow-100 text-yellow-800',
      'ingeniero': 'bg-indigo-100 text-indigo-800',
      'tecnico': 'bg-green-100 text-green-800'
    };
    return colors[roleSlug] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Funciones para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funciones para modales
  const handleCreate = () => {
    setModalMode('create');
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      phone: '',
      position: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (usuario) => {
    setModalMode('edit');
    setSelectedUser(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: '',
      password_confirmation: '',
      role_id: usuario.role.role_id,
      phone: usuario.phone || '',
      position: usuario.position || '',
      status: usuario.is_active ? 'active' : 'inactive' // Aseguramos que sea 'active' o 'inactive'
    });
    setShowModal(true);
  };


  const handleDelete = (usuario) => {
    setUserToDelete(usuario);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Funciones CRUD con backend real
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Preparar datos para enviar al backend, manejando campos de contraseña y status
      const requestData = {
        ...formData,
        is_active: formData.status === 'active' // Convertir 'active'/'inactive' a boolean
      };
      // Eliminar el campo status ya que el backend espera is_active
      delete requestData.status;
      
      // Manejar campos de contraseña
      if (!requestData.password) {
        // Si la contraseña está vacía, eliminar tanto password como password_confirmation
        delete requestData.password;
        delete requestData.password_confirmation;
      }
      
      // Si estamos actualizando y no se proporcionó una nueva contraseña, no enviar estos campos
      if (modalMode === 'edit' && !requestData.password) {
        delete requestData.password;
        delete requestData.password_confirmation;
      }

      let response;
      if (modalMode === 'create') {
        response = await dataService.createUser(requestData);
      } else {
        response = await dataService.updateUser(selectedUser.id, requestData);
      }

      if (response.success) {
        showNotification('success', 
          modalMode === 'create' 
            ? 'Usuario creado exitosamente' 
            : 'Usuario actualizado exitosamente'
        );
        closeModal();
        loadData(); // Recargar datos
      } else {
        showNotification('error', response.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      showNotification('error', 'Error al procesar la solicitud: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      
      
      const response = await dataService.deleteUser(userToDelete.id);
      
      

      if (response.success) {
        showNotification('success', 'Usuario eliminado exitosamente');
        closeDeleteModal();
        loadData(); // Recargar datos
      } else {
        showNotification('error', response.message || 'Error al eliminar el usuario');
      }
    } catch (error) {
      
      showNotification('error', 'Error al eliminar el usuario: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-slate-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats.by_role?.Administrador || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
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
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los roles</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.slug}>{role.name}</option>
            ))}
          </select>
          
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

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Usuarios ({loading ? '...' : usuariosFiltrados.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-slate-600">Cargando usuarios...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Rol</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Contacto</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {usuario.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{usuario.name}</p>
                        <p className="text-sm text-slate-600">{usuario.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(usuario.role?.slug || '')}`}>
                      {usuario.role?.name || 'Sin rol'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {usuario.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        {usuario.phone || 'Sin teléfono'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {usuario.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      {formatDate(usuario.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(usuario)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
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
        
        {!loading && usuariosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* Modal de Usuario */}
      <UsuarioModal
        show={showModal}
        mode={modalMode}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        roles={roles}
      />

      {/* Modal de Confirmación de Eliminación */}
      <UsuarioDeleteModal
        show={showDeleteModal}
        usuario={userToDelete}
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

export default VistaUsuarios;
