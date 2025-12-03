import { useState } from 'react';
import { Paperclip, Download, Plus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Skeleton } from '@/ui/skeleton';

const ProyectoDocumentosGrid = ({
  documentos,
  documentosFiltrados,
  busqueda,
  setBusqueda,
  totalDocumentos,
  loading,
  onSubirDocumento,
  onDescargarDocumento
}) => {
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

  if (!documentos || documentos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Paperclip className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No hay documentación registrada</h3>
          <p className="text-muted-foreground">Sube el primer documento para comenzar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón para subir documento y campo de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <Button onClick={onSubirDocumento} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Subir Nuevo Documento
            </Button>

            <div className="w-full sm:w-64">
              <Input
                type="text"
                placeholder="Buscar documentación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Toda la Documentación del Proyecto</CardTitle>
        </CardHeader>
        <CardContent>

        {documentosFiltrados.length > 0 ? (
          <div className="space-y-4">
            {documentosFiltrados.reduce((groups, doc) => {
              const hitoId = doc.hitoId || 'general';
              const hitoTitulo = doc.hitoTitulo || 'Documentos Generales del Proyecto';

              if (!groups[hitoId]) {
                groups[hitoId] = {
                  titulo: hitoId === 'general' ? 'Documentos Generales del Proyecto' : hitoTitulo,
                  documentos: [],
                  icono: hitoId === 'general' ? FileText : null
                };
              }
              groups[hitoId].documentos.push(doc);
              return groups;
            }, {}).map((group, groupKey) => (
              <div key={groupKey} className="border-b border-border pb-4 last:border-0">
                <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  {group.icono && <FileText className="w-4 h-4 text-primary" />}
                  {group.titulo} - {formatearFecha(group.documentos[0]?.hitoFecha)}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.documentos.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border hover:border-primary transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{obtenerIconoTipoDocumento(doc.type_id || doc.tipo || 10)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{doc.name || doc.nombre || doc.original_name || 'Documento sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">
                            {obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)} • {doc.size || doc.tamaño || doc.file_size || 'Tamaño desconocido'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.responsible || 'Responsable no especificado'} • {formatearFecha(doc.uploaded_at || doc.fechaSubida || doc.created_at)}
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
                        onClick={() => onDescargarDocumento(doc)}
                        title="Descargar documento"
                        className="flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Paperclip className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron documentos</h3>
            <p className="text-muted-foreground">No se encontró documentación que coincida con "{busqueda}"</p>
            <p className="text-sm text-muted-foreground mt-2">Intenta con otros términos de búsqueda</p>
          </div>
        )}
        </CardContent>
      </Card>
    </div>
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

export default ProyectoDocumentosGrid;
