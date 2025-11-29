import { AlertTriangle, X, FolderOpen, User, Calendar, DollarSign } from 'lucide-react';

const ProyectoDeleteModal = ({ show, proyecto, onConfirm, onCancel, isDeleting }) => {
  if (!show || !proyecto) return null;

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
              disabled={isDeleting}
              className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-slate-700 mb-4">
            ¿Estás seguro de que deseas eliminar el proyecto{' '}
            <span className="font-semibold text-slate-900">{proyecto.name}</span>?
          </p>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{proyecto.name}</p>
                  <p className="text-sm text-slate-600">{proyecto.description}</p>
                </div>
              </div>

              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  <span>Cliente: {proyecto.client?.name || 'Sin cliente'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="w-4 h-4" />
                  <span>Responsable: {proyecto.responsible_user?.name || 'No asignado'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span>Costo estimado: {formatCurrency(proyecto.estimated_cost)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Inicio: {formatDate(proyecto.start_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>Fin: {formatDate(proyecto.end_date)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>⚠️ Advertencia:</strong> Al eliminar este proyecto, se perderán todos sus datos asociados incluyendo tareas, documentos y registros relacionados.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Eliminar Proyecto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProyectoDeleteModal;
