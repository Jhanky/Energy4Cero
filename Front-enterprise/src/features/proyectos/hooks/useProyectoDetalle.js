import { useState, useEffect } from 'react';
import proyectosService from '../../../services/proyectosService';

export const useProyectoDetalle = (projectId) => {
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarProyecto = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await proyectosService.getProject(projectId);

        if (response.success) {
          setProyecto(response.data);
        } else {
          setError(response.message || 'Error al cargar el proyecto');
        }
      } catch (err) {
        console.error('Error al cargar proyecto:', err);
        setError('Error de conexión al cargar el proyecto');
      } finally {
        setLoading(false);
      }
    };

    cargarProyecto();
  }, [projectId]);

  const actualizarProyecto = async (updateData) => {
    if (!proyecto?.id) return { success: false, message: 'Proyecto no encontrado' };

    try {
      const response = await proyectosService.updateProject(proyecto.id, updateData);

      if (response.success) {
        setProyecto(prev => ({ ...prev, ...updateData }));
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('Error al actualizar proyecto:', err);
      return { success: false, message: 'Error al actualizar el proyecto' };
    }
  };

  return {
    proyecto,
    loading,
    error,
    actualizarProyecto,
    recargarProyecto: () => {
      if (projectId) {
        setLoading(true);
        setError(null);
        // Re-ejecutar el effect
        const cargarProyecto = async () => {
          try {
            const response = await proyectosService.getProject(projectId);
            if (response.success) {
              setProyecto(response.data);
            } else {
              setError(response.message || 'Error al recargar el proyecto');
            }
          } catch (err) {
            setError('Error de conexión al recargar el proyecto');
          } finally {
            setLoading(false);
          }
        };
        cargarProyecto();
      }
    }
  };
};
