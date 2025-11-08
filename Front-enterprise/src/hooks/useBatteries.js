import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

export const useBatteries = (params = {}) => {
  const [batteries, setBatteries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBatteries = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataService.getBatteries({ ...params, ...newParams });
      setBatteries(response.data?.batteries || response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar baterías');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchBatteries();
  }, [fetchBatteries]);

  const createBattery = async (batteryData) => {
    try {
      const response = await dataService.createBattery(batteryData);
      if (response.success) {
        await fetchBatteries(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al crear batería');
    }
  };

  const updateBattery = async (id, batteryData) => {
    try {
      const response = await dataService.updateBattery(id, batteryData);
      if (response.success) {
        await fetchBatteries(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al actualizar batería');
    }
  };

  const deleteBattery = async (id) => {
    try {
      const response = await dataService.deleteBattery(id);
      if (response.success) {
        await fetchBatteries(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al eliminar batería');
    }
  };

  const toggleBatteryStatus = async (id) => {
    try {
      const response = await dataService.toggleBatteryStatus(id);
      if (response.success) {
        await fetchBatteries(); // Refrescar la lista
      }
      return response;
    } catch (err) {
      throw new Error(err.message || 'Error al cambiar estado de la batería');
    }
  };

  return {
    batteries,
    loading,
    error,
    refetch: fetchBatteries,
    createBattery,
    updateBattery,
    deleteBattery,
    toggleBatteryStatus
  };
};
