import apiService from './api';

// Servicio para la gestión de tareas
export const taskService = {
  // Obtener todas las tareas
  getTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    return await apiService.request(url);
  },

  // Obtener una tarea específica
  getTask: async (id) => {
    return await apiService.request(`/tasks/${id}`);
  },

  // Crear una nueva tarea
  createTask: async (taskData) => {
    // Convertir assigned_user_ids a un array si no lo es
    const processedData = {
      ...taskData,
      assigned_user_ids: Array.isArray(taskData.assigned_user_ids) ? taskData.assigned_user_ids : [taskData.assigned_user_ids]
    };
    
    return await apiService.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(processedData),
    });
  },

  // Actualizar una tarea existente
  updateTask: async (id, taskData) => {
    // Convertir assigned_user_ids a un array si no lo es y está presente
    const processedData = { ...taskData };
    
    if (processedData.assigned_user_ids !== undefined) {
      processedData.assigned_user_ids = Array.isArray(processedData.assigned_user_ids) 
        ? processedData.assigned_user_ids 
        : [processedData.assigned_user_ids];
    }
    
    return await apiService.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(processedData),
    });
  },

  // Eliminar una tarea
  deleteTask: async (id) => {
    return await apiService.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Actualizar el estado de una tarea
  updateTaskStatus: async (id, status) => {
    return await apiService.request(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Obtener tareas asignadas al usuario actual
  getMyTasks: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/tasks/my-tasks?${queryString}` : '/tasks/my-tasks';
    return await apiService.request(url);
  },

  // Obtener estadísticas de tareas
  getTaskStatistics: async () => {
    return await apiService.request('/tasks/statistics');
  }
};

// Servicio para la gestión de evidencias fotográficas
export const taskEvidenceService = {
  // Subir evidencia fotográfica
  uploadEvidence: async (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    // Para FormData, no debemos establecer manualmente Content-Type
    // El navegador lo hará automáticamente con el boundary correcto
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/task-evidences/task/${taskId}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  },

  // Obtener evidencias de una tarea
  getTaskEvidences: async (taskId) => {
    return await apiService.request(`/task-evidences/task/${taskId}`);
  },

  // Obtener una evidencia específica
  getTaskEvidence: async (taskId, evidenceId) => {
    return await apiService.request(`/task-evidences/${taskId}/${evidenceId}`);
  },

  // Eliminar una evidencia
  deleteEvidence: async (taskId, evidenceId) => {
    return await apiService.request(`/task-evidences/${taskId}/${evidenceId}`, {
      method: 'DELETE',
    });
  },

  // Obtener URL para descargar imagen de evidencia
  getEvidenceFileUrl: async (evidenceId) => {
    return await apiService.request(`/task-evidences/${evidenceId}/url`);
  }
};

export default {
  ...taskService,
  ...taskEvidenceService
};