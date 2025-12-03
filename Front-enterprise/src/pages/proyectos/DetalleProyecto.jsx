import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Skeleton } from '@/ui/skeleton';
import {
  useProyectoDetalle,
  useProyectoHitos,
  useProyectoDocumentos,
  useProyectoTimeline,
  useProyectoObservaciones,
  ProyectoHeader,
  ProyectoTabs,
  ProyectoInfoGeneral,
  ProyectoInfoComercial,
  ProyectoTimelineEstados,
  ProyectoObservaciones,
  ProyectoProximaAccion,
  ProyectoHitosTimeline,
  ProyectoDocumentosGrid
} from '../../features/proyectos';
import HitoModal from './HitoModal';
import DocumentoModal from './DocumentoModal';

const DetalleProyecto = ({ proyecto: propProyecto, estados, onVolver }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Determinar el ID del proyecto
  const projectId = propProyecto?.id || id;

  // Estados locales para modales
  const [vistaActiva, setVistaActiva] = useState('general');
  const [showHitoModal, setShowHitoModal] = useState(false);
  const [showDocumentoModal, setShowDocumentoModal] = useState(false);

  // Hooks especializados
  const { proyecto, loading: loadingProyecto, actualizarProyecto } = useProyectoDetalle(projectId);
  const { hitos, loading: loadingHitos, crearHito } = useProyectoHitos(projectId);
  const { documentos, documentosFiltrados, busqueda, setBusqueda, totalDocumentos, loading: loadingDocumentos, subirDocumento, descargarDocumento } = useProyectoDocumentos(projectId);
  const { timelineEstados, loading: loadingTimeline } = useProyectoTimeline(projectId);
  const {
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
  } = useProyectoObservaciones(proyecto, actualizarProyecto);

  // Estados de carga combinados
  const loading = loadingProyecto || loadingHitos || loadingDocumentos || loadingTimeline;

  // Handlers para modales
  const handleCrearHito = async (hitoData) => {
    const result = await crearHito(hitoData);
    if (result.success) {
      setShowHitoModal(false);
      toast.success('Hito creado exitosamente');
    } else {
      toast.error(result.message || 'Error al crear el hito');
    }
  };

  const handleCrearDocumento = async (documentoData) => {
    const result = await subirDocumento(documentoData);
    if (result.success) {
      setShowDocumentoModal(false);
      toast.success('Documento subido exitosamente');
    } else {
      toast.error(result.message || 'Error al subir el documento');
    }
  };

  const handleDescargarDocumento = async (documento) => {
    const result = await descargarDocumento(documento);
    if (!result.success) {
      toast.error(result.message || 'Error al descargar el documento');
    }
  };

  // Si no hay proyecto, mostrar error
  if (!loading && !proyecto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">Error al cargar el proyecto</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              No se pudo encontrar la información del proyecto solicitado.
            </p>
            <Button onClick={() => navigate('/proyectos')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a proyectos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-16 w-32" />
            </div>
          </CardHeader>
        </Card>

        {/* Tabs skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProyectoHeader proyecto={proyecto} estados={estados} onVolver={onVolver || (() => navigate('/proyectos'))} />

      {/* Pestañas de navegación */}
      <ProyectoTabs vistaActiva={vistaActiva} onCambiarVista={setVistaActiva} />

      {/* Vista General */}
      {vistaActiva === 'general' && (
        <>
          <ProyectoInfoGeneral proyecto={proyecto} />
          <ProyectoInfoComercial proyecto={proyecto} />
          <ProyectoTimelineEstados proyecto={proyecto} estados={estados} timelineEstados={timelineEstados} />
          <ProyectoObservaciones
            proyecto={proyecto}
            editingObservations={editingObservations}
            editingComments={editingComments}
            aireObservations={aireObservations}
            setAireObservations={setAireObservations}
            internalComments={internalComments}
            setInternalComments={setInternalComments}
            handleEditObservations={handleEditObservations}
            handleCancelObservations={handleCancelObservations}
            handleSaveObservations={handleSaveObservations}
            handleEditComments={handleEditComments}
            handleCancelComments={handleCancelComments}
            handleSaveComments={handleSaveComments}
          />
          <ProyectoProximaAccion proyecto={proyecto} />
        </>
      )}

      {/* Vista Hitos y Eventos */}
      {vistaActiva === 'hitos' && (
        <div className="space-y-6">
          {/* Botón para agregar nuevo hito */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={() => setShowHitoModal(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Nuevo Hito/Evento
              </Button>
            </CardContent>
          </Card>

          <ProyectoHitosTimeline
            hitos={hitos}
            loading={loadingHitos}
            onCrearHito={handleCrearHito}
            onDescargarDocumento={handleDescargarDocumento}
          />
        </div>
      )}

      {/* Vista Documentos */}
      {vistaActiva === 'documentos' && (
        <ProyectoDocumentosGrid
          documentos={documentos}
          documentosFiltrados={documentosFiltrados}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          totalDocumentos={totalDocumentos}
          loading={loadingDocumentos}
          onSubirDocumento={() => setShowDocumentoModal(true)}
          onDescargarDocumento={handleDescargarDocumento}
        />
      )}

      {/* Modal para crear hitos */}
      <HitoModal
        isOpen={showHitoModal}
        onClose={() => setShowHitoModal(false)}
        onSave={handleCrearHito}
        proyecto={proyecto}
      />

      {/* Modal para subir documentos */}
      <DocumentoModal
        isOpen={showDocumentoModal}
        onClose={() => setShowDocumentoModal(false)}
        onSave={handleCrearDocumento}
        proyecto={proyecto}
      />
    </div>
  );
};

export default DetalleProyecto;
