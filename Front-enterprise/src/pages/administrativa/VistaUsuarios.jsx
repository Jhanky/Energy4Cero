import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
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
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import UsuarioModal from './UsuarioModal';
import UsuarioDeleteModal from './UsuarioDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import dataService from '../../services/dataService';

const VistaUsuarios = () => {
  // Estados para datos del backend
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role_id: '',
    is_active: ''
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

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar datos al montar el componente y cuando cambien los filtros o búsqueda
  useEffect(() => {
    loadUsers();
  }, [debouncedSearchTerm, filters]);

  // Función para cargar usuarios con paginación
  const loadUsers = async (page = 1, perPage = pagination.per_page) => {
    try {
      setLoading(true);
      // Filtrar solo parámetros con valores válidos (no vacíos ni undefined)
      const validFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) =>
          value !== '' && value !== undefined && value !== null
        )
      );

      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...validFilters
      };

      console.log('🔍 Parámetros enviados al backend:', params);
      console.log('🎯 Filtros aplicados (originales):', filters);
      console.log('🎯 Filtros válidos (filtrados):', validFilters);

      const response = await dataService.getUsers(params);

      console.log('📥 Respuesta del backend:', response);

      if (response.success) {
        const usersData = response.data.users || [];
        console.log('👥 Usuarios recibidos:', usersData.length, 'usuarios');

        setUsuarios(usersData);
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 15,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0
        });
      } else {
        console.error('❌ Error en respuesta:', response.message);
        showNotification('error', 'Error al cargar usuarios: ' + response.message);
      }
    } catch (error) {
      console.error('💥 Error de conexión:', error);
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar roles al montar
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await dataService.getRoles();
        if (response.success) {
          setRoles(response.data.roles || []);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      }
    };
    loadRoles();
  }, []);

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
        loadUsers(); // Recargar datos
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
        loadUsers(); // Recargar datos
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


      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <AdvancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nombre, email o cargo..."
              loading={loading && searchTerm.length > 0}
              className="flex-1 min-w-[200px]"
            />
            <AdvancedFilters
              filters={filters}
              onFilterChange={setFilters}
              filterOptions={[
                ...(roles.length > 0 ? [{
                  key: 'role_id',
                  label: 'Rol',
                  options: roles.map(role => ({ value: role.role_id, label: role.name }))
                }] : []),
                {
                  key: 'is_active',
                  label: 'Estado',
                  options: [
                    { value: 'true', label: 'Activos' },
                    { value: 'false', label: 'Inactivos' }
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={6} rows={pagination.per_page || 15} asRows={true} />
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(usuario.role?.slug || '')}`}>
                          {usuario.role?.name || 'Sin rol'}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {usuario.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(usuario.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
            onPageChange={(page) => loadUsers(page)}
            onPerPageChange={(perPage) => loadUsers(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

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
