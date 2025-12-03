import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

const ProveedorFilters = ({ filters, onChange, categorias, departamentosList }) => {
  const handleFilterChange = (key, value) => {
    // Convert "__all__" back to empty string for the parent component
    const actualValue = value === "__all__" ? "" : value;
    onChange(key, actualValue);
  };

  return (
    <div className="flex gap-4">
      <Select
        value={filters.categoria || "__all__"}
        onValueChange={(value) => handleFilterChange('categoria', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas las categorías</SelectItem>
          {categorias.filter(categoria => categoria && categoria.trim() !== '').map(categoria => (
            <SelectItem key={categoria} value={categoria}>
              {categoria}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.estado || "__all__"}
        onValueChange={(value) => handleFilterChange('estado', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los estados</SelectItem>
          <SelectItem value="activo">Activo</SelectItem>
          <SelectItem value="inactivo">Inactivo</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.departamento || "__all__"}
        onValueChange={(value) => handleFilterChange('departamento', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Departamento" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los departamentos</SelectItem>
          {departamentosList.filter(departamento => departamento && departamento.trim() !== '').map(departamento => (
            <SelectItem key={departamento} value={departamento}>
              {departamento}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProveedorFilters;
