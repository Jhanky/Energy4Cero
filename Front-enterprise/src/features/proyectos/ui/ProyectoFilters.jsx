import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

const ProyectoFilters = ({ filters, onFilterChange, clientes = [] }) => {
  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const estadoOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'preparacion-solicitud', label: 'Preparación Solicitud' },
    { value: 'solicitud-presentada', label: 'Solicitud Presentada' },
    { value: 'revision-completitud', label: 'Revisión Completitud' },
    { value: 'revision-tecnica', label: 'Revisión Técnica' },
    { value: 'concepto-viabilidad', label: 'Concepto Viabilidad' },
    { value: 'instalacion-proceso', label: 'Instalación Proceso' },
    { value: 'inspeccion-pendiente', label: 'Inspección Pendiente' },
    { value: 'inspeccion-realizada', label: 'Inspección Realizada' },
    { value: 'observaciones-inspeccion', label: 'Observaciones Inspección' },
    { value: 'aprobacion-final', label: 'Aprobación Final' },
    { value: 'conectado-operando', label: 'Conectado Operando' },
    { value: 'suspendido', label: 'Suspendido' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  const clienteOptions = [
    { value: 'all', label: 'Todos los clientes' },
    ...clientes.map(cliente => ({
      value: cliente.id.toString(),
      label: cliente.name
    }))
  ];

  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-[200px]">
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            {estadoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[200px]">
        <Select
          value={filters.client_id}
          onValueChange={(value) => handleFilterChange('client_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por cliente" />
          </SelectTrigger>
          <SelectContent>
            {clienteOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProyectoFilters;
