import { CheckCircle, Circle, Clock, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { calcularDiasEnEstado } from '../../../data/proyectos';

const ProyectoTimelineEstados = ({ proyecto, estados, timelineEstados }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderEstadoTimeline = (estado) => {
    const estadoActual = proyecto.current_state_id || proyecto.estadoActual;
    const estaCompleto = estado.id < estadoActual;
    const esActual = estado.id === estadoActual;
    const esPendiente = estado.id > estadoActual;

    // Buscar información detallada de este estado en el timeline
    const estadoTimeline = timelineEstados.find(t => t.state_id === estado.id) || {};

    // Obtener el usuario que cambió al estado
    let nombreUsuario = estadoTimeline.user_name;

    // Si no hay información detallada en el timeline, usar información del estado actual del proyecto
    if (!nombreUsuario && esActual && proyecto.current_state_user) {
      nombreUsuario = proyecto.current_state_user.name || proyecto.current_state_user;
    } else if (!nombreUsuario && esActual && proyecto.current_responsible) {
      nombreUsuario = proyecto.current_responsible;
    }

    // Si aún no hay nombre de usuario, usar 'Sistema'
    if (!nombreUsuario) {
      nombreUsuario = 'Sistema';
    }

    // Obtener las fechas
    let fechaInicio = estadoTimeline.start_date;

    // Si no hay fecha de inicio en el timeline, usar la fecha de inicio del estado actual del proyecto
    if (!fechaInicio && esActual && proyecto.current_state_date) {
      fechaInicio = proyecto.current_state_date;
    }

    const fechaFin = estadoTimeline.end_date;

    return (
      <div key={estado.id} className="flex gap-4 relative">
        {/* Línea vertical */}
        {estado.id < estados.length && (
          <div className={`absolute left-4 top-10 w-0.5 h-full ${estaCompleto ? 'bg-green-500' : 'bg-muted'}`}></div>
        )}

        {/* Icono */}
        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
          estaCompleto ? 'bg-green-500' : esActual ? 'bg-primary' : 'bg-muted'
        }`}>
          {estaCompleto ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : esActual ? (
            <Clock className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <Circle className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 pb-8">
          <div className={`p-4 rounded-lg ${esActual ? 'bg-primary/10 border-2 border-primary' : 'bg-muted/50'}`}>
            <h4 className={`font-semibold ${esActual ? 'text-primary' : 'text-foreground'}`}>
              {estado.nombre}
            </h4>
            {(estaCompleto || esActual) && (
              <div className="space-y-1 mt-2 text-sm">
                <p className="text-muted-foreground">
                  <User className="inline w-3 h-3 mr-1" />
                  {nombreUsuario}
                </p>
                {fechaInicio && (
                  <p className="text-muted-foreground">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    Desde: {formatearFecha(fechaInicio)}
                  </p>
                )}
                {fechaFin && (
                  <p className="text-muted-foreground">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    Hasta: {formatearFecha(fechaFin)}
                  </p>
                )}
                {!fechaFin && esActual && fechaInicio && (
                  <p className="text-muted-foreground italic">
                    <Clock className="inline w-3 h-3 mr-1" />
                    Estado actual desde {formatearFecha(fechaInicio)}
                  </p>
                )}
              </div>
            )}
            {esActual && (
              <p className="text-sm text-primary mt-1">
                Estado actual - {calcularDiasEnEstado(proyecto)} días en este estado
              </p>
            )}
            {estaCompleto && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Completado
              </p>
            )}
            {esPendiente && (
              <p className="text-sm text-muted-foreground mt-1">
                Pendiente
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Línea de Tiempo del Proyecto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {estados.map(estado => renderEstadoTimeline(estado))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProyectoTimelineEstados;
