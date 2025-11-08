import apiService from './api';

export const getDepartments = async () => {
  try {
    const response = await apiService.request('/departments');
    return response;
  } catch (error) {
    console.error('Error en getDepartments:', error);
    throw error;
  }
};

export const getCitiesByDepartment = async (departmentId) => {
  try {
    const response = await apiService.request(`/cities/department/${departmentId}`);
    return response;
  } catch (error) {
    console.error('Error en getCitiesByDepartment:', error);
    throw error;
  }
};
