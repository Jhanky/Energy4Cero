import apiService from './api';

class CotizacionesService {
  // Obtener todas las cotizaciones
  async getCotizaciones(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/quotations?${queryString}` : '/quotations';
      console.log(`📥 Solicitando cotizaciones con URL: ${url}`);
      const response = await apiService.request(url);
      console.log('📥 Respuesta de cotizaciones:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener cotizaciones:', error);
      throw error;
    }
  }

  // Obtener una cotización específica
  async getCotizacion(id) {
    try {
      console.log(`📥 Solicitando cotización con ID: ${id}`);
      const response = await apiService.request(`/quotations/${id}`);
      console.log(`📥 Respuesta para cotización ${id}:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error al obtener cotización ${id}:`, error);
      throw error;
    }
  }

  // Crear nueva cotización
  async createCotizacion(cotizacionData) {
    try {
      // Agregar log para depuración
      console.log('📤 Enviando datos de cotización al backend:', JSON.stringify(cotizacionData, null, 2));
      
      const response = await apiService.request('/quotations', {
        method: 'POST',
        body: JSON.stringify(cotizacionData)
      });
      
      console.log('📥 Respuesta del backend:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al crear cotización:', error);
      throw error;
    }
  }

  // Actualizar cotización
  async updateCotizacion(id, cotizacionData) {
    try {
      return await apiService.request(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cotizacionData)
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Eliminar cotización
  async deleteCotizacion(id) {
    try {
      return await apiService.request(`/quotations/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      
      throw error;
    }
  }

  // Cambiar estado de cotización
  async changeCotizacionStatus(id, statusId) {
    try {
      // Validar que el statusId sea un número válido
      const numericStatusId = parseInt(statusId, 10);
      if (isNaN(numericStatusId)) {
        console.error('❌ El statusId no es un número válido:', statusId);
        throw new Error(`El ID de estado no es válido: ${statusId}`);
      }
      
      console.log('📤 Enviando solicitud de cambio de estado:', {
        url: `/quotations/${id}/status`,
        method: 'POST',
        status_id: numericStatusId
      });
      
      // Crear FormData para enviar el _method como parámetro de formulario
      const formData = new FormData();
      formData.append('status_id', numericStatusId);
      formData.append('_method', 'PATCH');
      
      // Para FormData, necesitamos remover Content-Type header 
      // para que el navegador lo establezca automáticamente
      const headers = { ...apiService.getHeaders() };
      delete headers['Content-Type'];

      const response = await apiService.request(`/quotations/${id}/status`, {
        method: 'POST',
        body: formData,
        headers: headers, // Usar los headers modificados
      });
      
      console.log('📥 Respuesta del cambio de estado:', response);
      return response;
    } catch (error) {
      
      console.error('❌ Error en cambio de estado:', error);
      throw error;
    }
  }

  // Obtener estadísticas de cotizaciones
  async getStatistics() {
    try {
      return await apiService.request('/quotations/statistics');
    } catch (error) {
      
      throw error;
    }
  }

  // Obtener estados de cotizaciones
  async getStatuses() {
    try {
      return await apiService.request('/quotation-statuses');
    } catch (error) {
      
      throw error;
    }
  }

  // Generar PDF de cotización
  async generatePDF(id) {
    try {
      return await apiService.request(`/quotations/${id}/pdf`);
    } catch (error) {
      
      throw error;
    }
  }

  // Generar PDF con PDFKit
  async generatePDFKit(id) {
    try {
      return await apiService.request(`/quotations/${id}/pdfkit`);
    } catch (error) {
      
      throw error;
    }
  }
}

export const cotizacionesService = new CotizacionesService();
export default cotizacionesService;
