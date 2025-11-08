import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  Shield,
  Calendar,
  MoreVertical,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import dataService from '../../services/dataService';
import DataLoader from '../../shared/ui/DataLoader';

const VistaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    phone: '',
    position: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  const loadUsuarios = async () => {
    try {
      
      setLoading(true);
      setError('');
      
      const response = await dataService.getUsers();
      
      
      if (response.success) {
        // Verificar la estructura de la respuesta y adaptarla si es necesario
        let usuariosData = [];
        if (response.data && response.data.data) {
          // Estructura esperada: { success: true, data: { data: [...] } }
          usuariosData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Estructura alternativa: { success: true, data: [...] }
          usuariosData = response.data;
        } else if (Array.isArray(response.data)) {
          // Estructura simple: { success: true, data: [...] }
          usuariosData = response.data;
        }
        
        
        setUsuarios(usuariosData);
      } else {
        
        throw new Error(response.message || 'Error al cargar usuarios');
      }
    } catch (error) {
      
      setError('Error al cargar usuarios: ' + error.message);
    } finally {
      
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await dataService.getRoles();
      
      if (response.success) {
        // Asegurarse de que roles es siempre un array
        setRoles(Array.isArray(response.data) ? response.data : []);
      } else {
        setRoles([]);
      }
    } catch (error) {
      setRoles([]);
    }
  };

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
      is_active: true
    });
    setFormErrors({});
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
      role_id: usuario.role_id,
      phone: usuario.phone || '',
      position: usuario.position || '',
      is_active: usuario.is_active
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleView = (usuario) => {
    setModalMode('view');
    setSelectedUser(usuario);
    setFormData({
      name: usuario.name,
      email: usuario.email,
      password: '',
      password_confirmation: '',
      role_id: usuario.role_id,
      phone: usuario.phone || '',
      position: usuario.position || '',
      is_active: usuario.is_active
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      let response;
      
      if (modalMode === 'create') {
        response = await dataService.createUser(formData);
      } else {
        response = await dataService.updateUser(selectedUser.id, formData);
      }

      if (response.success) {
        setShowModal(false);
        loadUsuarios();
      } else {
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setError(response.message || 'Error al procesar la solicitud');
        }
      }
      
    } catch (error) {
      
      setError('Error de conexión: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (usuario) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario ${usuario.name}?`)) {
      return;
    }

    try {
      const response = await dataService.deleteUser(usuario.id);

      if (response.success) {
        loadUsuarios();
      } else {
        throw new Error(response.message || 'Error al eliminar usuario');
      }
    } catch (error) {
      
      setError('Error al eliminar usuario: ' + error.message);
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const response = await dataService.toggleUserStatus(usuario.id);

      if (response.success) {
        loadUsuarios();
      } else {
        throw new Error(response.message || 'Error al cambiar estado');
      }
    } catch (error) {
      
      setError('Error al cambiar estado: ' + error.message);
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (usuario.position && usuario.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = !roleFilter || usuario.role_id == roleFilter;
    const matchesStatus = !statusFilter || usuario.is_active.toString() === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Sin rol';
  };

  const getRoleColor = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return 'gray';
    
    const colors = {
      'administrador': 'red',
      'gerente': 'blue',
      'contador': 'purple',
      'ingeniero': 'green',
      'tecnico': 'orange'
    };
    
    return colors[role.slug] || 'gray';
  };

  // Debug del estado


  if (loading) {
    
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-slate-600">Cargando usuarios...</p>
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
            onClick={loadUsuarios}
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
            {Array.isArray(roles) && roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Contacto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {usuario.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{usuario.name}</p>
                        <p className="text-sm text-slate-500">{usuario.position || 'Sin cargo'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${getRoleColor(usuario.role_id)}-100 text-${getRoleColor(usuario.role_id)}-800`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {getRoleName(usuario.role_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {usuario.email}
                      </div>
                      {usuario.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          {usuario.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(usuario)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        usuario.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {usuario.is_active ? (
                        <>
                          <UserCheck className="w-3 h-3" />
                          Activo
                        </>
                      ) : (
                        <>
                          <UserX className="w-3 h-3" />
                          Inactivo
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(usuario)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {modalMode === 'create' && 'Nuevo Usuario'}
                  {modalMode === 'edit' && 'Editar Usuario'}
                  {modalMode === 'view' && 'Detalles del Usuario'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="Nombre completo"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="usuario@empresa.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contraseña {modalMode === 'create' ? '*' : '(dejar vacío para mantener actual)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.password ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {formErrors.password && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="••••••••"
                    />
                    {formErrors.password_confirmation && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.password_confirmation[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Rol *
                    </label>
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.role_id ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Seleccionar rol</option>
                      {Array.isArray(roles) && roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                    {formErrors.role_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.role_id[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cargo
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      disabled={modalMode === 'view'}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Cargo en la empresa"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        disabled={modalMode === 'view'}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Usuario activo</span>
                    </label>
                  </div>
                </div>

                {modalMode !== 'view' && (
                  <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario')}
                    </button>
                  </div>
                )}

                {modalMode === 'view' && (
                  <div className="flex justify-end pt-6 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaUsuarios;
