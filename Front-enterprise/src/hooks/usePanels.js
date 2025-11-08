import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

export const usePanels = (params = {}) => {
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPanels = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataService.getPanels({ ...params, ...newParams });
      console.log('🔧 Respuesta de getPanels:', response);
      // Verificar la estructura de los datos
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          // Si data es un array directamente
          setPanels(response.data);
        } else if (response.data.panels && Array.isArray(response.data.panels)) {
          // Si data tiene una propiedad panels que es un array
          setPanels(response.data.panels);
        } else {
          // Si no coincide con ninguna estructura esperada
          console.warn('🔧 Estructura de datos inesperada:', response.data);
          setPanels([]);
        }
      } else {
        setPanels([]);
      }
    } catch (err) {
      console.error('🔧 Error al cargar paneles:', err);
      setError(err.message || 'Error al cargar paneles');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPanels();
  }, [fetchPanels]);

  const createPanel = async (panelData) => {
    try {
      const response = await dataService.createPanel(panelData);
      if (response.success) {
        await fetchPanels(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al crear panel');
    }
  };

  const updatePanel = async (id, panelData) => {
    try {
      const response = await dataService.updatePanel(id, panelData);
      if (response.success) {
        await fetchPanels(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar panel');
    }
  };


  const deletePanel = async (id) => {
    try {
      console.log('🔧 Llamando a dataService.deletePanel con ID:', id);
      console.log('🔧 Tipo de ID:', typeof id);
      const response = await dataService.deletePanel(id);
      if (response.success) {
        await fetchPanels(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      console.error('🔧 Error en deletePanel del hook:', err);
      throw new Error(err.message || 'Error al eliminar panel');
    }
  };

  const togglePanelStatus = async (id) => {
    try {
      const response = await dataService.togglePanelStatus(id);
      if (response.success) {
        await fetchPanels(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al cambiar estado del panel');
    }
  };

  return {
    panels,
    loading,
    error,
    refetch: fetchPanels,
    createPanel,
    updatePanel,
    deletePanel,
    togglePanelStatus
  };
};
