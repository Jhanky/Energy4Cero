import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  ToggleLeft, 
  ToggleRight,
  Shield
} from 'lucide-react';

const RoleFilters = ({ 
  filters = {},
  onFilterChange,
  onApplyFilters,
  onClearFilters
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleStatusChange = (value) => {
    onFilterChange({ ...filters, is_active: value });
  };

  const clearFilter = (filterName) => {
    const newFilters = { ...filters };
    delete newFilters[filterName];
    onFilterChange(newFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== undefined
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Campo de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            placeholder="Buscar roles..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>

        {/* Filtro de estado */}
        <select
          value={filters.is_active || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={onApplyFilters}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Aplicar Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
          
          <button
            onClick={onClearFilters}
            className="px-4 py-3 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center"
            title="Limpiar filtros"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Indicador de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Filtros activos: <span className="font-medium">{activeFiltersCount}</span>
            </p>
            <button
              onClick={onClearFilters}
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleFilters;