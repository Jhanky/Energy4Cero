import { useState, useEffect, useMemo } from 'react';
import proyectosService from '../../../services/proyectosService';
import milestoneService from '../../../services/milestoneService';
import documentService from '../../../services/documentService';

export const useProyectoDocumentos = (projectId) => {
  const [documentos, setDocumentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDocumentos = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener documentos generales del proyecto
        const documentosResponse = await documentService.getDocumentsByProject(projectId);

        if (documentosResponse.success) {
          const documentosGenerales = documentosResponse.data.data || documentosResponse.data || [];

          // Obtener documentos de hitos
          const hitosResponse = await milestoneService.getMilestonesByProject(projectId);
          let documentosDeHitos = [];

          if (hitosResponse.success) {
            const hitos = hitosResponse.data.data || hitosResponse.data || [];
            documentosDeHitos = hitos.flatMap(hito => {
              const docs = hito.documents || hito.documentos || [];
              return docs.map(doc => ({
                ...doc,
                hitoId: hito.id,
                hitoTitulo: hito.title || hito.titulo,
                hitoFecha: hito.date || hito.fecha
              }));
            });
          }

          // Combinar todos los documentos
          const todosDocumentos = [...documentosGenerales, ...documentosDeHitos];
          setDocumentos(todosDocumentos);
        } else {
          setError(documentosResponse.message || 'Error al cargar los documentos');
          setDocumentos([]);
        }
      } catch (err) {
        console.error('Error al cargar documentos:', err);
        setError('Error de conexión al cargar los documentos');
        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, [projectId]);

  const documentosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return documentos;

    return documentos.filter(doc => {
      const nombre = (doc.name || doc.nombre || doc.original_name || '').toLowerCase();
      const tipo = obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10).toLowerCase();
      const responsable = (doc.responsible || '').toLowerCase();

      return nombre.includes(busqueda.toLowerCase()) ||
             tipo.includes(busqueda.toLowerCase()) ||
             responsable.includes(busqueda.toLowerCase());
    });
  }, [documentos, busqueda]);

  const totalDocumentos = documentos.length;

  const subirDocumento = async (documentoData) => {
    try {
      // Validar campos requeridos
      if (!documentoData.archivo || !documentoData.nombre?.trim()) {
        return { success: false, message: 'Archivo y nombre son requeridos' };
      }

      if (documentoData.milestoneId) {
        // Subir a un hito específico
        const documentData = {
          type_id: documentoData.tipo || 10,
          file: documentoData.archivo,
          name: documentoData.nombre,
          description: documentoData.descripcion || '',
          responsible: documentoData.responsable || 'Sistema'
        };

        const response = await milestoneService.uploadMilestoneDocument(
          projectId,
          documentoData.milestoneId,
          documentData
        );

        if (response.success) {
          recargarDocumentos();
          return { success: true };
        } else {
          return { success: false, message: response.message };
        }
      } else {
        // Subir directamente al proyecto
        const documentData = {
          type_id: documentoData.tipo || 10,
          file: documentoData.archivo,
          name: documentoData.nombre,
          description: documentoData.descripcion || '',
          responsible: documentoData.responsable || 'Sistema',
          project_id: projectId
        };

        const response = await documentService.createDocument(documentData);

        if (response.success) {
          recargarDocumentos();
          return { success: true };
        } else {
          return { success: false, message: response.message };
        }
      }
    } catch (err) {
      console.error('Error al subir documento:', err);
      return { success: false, message: 'Error al subir el documento' };
    }
  };

  const descargarDocumento = async (documento) => {
    try {
      const blob = await proyectosService.downloadDocument(projectId, documento.id);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = documento.name || documento.nombre || documento.original_name || `documento_${documento.id}`;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error('Error al descargar documento:', err);
      return { success: false, message: 'Error al descargar el documento' };
    }
  };

  const recargarDocumentos = async () => {
    if (!projectId) return;

    try {
      setLoading(true);

      // Obtener documentos generales del proyecto
      const documentosResponse = await documentService.getDocumentsByProject(projectId);
      const documentosGenerales = documentosResponse.success
        ? documentosResponse.data.data || documentosResponse.data || []
        : [];

      // Obtener documentos de hitos
      const hitosResponse = await milestoneService.getMilestonesByProject(projectId);
      let documentosDeHitos = [];

      if (hitosResponse.success) {
        const hitos = hitosResponse.data.data || hitosResponse.data || [];
        documentosDeHitos = hitos.flatMap(hito => {
          const docs = hito.documents || hito.documentos || [];
          return docs.map(doc => ({
            ...doc,
            hitoId: hito.id,
            hitoTitulo: hito.title || hito.titulo,
            hitoFecha: hito.date || hito.fecha
          }));
        });
      }

      const todosDocumentos = [...documentosGenerales, ...documentosDeHitos];
      setDocumentos(todosDocumentos);
    } catch (err) {
      console.error('Error al recargar documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    documentos,
    documentosFiltrados,
    busqueda,
    setBusqueda,
    totalDocumentos,
    loading,
    error,
    subirDocumento,
    descargarDocumento,
    recargarDocumentos
  };
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
