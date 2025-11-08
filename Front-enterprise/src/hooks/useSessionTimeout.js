import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import dataService from '../services/dataService';

/**
 * Hook para manejar el timeout de sesión y redirección automática
 */
export const useSessionTimeout = () => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  // Función para verificar la validez de la sesión
  const checkSession = useCallback(async () => {
    if (!isAuthenticated()) return;

    try {

      await dataService.getCurrentUser();
      setSessionExpired(false);
      
    } catch (error) {
      
      setSessionExpired(true);
      
      // Hacer logout automático después de un breve delay
      setTimeout(async () => {
        await logout();
      }, 2000);
    }
  }, [isAuthenticated, logout]);

  // Verificar sesión periódicamente
  useEffect(() => {
    if (!isAuthenticated()) return;

    // Verificar inmediatamente
    checkSession();

    // Configurar verificación cada 10 minutos (menos agresivo)
    const interval = setInterval(checkSession, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkSession, isAuthenticated]);

  // Manejar eventos de visibilidad de la página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated()) {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [checkSession, isAuthenticated]);

  return {
    sessionExpired,
    checkSession
  };
};
