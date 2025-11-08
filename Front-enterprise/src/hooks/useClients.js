import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

export const useClients = (params = {}) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async (newParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataService.getClients({ ...params, ...newParams });
      setClients(response.data?.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients
  };
};
