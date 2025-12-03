import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

const FacturaFilters = ({ filters, onChange, estados, tiposPago, proveedoresList, centrosCostoList }) => {
  const handleFilterChange = (key, value) => {
    // Convert "__all__" back to empty string for the parent component
    const actualValue = value === "__all__" ? "" : value;
    onChange(key, actualValue);
  };

  return (
    <div className="flex gap-4">
      <Select
        value={filters.estado || "__all__"}
        onValueChange={(value) => handleFilterChange('estado', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los estados</SelectItem>
          {estados.map(estado => (
            <SelectItem key={estado} value={estado}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tipoPago || "__all__"}
        onValueChange={(value) => handleFilterChange('tipoPago', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Tipo de Pago" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los tipos</SelectItem>
          {tiposPago.map(tipo => (
            <SelectItem key={tipo} value={tipo}>
              {tipo === 'total' ? 'Pago Total' : 'Pago Parcial'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.proveedor || "__all__"}
        onValueChange={(value) => handleFilterChange('proveedor', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Proveedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los proveedores</SelectItem>
          {proveedoresList.map(proveedor => (
            <SelectItem key={proveedor} value={proveedor}>
              {proveedor}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.centroCosto || "__all__"}
        onValueChange={(value) => handleFilterChange('centroCosto', value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Centro de Costo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los centros</SelectItem>
          {centrosCostoList.map(centro => (
            <SelectItem key={centro} value={centro}>
              {centro}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FacturaFilters;
