import { User, MapPin, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

const ProyectoInfoGeneral = ({ proyecto }) => {
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Datos del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Cliente</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.name
                : (proyecto.client?.name || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.name : proyecto.cliente) || 'No especificado')}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Cliente</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.client_type
                : (proyecto.client?.client_type || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.client_type : 'No especificado'))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email del Cliente</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.email
                : (proyecto.client?.email || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.email : 'No especificado'))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Teléfono del Cliente</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.phone
                : (proyecto.client?.phone || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.phone : 'No especificado'))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Consumo Mensual del Cliente</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.monthly_consumption
                : (proyecto.client?.monthly_consumption || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.monthly_consumption : 'No especificado'))}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Número NIC</p>
            <p className="font-medium text-foreground">
              {typeof proyecto.client === 'object' && proyecto.client
                ? proyecto.client.nic
                : (proyecto.client?.nic || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.nic : 'No especificado'))}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ubicación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Departamento</p>
            <p className="font-medium text-foreground">{proyecto.department || proyecto.departamento || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Municipio</p>
            <p className="font-medium text-foreground">{proyecto.municipality || proyecto.municipio || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dirección</p>
            <p className="font-medium text-foreground">{proyecto.address || proyecto.direccion || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Coordenadas</p>
            <p className="font-medium text-foreground">{proyecto.coordinates || proyecto.coordenadas || 'No especificadas'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Especificaciones Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Especificaciones Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Tipo de Sistema</p>
            <p className="font-medium text-foreground">{proyecto.system_type || proyecto.project_type || proyecto.tipoProyecto || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capacidad DC</p>
            <p className="font-medium text-foreground">{proyecto.capacity_dc || proyecto.capacidadDC || 0} kW</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Capacidad AC</p>
            <p className="font-medium text-foreground">{proyecto.capacity_ac || proyecto.capacidadAC || 0} kW</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Número de Paneles</p>
            <p className="font-medium text-foreground">{proyecto.number_panels || proyecto.numeroPaneles || 0} unidades</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Número de Inversores</p>
            <p className="font-medium text-foreground">{proyecto.number_inverters || proyecto.numeroInversores || 0} unidades</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProyectoInfoGeneral;
