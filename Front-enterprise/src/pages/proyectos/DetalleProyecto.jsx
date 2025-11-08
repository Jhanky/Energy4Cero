import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, MapPin, Zap, Calendar, User, DollarSign, CheckCircle, Circle, Clock, FileText, Download, Plus, History, Paperclip, AlertCircle, AlertTriangle, X } from 'lucide-react';
import { calcularDiasEnEstado, calcularDiasTotales, calcularDiasRetraso, calcularPorcentajePorEstado } from '../../data/proyectos';
import { 
  obtenerHitosProyecto, 
  obtenerNombreTipoHito, 
  obtenerIconoTipoHito,
  obtenerColorTipoHito,
  obtenerIconoTipoDocumento,
  obtenerNombreTipoDocumento,
  contarDocumentosProyecto
} from '../../data/hitos';
import proyectosService from '../../services/proyectosService';
import milestoneService from '../../services/milestoneService';
import documentService from '../../services/documentService';
import userService from '../../services/userService';
import HitoModal from './HitoModal';
import DocumentoModal from './DocumentoModal';

const DetalleProyecto = ({ proyecto, estados, onVolver }) => {
  const [vistaActiva, setVistaActiva] = useState('general');
  const [hitoSeleccionado, setHitoSeleccionado] = useState(null);
  const [showHitoModal, setShowHitoModal] = useState(false);
  const [showDocumentoModal, setShowDocumentoModal] = useState(false);
  const [proyectoDetalle, setProyectoDetalle] = useState(proyecto);
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedaDocumentos, setBusquedaDocumentos] = useState('');
  const [notification, setNotification] = useState(null);
  const [timelineEstados, setTimelineEstados] = useState([]);
  const [editingObservations, setEditingObservations] = useState(false);
  const [editingComments, setEditingComments] = useState(false);
  const [aireObservations, setAireObservations] = useState('');
  const [internalComments, setInternalComments] = useState('');

  // Función para mostrar notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Ocultar la notificación después de 5 segundos
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Función auxiliar para transformar los hitos y mapear IDs de usuarios a nombres
  const transformarHitosConUsuarios = async (hitosData) => {
    try {
      // Obtener la lista de usuarios para mapear IDs a nombres
      const usersResponse = await userService.getUsers({ per_page: 1000 }); // Aumentar el número de usuarios
      const usersMap = {};
      
      if (usersResponse.success && usersResponse.data) {
        // La estructura de la respuesta de usuarios puede ser { users: [...], pagination: {...}, stats: {...} }
        // o { data: [...] } o directamente un array
        let usersData = usersResponse.data.users || usersResponse.data.data || usersResponse.data;
        
        if (Array.isArray(usersData)) {
          usersData.forEach(user => {
            if (user && user.id && user.name) {
              usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
            }
          });
        } else if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
          // Caso donde la respuesta tiene formato { data: [...], meta: {...} }
          usersData.data.forEach(user => {
            if (user && user.id && user.name) {
              usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
            }
          });
        }
      }

      // Transformar la respuesta para que coincida con el formato esperado por la UI
      return hitosData.map(hito => {
        // Transformar el responsable: intentar obtener el nombre si solo tenemos el ID
        let responsableNombre = hito.responsible_user_name || hito.responsable;
        if (!responsableNombre && hito.responsible_user_id) {
          responsableNombre = usersMap[hito.responsible_user_id] || `Usuario ${hito.responsible_user_id}`;
        }

        // Transformar los participantes: convertir IDs a nombres si es necesario
        let participantesNombres = [];
        if (Array.isArray(hito.participants)) {
          participantesNombres = hito.participants.map(participante => {
            if (typeof participante === 'object' && participante.name) {
              return participante.name;
            } else if (typeof participante === 'object' && participante.id) {
              return usersMap[participante.id] || `Usuario ${participante.id}`;
            } else if (typeof participante === 'number') {
              // Si es un ID numérico, buscar el nombre
              return usersMap[participante] || `Usuario ${participante}`;
            } else {
              return participante;
            }
          });
        } else if (Array.isArray(hito.participantes)) {
          participantesNombres = hito.participantes.map(participante => {
            if (typeof participante === 'object' && participante.name) {
              return participante.name;
            } else if (typeof participante === 'object' && participante.id) {
              return usersMap[participante.id] || `Usuario ${participante.id}`;
            } else if (typeof participante === 'number') {
              // Si es un ID numérico, buscar el nombre
              return usersMap[participante] || `Usuario ${participante}`;
            } else {
              return participante;
            }
          });
        }

        return {
          id: hito.id,
          tipo: hito.type_id || hito.tipo, // Mapear type_id a tipo 
          fecha: hito.date || hito.fecha,
          titulo: hito.title || hito.titulo,
          descripcion: hito.description || hito.descripcion,
          responsable: responsableNombre,
          participantes: participantesNombres,
          documentos: hito.documents || hito.documentos || [],
          notas: hito.notes || hito.notas || hito.observations || '',
          estado: hito.state || hito.estado || 'completado',
          created_at: hito.created_at || hito.fechaCreacion,
          updated_at: hito.updated_at || hito.fechaActualizacion
        };
      });
    } catch (error) {
      console.error('Error en transformarHitosConUsuarios:', error);
      // En caso de error, devolver los hitos sin transformación pero con estructura base
      return hitosData.map(hito => ({
        id: hito.id,
        tipo: hito.type_id || hito.tipo,
        fecha: hito.date || hito.fecha,
        titulo: hito.title || hito.titulo,
        descripcion: hito.description || hito.descripcion,
        responsable: hito.responsible_user_id || hito.responsible_user_name || hito.responsable || 'Responsable no asignado',
        participantes: Array.isArray(hito.participants) ? hito.participants : (Array.isArray(hito.participantes) ? hito.participantes : []),
        documentos: hito.documents || hito.documentos || [],
        notas: hito.notes || hito.notas || hito.observations || '',
        estado: hito.state || hito.estado || 'completado',
        created_at: hito.created_at || hito.fechaCreacion,
        updated_at: hito.updated_at || hito.fechaActualizacion
      }));
    }
  };

  useEffect(() => {
    const cargarDetalleProyecto = async () => {
      try {
        // Obtener el proyecto específico desde la API
        const response = await proyectosService.getProject(proyecto.id);
        if (response.success) {
          setProyectoDetalle(response.data);
        } else {
          console.error('Error al cargar el proyecto:', response.message);
          // Si falla, usar el proyecto que ya tenemos
          setProyectoDetalle(proyecto);
        }
      } catch (error) {
        console.error('Error al cargar el proyecto:', error);
        // Si falla, usar el proyecto que ya tenemos
        setProyectoDetalle(proyecto);
      } finally {
        // Cargar también los hitos del proyecto y la línea de tiempo de estados
        cargarHitosProyecto();
        cargarTimelineEstados();
      }
    };

    const cargarHitosProyecto = async () => {
      try {
        setLoading(true);
        // Obtener los hitos del proyecto desde la API
        const response = await milestoneService.getMilestonesByProject(proyecto.id);
        // Obtener también los documentos generales del proyecto (no asociados a hitos)
        const documentosResponse = await documentService.getDocumentsByProject(proyecto.id);
        if (response.success) {
          // Obtener la lista de usuarios para mapear IDs a nombres
          const usersResponse = await userService.getUsers({ per_page: 1000 }); // Aumentar el número de usuarios
          const usersMap = {};
          
          if (usersResponse.success && usersResponse.data) {
            // La estructura de la respuesta de usuarios puede ser { users: [...], pagination: {...}, stats: {...} }
            // o { data: [...] } o directamente un array
            let usersData = usersResponse.data.users || usersResponse.data.data || usersResponse.data;
            
            if (Array.isArray(usersData)) {
              usersData.forEach(user => {
                if (user && user.id && user.name) {
                  usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
                }
              });
            } else if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
              // Caso donde la respuesta tiene formato { data: [...], meta: {...} }
              usersData.data.forEach(user => {
                if (user && user.id && user.name) {
                  usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
                }
              });
            }
          }
          


          // Transformar la respuesta para que coincida con el formato esperado por la UI
          const hitosTransformados = (response.data.data || response.data || []).map(hito => {
            // Transformar el responsable: intentar obtener el nombre si solo tenemos el ID
            let responsableNombre = hito.responsible_user_name || hito.responsable;
            if (!responsableNombre && hito.responsible_user_id) {
              responsableNombre = usersMap[hito.responsible_user_id] || `Usuario ${hito.responsible_user_id}`;
            }

            // Transformar los participantes: usar la información detallada si está disponible
            let participantesNombres = [];
            if (Array.isArray(hito.participant_users)) {
              // Usar los nombres directamente desde participant_users
              participantesNombres = hito.participant_users.map(participante => participante.name);
            } else if (Array.isArray(hito.participants)) {
              // Si no está disponible participant_users, usar la lógica anterior
              participantesNombres = hito.participants.map(participante => {
                if (typeof participante === 'object' && participante.name) {
                  return participante.name;
                } else if (typeof participante === 'object' && participante.id) {
                  return usersMap[participante.id] || `Usuario ${participante.id}`;
                } else if (typeof participante === 'number') {
                  // Si es un ID numérico, buscar el nombre
                  return usersMap[participante] || `Usuario ${participante}`;
                } else {
                  return participante;
                }
              });
            } else if (Array.isArray(hito.participantes)) {
              participantesNombres = hito.participantes.map(participante => {
                if (typeof participante === 'object' && participante.name) {
                  return participante.name;
                } else if (typeof participante === 'object' && participante.id) {
                  return usersMap[participante.id] || `Usuario ${participante.id}`;
                } else if (typeof participante === 'number') {
                  // Si es un ID numérico, buscar el nombre
                  return usersMap[participante] || `Usuario ${participante}`;
                } else {
                  return participante;
                }
              });
            }

            return {
              id: hito.id,
              tipo: hito.type_id || hito.tipo, // Mapear type_id a tipo 
              fecha: hito.date || hito.fecha,
              titulo: hito.title || hito.titulo,
              descripcion: hito.description || hito.descripcion,
              responsable: responsableNombre,
              participantes: participantesNombres,
              documentos: hito.documents || hito.documentos || [],
              notas: hito.notes || hito.notas || hito.observations || '', // Mapear observaciones a notas
              estado: hito.state || hito.estado || 'completado', // Valor por defecto
              created_at: hito.created_at || hito.fechaCreacion,
              updated_at: hito.updated_at || hito.fechaActualizacion
            };
          });
          
          // Si se obtuvieron documentos generales del proyecto, crear un hito virtual para ellos
          let hitosFinales = hitosTransformados;
          if (documentosResponse.success) {
            const documentosGenerales = documentosResponse.data.data || documentosResponse.data || [];
            // Filtrar documentos que no estén asociados a ningún hito (milestone_id es nulo o indefinido)
            const documentosSinHito = documentosGenerales.filter(doc => 
              !doc.milestone_id || doc.milestone_id === null || doc.milestone_id === undefined
            );
            
            if (documentosSinHito.length > 0) {
              // Crear un "hito" virtual para documentos generales del proyecto
              const hitoDocumentosGenerales = {
                id: 'general-documents',
                tipo: 999, // Tipo especial para documentos generales
                fecha: new Date().toISOString().split('T')[0],
                titulo: 'Documentos Generales del Proyecto',
                descripcion: 'Documentos no asociados a hitos específicos',
                responsable: 'Sistema',
                participantes: [],
                documentos: documentosSinHito,
                notas: 'Documentos generales del proyecto',
                estado: 'completed',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              // Agregar este hito virtual al principio de la lista
              hitosFinales = [hitoDocumentosGenerales, ...hitosTransformados];
            } else if (hitosTransformados.length > 0) {
              // Si no hay documentos generales pero sí hay hitos con documentos, usar los hitos normales
              hitosFinales = hitosTransformados;
            }
          } else {
            // Si hubo error al obtener documentos generales, usar solo los hitos normales
            console.warn('Error al cargar documentos generales del proyecto:', documentosResponse.message);
            hitosFinales = hitosTransformados;
          }
          
          setHitos(hitosFinales);
        } else {
          console.error('Error al cargar los hitos:', response.message);
          setHitos([]);
        }
      } catch (error) {
        console.error('Error al cargar los hitos:', error);
        setHitos([]);
      } finally {
        setLoading(false);
      }
    };

    const cargarTimelineEstados = async () => {
      try {
        // Cargar la línea de tiempo detallada de estados del proyecto
        const response = await proyectosService.getProjectStateTimeline(proyecto.id);
        if (response.success) {
          // Aquí tendríamos la información detallada de cada estado incluyendo:
          // - usuario que cambió el estado
          // - fecha de inicio del estado
          // - fecha de fin del estado (si aplica)
          // - otros detalles relevantes
          setTimelineEstados(response.data);
        } else {
          console.error('Error al cargar la línea de tiempo de estados:', response.message);
        }
      } catch (error) {
        console.error('Error al cargar la línea de tiempo de estados:', error);
      }
    };

    cargarDetalleProyecto();
  }, [proyecto.id, proyecto]);
  
  const totalDocumentos = useMemo(() => {
    // Contar documentos de todos los hitos (incluyendo hitos virtuales) y documentos generales del proyecto
    return hitos.reduce((total, hito) => total + (hito.documentos?.length || 0), 0);
  }, [hitos]);
  
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

  const handleCrearHito = async (hitoData) => {
    try {
      console.log('=== INICIANDO CREACIÓN DE HITO ===');
      console.log('Datos recibidos del modal:', hitoData);
      
      // Obtener el ID del proyecto correctamente
      const projectId = proyectoDetalle.id || proyectoDetalle.backendId || proyecto.backendId || proyecto.id;
      console.log('ID del proyecto detectado:', projectId);
      
      if (!projectId) {
        console.error('❌ ID del proyecto no encontrado');
        console.log('proyectoDetalle.id:', proyectoDetalle.id);
        console.log('proyectoDetalle.backendId:', proyectoDetalle.backendId);
        console.log('proyecto.backendId:', proyecto.backendId);
        console.log('proyecto.id:', proyecto.id);
        return;
      }
      
      // Validar campos requeridos antes de construir el objeto
      console.log('Validando campos requeridos...');
      
      const tipoId = parseInt(hitoData.tipo);
      console.log('Tipo ID:', tipoId, 'Tipo original:', hitoData.tipo);
      if (!tipoId) {
        console.error('❌ Tipo de hito no especificado o inválido:', hitoData.tipo);
        return;
      }
      
      const title = hitoData.titulo?.toString() || '';
      console.log('Título:', title);
      if (!title.trim()) {
        console.error('❌ Título del hito no especificado');
        return;
      }
      
      const description = hitoData.descripcion?.toString() || '';
      console.log('Descripción:', description);
      if (!description.trim()) {
        console.error('❌ Descripción del hito no especificada');
        return;
      }
      
      const responsible = hitoData.responsable?.toString() || '';
      console.log('Responsable:', responsible);
      if (!responsible.trim()) {
        console.error('❌ Responsable del hito no especificado');
        return;
      }

      // Preparar los datos para enviar al backend
      // Convertimos el responsable y participantes a números enteros
      const responsibleId = parseInt(responsible);
      const participantsIds = Array.isArray(hitoData.participantes) 
        ? hitoData.participantes.map(p => parseInt(p)) 
        : [];
      
      // Validar que los IDs sean válidos
      if (isNaN(responsibleId)) {
        console.error('❌ El ID del responsable no es válido:', responsible);
        return;
      }

      const milestoneData = {
        project_id: projectId,
        type_id: tipoId,
        date: hitoData.fecha || new Date().toISOString().split('T')[0],
        title: title,
        description: description,
        responsible_user_id: responsibleId, // Enviar como ID numérico
        participants: participantsIds, // Enviar como array de IDs numéricos
        notes: hitoData.notas?.toString() || ''
      };
      
      // Eliminar el campo 'responsible' si existe para evitar conflictos con el backend
      // ya que ahora usamos 'responsible_user_id'
      if (milestoneData.hasOwnProperty('responsible')) {
        delete milestoneData.responsible;
      }

      console.log('✅ Datos preparados para enviar al backend:', milestoneData);

      // Manejar documentos - siempre incluir la propiedad aunque esté vacía
      console.log('Documentos en hitoData:', hitoData.documentos);
      if (Array.isArray(hitoData.documentos) && hitoData.documentos.length > 0) {
        console.log('Agregando documentos al objeto:', hitoData.documentos);
        // Mapear los documentos para que tengan la propiedad 'file' en lugar de 'archivo'
        // y otros campos requeridos para el backend
        const documentosMapeados = hitoData.documentos.map(doc => ({
          file: doc.archivo, // Cambiar 'archivo' a 'file' para que el servicio lo reconozca
          name: doc.nombre || doc.nombreOriginal || 'Documento sin nombre',
          type_id: doc.tipo || 10,
          description: doc.descripcion || ''
        }));
        milestoneData.documents = documentosMapeados;
        console.log('Documentos mapeados:', documentosMapeados);
      } else {
        console.log('No hay documentos para agregar');
        milestoneData.documents = []; // Asegurar que la propiedad exista
      }

      console.log('Llamando al servicio para crear hito...');
      
      // Llamar al backend para crear el hito
      const response = await milestoneService.createMilestone(milestoneData);
      
      console.log('Respuesta del backend:', response);
      
      if (response.success) {
        // Obtener la lista de usuarios para mapear IDs a nombres
        const usersResponse = await userService.getUsers({ per_page: 1000 }); // Aumentar el número de usuarios
        const usersMap = {};
        
        if (usersResponse.success && usersResponse.data) {
          // La estructura de la respuesta de usuarios puede ser { users: [...], pagination: {...}, stats: {...} }
          // o { data: [...] } o directamente un array
          let usersData = usersResponse.data.users || usersResponse.data.data || usersResponse.data;
          
          if (Array.isArray(usersData)) {
            usersData.forEach(user => {
              if (user && user.id && user.name) {
                usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
              }
            });
          } else if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
            // Caso donde la respuesta tiene formato { data: [...], meta: {...} }
            usersData.data.forEach(user => {
              if (user && user.id && user.name) {
                usersMap[user.id] = user.name; // Mapear ID a nombre de usuario
              }
            });
          }
        }

        // Transformar y actualizar la lista de hitos con el hito recién creado desde el backend
        // Transformar el responsable: intentar obtener el nombre si solo tenemos el ID
        let responsableNombre = response.data.responsible_user_name || response.data.responsable;
        if (!responsableNombre && response.data.responsible_user_id) {
          responsableNombre = usersMap[response.data.responsible_user_id] || `Usuario ${response.data.responsible_user_id}`;
        }

        // Transformar los participantes: convertir IDs a nombres si es necesario
        let participantesNombres = [];
        if (Array.isArray(response.data.participants)) {
          participantesNombres = response.data.participants.map(participante => {
            if (typeof participante === 'object' && participante.name) {
              return participante.name;
            } else if (typeof participante === 'object' && participante.id) {
              return usersMap[participante.id] || `Usuario ${participante.id}`;
            } else if (typeof participante === 'number') {
              // Si es un ID numérico, buscar el nombre
              return usersMap[participante] || `Usuario ${participante}`;
            } else {
              return participante;
            }
          });
        } else if (Array.isArray(response.data.participantes)) {
          participantesNombres = response.data.participantes.map(participante => {
            if (typeof participante === 'object' && participante.name) {
              return participante.name;
            } else if (typeof participante === 'object' && participante.id) {
              return usersMap[participante.id] || `Usuario ${participante.id}`;
            } else if (typeof participante === 'number') {
              // Si es un ID numérico, buscar el nombre
              return usersMap[participante] || `Usuario ${participante}`;
            } else {
              return participante;
            }
          });
        }

        const nuevoHito = {
          id: response.data.id,
          tipo: response.data.type_id || response.data.tipo,
          fecha: response.data.date || response.data.fecha,
          titulo: response.data.title || response.data.titulo,
          descripcion: response.data.description || response.data.descripcion,
          responsable: responsableNombre,
          participantes: participantesNombres,
          documentos: response.data.documents || response.data.documentos || [],
          notas: response.data.notes || response.data.notas || response.data.observations || '',
          estado: response.data.state || response.data.estado || 'completado',
          created_at: response.data.created_at || response.data.fechaCreacion
        };
        // Recargar todos los hitos para mantener la consistencia en el mapeo de usuarios
        const responseHitos = await milestoneService.getMilestonesByProject(proyecto.id);
        if (responseHitos.success) {
          const hitosOriginales = responseHitos.data.data || responseHitos.data || [];
          const hitosTransformados = await transformarHitosConUsuarios(hitosOriginales);
          setHitos(hitosTransformados);
        }
        // Cerrar el modal
        setShowHitoModal(false);
      } else {
        console.error('❌ Error al crear el hito:', response.message);
        console.error('❌ Detalles de la respuesta:', response);
        console.error('❌ Errores de validación:', response.errors); // Mostrar errores de validación específicos
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    } catch (error) {
      console.error('❌ Error general al crear el hito:', error);
      console.error('❌ Error detalles:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      // Aquí podrías mostrar un mensaje de error al usuario
    }
    console.log('=== FINALIZADO PROCESO DE CREACIÓN DE HITO ===');
  };

  const handleAbrirModal = () => {
    setShowHitoModal(true);
  };

  const handleCerrarModal = () => {
    setShowHitoModal(false);
  };

  const handleCrearDocumento = async (grupoDocumentosData) => {
    // Esta función es para subir documentos al proyecto o a un hito específico
    try {
      // Verificar si los documentos deben asociarse a un hito específico o directamente al proyecto
      if (grupoDocumentosData.milestoneId) {
        // Subir múltiples documentos a un hito específico
        for (const doc of grupoDocumentosData.documentos) {
          const documentData = {
            type_id: doc.tipo || 10,
            file: doc.archivo,
            name: doc.nombre,
            description: grupoDocumentosData.descripcion || '',
            responsible: grupoDocumentosData.responsable || 'Sistema'
          };

          // Llamar al backend para subir cada documento al hito
          const response = await milestoneService.uploadMilestoneDocument(proyecto.id, grupoDocumentosData.milestoneId, documentData);
          
          if (!response.success) {
            console.error('Error al subir el documento al hito:', response.message);
            showNotification('error', `Error al subir ${doc.nombre}: ${response.message}`);
          }
        }
        
        // Recargar los hitos y documentos para obtener los documentos actualizados
        await cargarHitosProyecto();
      } else if (hitos.length > 0) {
        // Si no se especificó hito pero hay hitos, subir al primer hito
        const primerHito = hitos[0];
        for (const doc of grupoDocumentosData.documentos) {
          const documentData = {
            type_id: doc.tipo || 10,
            file: doc.archivo,
            name: doc.nombre,
            description: grupoDocumentosData.descripcion || '',
            responsible: grupoDocumentosData.responsable || 'Sistema'
          };

          const response = await milestoneService.uploadMilestoneDocument(proyecto.id, primerHito.id, documentData);
          
          if (!response.success) {
            console.error('Error al subir el documento:', response.message);
            showNotification('error', `Error al subir ${doc.nombre}: ${response.message}`);
          }
        }
        
        // Recargar los hitos y documentos para obtener los documentos actualizados
        await cargarHitosProyecto();
      } else {
        // Si no hay hitos, subir directamente al proyecto
        for (const doc of grupoDocumentosData.documentos) {
          const documentData = {
            type_id: doc.tipo || 10,
            file: doc.archivo,
            name: doc.nombre,
            description: grupoDocumentosData.descripcion || '',
            responsible: grupoDocumentosData.responsable || 'Sistema',
            project_id: proyectoDetalle.id || proyecto.backendId
          };

          const response = await documentService.createDocument(documentData);
          
          if (!response.success) {
            console.error('Error al subir el documento al proyecto:', response.message);
            showNotification('error', `Error al subir ${doc.nombre}: ${response.message}`);
          }
        }
      }
      
      // Recargar todos los hitos y documentos para actualizar la vista con el nuevo documento
      await cargarHitosProyecto();
      
      showNotification('success', `Grupo de documentación subido exitosamente (${grupoDocumentosData.documentos.length} archivos)`);
    } catch (error) {
      console.error('Error al subir los documentos:', error);
      showNotification('error', `Error al subir la documentación: ${error.message}`);
    }
  };

  const handleAbrirDocumentoModal = () => {
    setShowDocumentoModal(true);
  };

  const handleCerrarDocumentoModal = () => {
    setShowDocumentoModal(false);
  };

  // Función para descargar un documento
  const descargarDocumento = async (documento, hitoId) => {
    try {
      // Obtener el ID del proyecto del estado actual
      const projectId = proyectoDetalle.id || proyecto.id;

      // Usar el servicio de proyectos para descargar el documento
      const blob = await proyectosService.downloadDocument(projectId, documento.id);

      // Crear una URL temporal para el archivo
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal y hacer clic para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.name || documento.nombre || documento.original_name || `documento_${documento.id}`;
      document.body.appendChild(link);
      link.click();

      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
      // Aquí podrías mostrar una notificación de error al usuario
      alert(`Error al descargar el documento: ${error.message}`);
    }
  };

  // Función para iniciar edición de observaciones
  const handleEditObservations = () => {
    setAireObservations(proyectoDetalle.aire_observations || '');
    setEditingObservations(true);
  };

  // Función para cancelar edición de observaciones
  const handleCancelObservations = () => {
    setEditingObservations(false);
    setAireObservations('');
  };

  // Función para guardar observaciones
  const handleSaveObservations = async () => {
    try {
      const updateData = { aire_observations: aireObservations };
      const response = await proyectosService.updateProject(proyectoDetalle.id, updateData);

      if (response.success) {
        setProyectoDetalle(prev => ({ ...prev, aire_observations: aireObservations }));
        setEditingObservations(false);
        setAireObservations('');
        showNotification('success', 'Observaciones de Air-e actualizadas correctamente');
      } else {
        showNotification('error', 'Error al actualizar las observaciones');
      }
    } catch (error) {
      console.error('Error al guardar observaciones:', error);
      showNotification('error', 'Error al guardar las observaciones');
    }
  };

  // Función para iniciar edición de comentarios internos
  const handleEditComments = () => {
    setInternalComments(proyectoDetalle.internal_comments || '');
    setEditingComments(true);
  };

  // Función para cancelar edición de comentarios internos
  const handleCancelComments = () => {
    setEditingComments(false);
    setInternalComments('');
  };

  // Función para guardar comentarios internos
  const handleSaveComments = async () => {
    try {
      const updateData = { internal_comments: internalComments };
      const response = await proyectosService.updateProject(proyectoDetalle.id, updateData);

      if (response.success) {
        setProyectoDetalle(prev => ({ ...prev, internal_comments: internalComments }));
        setEditingComments(false);
        setInternalComments('');
        showNotification('success', 'Comentarios internos actualizados correctamente');
      } else {
        showNotification('error', 'Error al actualizar los comentarios internos');
      }
    } catch (error) {
      console.error('Error al guardar comentarios internos:', error);
      showNotification('error', 'Error al guardar los comentarios internos');
    }
  };

  const renderEstadoTimeline = (estado) => {
    const estadoActual = proyectoDetalle.current_state_id || proyecto.estadoActual;
    const estaCompleto = estado.id < estadoActual;
    const esActual = estado.id === estadoActual;
    const esPendiente = estado.id > estadoActual;

    // Buscar información detallada de este estado en el timeline
    const estadoTimeline = timelineEstados.find(t => t.state_id === estado.id) || {};

    // Obtener el usuario que cambió al estado
    let nombreUsuario = estadoTimeline.user_name;

    // Si no hay información detallada en el timeline, usar información del estado actual del proyecto
    if (!nombreUsuario && esActual && proyectoDetalle.current_state_user) {
      nombreUsuario = proyectoDetalle.current_state_user.name || proyectoDetalle.current_state_user;
    } else if (!nombreUsuario && esActual && proyectoDetalle.current_responsible) {
      nombreUsuario = proyectoDetalle.current_responsible;
    }

    // Si aún no hay nombre de usuario, usar 'Sistema'
    if (!nombreUsuario) {
      nombreUsuario = 'Sistema';
    }

    // Obtener las fechas
    let fechaInicio = estadoTimeline.start_date;

    // Si no hay fecha de inicio en el timeline, usar la fecha de inicio del estado actual del proyecto
    if (!fechaInicio && esActual && proyectoDetalle.current_state_date) {
      fechaInicio = proyectoDetalle.current_state_date;
    }

    const fechaFin = estadoTimeline.end_date;

    return (
      <div key={estado.id} className="flex gap-4 relative">
        {/* Línea vertical */}
        {estado.id < estados.length && (
          <div className={`absolute left-4 top-10 w-0.5 h-full ${estaCompleto ? 'bg-green-500' : 'bg-slate-300'}`}></div>
        )}

        {/* Icono */}
        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
          estaCompleto ? 'bg-green-500' : esActual ? 'bg-blue-500' : 'bg-slate-300'
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
          <div className={`p-4 rounded-lg ${esActual ? 'bg-blue-50 border-2 border-blue-500' : 'bg-slate-50'}`}>
            <h4 className={`font-semibold ${esActual ? 'text-blue-900' : 'text-slate-900'}`}>
              {estado.nombre}
            </h4>
            {(estaCompleto || esActual) && (
              <div className="space-y-1 mt-2 text-sm">
                <p className="text-slate-600">
                  <User className="inline w-3 h-3 mr-1" />
                  {nombreUsuario}
                </p>
                {fechaInicio && (
                  <p className="text-slate-600">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    Desde: {formatearFecha(fechaInicio)}
                  </p>
                )}
                {fechaFin && (
                  <p className="text-slate-600">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    Hasta: {formatearFecha(fechaFin)}
                  </p>
                )}
                {!fechaFin && esActual && fechaInicio && (
                  <p className="text-slate-600 italic">
                    <Clock className="inline w-3 h-3 mr-1" />
                    Estado actual desde {formatearFecha(fechaInicio)}
                  </p>
                )}
              </div>
            )}
            {esActual && (
              <p className="text-sm text-blue-600 mt-1">
                Estado actual - {calcularDiasEnEstado(proyectoDetalle)} días en este estado
              </p>
            )}
            {estaCompleto && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Completado
              </p>
            )}
            {esPendiente && (
              <p className="text-sm text-slate-500 mt-1">
                Pendiente
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <button
          onClick={onVolver}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a lista de proyectos
        </button>
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{proyectoDetalle.name || proyecto.nombre}</h2>
            <p className="text-slate-600 mt-1">ID: {proyectoDetalle.code || proyecto.id}</p>
          </div>
          <div className="text-right">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {calcularPorcentajePorEstado(proyectoDetalle.current_state_id || proyecto.estadoActual || 0)}% Completado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${calcularPorcentajePorEstado(proyectoDetalle.current_state_id || proyecto.estadoActual || 0)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex gap-2 border-t border-slate-200 pt-4">
          <button
            onClick={() => setVistaActiva('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              vistaActiva === 'general'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Información General
          </button>
          <button
            onClick={() => setVistaActiva('hitos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              vistaActiva === 'hitos'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Hitos y Eventos ({hitos.length})
          </button>
          <button
            onClick={() => setVistaActiva('documentos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              vistaActiva === 'documentos'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Documentación ({totalDocumentos})
          </button>
        </div>
      </div>

      {/* Vista General */}
      {vistaActiva === 'general' && (
        <>
      {/* Información General */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Información del Cliente
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Cliente</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.name 
                  : (proyectoDetalle.client?.name || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.name : proyecto.cliente) || 'No especificado')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Tipo de Cliente</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.client_type 
                  : (proyectoDetalle.client?.client_type || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.client_type : 'No especificado'))}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Email del Cliente</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.email 
                  : (proyectoDetalle.client?.email || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.email : 'No especificado'))}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Teléfono del Cliente</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.phone 
                  : (proyectoDetalle.client?.phone || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.phone : 'No especificado'))}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Consumo Mensual del Cliente</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.monthly_consumption 
                  : (proyectoDetalle.client?.monthly_consumption || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.monthly_consumption : 'No especificado'))}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Número NIC</p>
              <p className="font-medium text-slate-900">
                {typeof proyectoDetalle.client === 'object' && proyectoDetalle.client 
                  ? proyectoDetalle.client.nic 
                  : (proyectoDetalle.client?.nic || (typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.nic : 'No especificado'))}
              </p>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Ubicación
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Departamento</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.department || proyecto.departamento || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Municipio</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.municipality || proyecto.municipio || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Dirección</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.address || proyecto.direccion || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Coordenadas</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.coordinates || proyecto.coordenadas || 'No especificadas'}</p>
            </div>
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Especificaciones Técnicas
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Tipo de Sistema</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.system_type || proyectoDetalle.project_type || proyecto.tipoProyecto || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Capacidad DC</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.capacity_dc || proyecto.capacidadDC || 0} kW</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Capacidad AC</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.capacity_ac || proyecto.capacidadAC || 0} kW</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Número de Paneles</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.number_panels || proyecto.numeroPaneles || 0} unidades</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Número de Inversores</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.number_inverters || proyecto.numeroInversores || 0} unidades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información Comercial y Fechas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Comercial */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Información Comercial
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Valor del Contrato</p>
              <p className="font-medium text-slate-900 text-xl">{formatearMoneda(proyectoDetalle.contract_value || proyecto.valorContrato || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Margen Estimado</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.estimated_margin || proyecto.margenEstimado || 0}%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Responsable Comercial</p>
              <p className="font-medium text-slate-900">{proyectoDetalle.responsible_commercial || proyecto.responsableComercial || 'No asignado'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Fecha de Contrato</p>
              <p className="font-medium text-slate-900">{formatearFecha(proyectoDetalle.contract_date || proyecto.fechaContrato)}</p>
            </div>
          </div>
        </div>

        {/* Fechas Clave */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Fechas Clave
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Fecha de Inicio</p>
              <p className="font-medium text-slate-900">{formatearFecha(proyectoDetalle.start_date || proyecto.fechaInicio)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Solicitud Presentada</p>
              <p className="font-medium text-slate-900">{formatearFecha(proyectoDetalle.application_date || proyecto.fechaSolicitudPresentada)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Fecha Estimada Finalización</p>
              <p className="font-medium text-slate-900">{formatearFecha(proyectoDetalle.estimated_completion_date || proyecto.fechaEstimadaFinalizacion)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Días Totales del Proyecto</p>
              <p className="font-medium text-slate-900">{calcularDiasTotales(proyectoDetalle)} días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline de Estados */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Línea de Tiempo del Proyecto</h3>
        <div className="space-y-0">
          {estados.map(estado => renderEstadoTimeline(estado))}
        </div>
      </div>

      {/* Observaciones y Comentarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Observaciones de Air-e</h3>
            {!editingObservations && (
              <button
                onClick={handleEditObservations}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Editar
              </button>
            )}
          </div>
          {editingObservations ? (
            <div className="space-y-3">
              <textarea
                value={aireObservations}
                onChange={(e) => setAireObservations(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                rows={4}
                placeholder="Ingrese las observaciones de Air-e..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveObservations}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelObservations}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700">{proyectoDetalle.aire_observations || proyecto.observacionesAire || 'Sin observaciones'}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Comentarios Internos</h3>
            {!editingComments && (
              <button
                onClick={handleEditComments}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Editar
              </button>
            )}
          </div>
          {editingComments ? (
            <div className="space-y-3">
              <textarea
                value={internalComments}
                onChange={(e) => setInternalComments(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                rows={4}
                placeholder="Ingrese los comentarios internos..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveComments}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Guardar
                </button>
                <button
                  onClick={handleCancelComments}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-slate-700">{proyectoDetalle.internal_comments || proyecto.comentariosInternos || 'Sin comentarios'}</p>
          )}
        </div>
      </div>

      {/* Próxima Acción */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Próxima Acción</h3>
        <p className="text-blue-800 font-medium">{proyectoDetalle.next_action || proyecto.proximaAccion || 'No especificada'}</p>
        {proyectoDetalle.next_action_date && (
          <p className="text-sm text-blue-600 mt-2">
            Fecha programada: {formatearFecha(proyectoDetalle.next_action_date)}
          </p>
        )}
        {proyecto.fechaProximaAccion && !proyectoDetalle.next_action_date && (
          <p className="text-sm text-blue-600 mt-2">
            Fecha programada: {formatearFecha(proyecto.fechaProximaAccion)}
          </p>
        )}
        <p className="text-sm text-blue-700 mt-2">
          Responsable: {proyectoDetalle.current_responsible || proyecto.responsableActual || 'No asignado'}
        </p>
      </div>
      </>
      )}

      {/* Alerta de notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
          notification.type === 'error' ? 'bg-red-500' : 
          notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
        }`}>
          <div className="flex items-start gap-2">
            {notification.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-white hover:text-gray-200 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Vista Hitos y Eventos */}
      {vistaActiva === 'hitos' && (
        <div className="space-y-6">
          {/* Botón para agregar nuevo hito */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <button 
              onClick={handleAbrirModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Nuevo Hito/Evento
            </button>
          </div>

          {/* Timeline de Hitos */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              {/* Spinner de carga */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-slate-600">Cargando hitos y eventos...</p>
            </div>
          ) : hitos.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Historial de Hitos y Eventos</h3>
              <div className="space-y-0">
                {hitos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((hito, index) => (
                  <div key={hito.id} className="flex gap-4 relative pb-8">
                    {/* Línea vertical */}
                    {index < hitos.length - 1 && (
                      <div className="absolute left-6 top-14 w-0.5 h-full bg-slate-200"></div>
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
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: obtenerColorTipoHito(hito.tipo) }}
                              >
                                {obtenerNombreTipoHito(hito.tipo)}
                              </span>
                              <span className="text-sm text-slate-600">
                                {formatearFecha(hito.fecha)}
                              </span>
                            </div>
                            <h4 className="font-semibold text-slate-900 text-lg">{hito.titulo}</h4>
                          </div>
                          <button
                            onClick={() => setHitoSeleccionado(hitoSeleccionado?.id === hito.id ? null : hito)}
                            className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                          >
                            {hitoSeleccionado?.id === hito.id ? 'Ocultar' : 'Ver Detalle'}
                          </button>
                        </div>
                        
                        <p className="text-slate-700 mb-3">{hito.descripcion}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
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
                          <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                            {/* Participantes */}
                            {hito.participantes && hito.participantes.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Participantes:</p>
                                <div className="flex flex-wrap gap-2">
                                  {hito.participantes.map((participante, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-sm">
                                      {typeof participante === 'object' ? participante.name || participante.full_name || participante : participante}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Documentos */}
                            {hito.documentos && hito.documentos.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Documentos:</p>
                                <div className="space-y-2">
                                  {hito.documentos.map((doc) => (
                                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{obtenerIconoTipoDocumento(doc.type_id || doc.tipo || 10)}</span>
                                        <div>
                                          <p className="font-medium text-slate-900">{doc.name || doc.nombre || doc.original_name || 'Documento sin nombre'}</p>
                                          <p className="text-xs text-slate-500">
                                            {obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)} • {doc.size || doc.tamaño || doc.file_size || 'Tamaño desconocido'} • {formatearFecha(doc.uploaded_at || doc.fechaSubida || doc.created_at)}
                                          </p>
                                          {doc.description && (
                                            <p className="text-xs text-slate-600 mt-1 italic">
                                              {doc.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <button 
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Evitar que se expanda/colapse el hito
                                          descargarDocumento(doc, hito.id);
                                        }}
                                        title="Descargar documento"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Notas */}
                            {hito.notas && (
                              <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Notas:</p>
                                <p className="text-sm text-slate-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
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
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay hitos registrados para este proyecto</p>
              <p className="text-sm text-slate-500 mt-2">Agrega el primer hito para comenzar el historial</p>
            </div>
          )}
        </div>
      )}

      {/* Vista Documentos */}
      {vistaActiva === 'documentos' && (
        <div className="space-y-6">
          {/* Botón para subir documento y campo de búsqueda */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <button 
                onClick={handleAbrirDocumentoModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Subir Nuevo Documento
              </button>
              
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar documentación..."
                  value={busquedaDocumentos}
                  onChange={(e) => setBusquedaDocumentos(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Lista de todos los documentos */}
          {totalDocumentos > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Toda la Documentación del Proyecto</h3>
              <div className="space-y-4">
                {hitos.map((hito) => {
                  // Filtrar documentos según texto de búsqueda
                  const documentosFiltrados = hito.documentos && busquedaDocumentos 
                    ? hito.documentos.filter(doc => 
                        (doc.name || doc.nombre || doc.original_name || '').toLowerCase().includes(busquedaDocumentos.toLowerCase()) ||
                        (obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)).toLowerCase().includes(busquedaDocumentos.toLowerCase()) ||
                        (doc.responsible || '').toLowerCase().includes(busquedaDocumentos.toLowerCase())
                      )
                    : hito.documentos || [];
                  
                  if (documentosFiltrados && documentosFiltrados.length > 0) {
                    return (
                      <div key={hito.id} className="border-b border-slate-200 pb-4 last:border-0">
                        {hito.id !== 'general-documents' && (
                          <p className="text-sm font-medium text-slate-700 mb-3">
                            {obtenerIconoTipoHito(hito.tipo)} {hito.titulo} - {formatearFecha(hito.fecha)}
                          </p>
                        )}
                        {hito.id === 'general-documents' && (
                          <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" /> {hito.titulo}
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {documentosFiltrados.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-2xl flex-shrink-0">{obtenerIconoTipoDocumento(doc.type_id || doc.tipo || 10)}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-slate-900 truncate">{doc.name || doc.nombre || doc.original_name || 'Documento sin nombre'}</p>
                                  <p className="text-xs text-slate-500">
                                    {obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)} • {doc.size || doc.tamaño || doc.file_size || 'Tamaño desconocido'}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {doc.responsible || 'Responsable no especificado'} • {formatearFecha(doc.uploaded_at || doc.fechaSubida || doc.created_at)}
                                  </p>
                                  {doc.description && (
                                    <p className="text-xs text-slate-600 mt-1 italic">
                                      {doc.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button 
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation(); // Evitar que se expanda/colapse el hito
                                  descargarDocumento(doc, hito.id);
                                }}
                                title="Descargar documento"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
              
              {/* Mostrar mensaje si no hay resultados de búsqueda */}
              {busquedaDocumentos && !hitos.some(hito => 
                (hito.documentos || []).some(doc => 
                  (doc.name || doc.nombre || doc.original_name || '').toLowerCase().includes(busquedaDocumentos.toLowerCase()) ||
                  (obtenerNombreTipoDocumento(doc.type_id || doc.tipo || 10)).toLowerCase().includes(busquedaDocumentos.toLowerCase()) ||
                  (doc.responsible || '').toLowerCase().includes(busquedaDocumentos.toLowerCase())
                )
              ) && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                  <Paperclip className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No se encontró documentación que coincida con "{busquedaDocumentos}"</p>
                  <p className="text-sm text-slate-500 mt-2">Intenta con otros términos de búsqueda</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Paperclip className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No hay documentación registrada para este proyecto</p>
              <p className="text-sm text-slate-500 mt-2">Sube el primer documento para comenzar</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear hitos */}
      <HitoModal
        isOpen={showHitoModal}
        onClose={handleCerrarModal}
        onSave={handleCrearHito}
        proyecto={proyecto}
      />

      {/* Modal para subir documentos */}
      <DocumentoModal
        isOpen={showDocumentoModal}
        onClose={handleCerrarDocumentoModal}
        onSave={handleCrearDocumento}
        proyecto={proyecto}
      />
    </div>
  );
};

export default DetalleProyecto;
