import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

const RolModal = ({
  show,
  mode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
  availablePermissions
}) => {
  const [formErrors, setFormErrors] = useState({});

  // Limpiar errores cuando cambia el modo
  useEffect(() => {
    setFormErrors({});
  }, [mode]);

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
    onFormChange({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  const handlePermissionChange = (permission) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];

    onFormChange({ ...formData, permissions: newPermissions });
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

  // Convertir la estructura de permisos del backend a un formato plano para etiquetas
  const flatPermissions = {};
  if (availablePermissions && typeof availablePermissions === 'object') {
    Object.entries(availablePermissions).forEach(([module, permissions]) => {
      if (permissions && typeof permissions === 'object') {
        Object.entries(permissions).forEach(([action, permissionKey]) => {
          flatPermissions[permissionKey] = getPermissionLabel(permissionKey);
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'create' && 'Nuevo Rol'}
              {mode === 'edit' && 'Editar Rol'}
              {mode === 'view' && 'Detalles del Rol'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre del Rol *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={mode === 'view'}
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
                  onChange={(e) => onFormChange({...formData, slug: e.target.value})}
                  disabled={mode === 'view'}
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
                  onChange={(e) => onFormChange({...formData, description: e.target.value})}
                  disabled={mode === 'view'}
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
                    onChange={(e) => onFormChange({...formData, is_active: e.target.checked})}
                    disabled={mode === 'view'}
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
                          disabled={mode === 'view'}
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

            {mode !== 'view' && (
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Rol' : 'Actualizar Rol')}
                </button>
              </div>
            )}

            {mode === 'view' && (
              <div className="flex justify-end pt-6 border-t border-slate-200">
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
    </div>
  );
};

export default RolModal;
