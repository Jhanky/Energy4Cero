import { DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';

const ProyectoInfoComercial = ({ proyecto }) => {
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información Comercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Información Comercial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Valor del Contrato</p>
            <p className="font-medium text-foreground text-xl">{formatearMoneda(proyecto.contract_value || proyecto.valorContrato || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Margen Estimado</p>
            <p className="font-medium text-foreground">{proyecto.estimated_margin || proyecto.margenEstimado || 0}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Responsable Comercial</p>
            <p className="font-medium text-foreground">{proyecto.responsible_commercial || proyecto.responsableComercial || 'No asignado'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Contrato</p>
            <p className="font-medium text-foreground">{formatearFecha(proyecto.contract_date || proyecto.fechaContrato)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Fechas Clave */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Fechas Clave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Inicio</p>
            <p className="font-medium text-foreground">{formatearFecha(proyecto.start_date || proyecto.fechaInicio)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Solicitud Presentada</p>
            <p className="font-medium text-foreground">{formatearFecha(proyecto.application_date || proyecto.fechaSolicitudPresentada)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha Estimada Finalización</p>
            <p className="font-medium text-foreground">{formatearFecha(proyecto.estimated_completion_date || proyecto.fechaEstimadaFinalizacion)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Días Totales del Proyecto</p>
            <p className="font-medium text-foreground">{calcularDiasTotales(proyecto)} días</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Función auxiliar para calcular días totales
const calcularDiasTotales = (proyecto) => {
  const fechaInicio = proyecto.start_date || proyecto.fechaInicio;
  const fechaFin = proyecto.estimated_completion_date || proyecto.fechaEstimadaFinalizacion;

  if (!fechaInicio || !fechaFin) return 0;

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  const diffTime = Math.abs(fin - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export default ProyectoInfoComercial;
