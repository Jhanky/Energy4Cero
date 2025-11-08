import { Filter, ChevronDown, ChevronUp, X, User, TrendingUp, Search } from 'lucide-react';

const ClientesFilters = ({ 
  showFilters, 
  onToggleFilters, 
  filters, 
  onFilterChange, 
  onClearFilters 
}) => {
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header de Filtros */}
      <button
        onClick={onToggleFilters}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <span className="font-medium text-slate-900">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {showFilters ? (
          <ChevronUp className="w-5 h-5 text-slate-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Contenido de Filtros */}
      {showFilters && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tipo de Cliente */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Tipo de Cliente
              </label>
              <select
                value={filters.client_type}
                onChange={(e) => onFilterChange('client_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              >
                <option value="">🏢 Todos los tipos</option>
                <option value="residencial">🏠 Residencial</option>
                <option value="comercial">🏪 Comercial</option>
                <option value="industrial">🏭 Industrial</option>
              </select>
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <Search className="w-3.5 h-3.5" />
                Ciudad
              </label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => onFilterChange('city', e.target.value)}
                placeholder="🏙️ Ej: Barranquilla..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              />
            </div>

            {/* Responsable */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                Responsable
              </label>
              <input
                type="text"
                value={filters.responsable}
                onChange={(e) => onFilterChange('responsable', e.target.value)}
                placeholder="👤 Ej: María González..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              />
            </div>

            {/* Rango de Consumo */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Consumo (kWh/mes)
              </label>
              <select
                value={filters.consumption_range}
                onChange={(e) => onFilterChange('consumption_range', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
              >
                <option value="">⚡ Todos los consumos</option>
                <option value="0-500">0 - 500 kWh</option>
                <option value="500-1000">500 - 1000 kWh</option>
                <option value="1000-2000">1000 - 2000 kWh</option>
                <option value="2000+">Más de 2000 kWh</option>
              </select>
            </div>
          </div>

          {/* Filtros Activos */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.client_type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Tipo: {filters.client_type}
                    <button onClick={() => onFilterChange('client_type', '')} className="hover:bg-blue-200 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Ciudad: {filters.city}
                    <button onClick={() => onFilterChange('city', '')} className="hover:bg-purple-200 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.responsable && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Responsable: {filters.responsable}
                    <button onClick={() => onFilterChange('responsable', '')} className="hover:bg-orange-200 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.consumption_range && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Consumo: {filters.consumption_range}
                    <button onClick={() => onFilterChange('consumption_range', '')} className="hover:bg-green-200 rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={onClearFilters}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientesFilters;

