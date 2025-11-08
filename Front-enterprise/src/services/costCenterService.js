import apiService from './api';

class CostCenterService {
  // Centros de Costos
  async getCostCenters(params = {}) {
    return await apiService.request('/cost-centers', {
      method: 'GET',
      params
    });
  }

  async getCostCenter(id) {
    return await apiService.request(`/cost-centers/${id}`);
  }

  async createCostCenter(costCenterData) {
    return await apiService.request('/cost-centers', {
      method: 'POST',
      body: JSON.stringify(costCenterData),
    });
  }

  async updateCostCenter(id, costCenterData) {
    return await apiService.request(`/cost-centers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(costCenterData),
    });
  }

  async deleteCostCenter(id) {
    return await apiService.request(`/cost-centers/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleCostCenterStatus(id) {
    return await apiService.request(`/cost-centers/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getCostCenterStatistics() {
    return await apiService.request('/cost-centers/statistics');
  }

  async getCostCenterOptions() {
    return await apiService.request('/cost-centers/options');
  }
}

const costCenterService = new CostCenterService();
export default costCenterService;
