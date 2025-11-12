import apiService from './api';

class ClientService {
  // Clientes
  async getClients(params = {}) {
    return await apiService.request('/clients', {
      method: 'GET',
      params
    });
  }

  async getClient(id) {
    return await apiService.request(`/clients/${id}`);
  }

  async createClient(clientData) {
    return await apiService.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, clientData) {
    return await apiService.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id) {
    return await apiService.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkDeleteClients(clientIds) {
    return await apiService.request('/clients/bulk', {
      method: 'DELETE',
      body: JSON.stringify(clientIds),
    });
  }

  async toggleClientStatus(id) {
    return await apiService.request(`/clients/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getClientStatistics() {
    return await apiService.request('/clients/statistics');
  }

  async getClientOptions() {
    return await apiService.request('/clients/options');
  }

  // Importar clientes desde archivo
  async importClients(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Para FormData, necesitamos remover Content-Type header 
    // para que el navegador lo establezca automáticamente
    const headers = { ...apiService.getHeaders() };
    delete headers['Content-Type'];

    return await apiService.request('/clients/import', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  }

  // Exportar clientes a archivo
  async exportClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/clients/export?${queryString}` : '/clients/export';
    
    return await apiService.request(url, {
      method: 'GET',
    });
  }
}

const clientService = new ClientService();
export default clientService;
