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
      [filterKey]: value === "none" ? "" : value
    };
    onFilterChange(newFilters);
  };

  if (!filterOptions || filterOptions.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {filterOptions.map((filterOption) => {
        const { key, label, options = [], placeholder = `Seleccionar ${label.toLowerCase()}` } = filterOption;

        return (
          <div key={key} className="min-w-[180px]">
            <Select
              value={filters[key] || "none"}
              onValueChange={(value) => handleFilterChange(key, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos</SelectItem>
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
