import { Trash2, X } from 'lucide-react';

const SuministroDeleteModal = ({ show, activeTab, item, onConfirm, onCancel }) => {
  if (!show || !item) {
    return null;
  }

  const getTabConfig = () => {
    const configs = {
      paneles: {
        title: 'Panel Solar',
        name: item.brand ? `${item.brand} ${item.model}` : 'Panel'
      },
      inversores: {
        title: 'Inversor',
        name: item.name ? `${item.name} ${item.model}` : 'Inversor'
      },
      baterias: {
        title: 'Batería',
        name: item.name ? `${item.name} ${item.model}` : 'Batería'
      }
    };
    return configs[activeTab] || configs.paneles;
  };

  const config = getTabConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Confirmar Eliminación</h3>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-center text-slate-600 mb-2">
              ¿Estás seguro de que deseas eliminar este {config.title}?
            </p>
            <p className="text-center font-medium text-slate-900">
              {config.name}
            </p>
            <p className="text-center text-sm text-slate-500 mt-2">
              Esta acción no se puede deshacer.
            </p>
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuministroDeleteModal;
