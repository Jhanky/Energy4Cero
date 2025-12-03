import { useState, useEffect } from 'react';
import milestoneService from '../../../services/milestoneService';
import userService from '../../../services/userService';
import documentService from '../../../services/documentService';

export const useProyectoHitos = (projectId) => {
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función auxiliar para transformar los hitos y mapear IDs de usuarios a nombres
  const transformarHitosConUsuarios = async (hitosData) => {
    try {
      // Obtener la lista de usuarios para mapear IDs a nombres
      const usersResponse = await userService.getUsers({ per_page: 1000 });
      const usersMap = {};

      if (usersResponse.success && usersResponse.data) {
        let usersData = usersResponse.data.users || usersResponse.data.data || usersResponse.data;

        if (Array.isArray(usersData)) {
          usersData.forEach(user => {
            if (user && user.id && user.name) {
              usersMap[user.id] = user.name;
            }
          });
        } else if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
          usersData.data.forEach(user => {
            if (user && user.id && user.name) {
              usersMap[user.id] = user.name;
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

        // Transformar los participantes
        let participantesNombres = [];
        if (Array.isArray(hito.participant_users)) {
          participantesNombres = hito.participant_users.map(participante => participante.name);
        } else if (Array.isArray(hito.participants)) {
          participantesNombres = hito.participants.map(participante => {
            if (typeof participante === 'object' && participante.name) {
              return participante.name;
            } else if (typeof participante === 'object' && participante.id) {
              return usersMap[participante.id] || `Usuario ${participante.id}`;
            } else if (typeof participante === 'number') {
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
              return usersMap[participante] || `Usuario ${participante}`;
            } else {
              return participante;
            }
          });
        }

        return {
          id: hito.id,
          tipo: hito.type_id || hito.tipo,
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
    const cargarHitos = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener los hitos del proyecto
        const response = await milestoneService.getMilestonesByProject(projectId);

        if (response.success) {
          const hitosOriginales = response.data.data || response.data || [];
          const hitosTransformados = await transformarHitosConUsuarios(hitosOriginales);

          // Obtener documentos generales del proyecto
          const documentosResponse = await documentService.getDocumentsByProject(projectId);
          let hitosFinales = hitosTransformados;

          if (documentosResponse.success) {
            const documentosGenerales = documentosResponse.data.data || documentosResponse.data || [];
            const documentosSinHito = documentosGenerales.filter(doc =>
              !doc.milestone_id || doc.milestone_id === null || doc.milestone_id === undefined
            );

            if (documentosSinHito.length > 0) {
              const hitoDocumentosGenerales = {
                id: 'general-documents',
                tipo: 999,
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

              hitosFinales = [hitoDocumentosGenerales, ...hitosTransformados];
            }
          }

          setHitos(hitosFinales);
        } else {
          setError(response.message || 'Error al cargar los hitos');
          setHitos([]);
        }
      } catch (err) {
        console.error('Error al cargar hitos:', err);
        setError('Error de conexión al cargar los hitos');
        setHitos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarHitos();
  }, [projectId]);

  const crearHito = async (hitoData) => {
    try {
      // Validar campos requeridos
      if (!hitoData.tipo || !hitoData.titulo?.trim() || !hitoData.descripcion?.trim() || !hitoData.responsable?.trim()) {
        return { success: false, message: 'Todos los campos son requeridos' };
      }

      // Preparar datos para el backend
      const responsibleId = parseInt(hitoData.responsable);
      const participantsIds = Array.isArray(hitoData.participantes)
        ? hitoData.participantes.map(p => parseInt(p))
        : [];

      if (isNaN(responsibleId)) {
        return { success: false, message: 'El ID del responsable no es válido' };
      }

      const milestoneData = {
        project_id: projectId,
        type_id: parseInt(hitoData.tipo),
        date: hitoData.fecha || new Date().toISOString().split('T')[0],
        title: hitoData.titulo,
        description: hitoData.descripcion,
        responsible_user_id: responsibleId,
        participants: participantsIds,
        notes: hitoData.notas?.toString() || ''
      };

      // Agregar documentos si existen
      if (Array.isArray(hitoData.documentos) && hitoData.documentos.length > 0) {
        const documentosMapeados = hitoData.documentos.map(doc => ({
          file: doc.archivo,
          name: doc.nombre || doc.nombreOriginal || 'Documento sin nombre',
          type_id: doc.tipo || 10,
          description: doc.descripcion || ''
        }));
        milestoneData.documents = documentosMapeados;
      } else {
        milestoneData.documents = [];
      }

      const response = await milestoneService.createMilestone(milestoneData);

      if (response.success) {
        // Recargar hitos para mantener consistencia
        const responseHitos = await milestoneService.getMilestonesByProject(projectId);
        if (responseHitos.success) {
          const hitosOriginales = responseHitos.data.data || responseHitos.data || [];
          const hitosTransformados = await transformarHitosConUsuarios(hitosOriginales);
          setHitos(hitosTransformados);
        }
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error al crear hito:', err);
      return { success: false, message: 'Error al crear el hito' };
    }
  };

  const recargarHitos = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const response = await milestoneService.getMilestonesByProject(projectId);
      if (response.success) {
        const hitosOriginales = response.data.data || response.data || [];
        const hitosTransformados = await transformarHitosConUsuarios(hitosOriginales);
        setHitos(hitosTransformados);
      }
    } catch (err) {
      console.error('Error al recargar hitos:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    hitos,
    loading,
    error,
    crearHito,
    recargarHitos
  };
};
