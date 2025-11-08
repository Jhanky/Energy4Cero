import apiService from './api';

class TicketService {
  constructor() {
    this.apiService = apiService;
  }

  // Crear un nuevo ticket
  async createTicket(ticketData) {
    try {
      // Preparar FormData para enviar datos y archivos
      const formData = new FormData();
      
      // Agregar campos básicos del ticket
      for (const [key, value] of Object.entries(ticketData)) {
        if (key === 'archivos' && Array.isArray(value)) {
          // Si hay archivos adjuntos, agregarlos al FormData
          value.forEach((archivo, index) => {
            if (archivo.archivo) { // Solo si es un archivo real, no solo información
              formData.append(`archivos[${index}]`, archivo.archivo, archivo.nombre);
            }
          });
        } else if (Array.isArray(value)) {
          // Convertir arrays a strings si no son archivos
          formData.append(key, value.join(','));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }

      // Asegurarnos de que no se establezca manualmente Content-Type
      // para que el navegador lo configure automáticamente con boundary
      const headers = { ...this.apiService.getHeaders() };
      delete headers['Content-Type'];

      return await this.apiService.request('/tickets', {
        method: 'POST',
        body: formData,
        headers: headers,
        isFormData: true
      });
    } catch (error) {
      console.error('Error al crear ticket:', error);
      throw error;
    }
  }

  // Obtener lista de tickets
  async getTickets(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/tickets?${queryString}` : '/tickets';
      
      return await this.apiService.request(url);
    } catch (error) {
      console.error('Error al obtener tickets:', error);
      throw error;
    }
  }

  // Obtener un ticket específico
  async getTicket(id) {
    try {
      return await this.apiService.request(`/tickets/${id}`);
    } catch (error) {
      console.error(`Error al obtener ticket ${id}:`, error);
      throw error;
    }
  }

  // Actualizar un ticket
  async updateTicket(id, ticketData) {
    try {
      // Preparar FormData para enviar datos y archivos
      const formData = new FormData();
      
      // Asegurarnos de incluir el método PUT para Laravel
      formData.append('_method', 'PUT');
      
      // Agregar campos del ticket
      for (const [key, value] of Object.entries(ticketData)) {
        if (key === 'archivos' && Array.isArray(value)) {
          // Si hay archivos adjuntos, agregarlos al FormData
          value.forEach((archivo, index) => {
            if (archivo.archivo) { // Solo si es un archivo real
              formData.append(`archivos[${index}]`, archivo.archivo, archivo.nombre);
            }
          });
        } else if (Array.isArray(value)) {
          // Convertir arrays a strings si no son archivos
          formData.append(key, value.join(','));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }

      // Asegurarnos de que no se establezca manualmente Content-Type
      const headers = { ...this.apiService.getHeaders() };
      delete headers['Content-Type'];

      return await this.apiService.request(`/tickets/${id}`, {
        method: 'POST', // Usamos POST con _method=PUT para Laravel
        body: formData,
        headers: headers,
        isFormData: true
      });
    } catch (error) {
      console.error(`Error al actualizar ticket ${id}:`, error);
      throw error;
    }
  }

  // Eliminar un ticket
  async deleteTicket(id) {
    try {
      return await this.apiService.request(`/tickets/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error al eliminar ticket ${id}:`, error);
      throw error;
    }
  }

  // Cambiar el estado de un ticket
  async updateTicketStatus(id, statusData) {
    try {
      return await this.apiService.request(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(statusData),
      });
    } catch (error) {
      console.error(`Error al actualizar estado del ticket ${id}:`, error);
      throw error;
    }
  }

  // Agregar un comentario a un ticket
  async addCommentToTicket(id, commentData) {
    try {
      return await this.apiService.request(`/tickets/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData),
      });
    } catch (error) {
      console.error(`Error al agregar comentario al ticket ${id}:`, error);
      throw error;
    }
  }

  // Obtener comentarios de un ticket
  async getTicketComments(id, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/tickets/${id}/comments?${queryString}` : `/tickets/${id}/comments`;
      
      return await this.apiService.request(url);
    } catch (error) {
      console.error(`Error al obtener comentarios del ticket ${id}:`, error);
      throw error;
    }
  }

  // Subir archivos adjuntos a un ticket existente
  async attachFilesToTicket(id, files) {
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      files.forEach((file, index) => {
        formData.append(`archivos[${index}]`, file, file.name);
      });

      // Asegurarnos de que no se establezca manualmente Content-Type
      const headers = { ...this.apiService.getHeaders() };
      delete headers['Content-Type'];

      return await this.apiService.request(`/tickets/${id}/attachments`, {
        method: 'POST',
        body: formData,
        headers: headers,
        isFormData: true
      });
    } catch (error) {
      console.error(`Error al adjuntar archivos al ticket ${id}:`, error);
      throw error;
    }
  }

  // Descargar un archivo adjunto
  async downloadAttachment(ticketId, attachmentId) {
    try {
      const url = `${this.apiService.baseURL}/tickets/${ticketId}/attachments/${attachmentId}`;
      const headers = this.apiService.getHeaders();
      
      // Realizar la solicitud y manejar la respuesta como blob
      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Obtener el blob de la respuesta
      const blob = await response.blob();
      
      // Crear un objeto URL para el blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Devolver la URL para que el componente pueda usarla
      return downloadUrl;
    } catch (error) {
      console.error(`Error al descargar archivo adjunto ${attachmentId} del ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // Eliminar un archivo adjunto
  async removeAttachment(ticketId, attachmentId) {
    try {
      return await this.apiService.request(`/tickets/${ticketId}/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error al eliminar archivo adjunto ${attachmentId} del ticket ${ticketId}:`, error);
      throw error;
    }
  }
}

const ticketService = new TicketService();
export default ticketService;