import { AlertTriangle, Loader2, X } from 'lucide-react';

const RolDeleteModal = ({ show, rol, onConfirm, onCancel }) => {
  if (!show || !rol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Eliminar Rol
            </h3>
            <p className="text-slate-600 mb-4">
              ¿Estás seguro de que deseas eliminar el rol <strong>"{rol.name}"</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                <strong>Advertencia:</strong> Esta acción no se puede deshacer.
                Todos los usuarios asignados a este rol perderán sus permisos asociados.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Eliminar Rol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolDeleteModal;
