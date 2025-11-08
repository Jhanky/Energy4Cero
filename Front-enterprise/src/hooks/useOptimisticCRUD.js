import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar operaciones CRUD optimistas
 * 
 * @param {Array} initialData - Datos iniciales
 * @param {Function} apiService - Servicio API para operaciones CRUD
 * @returns {Object} Estado y funciones para operaciones CRUD optimistas
 */
const useOptimisticCRUD = (initialData = [], apiService) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crear un nuevo elemento
   * 
   * @param {Object} newItem - Nuevo elemento a crear
   * @param {Function} createApiCall - Función de la API para crear
   * @returns {Promise} Promesa con el resultado de la operación
   */
  const createItem = useCallback(async (newItem, createApiCall) => {
    setLoading(true);
    setError(null);
    
    // Guardamos el estado anterior por si necesitamos revertir
    const previousData = [...data];
    
    try {
      // Actualización optimista: agregamos el nuevo elemento al estado inmediatamente
      const tempId = `temp_${Date.now()}`;
      const tempItem = { ...newItem, id: tempId, _isOptimistic: true };
      setData(prevData => [...prevData, tempItem]);
      
      // Llamada a la API
      const response = await createApiCall(newItem);
      
      if (response.success) {
        // Reemplazamos el elemento temporal con el real
        setData(prevData => 
          prevData.map(item => 
            item.id === tempId 
              ? { ...response.data, _isOptimistic: false } 
              : item
          )
        );
        return response;
      } else {
        // Si falla, revertimos el cambio
        setData(previousData);
        throw new Error(response.message || 'Error al crear elemento');
      }
    } catch (err) {
      // En caso de error, revertimos
      setData(previousData);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  /**
   * Actualizar un elemento existente
   * 
   * @param {Object} item - Elemento a actualizar
   * @param {Function} updateApiCall - Función de la API para actualizar
   * @returns {Promise} Promesa con el resultado de la operación
   */
  const updateItem = useCallback(async (item, updateApiCall) => {
    setLoading(true);
    setError(null);
    
    // Guardamos el estado anterior por si necesitamos revertir
    const previousData = [...data];
    
    try {
      // Actualización optimista: actualizamos el elemento en el estado inmediatamente
      setData(prevData => 
        prevData.map(dataItem => 
          dataItem.id === item.id 
            ? { ...dataItem, ...item, _isOptimistic: true } 
            : dataItem
        )
      );
      
      // Llamada a la API
      const response = await updateApiCall(item.id, item);
      
      if (response.success) {
        // Actualizamos con los datos reales
        setData(prevData => 
          prevData.map(dataItem => 
            dataItem.id === item.id 
              ? { ...response.data, _isOptimistic: false } 
              : dataItem
          )
        );
        return response;
      } else {
        // Si falla, revertimos el cambio
        setData(previousData);
        throw new Error(response.message || 'Error al actualizar elemento');
      }
    } catch (err) {
      // En caso de error, revertimos
      setData(previousData);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  /**
   * Eliminar un elemento
   * 
   * @param {Object} item - Elemento a eliminar
   * @param {Function} deleteApiCall - Función de la API para eliminar
   * @returns {Promise} Promesa con el resultado de la operación
   */
  const deleteItem = useCallback(async (item, deleteApiCall) => {
    setLoading(true);
    setError(null);
    
    // Guardamos el estado anterior por si necesitamos revertir
    const previousData = [...data];
    
    try {
      // Actualización optimista: removemos el elemento del estado inmediatamente
      setData(prevData => prevData.filter(dataItem => dataItem.id !== item.id));
      
      // Llamada a la API
      const response = await deleteApiCall(item.id);
      
      if (response.success) {
        // El elemento ya fue removido del estado
        return response;
      } else {
        // Si falla, revertimos el cambio
        setData(previousData);
        throw new Error(response.message || 'Error al eliminar elemento');
      }
    } catch (err) {
      // En caso de error, revertimos
      setData(previousData);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  /**
   * Cambiar el estado de un elemento (activo/inactivo)
   * 
   * @param {Object} item - Elemento a cambiar de estado
   * @param {Function} toggleApiCall - Función de la API para cambiar estado
   * @returns {Promise} Promesa con el resultado de la operación
   */
  const toggleItemStatus = useCallback(async (item, toggleApiCall) => {
    setLoading(true);
    setError(null);
    
    // Guardamos el estado anterior por si necesitamos revertir
    const previousData = [...data];
    
    try {
      // Actualización optimista: cambiamos el estado inmediatamente
      setData(prevData => 
        prevData.map(dataItem => 
          dataItem.id === item.id 
            ? { ...dataItem, is_active: !dataItem.is_active, _isOptimistic: true } 
            : dataItem
        )
      );
      
      // Llamada a la API
      const response = await toggleApiCall(item.id);
      
      if (response.success) {
        // Actualizamos con los datos reales
        setData(prevData => 
          prevData.map(dataItem => 
            dataItem.id === item.id 
              ? { ...response.data, _isOptimistic: false } 
              : dataItem
          )
        );
        return response;
      } else {
        // Si falla, revertimos el cambio
        setData(previousData);
        throw new Error(response.message || 'Error al cambiar estado');
      }
    } catch (err) {
      // En caso de error, revertimos
      setData(previousData);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [data]);

  /**
   * Recargar datos desde la API
   * 
   * @param {Function} loadApiCall - Función de la API para cargar datos
   * @returns {Promise} Promesa con el resultado de la operación
   */
  const reloadData = useCallback(async (loadApiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loadApiCall();
      
      if (response.success) {
        setData(response.data || []);
        return response;
      } else {
        throw new Error(response.message || 'Error al cargar datos');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    data,
    loading,
    error,
    
    // Funciones CRUD optimistas
    createItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
    reloadData,
    
    // Setter para actualizar datos manualmente
    setData
  };
};

export default useOptimisticCRUD;
