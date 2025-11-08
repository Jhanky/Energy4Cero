import { taskService } from '../../../services/taskService';

// Modelo para la gestión de tareas
export const taskModel = {
  // Estado inicial
  initialState: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    statistics: null,
    myTasks: [],
  },

  // Acciones
  actions: {
    // Obtener todas las tareas
    fetchTasks: async (params = {}) => {
      try {
        const response = await taskService.getTasks(params);
        if (response.success) {
          return {
            success: true,
            data: response.data.tasks,
            pagination: response.data.pagination,
            stats: response.data.stats,
          };
        } else {
          return { success: false, message: response.message || 'Error al obtener tareas' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Obtener tareas asignadas al usuario actual
    fetchMyTasks: async (params = {}) => {
      try {
        const response = await taskService.getMyTasks(params);
        if (response.success) {
          return {
            success: true,
            data: response.data.tasks,
            pagination: response.data.pagination,
          };
        } else {
          return { success: false, message: response.message || 'Error al obtener mis tareas' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Obtener una tarea específica
    fetchTask: async (id) => {
      try {
        const response = await taskService.getTask(id);
        if (response.success) {
          return { success: true, data: response.data.task };
        } else {
          return { success: false, message: response.message || 'Error al obtener tarea' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Crear una nueva tarea
    createTask: async (taskData) => {
      try {
        const response = await taskService.createTask(taskData);
        if (response.success) {
          return { success: true, data: response.data.task };
        } else {
          return { success: false, message: response.message || 'Error al crear tarea' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Actualizar una tarea existente
    updateTask: async (id, taskData) => {
      try {
        const response = await taskService.updateTask(id, taskData);
        if (response.success) {
          return { success: true, data: response.data.task };
        } else {
          return { success: false, message: response.message || 'Error al actualizar tarea' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Actualizar el estado de una tarea
    updateTaskStatus: async (id, status) => {
      try {
        const response = await taskService.updateTaskStatus(id, status);
        if (response.success) {
          return { success: true, data: response.data.task };
        } else {
          return { success: false, message: response.message || 'Error al actualizar estado de tarea' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Eliminar una tarea
    deleteTask: async (id) => {
      try {
        const response = await taskService.deleteTask(id);
        if (response.success) {
          return { success: true };
        } else {
          return { success: false, message: response.message || 'Error al eliminar tarea' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    },

    // Obtener estadísticas de tareas
    getTaskStatistics: async () => {
      try {
        const response = await taskService.getTaskStatistics();
        if (response.success) {
          return { success: true, data: response.data.statistics };
        } else {
          return { success: false, message: response.message || 'Error al obtener estadísticas' };
        }
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
  }
};