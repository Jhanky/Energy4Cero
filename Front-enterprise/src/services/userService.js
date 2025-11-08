import apiService from './api';

class UserService {
  // Usuarios
  async getUsers(params = {}) {
    return await apiService.request('/users', {
      method: 'GET',
      params
    });
  }

  async getUser(id) {
    return await apiService.request(`/users/${id}`);
  }

  async createUser(userData) {
    return await apiService.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return await apiService.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return await apiService.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id) {
    return await apiService.request(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getUserStatistics() {
    return await apiService.request('/users/statistics');
  }

  async getUserOptions() {
    const response = await this.getUsers({ per_page: 100 });
    if (response.success && response.data) {
      return response.data.data.map(user => ({
        value: user.id,
        label: `${user.name} - ${user.position || user.role?.name || 'Usuario'}`
      }));
    }
    return [];
  }
}

const userService = new UserService();
export default userService;