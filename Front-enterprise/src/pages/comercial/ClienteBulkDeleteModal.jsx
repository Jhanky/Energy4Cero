import { AlertTriangle, X, Loader2, Users, FileText, FolderOpen, Ticket } from 'lucide-react';

const ClienteBulkDeleteModal = ({ show, onCancel, onConfirm, selectedClients, isDeleting }) => {
  if (!show || !selectedClients || selectedClients.length === 0) {
    return null;
  }

  const totalClients = selectedClients.length;

  // Calcular estadísticas de relaciones
  const stats = selectedClients.reduce((acc, client) => {
    if (client.relations) {
      acc.quotations += client.relations.quotations || 0;
      acc.projects += client.relations.projects || 0;
      acc.tickets += client.relations.tickets || 0;
    }
    return acc;
  }, { quotations: 0, projects: 0, tickets: 0 });

  const hasRelations = stats.quotations > 0 || stats.projects > 0 || stats.tickets > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Confirmar Eliminación en Grupo
            </h2>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
              disabled={isDeleting}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-slate-600 mb-4">
              ¿Estás seguro de que deseas eliminar <strong>{totalClients}</strong> cliente{totalClients !== 1 ? 's' : ''}?
              Esta acción no se puede deshacer.
            </p>

            {hasRelations && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Advertencia: Registros relacionados
                </div>
                <p className="text-amber-700 text-sm mb-3">
                  Los siguientes registros relacionados también serán eliminados:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {stats.quotations > 0 && (
                    <div className="flex items-center gap-2 text-amber-700">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{stats.quotations} cotización{stats.quotations !== 1 ? 'es' : ''}</span>
                    </div>
                  )}
                  {stats.projects > 0 && (
                    <div className="flex items-center gap-2 text-amber-700">
                      <FolderOpen className="w-4 h-4" />
                      <span className="text-sm">{stats.projects} proyecto{stats.projects !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {stats.tickets > 0 && (
                    <div className="flex items-center gap-2 text-amber-700">
                      <Ticket className="w-4 h-4" />
                      <span className="text-sm">{stats.tickets} ticket{stats.tickets !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Clientes a eliminar ({totalClients})
              </h3>
              <div className="max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {selectedClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{client.name}</p>
                          <p className="text-sm text-slate-500">{client.email}</p>
                        </div>
                      </div>
                      {client.relations && (client.relations.quotations > 0 || client.relations.projects > 0 || client.relations.tickets > 0) && (
                        <div className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                          Tiene relaciones
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
                `Eliminar ${totalClients} Cliente${totalClients !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClienteBulkDeleteModal;
