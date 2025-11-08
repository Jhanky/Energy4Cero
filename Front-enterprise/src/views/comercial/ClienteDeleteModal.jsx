
import { AlertTriangle, X, Loader2 } from 'lucide-react';

const ClienteDeleteModal = ({ show, onCancel, onConfirm, cliente, isDeleting }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Confirmar Eliminación
            </h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
              disabled={isDeleting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-slate-600 mb-6">
            ¿Estás seguro de que deseas eliminar al cliente "<strong>{cliente?.name}</strong>"?
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 flex items-center gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar Cliente'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteDeleteModal;
