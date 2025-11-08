import apiService from './api';

class ProjectService {
  // Proyectos
  async getProjects(params = {}) {
    return await apiService.request('/projects', {
      method: 'GET',
      params
    });
  }

  async getProject(id) {
    return await apiService.request(`/projects/${id}`);
  }

  async createProject(projectData) {
    return await apiService.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return await apiService.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return await apiService.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProjectState(id, stateData) {
    return await apiService.request(`/projects/${id}/state`, {
      method: 'PATCH',
      body: JSON.stringify(stateData),
    });
  }

  async getProjectStatistics() {
    return await apiService.request('/projects/statistics');
  }

  // Hitos (Milestones)
  async getMilestones(projectId, params = {}) {
    return await apiService.request(`/projects/${projectId}/milestones`, {
      method: 'GET',
      params
    });
  }

  async getMilestone(projectId, milestoneId) {
    return await apiService.request(`/projects/${projectId}/milestones/${milestoneId}`);
  }

  async createMilestone(projectId, milestoneData) {
    return await apiService.request(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async updateMilestone(projectId, milestoneId, milestoneData) {
    return await apiService.request(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(milestoneData),
    });
  }

  async deleteMilestone(projectId, milestoneId) {
    return await apiService.request(`/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  }

  async updateMilestoneState(projectId, milestoneId, stateData) {
    return await apiService.request(`/projects/${projectId}/milestones/${milestoneId}/state`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  // Documentos (Documents)
  async getDocuments(projectId, params = {}) {
    return await apiService.request(`/projects/${projectId}/documents`, {
      method: 'GET',
      params
    });
  }

  async getDocument(projectId, documentId) {
    return await apiService.request(`/projects/${projectId}/documents/${documentId}`);
  }

  async createDocument(projectId, documentData) {
    // Handle file upload with FormData
    const formData = new FormData();
    formData.append('type_id', documentData.type_id);
    formData.append('responsible', documentData.responsible);
    formData.append('date', documentData.date);
    formData.append('name', documentData.name);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  async updateDocument(projectId, documentId, documentData) {
    // Handle file upload with FormData
    const formData = new FormData();
    
    if (documentData.type_id) formData.append('type_id', documentData.type_id);
    if (documentData.responsible) formData.append('responsible', documentData.responsible);
    if (documentData.date) formData.append('date', documentData.date);
    if (documentData.name) formData.append('name', documentData.name);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    // Add method override for Laravel
    formData.append('_method', 'PUT');

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/projects/${projectId}/documents/${documentId}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  async deleteDocument(projectId, documentId) {
    return await apiService.request(`/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(projectId, documentId) {
    const url = `${apiService.baseURL}/projects/${projectId}/documents/${documentId}/download`;
    const headers = apiService.getHeaders();
    
    const response = await fetch(url, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error al descargar el documento: ${response.status}`);
    }

    return await response.blob();
  }

  async getDocumentTypes() {
    return await apiService.request('/document-types');
  }

  // Tipos de estados (States)
  async getProjectStates() {
    return await apiService.request('/project-states');
  }

  async getProjectStateType(id) {
    return await apiService.request(`/project-states/${id}`);
  }

  async createProjectStateType(stateData) {
    return await apiService.request('/project-states', {
      method: 'POST',
      body: JSON.stringify(stateData),
    });
  }

  async updateProjectStateType(id, stateData) {
    return await apiService.request(`/project-states/${id}`, {
      method: 'PUT',
      body: JSON.stringify(stateData),
    });
  }

  async deleteProjectStateType(id) {
    return await apiService.request(`/project-states/${id}`, {
      method: 'DELETE',
    });
  }

  // Milestone types
  async getMilestoneTypes() {
    return await apiService.request('/milestone-types');
  }

  // Proyecto hitos (Project milestones)
  async getProjectMilestones(projectId) {
    return await apiService.request(`/projects/${projectId}/milestones`);
  }

  // Proyecto documentos (Project documents)
  async getProjectDocuments(projectId) {
    return await apiService.request(`/projects/${projectId}/documents`);
  }

  // Proyecto estadísticas (Project statistics)
  async getProjectDetailsStatistics(projectId) {
    return await apiService.request(`/projects/${projectId}/statistics`);
  }
}

const projectService = new ProjectService();
export default projectService;