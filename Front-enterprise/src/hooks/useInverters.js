import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

export const useInverters = (params = {}) => {
  const [inverters, setInverters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInverters = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataService.getInverters({ ...params, ...newParams });
      setInverters(response.data?.inverters || response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar inversores');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInverters();
  }, [fetchInverters]);

  const createInverter = async (inverterData) => {
    try {
      const response = await dataService.createInverter(inverterData);
      if (response.success) {
        await fetchInverters(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al crear inversor');
    }
  };

  const updateInverter = async (id, inverterData) => {
    try {
      const response = await dataService.updateInverter(id, inverterData);
      if (response.success) {
        await fetchInverters(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar inversor');
    }
  };

  const deleteInverter = async (id) => {
    try {
      const response = await dataService.deleteInverter(id);
      if (response.success) {
        await fetchInverters(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al eliminar inversor');
    }
  };

  const toggleInverterStatus = async (id) => {
    try {
      const response = await dataService.toggleInverterStatus(id);
      if (response.success) {
        await fetchInverters(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al cambiar estado del inversor');
    }
  };

  return {
    inverters,
    loading,
    error,
    refetch: fetchInverters,
    createInverter,
    updateInverter,
    deleteInverter,
    toggleInverterStatus
  };
};
