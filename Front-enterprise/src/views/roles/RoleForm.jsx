import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Shield, 
  AlertTriangle, 
  Check, 
  Minus,
  Users,
  FileText,
  Calendar
} from 'lucide-react';

const RoleForm = ({ 
  show = false,
  mode = 'create', // create, edit, view
  role = null,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [],
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [availablePermissions] = useState([
    'users.create', 'users.read', 'users.update', 'users.delete',
    'roles.create', 'roles.read', 'roles.update', 'roles.delete',
    'projects.create', 'projects.read', 'projects.update', 'projects.delete',
    'financial.read', 'financial.update', 'financial.reports',
    'commercial.read', 'commercial.update', 'commercial.reports',
    'settings.read', 'settings.update',
    'reports.create', 'reports.read', 'reports.update', 'reports.delete',
    'support.read', 'support.update', 'support.delete'
  ]);

  // Actualizar datos del formulario cuando cambia el rol
  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && role) {
      setFormData({
        name: role.name || '',
        slug: role.slug || '',
        description: role.description || '',
        permissions: role.permissions || [],
        is_active: role.is_active !== undefined ? role.is_active : true
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        slug: '',
        description: '',
        permissions: [],
        is_active: true
      });
    }
  }, [mode, role, show]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Manejar cambios en permisos
  const handlePermissionToggle = (permission) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(permission);
      
      if (index >= 0) {
        permissions.splice(index, 1);
      } else {
        permissions.push(permission);
      }
      
      return { ...prev, permissions };
    });
    
    // Limpiar error si existe
    if (errors.permissions) {
      setErrors(prev => ({
        ...prev,
        permissions: null
      }));
    }
  };

  // Seleccionar todos los permisos
  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: [...availablePermissions]
    }));
  };

  // Deseleccionar todos los permisos
  const deselectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  // Agrupar permisos por categoría
  const groupPermissionsByCategory = () => {
    const grouped = {};
    
    availablePermissions.forEach(permission => {
      const parts = permission.split('.');
      const category = parts[0];
      const action = parts[1];
      
      if (!grouped[category]) {
        grouped[category] = {
          name: getCategoryName(category),
          icon: getCategoryIcon(category),
          permissions: []
        };
      }
      
      grouped[category].permissions.push({
        id: permission,
        action: action,
        label: getActionLabel(action)
      });
    });
    
    return grouped;
  };

  // Obtener nombre legible para categoría
  const getCategoryName = (category) => {
    switch (category) {
      case 'users': return 'Usuarios';
      case 'roles': return 'Roles';
      case 'projects': return 'Proyectos';
      case 'financial': return 'Finanzas';
      case 'commercial': return 'Comercial';
      case 'settings': return 'Configuración';
      case 'reports': return 'Reportes';
      case 'support': return 'Soporte';
      default: return category;
    }
  };

  // Obtener icono para categoría
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'users': return '👥';
      case 'roles': return '👑';
      case 'projects': return '🏗️';
      case 'financial': return '💰';
      case 'commercial': return '📈';
      case 'settings': return '⚙️';
      case 'reports': return '📊';
      case 'support': return '🔧';
      default: return '🔒';
    }
  };

  // Obtener etiqueta legible para acción
  const getActionLabel = (action) => {
    switch (action) {
      case 'create': return 'Crear';
      case 'read': return 'Leer';
      case 'update': return 'Editar';
      case 'delete': return 'Eliminar';
      case 'write': return 'Escribir';
      case 'reports': return 'Reportes';
      default: return action;
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'El slug es obligatorio';
    } else if (!/^[a-z0-9\-]+$/.test(formData.slug)) {
      newErrors.slug = 'El slug solo puede contener letras minúsculas, números y guiones';
    }
    
    if (formData.permissions.length === 0) {
      newErrors.permissions = 'Debes seleccionar al menos un permiso';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Generar slug automáticamente desde el nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Manejar cambio en el nombre para generar slug
  const handleNameChange = (e) => {
    const name = e.target.value;
    handleInputChange(e);
    
    // Solo generar slug si es modo creación y el slug está vacío
    if (mode === 'create' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(name)
      }));
    }
  };

  if (!show) return null;

  const groupedPermissions = groupPermissionsByCategory();
  const title = mode === 'create' ? 'Crear Nuevo Rol' : 
                mode === 'edit' ? 'Editar Rol' : 'Detalles del Rol';
  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Cabecera */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-600 mt-1">
                  {mode === 'create' ? 'Crea un nuevo rol con sus permisos' : 
                   mode === 'edit' ? 'Edita la información del rol' : 
                   'Visualiza los detalles del rol'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
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
                    errors.name ? 'border-red-300 bg-red-50' : ''
                  } ${isViewMode ? 'bg-slate-50' : ''}`}
                  placeholder="Ej: Administrador"
                  disabled={isViewMode}
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
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
                    errors.slug ? 'border-red-300 bg-red-50' : ''
                  } ${isViewMode ? 'bg-slate-50' : ''}`}
                  placeholder="ej-administrador"
                  disabled={isViewMode}
                  required
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.slug}
                  </p>
                )}
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
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-slate-700">
                  Permisos del Rol *
                </label>
                {!isViewMode && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Seleccionar Todos
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllPermissions}
                      disabled={isSubmitting}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                      Deseleccionar Todos
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, group]) => {
                  const allSelected = group.permissions.every(p => 
                    formData.permissions.includes(p.id)
                  );
                  const someSelected = group.permissions.some(p => 
                    formData.permissions.includes(p.id)
                  ) && !allSelected;

                  return (
                    <div key={category} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{group.icon}</span>
                            <span className="font-medium text-slate-900">{group.name}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                              {group.permissions.length} permisos
                            </span>
                          </div>
                          
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => {
                                if (allSelected) {
                                  // Deseleccionar todos los permisos de esta categoría
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: prev.permissions.filter(p => 
                                      !group.permissions.some(gp => gp.id === p)
                                    )
                                  }));
                                } else {
                                  // Seleccionar todos los permisos de esta categoría
                                  setFormData(prev => ({
                                    ...prev,
                                    permissions: [
                                      ...prev.permissions,
                                      ...group.permissions
                                        .filter(p => !prev.permissions.includes(p.id))
                                        .map(p => p.id)
                                    ]
                                  }));
                                }
                              }}
                              disabled={isSubmitting}
                              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                                allSelected 
                                  ? 'bg-green-100 text-green-800' 
                                  : someSelected
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.permissions.map(permission => {
                            const isSelected = formData.permissions.includes(permission.id);
                            
                            if (isViewMode) {
                              return (
                                <div 
                                  key={permission.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    isSelected
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                                    {isSelected ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <X className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {permission.label}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {permission.id}
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            
                            return (
                              <label 
                                key={permission.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  disabled={isSubmitting}
                                  className="sr-only"
                                />
                                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded border">
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    {permission.label}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {permission.id}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {errors.permissions && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {errors.permissions}
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
            {isViewMode ? (
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cerrar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {mode === 'create' ? '✅ Crear Rol' : '💾 Guardar Cambios'}
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

export default RoleForm;