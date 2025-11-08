import apiService from './api';

class InvoiceService {
  // Facturas
  async getInvoices(params = {}) {
    return await apiService.request('/invoices', {
      method: 'GET',
      params
    });
  }

  async getInvoice(id) {
    return await apiService.request(`/invoices/${id}`);
  }

  async createInvoice(invoiceData) {
    // Si hay un archivo, usar FormData
    if (invoiceData.file) {
      const formData = new FormData();

      // Agregar todos los campos excepto el archivo
      Object.keys(invoiceData).forEach(key => {
        if (key !== 'file') {
          formData.append(key, invoiceData[key]);
        }
      });

      // Agregar el archivo
      formData.append('file', invoiceData.file);

      return await apiService.request('/invoices', {
        method: 'POST',
        body: formData,
        headers: {
          // No set Content-Type, let the browser set it with boundary for FormData
        }
      });
    } else {
      // Si no hay archivo, usar JSON normal
      return await apiService.request('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
    }
  }

  async updateInvoice(id, invoiceData) {
    return await apiService.request(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData),
    });
  }

  async deleteInvoice(id) {
    return await apiService.request(`/invoices/${id}`, {
      method: 'DELETE',
    });
  }

  async updateInvoiceStatus(id, status) {
    return await apiService.request(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async uploadInvoiceFile(id, file) {
    const formData = new FormData();
    formData.append('file', file);

    return await apiService.request(`/invoices/${id}/upload-file`, {
      method: 'POST',
      body: formData,
      headers: {
        // No set Content-Type, let the browser set it with boundary for FormData
      }
    });
  }

  async downloadInvoiceFile(id) {
    console.log('🔧 SERVICIO: downloadInvoiceFile llamado', { id });

    const token = localStorage.getItem('auth_token');
    console.log('🔑 Token obtenido:', token ? 'Presente' : 'Ausente');

    const url = `${this.baseURL}/invoices/${id}/download-file?token=${token}`;
    console.log('🌐 URL construida:', url);

    console.log('🪟 Abriendo nueva pestaña...');
    // Abrir directamente en nueva pestaña - el navegador maneja la descarga automáticamente
    window.open(url, '_blank');
    console.log('✅ Nueva pestaña abierta');

    return { success: true, message: 'Descarga iniciada' };
  }

  async getInvoiceStatistics() {
    return await apiService.request('/invoices/statistics');
  }

  async getInvoiceOptions() {
    return await apiService.request('/invoices/options');
  }
}

const invoiceService = new InvoiceService();
export default invoiceService;
