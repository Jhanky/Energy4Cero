import { X, Loader2, Shield, Key, CheckSquare } from 'lucide-react';

const RolModal = ({ 
  show, 
  mode, // 'create', 'edit', 'view'
  formData, 
  onFormChange, 
  onSubmit, 
  onClose, 
  isSubmitting,
  availablePermissions = {}
}) => {
  if (!show) return null;

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

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };
    
    // Si se cambia el nombre y el slug está vacío o es el generado automáticamente, actualizar el slug
    if (field === 'name' && !formData.slug) {
      updatedData.slug = generateSlug(value);
    }
    
    onFormChange(updatedData);
  };

  const handlePermissionToggle = (permission) => {
    const currentPermissions = formData.permissions || [];
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];
    
    onFormChange({ ...formData, permissions: newPermissions });
  };

  const titles = {
    create: '➕ Nuevo Rol',
    edit: '✏️ Editar Rol',
    view: '👁️ Detalles del Rol'
  };

  // Agrupar permisos por categoría desde la estructura del backend
  const groupedPermissions = {};
  if (availablePermissions && typeof availablePermissions === 'object') {
    // Formato del backend: { usuarios: [...], roles: [...], etc. }
    for (const [module, permissions] of Object.entries(availablePermissions)) {
      const capitalizedModule = module.charAt(0).toUpperCase() + module.slice(1);
      groupedPermissions[capitalizedModule] = permissions;
    }
  } else {
    // Formato anterior como fallback
    groupedPermissions['Usuarios'] = [];
    groupedPermissions['Roles'] = [];
    groupedPermissions['Proyectos'] = [];
    groupedPermissions['Financiero'] = [];
    groupedPermissions['Comercial'] = [];
    groupedPermissions['Configuración'] = [];
    groupedPermissions['Reportes'] = [];
    groupedPermissions['Soporte'] = [];
  }

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{titles[mode]}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Contenido del Modal */}
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Administrador"
                  disabled={mode === 'view'}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  Slug (Identificador único) *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="admin"
                  disabled={mode === 'view'}
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Solo letras minúsculas, números y guiones</p>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Descripción del rol y sus responsabilidades..."
                disabled={mode === 'view'}
                rows={3}
              />
            </div>

            {/* Estado */}
            <div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  disabled={mode === 'view'}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-700">Rol activo</span>
              </label>
            </div>

            {/* Permisos */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-4">
                <Key className="w-4 h-4 inline mr-2" />
                Permisos del Rol
              </label>
              
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, permissions]) => (
                  permissions.length > 0 && (
                    <div key={category} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-900 mb-3">{category}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permissions.map((permission) => (
                          <label key={permission} className="flex items-center gap-2 cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={(formData.permissions || []).includes(permission)}
                                onChange={() => handlePermissionToggle(permission)}
                                disabled={mode === 'view'}
                                className="sr-only"
                              />
                              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                                (formData.permissions || []).includes(permission)
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-300'
                              }`}>
                                {(formData.permissions || []).includes(permission) && (
                                  <CheckSquare className="w-3 h-3 text-white" />
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-slate-700">
                              {getPermissionLabel(permission)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          
          {/* Botones del Modal */}
          {mode !== 'view' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    {mode === 'create' ? 'Crear Rol' : 'Actualizar Rol'}
                  </>
                )}
              </button>
            </div>
          )}
          
          {mode === 'view' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RolModal;