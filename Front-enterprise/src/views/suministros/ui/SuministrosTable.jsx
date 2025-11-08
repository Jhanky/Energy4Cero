import { Eye, Edit, Trash2, Package, FileText, ExternalLink } from 'lucide-react';

const SuministrosTable = ({
  activeTab,
  data,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onRetry,
  formatPrice,
  formatDate,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <p className="text-slate-600 font-medium">Cargando {activeTab}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const renderPanelsTable = () => (
    <table className="w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Marca</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Modelo</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Potencia (W)</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Precio</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ficha Técnica</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((item) => (
          <tr key={item.panel_id || item.inverter_id || item.battery_id || item.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.brand}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.model}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.power_output} W</td>
            <td className="px-6 py-4 text-sm text-slate-600">{formatPrice(item.price)}</td>
            <td className="px-6 py-4 text-sm text-slate-600">
              {item.technical_sheet_path ? (
                <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${item.technical_sheet_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Ver PDF <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                'N/A'
              )}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => onView(item)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(item)} className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderInvertersTable = () => (
    <table className="w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Nombre</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Modelo</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Potencia (kW)</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo de Red</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo de Sistema</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Precio</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ficha Técnica</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((item) => (
          <tr key={item.panel_id || item.inverter_id || item.battery_id || item.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.model}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.power_output_kw} kW</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.grid_type}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.system_type}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{formatPrice(item.price)}</td>
            <td className="px-6 py-4 text-sm text-slate-600">
              {item.technical_sheet_path ? (
                <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${item.technical_sheet_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Ver PDF <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                'N/A'
              )}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => onView(item)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(item)} className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderBatteriesTable = () => (
    <table className="w-full">
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Nombre</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Modelo</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Precio</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Capacidad (Ah)</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Voltaje (V)</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ficha Técnica</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {data.map((item) => (
          <tr key={item.panel_id || item.inverter_id || item.battery_id || item.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.model}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{formatPrice(item.price)}</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.ah_capacity} Ah</td>
            <td className="px-6 py-4 text-sm text-slate-600">{item.voltage} V</td>
            <td className="px-6 py-4 text-sm text-slate-600">
              {item.technical_sheet_path ? (
                <a href={`${import.meta.env.VITE_API_BASE_URL}/storage/${item.technical_sheet_path}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                  <FileText className="w-4 h-4" /> Ver PDF <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                'N/A'
              )}
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => onView(item)} className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(item)} className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(item)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTable = () => {
    switch (activeTab) {
      case 'paneles':
        return renderPanelsTable();
      case 'inversores':
        return renderInvertersTable();
      case 'baterias':
        return renderBatteriesTable();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        {data.length === 0 && !loading && !error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium mb-2">No hay {activeTab} registrados</p>
            <p className="text-sm text-slate-500">Comienza agregando tu primer {activeTab}</p>
          </div>
        ) : (
          renderTable()
        )}
      </div>
    </div>
  );
};

export default SuministrosTable;
