import { useState, useEffect } from 'react';
import proyectosService from '../../../services/proyectosService';

export const useProyectoTimeline = (projectId) => {
  const [timelineEstados, setTimelineEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarTimeline = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await proyectosService.getProjectStateTimeline(projectId);

        if (response.success) {
          setTimelineEstados(response.data || []);
        } else {
          console.warn('Error al cargar timeline de estados:', response.message);
          setTimelineEstados([]);
        }
      } catch (err) {
        console.error('Error al cargar timeline de estados:', err);
        setError('Error de conexión al cargar la timeline');
        setTimelineEstados([]);
      } finally {
        setLoading(false);
      }
    };

    cargarTimeline();
  }, [projectId]);

  return {
    timelineEstados,
    loading,
    error
  };
};
