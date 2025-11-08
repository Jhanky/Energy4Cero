import apiService from './api';

class DocumentService {
  // Documentos (Documents)
  async getDocuments(params = {}) {
    return await apiService.request('/documents', {
      method: 'GET',
      params
    });
  }

  async getDocument(id) {
    return await apiService.request(`/documents/${id}`);
  }

  async getDocumentsByProject(projectId, params = {}) {
    return await apiService.request(`/projects/${projectId}/documents`, {
      method: 'GET',
      params
    });
  }

  async getDocumentsByMilestone(milestoneId, params = {}) {
    return await apiService.request(`/milestones/${milestoneId}/documents`, {
      method: 'GET',
      params
    });
  }

  async createDocument(documentData) {
    // Handle file upload with FormData
    const formData = new FormData();
    
    if (documentData.project_id) formData.append('project_id', documentData.project_id);
    if (documentData.milestone_id) formData.append('milestone_id', documentData.milestone_id);
    formData.append('type_id', documentData.type_id);
    formData.append('responsible', documentData.responsible);
    formData.append('date', documentData.date);
    formData.append('name', documentData.name);
    
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request('/documents', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  async updateDocument(id, documentData) {
    // Handle file upload with FormData
    const formData = new FormData();
    
    if (documentData.project_id) formData.append('project_id', documentData.project_id);
    if (documentData.milestone_id) formData.append('milestone_id', documentData.milestone_id);
    if (documentData.type_id) formData.append('type_id', documentData.type_id);
    if (documentData.responsible) formData.append('responsible', documentData.responsible);
    if (documentData.date) formData.append('date', documentData.date);
    if (documentData.name) formData.append('name', documentData.name);
    if (documentData.description) formData.append('description', documentData.description);
    
    if (documentData.file) {
      formData.append('file', documentData.file);
    }

    // Add method override for Laravel
    formData.append('_method', 'PUT');

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/documents/${id}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  async deleteDocument(id) {
    return await apiService.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(id) {
    const url = `${apiService.baseURL}/documents/${id}/download`;
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

  async previewDocument(id) {
    const url = `${apiService.baseURL}/documents/${id}/preview`;
    const headers = apiService.getHeaders();
    
    const response = await fetch(url, {
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error al previsualizar el documento: ${response.status}`);
    }

    return await response.blob();
  }

  // Types
  async getDocumentTypes() {
    return await apiService.request('/document-types');
  }

  // Statistics
  async getDocumentStatistics() {
    return await apiService.request('/documents/statistics');
  }

  // Upload multiple documents
  async uploadMultipleDocuments(documentsData) {
    const formData = new FormData();
    
    documentsData.forEach((doc, index) => {
      if (doc.file) {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][type_id]`, doc.type_id);
        formData.append(`documents[${index}][name]`, doc.name || doc.file.name);
        formData.append(`documents[${index}][description]`, doc.description || '');
        if (doc.project_id) formData.append(`documents[${index}][project_id]`, doc.project_id);
        if (doc.milestone_id) formData.append(`documents[${index}][milestone_id]`, doc.milestone_id);
        if (doc.responsible) formData.append(`documents[${index}][responsible]`, doc.responsible);
        if (doc.date) formData.append(`documents[${index}][date]`, doc.date);
      }
    });

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request('/documents/multiple', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }
}

const documentService = new DocumentService();
export default documentService;