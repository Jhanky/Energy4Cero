import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const AdvancedFilters = ({
  filters = {},
  onFilterChange,
  filterOptions = [],
  className = ""
}) => {
  const handleFilterChange = (filterKey, value) => {
    const newFilters = {
      ...filters,
      [filterKey]: value === "all" ? "" : value
    };
    onFilterChange(newFilters);
  };

  if (!filterOptions || filterOptions.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {filterOptions.map((filterOption) => {
        const { key, label, options = [], placeholder = `Filtrar por ${label}` } = filterOption;

        return (
          <div key={key} className="min-w-[200px]">
              <Select
                value={filters[key] || undefined}
                onValueChange={(value) => handleFilterChange(key, value)}
              >
              <SelectTrigger className="w-full h-12 py-3">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
};

export default AdvancedFilters;
