import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Textarea } from '@/ui/textarea';
import { Edit } from 'lucide-react';

const ProyectoObservaciones = ({
  proyecto,
  editingObservations,
  editingComments,
  aireObservations,
  setAireObservations,
  internalComments,
  setInternalComments,
  handleEditObservations,
  handleCancelObservations,
  handleSaveObservations,
  handleEditComments,
  handleCancelComments,
  handleSaveComments
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Observaciones de Air-e</CardTitle>
            {!editingObservations && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditObservations}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingObservations ? (
            <div className="space-y-3">
              <Textarea
                value={aireObservations}
                onChange={(e) => setAireObservations(e.target.value)}
                rows={4}
                placeholder="Ingrese las observaciones de Air-e..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveObservations}>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancelObservations}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {proyecto.aire_observations || proyecto.observacionesAire || 'Sin observaciones'}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Comentarios Internos</CardTitle>
            {!editingComments && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditComments}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingComments ? (
            <div className="space-y-3">
              <Textarea
                value={internalComments}
                onChange={(e) => setInternalComments(e.target.value)}
                rows={4}
                placeholder="Ingrese los comentarios internos..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveComments}>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancelComments}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {proyecto.internal_comments || proyecto.comentariosInternos || 'Sin comentarios'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProyectoObservaciones;
