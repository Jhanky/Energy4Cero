import { X, Loader2, User, Mail, Phone, Shield, Calendar } from 'lucide-react';

const UsuarioModal = ({
  show,
  mode, // 'create', 'edit', 'view'
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
  roles = []
}) => {
  if (!show) return null;

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const titles = {
    create: '➕ Nuevo Usuario',
    edit: '✏️ Editar Usuario',
    view: '👁️ Detalles del Usuario'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del Modal */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">{titles[mode]}</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Contenido del Modal */}
        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Ej: Carlos Mendoza"
                disabled={mode === 'view'}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="carlos.mendoza@enterprise.com"
                disabled={mode === 'view'}
                required
              />
            </div>

            {/* Contraseña (solo para crear y editar) */}
            {mode !== 'view' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contraseña {mode === 'create' ? '*' : ''}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="••••••••"
                    required={mode === 'create'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmar Contraseña {mode === 'create' ? '*' : ''}
                  </label>
                  <input
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="••••••••"
                    required={mode === 'create'}
                  />
                </div>
              </div>
            )}

            {/* Teléfono y Posición */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="3001234567"
                  disabled={mode === 'view'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Posición/Cargo
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: Gerente General"
                  disabled={mode === 'view'}
                />
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Shield className="w-4 h-4 inline mr-2" />
                Rol *
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => handleInputChange('role_id', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                disabled={mode === 'view'}
                required
              >
                <option value="">Seleccionar rol</option>
                {roles.map(role => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado (solo para editar y ver) */}
            {mode !== 'create' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={mode === 'view'}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            )}

            {/* Fecha de creación (solo para ver) */}
            {mode === 'view' && formData.created_at && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Fecha de Creación
                </label>
                <input
                  type="text"
                  value={new Date(formData.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  disabled
                />
              </div>
            )}
          </div>
          
          {/* Botones del Modal */}
          {mode !== 'view' && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
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
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    {mode === 'create' ? '✅ Crear Usuario' : '💾 Guardar Cambios'}
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
                className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
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

export default UsuarioModal;
