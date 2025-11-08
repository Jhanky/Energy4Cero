import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  UserCheck, 
  UserX,
  Users,
  Settings,
  Key,
  CheckSquare,
  Square,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import dataService from '../../services/dataService';
import useOptimisticCRUD from '../../hooks/useOptimisticCRUD';

const VistaRoles = () => {
  const {
    data: roles,
    loading,
    error,
    deleteItem,
    toggleItemStatus,
    setData: setRoles
  } = useOptimisticCRUD([], dataService);
  
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [],
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {

      setLoading(true);
      setError('');
      
      // Cargar roles y permisos disponibles en paralelo
      await Promise.all([
        loadRoles(),
        loadAvailablePermissions()
      ]);
    } catch (error) {
      
      setError('Error al cargar los datos: ' + error.message);
    } finally {
      
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      
      const response = await dataService.getRoles();
      
      
      if (response.success) {
        // Verificar la estructura de la respuesta y adaptarla si es necesario
        let rolesData = [];
        if (response.data && response.data.data) {
          // Estructura esperada: { success: true, data: { data: [...] } }
          rolesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Estructura alternativa: { success: true, data: [...] }
          rolesData = response.data;
        } else if (Array.isArray(response.data)) {
          // Estructura simple: { success: true, data: [...] }
          rolesData = response.data;
        }
        
        
        setRoles(rolesData);
      } else {
        
        throw new Error(response.message || 'Error al cargar roles');
      }
    } catch (error) {
      
      setError('Error al cargar roles: ' + error.message);
      throw error;
    }
  };

  const loadAvailablePermissions = async () => {
    try {
      
      const response = await dataService.getAvailablePermissions();
      
      
      if (response.success) {
        
        setAvailablePermissions(response.data || {});
      } else {
        
        throw new Error(response.message || 'Error al cargar permisos');
      }
    } catch (error) {
      
      throw error;
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
    setFormErrors({});
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
    setFormErrors({});
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

  const handleDelete = async (role) => {
    if (!window.confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      return;
    }

    try {
      await deleteItem(role, (id) => dataService.deleteRole(id));
    } catch (error) {
      // El hook ya maneja el estado de error
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      await toggleItemStatus(role, (id) => dataService.toggleRoleStatus(id));
    } catch (error) {
      // El hook ya maneja el estado de error
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

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || role.is_active.toString() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const groupedPermissions = Object.entries(availablePermissions).reduce((groups, [key, label]) => {
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
            onClick={loadInitialData}
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
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Roles y Permisos</h1>
          <p className="text-slate-600 mt-1">Administra los roles del sistema y sus permisos</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Rol
        </button>
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

      {/* Tabla de Roles */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Permisos</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Usuarios</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRoles.map((role) => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br from-${getRoleColor(role.slug)}-500 to-${getRoleColor(role.slug)}-600 rounded-full flex items-center justify-center text-white font-semibold`}>
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{role.name}</p>
                        <p className="text-sm text-slate-500">{role.description || 'Sin descripción'}</p>
                        <p className="text-xs text-slate-400">{role.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions && role.permissions.slice(0, 3).map((permission) => (
                        <span key={permission} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {availablePermissions[permission] || permission}
                        </span>
                      ))}
                      {role.permissions && role.permissions.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          +{role.permissions.length - 3} más
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{role.users_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(role)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        role.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                    >
                      {role.is_active ? (
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
                        onClick={() => handleView(role)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role)}
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
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {modalMode === 'create' && 'Nuevo Rol'}
                  {modalMode === 'edit' && 'Editar Rol'}
                  {modalMode === 'view' && 'Detalles del Rol'}
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
                      Nombre del Rol *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="Ej: Administrador de Proyectos"
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name[0]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Slug *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      disabled={modalMode === 'view'}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        formErrors.slug ? 'border-red-300 bg-red-50' : 'border-slate-300'
                      }`}
                      placeholder="administrador-proyectos"
                    />
                    {formErrors.slug && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.slug[0]}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      disabled={modalMode === 'view'}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Descripción del rol y sus responsabilidades"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3 mb-4">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                        disabled={modalMode === 'view'}
                        className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm font-medium text-slate-700">Rol activo</span>
                    </label>
                  </div>
                </div>

                {/* Permisos */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">
                    Permisos del Rol
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-4">
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium text-slate-900 capitalize">{category}</h4>
                        {permissions.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(key)}
                              onChange={() => handlePermissionChange(key)}
                              disabled={modalMode === 'view'}
                              className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                            />
                            <span className="text-slate-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  {formErrors.permissions && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.permissions[0]}</p>
                  )}
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
                      {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear Rol' : 'Actualizar Rol')}
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

export default VistaRoles;
