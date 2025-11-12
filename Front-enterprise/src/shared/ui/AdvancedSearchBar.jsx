import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const AdvancedSearchBar = ({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 200,
  loading = false,
  className = ""
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sincronizar el valor local con el valor externo
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value, debounceMs]);

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
          loading && localValue ? 'text-blue-500 animate-pulse' : 'text-gray-400'
        }`}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
        className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ${
          loading && localValue ? 'ring-2 ring-blue-200 border-blue-300' : ''
        }`}
      />
      {loading && localValue && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          <span className="text-xs text-blue-600 font-medium">Buscando...</span>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;
