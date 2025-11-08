import apiService from './api';

class StateService {
  // Estados generales
  async getStates(params = {}) {
    return await apiService.request('/states', {
      method: 'GET',
      params
    });
  }

  async getState(id) {
    return await apiService.request(`/states/${id}`);
  }

  async createState(stateData) {
    return await apiService.request('/states', {
      method: 'POST',
      body: JSON.stringify(stateData),
    });
  }

  async updateState(id, stateData) {
    return await apiService.request(`/states/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  async deleteState(id) {
    return await apiService.request(`/states/${id}`, {
      method: 'DELETE',
    });
  }

  // Estados de proyecto
  async getProjectStates(params = {}) {
    return await apiService.request('/project-states', {
      method: 'GET',
      params
    });
  }

  async getProjectState(id) {
    return await apiService.request(`/project-states/${id}`);
  }

  async createProjectState(stateData) {
    return await apiService.request('/project-states', {
      method: 'POST',
      body: JSON.stringify(stateData),
    });
  }



  async deleteProjectState(id) {
    return await apiService.request(`/project-states/${id}`, {
      method: 'DELETE',
    });
  }

  // Estados de hito
  async getMilestoneStates(params = {}) {
    return await apiService.request('/milestone-states', {
      method: 'GET',
      params
    });
  }

  async getMilestoneState(id) {
    return await apiService.request(`/milestone-states/${id}`);
  }

  async createMilestoneState(stateData) {
    return await apiService.request('/milestone-states', {
      method: 'POST',
      body: JSON.stringify(stateData),
    });
  }



  async deleteMilestoneState(id) {
    return await apiService.request(`/milestone-states/${id}`, {
      method: 'DELETE',
    });
  }

  // Actualizar estado de proyecto
  async updateProjectState(projectId, stateData) {
    return await apiService.request(`/projects/${projectId}/state`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  // Actualizar estado de hito
  async updateMilestoneState(milestoneId, stateData) {
    return await apiService.request(`/milestones/${milestoneId}/state`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  // Transiciones de estado
  async getStateTransitions(projectId) {
    return await apiService.request(`/projects/${projectId}/state-transitions`);
  }

  async getStateTransitionsByType(type) {
    return await apiService.request(`/state-transitions?type=${type}`);
  }

  // Estadísticas de estados
  async getStateStatistics(params = {}) {
    return await apiService.request('/states/statistics', {
      method: 'GET',
      params
    });
  }

  async getProjectStateStatistics() {
    return await apiService.request('/project-states/statistics');
  }

  async getMilestoneStateStatistics() {
    return await apiService.request('/milestone-states/statistics');
  }

  // Timeline de estados de proyecto
  async getProjectStateTimeline(projectId) {
    return await apiService.request(`/states/projects/${projectId}/timeline`);
  }

  // Validar si una transición de estado es válida
  async validateStateTransition(projectId, fromStateId, toStateId) {
    const transitionData = {
      from_state_id: fromStateId,
      to_state_id: toStateId
    };
    
    return await apiService.request(`/projects/${projectId}/validate-state-transition`, {
      method: 'POST',
      body: JSON.stringify(transitionData),
    });
  }

  // Obtener estados disponibles para transición
  async getAvailableStateTransitions(projectId, currentStateId) {
    return await apiService.request(`/projects/${projectId}/available-transitions/${currentStateId}`);
  }
}

const stateService = new StateService();
export default stateService;
