import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { AdvancedSearchBar, AdvancedFilters } from '../../../../shared/ui';

const RolFilters = ({
    searchTerm,
    onSearchChange,
    filters,
    onFilterChange,
    loading
}) => {
    const filterOptions = [
        {
            key: 'is_active',
            label: 'Estado',
            options: [
                { value: '', label: 'Todos los estados' },
                { value: 'true', label: 'Activos' },
                { value: 'false', label: 'Inactivos' }
            ]
        }
    ];

    return (
        <div className="flex flex-wrap gap-4 mb-4">
            <AdvancedSearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Buscar roles..."
                loading={loading && searchTerm.length > 0}
                className="flex-1 min-w-[200px]"
            />
            <AdvancedFilters
                filters={filters}
                onFilterChange={onFilterChange}
                filterOptions={filterOptions}
            />
        </div>
    );
};

export default RolFilters;
