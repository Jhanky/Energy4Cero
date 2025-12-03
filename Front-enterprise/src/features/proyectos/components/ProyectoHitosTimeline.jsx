import { useState } from 'react';
import { History, User, Paperclip, Download, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Skeleton } from '@/ui/skeleton';
import { obtenerIconoTipoHito, obtenerNombreTipoHito, obtenerColorTipoHito } from '../../../data/hitos';

const ProyectoHitosTimeline = ({ hitos, loading, onCrearHito, onDescargarDocumento }) => {
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Pendiente';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!hitos || hitos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay hitos registrados</h3>
          <p className="text-muted-foreground">Agrega el primer hito para comenzar el historial del proyecto</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Hitos y Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
        {hitos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((hito, index) => (
          <div key={hito.id} className="flex gap-4 relative pb-8">
            {/* Línea vertical */}
            {index < hitos.length - 1 && (
              <div className="absolute left-6 top-14 w-0.5 h-full bg-muted"></div>
            )}

            {/* Icono del hito */}
            <div
              className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: `${obtenerColorTipoHito(hito.tipo)}20` }}
            >
              {obtenerIconoTipoHito(hito.tipo)}
            </div>

            {/* Contenido del hito */}
            <div className="flex-1">
              <div className="bg-muted/50 rounded-lg p-4 border border-border hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: obtenerColorTipoHito(hito.tipo) }}
                      >
                        {obtenerNombreTipoHito(hito.tipo)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatearFecha(hito.fecha)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-foreground text-lg">{hito.titulo}</h4>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHitoSeleccionado(hitoSeleccionado?.id === hito.id ? null : hito)}
                  >
                    {hitoSeleccionado?.id === hito.id ? 'Ocultar' : 'Ver Detalle'}
                  </Button>
                </div>

                <p className="text-foreground mb-3">{hito.descripcion}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {hito.responsable || 'Responsable no asignado'}
                  </span>
                  {hito.documentos && hito.documentos.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="w-4 h-4" />
                      {hito.documentos.length} documento(s)
                    </span>
                  )}
                </div>

                {/* Detalle expandido */}
                {hitoSeleccionado?.id === hito.id && (
                  <div className="mt-4 pt-4 border-t border-border space-y-4">
                    {/* Participantes */}
                    {hito.participantes && hito.participantes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Participantes:</p>
                        <div className="flex flex-wrap gap-2">
                          {hito.participantes.map((participante, idx) => (
                            <span key={idx} className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
                              {typeof participante === 'object' ? participante.name || participante.full_name || participante : participante}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documentos */}
                    {hito.documentos && hito.documentos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Documentos:</p>
                        <div className="space-y-2">
                          {hito.documentos.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{obtenerIconoTipoDocumento(doc.type_id || doc.tipo || 10)}</span>
                                <div>
                                  <p className="font-medium text-foreground">{doc.name || doc.nombre || doc.original_name || 'Documento sin nombre'}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)} • {doc.size || doc.tamaño || doc.file_size || 'Tamaño desconocido'} • {formatearFecha(doc.uploaded_at || doc.fechaSubida || doc.created_at)}
                                  </p>
                                  {doc.description && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {doc.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDescargarDocumento(doc, hito.id);
                                }}
                                title="Descargar documento"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notas */}
                    {hito.notas && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Notas:</p>
                        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border">
                          {hito.notas}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Función auxiliar para obtener icono del tipo de documento
const obtenerIconoTipoDocumento = (tipoId) => {
  const iconos = {
    1: '📄', // Contrato
    2: '💰', // Factura
    3: '⚡', // Permiso
    4: '🏆', // Certificación
    5: '📊', // Informe
    6: '📷', // Fotografía
    7: '📐', // Plano
    8: '📚', // Manual
    9: '❓', // Otro
    10: '📋' // General
  };
  return iconos[tipoId] || '📄';
};

// Función auxiliar para obtener nombre del tipo de documento
const obtenerNombreTipoDocumento = (tipoId) => {
  const tipos = {
    1: 'Contrato',
    2: 'Factura',
    3: 'Permiso',
    4: 'Certificación',
    5: 'Informe',
    6: 'Fotografía',
    7: 'Plano',
    8: 'Manual',
    9: 'Otro',
    10: 'General'
  };
  return tipos[tipoId] || 'Desconocido';
};

export default ProyectoHitosTimeline;
