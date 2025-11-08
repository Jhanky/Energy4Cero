import apiService from './api';

class SupplierService {
  // Proveedores
  async getSuppliers(params = {}) {
    return await apiService.request('/suppliers', {
      method: 'GET',
      params
    });
  }

  async getSupplier(id) {
    return await apiService.request(`/suppliers/${id}`);
  }

  async createSupplier(supplierData) {
    return await apiService.request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData),
    });
  }

  async updateSupplier(id, supplierData) {
    return await apiService.request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData),
    });
  }

  async deleteSupplier(id) {
    return await apiService.request(`/suppliers/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleSupplierStatus(id) {
    return await apiService.request(`/suppliers/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getSupplierStatistics() {
    return await apiService.request('/suppliers/statistics');
  }

  async getSupplierOptions() {
    return await apiService.request('/suppliers/options');
  }
}

const supplierService = new SupplierService();
export default supplierService;
