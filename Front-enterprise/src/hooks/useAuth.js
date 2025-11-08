import { useState, useEffect } from 'react';
import dataService from '../services/dataService';
import { ENV_CONFIG } from '../config/environment';

export const useAuth = () => {
  const [usuario, setUsuario] = useState(() => {
    // Inicializar estado desde localStorage para evitar el destello
    const usuarioGuardado = dataService.getCurrentUserFromStorage();
    return (usuarioGuardado && dataService.isAuthenticated()) ? usuarioGuardado : null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verificar si hay una sesión guardada y actualizar si es necesario
    const usuarioGuardado = dataService.getCurrentUserFromStorage();
    const estaAutenticado = dataService.isAuthenticated();
    
    if (usuarioGuardado && estaAutenticado) {
      setUsuario(usuarioGuardado);
    } else {
      setUsuario(null);
    }
    
    // Pequeña demora para estabilizar el estado
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100); // Pequeña demora para evitar destellos

    return () => clearTimeout(timer);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dataService.login(email, password);
      
      if (response.success) {
        
        
        
        
        // Guardar token y usuario en localStorage (por si acaso)
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
          
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
        }
        
        setUsuario(response.data.user);
        
        // Forzar re-render del componente
        setTimeout(() => {
          // Verificación post-login
        }, 100);
        
        return { success: true, user: response.data.user };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dataService.register(userData);
      
      if (response.success) {
        setUsuario(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        setError(response.message);
        return { success: false, message: response.message };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await dataService.logout();
    } catch (error) {
    } finally {
      setUsuario(null);
      setError(null);
      // Forzar recarga de la página para limpiar completamente el estado
      window.location.reload();
    }
  };

  const isAuthenticated = () => {
    const dataAuth = dataService.isAuthenticated();
    const hasUser = usuario !== null;
    const result = dataAuth && hasUser;
    
    return result;
  };

  const getUsuario = () => {
    return usuario;
  };

  const hasPermission = (permission) => {
    return dataService.hasPermission(permission);
  };

  const hasRole = (roleSlug) => {
    return dataService.hasRole(roleSlug);
  };

  const refreshUser = async () => {
    try {
      const response = await dataService.getCurrentUser();
      if (response.success) {
        setUsuario(response.data.user);
        localStorage.setItem(ENV_CONFIG.USER_KEY, JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        // Token no válido, limpiar sesión
        localStorage.removeItem(ENV_CONFIG.TOKEN_KEY);
        localStorage.removeItem(ENV_CONFIG.USER_KEY);
        setUsuario(null);
        return { success: false, message: response.message || 'Sesión no válida' };
      }
    } catch (error) {
      // Si hay error, limpiar sesión pero no hacer logout completo para evitar ciclos
      localStorage.removeItem(ENV_CONFIG.TOKEN_KEY);
      localStorage.removeItem(ENV_CONFIG.USER_KEY);
      setUsuario(null);
      return { success: false, message: error.message || 'Error de conexión' };
    }
  };

  return {
    usuario,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    getUsuario,
    hasPermission,
    hasRole,
    refreshUser
  };
};
