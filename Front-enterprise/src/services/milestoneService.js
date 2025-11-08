import apiService from './api';

class MilestoneService {
  // Hitos (Milestones)
  async getMilestones(params = {}) {
    return await apiService.request('/milestones', {
      method: 'GET',
      params
    });
  }

  async getMilestone(id) {
    return await apiService.request(`/milestones/${id}`);
  }

  async getMilestonesByProject(projectId, params = {}) {
    return await apiService.request(`/projects/${projectId}/milestones`, {
      method: 'GET',
      params
    });
  }

  async createMilestone(milestoneData) {
    console.log('=== INICIANDO SERVICIO createMilestone ===');
    console.log('Datos recibidos en el servicio:', milestoneData);
    
    // Verificar si hay documentos con archivos para determinar el tipo de envío
    const hasFileUploads = milestoneData.documents && 
      Array.isArray(milestoneData.documents) && 
      milestoneData.documents.some(doc => doc.file);
    
    console.log('¿Tiene archivos para subir?', hasFileUploads);
    
    if (hasFileUploads) {
      // Usar FormData para manejar archivos
      console.log('Usando FormData para manejar archivos...');
      const formData = new FormData();
      
      // Add basic milestone data
      formData.append('type_id', milestoneData.type_id);
      formData.append('date', milestoneData.date);
      formData.append('title', milestoneData.title);
      formData.append('description', milestoneData.description);
      formData.append('responsible_user_id', milestoneData.responsible_user_id); // Usar el nuevo campo
      
      console.log('Agregando participantes:', milestoneData.participants);
      // Add participants if present
      if (milestoneData.participants && Array.isArray(milestoneData.participants)) {
        milestoneData.participants.forEach((participant, index) => {
          console.log(`Agregando participante ${index}:`, participant);
          formData.append(`participants[${index}]`, participant);
        });
      }
      
      // Add notes if present
      if (milestoneData.notes) {
        formData.append('notes', milestoneData.notes);
      }

      console.log('Agregando documentos:', milestoneData.documents);
      // Handle file uploads for documents
      if (milestoneData.documents && Array.isArray(milestoneData.documents)) {
        milestoneData.documents.forEach((doc, index) => {
          console.log(`Procesando documento ${index}:`, {
            hasFile: !!doc.file,
            name: doc.name || (doc.file && doc.file.name),
            type_id: doc.type_id
          });
          if (doc.file) {
            formData.append(`documents[${index}][file]`, doc.file);
            formData.append(`documents[${index}][type_id]`, doc.type_id);
            formData.append(`documents[${index}][name]`, doc.name || doc.file.name);
            formData.append(`documents[${index}][description]`, doc.description || '');
          }
        });
      }

      console.log('FormData construido, llamando a API...');
      
      // Para FormData, necesitamos usar headers especiales
      // Tomamos los headers base pero excluimos Content-Type para que el navegador lo establezca automáticamente
      const baseHeaders = apiService.getHeaders();
      console.log('Headers base:', baseHeaders);
      
      // Creamos headers especiales para FormData
      const formDataHeaders = { ...baseHeaders };
      delete formDataHeaders['Content-Type']; // Permitir que el navegador establezca el Content-Type automáticamente
      console.log('Headers para FormData:', formDataHeaders);

      const endpoint = `/projects/${milestoneData.project_id}/milestones`;
      console.log('Endpoint a llamar:', endpoint);

      const response = await apiService.request(endpoint, {
        method: 'POST',
        body: formData,
        headers: formDataHeaders, // Usar los headers especiales para FormData
      });
      
      console.log('Respuesta recibida del backend:', response);
      console.log('=== FINALIZADO SERVICIO createMilestone ===');
      
      return response;
    } else {
      // Usar JSON para solicitudes sin archivos (más fácil de depurar)
      console.log('Usando JSON para solicitud sin archivos...');
      
      // Preparar datos para enviar como JSON
      const jsonData = {
        project_id: milestoneData.project_id,
        type_id: milestoneData.type_id,
        date: milestoneData.date,
        title: milestoneData.title,
        description: milestoneData.description,
        responsible_user_id: milestoneData.responsible_user_id, // Usar el nuevo campo
        participants: milestoneData.participants || [],
        notes: milestoneData.notes || ''
      };
      
      console.log('Datos JSON a enviar:', jsonData);
      
      const endpoint = `/projects/${milestoneData.project_id}/milestones`;
      console.log('Endpoint a llamar:', endpoint);

      const response = await apiService.request(endpoint, {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...apiService.getHeaders()
        }
      });
      
      console.log('Respuesta recibida del backend:', response);
      console.log('=== FINALIZADO SERVICIO createMilestone ===');
      
      return response;
    }
  }

  async updateMilestone(id, milestoneData) {
    // Handle file uploads if present
    const formData = new FormData();
    
    // Add basic milestone data
    if (milestoneData.project_id) formData.append('project_id', milestoneData.project_id);
    if (milestoneData.type_id) formData.append('type_id', milestoneData.type_id);
    if (milestoneData.date) formData.append('date', milestoneData.date);
    if (milestoneData.title) formData.append('title', milestoneData.title);
    if (milestoneData.description) formData.append('description', milestoneData.description);
    if (milestoneData.responsible_user_id) formData.append('responsible_user_id', milestoneData.responsible_user_id);
    
    // Add participants if present
    if (milestoneData.participants && Array.isArray(milestoneData.participants)) {
      milestoneData.participants.forEach((participant, index) => {
        formData.append(`participants[${index}]`, participant);
      });
    }
    
    // Add notes if present
    if (milestoneData.notes) {
      formData.append('notes', milestoneData.notes);
    }

    // Handle file uploads for documents
    if (milestoneData.documents && Array.isArray(milestoneData.documents)) {
      milestoneData.documents.forEach((doc, index) => {
        if (doc.file) {
          formData.append(`documents[${index}][file]`, doc.file);
          formData.append(`documents[${index}][type_id]`, doc.type_id);
          formData.append(`documents[${index}][name]`, doc.name || doc.file.name);
          formData.append(`documents[${index}][description]`, doc.description || '');
        }
      });
    }

    // Add method override for Laravel
    formData.append('_method', 'PUT');

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/milestones/${id}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  async deleteMilestone(id) {
    return await apiService.request(`/milestones/${id}`, {
      method: 'DELETE',
    });
  }



  // Types
  async getMilestoneTypes() {
    return await apiService.request('/milestone-types');
  }

  // Statistics
  async getMilestoneStatistics() {
    return await apiService.request('/milestones/statistics');
  }

  // Upload document to milestone - using the correct route from backend
  async uploadMilestoneDocument(projectId, milestoneId, documentData) {
    const formData = new FormData();
    formData.append('type_id', documentData.type_id);
    formData.append('file', documentData.file);
    formData.append('name', documentData.name);
    if (documentData.responsible) {
      formData.append('responsible', documentData.responsible);
    }
    if (documentData.date) {
      formData.append('date', documentData.date);
    }
    if (documentData.description) {
      formData.append('description', documentData.description);
    }

    // For FormData, we need to remove Content-Type header so browser sets it automatically
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request(`/projects/${projectId}/documents/milestone/${milestoneId}`, {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }


}

const milestoneService = new MilestoneService();
export default milestoneService;