import api from './api';

// --- Paneles ---
export const getPanels = async (params = {}) => {
  try {
    const response = await api.get('/panels', params);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const getPanel = async (id) => {
  try {
    const response = await api.get(`/panels/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const createPanel = async (panelData) => {
  try {
    const response = await api.post('/panels', panelData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const updatePanel = async (id, panelData) => {
  try {
    // Laravel expects PUT/PATCH for multipart/form-data to be POST with _method field
    const formData = new FormData();
    for (const key in panelData) {
      formData.append(key, panelData[key]);
    }
    formData.append('_method', 'PUT'); // Simulate PUT request

    const response = await api.post(`/panels/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const deletePanel = async (id) => {
  try {
    const response = await api.delete(`/panels/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const togglePanelStatus = async (id) => {
  try {
    const response = await api.patch(`/panels/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

// --- Inversores ---
export const getInverters = async (params = {}) => {
  try {
    const response = await api.get('/inverters', params);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const getInverter = async (id) => {
  try {
    const response = await api.get(`/inverters/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const createInverter = async (inverterData) => {
  try {
    const response = await api.post('/inverters', inverterData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const updateInverter = async (id, inverterData) => {
  try {
    const formData = new FormData();
    for (const key in inverterData) {
      formData.append(key, inverterData[key]);
    }
    formData.append('_method', 'PUT');

    const response = await api.post(`/inverters/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const deleteInverter = async (id) => {
  try {
    const response = await api.delete(`/inverters/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const toggleInverterStatus = async (id) => {
  try {
    const response = await api.patch(`/inverters/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

// --- Baterías ---
export const getBatteries = async (params = {}) => {
  try {
    const response = await api.get('/batteries', params);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const getBattery = async (id) => {
  try {
    const response = await api.get(`/batteries/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const createBattery = async (batteryData) => {
  try {
    const response = await api.post('/batteries', batteryData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const updateBattery = async (id, batteryData) => {
  try {
    const formData = new FormData();
    for (const key in batteryData) {
      formData.append(key, batteryData[key]);
    }
    formData.append('_method', 'PUT');

    const response = await api.post(`/batteries/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const deleteBattery = async (id) => {
  try {
    const response = await api.delete(`/batteries/${id}`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};

export const toggleBatteryStatus = async (id) => {
  try {
    const response = await api.patch(`/batteries/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    
    throw error;
  }
};
