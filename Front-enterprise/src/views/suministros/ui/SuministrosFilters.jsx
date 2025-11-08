import { Search } from 'lucide-react';

const SuministrosFilters = ({
  activeTab,
  searchTerm,
  filters,
  onSearchChange,
  onFiltersChange,
  onApplyFilters
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onSearchChange('');
    onFiltersChange({});
    onApplyFilters();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Buscar ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Marca</label>
          <input
            type="text"
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            placeholder="Filtrar por marca..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Modelo</label>
          <input
            type="text"
            value={filters.model || ''}
            onChange={(e) => handleFilterChange('model', e.target.value)}
            placeholder="Filtrar por modelo..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        {activeTab === 'inversores' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Red</label>
            <select
              value={filters.grid_type || ''}
              onChange={(e) => handleFilterChange('grid_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los tipos</option>
              <option value="monofasico">Monofásico</option>
              <option value="bifasico">Bifásico</option>
              <option value="trifasico 220v">Trifásico 220V</option>
              <option value="trifasico 440v">Trifásico 440V</option>
            </select>
          </div>
        )}
        
        {activeTab === 'inversores' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Sistema</label>
            <select
              value={filters.system_type || ''}
              onChange={(e) => handleFilterChange('system_type', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los tipos</option>
              <option value="on-grid">On-Grid</option>
              <option value="off-grid">Off-Grid</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        )}
        
        {activeTab === 'baterias' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
            <input
              type="text"
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              placeholder="Filtrar por tipo..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={onApplyFilters}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Aplicar Filtros
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SuministrosFilters;
