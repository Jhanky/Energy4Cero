import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/authUtils';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated on app load
    const token = authUtils.getToken();
    const userData = authUtils.getCurrentUser();
    
    if (token && userData) {
      setUser(userData);
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const result = await authUtils.login(email, password);
      
      if (result.success) {
        setUser(result.data.user);
        return { success: true, user: result.data.user };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authUtils.logout();
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!authUtils.getToken() && !!authUtils.getCurrentUser();
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.success) {
        setUser(response.data.user);
        // Actualizar también en localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      } else {
        // Token no válido, limpiar sesión
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        return { success: false, message: response.message || 'Sesión no válida' };
      }
    } catch (error) {
      // Si hay error, limpiar sesión pero no hacer logout completo para evitar ciclos
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      return { success: false, message: error.message || 'Error de conexión' };
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    refreshUser, // Agregamos la función refreshUser
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};