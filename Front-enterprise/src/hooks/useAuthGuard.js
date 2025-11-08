import { useEffect } from 'react';
import { useAuth } from './useAuth';
import dataService from '../services/dataService';

/**
 * Hook para proteger rutas y manejar redirección automática
 */
export const useAuthGuard = () => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    // Verificar autenticación cada 30 segundos
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          // Verificar si el token sigue siendo válido usando dataService

        } catch (error) {
          
          // Si hay error, hacer logout automático
          await logout();
        }
      }
    };

    // Verificar inmediatamente
    checkAuth();

    // Configurar verificación periódica
    const interval = setInterval(checkAuth, 300000); // 5 minutos (menos agresivo)

    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  return {
    isAuthenticated: isAuthenticated(),
    logout
  };
};
