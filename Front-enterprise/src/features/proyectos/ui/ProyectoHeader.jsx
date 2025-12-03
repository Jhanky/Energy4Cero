import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader } from '@/ui/card';
import { calcularPorcentajePorEstado } from '../../../data/proyectos';

const ProyectoHeader = ({ proyecto, estados, onVolver }) => {
  return (
    <Card>
      <CardHeader>
        <Button
          variant="ghost"
          onClick={onVolver}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium mb-4 p-0 h-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a lista de proyectos
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{proyecto.name || proyecto.nombre}</h2>
            <p className="text-muted-foreground mt-1">ID: {proyecto.code || proyecto.id}</p>
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {calcularPorcentajePorEstado(proyecto.current_state_id || proyecto.current_state_id || 0)}% Completado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${calcularPorcentajePorEstado(proyecto.current_state_id || proyecto.current_state_id || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ProyectoHeader;
