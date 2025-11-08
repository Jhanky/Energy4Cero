import { AlertTriangle, X, Shield, Users, Key } from 'lucide-react';

const RolDeleteModal = ({ show, rol, onConfirm, onCancel }) => {
  if (!show || !rol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        {/* Header con icono de advertencia */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Confirmar Eliminación
              </h3>
              <p className="text-sm text-slate-600">
                Esta acción no se puede deshacer
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-slate-700 mb-4">
            ¿Estás seguro de que deseas eliminar el rol{' '}
            <span className="font-semibold text-slate-900">{rol.name}</span>?
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{rol.name}</p>
                  <p className="text-sm text-slate-600">@{rol.slug}</p>
                </div>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{rol.users_count} usuarios asignados</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Key className="w-4 h-4" />
                  <span>{rol.permissions?.length || 0} permisos</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="w-4 h-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (rol.is_active || rol.status === 'active') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {(rol.is_active || rol.status === 'active') ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>⚠️ Advertencia:</strong> Al eliminar este rol, los usuarios asignados perderán sus permisos y no podrán acceder a las funciones correspondientes.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Eliminar Rol
          </button>
        </div>
      </div>
    </div>
  );
};

export default RolDeleteModal;
