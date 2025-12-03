import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Clock, User } from 'lucide-react';

const ProyectoProximaAccion = ({ proyecto }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="w-5 h-5" />
          Próxima Acción
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium text-foreground">
          {proyecto.next_action || proyecto.proximaAccion || 'No especificada'}
        </p>
        {(proyecto.next_action_date || proyecto.fechaProximaAccion) && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Fecha programada: {formatearFecha(proyecto.next_action_date || proyecto.fechaProximaAccion)}
          </p>
        )}
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <User className="w-4 h-4" />
          Responsable: {proyecto.current_responsible || proyecto.responsableActual || 'No asignado'}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProyectoProximaAccion;
