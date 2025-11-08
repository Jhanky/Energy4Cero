// Simple auth utility for direct API calls
import { getApiBaseUrl } from '../config/environment';

export const authUtils = {
  async login(email, password) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Store token and user
        localStorage.setItem('auth_token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Credenciales incorrectas' };
      }
    } catch (error) {
      
      return { success: false, message: 'Error de conexión. Verifique que el backend esté ejecutándose.' };
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      // Si hay un error al parsear JSON, limpiar el localStorage y devolver null
      console.warn('Error parsing user from localStorage:', error);
      localStorage.removeItem('user'); // Limpiar el dato corrupto
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('auth_token');
  }
};