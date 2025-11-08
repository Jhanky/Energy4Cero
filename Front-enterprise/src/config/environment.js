// Configuración del entorno
export const ENV_CONFIG = {
  // URL base de la API - se puede cambiar aquí o usando variables de entorno
  // Valor por defecto para desarrollo local
  // Para producción, se sobrescribe con la variable VITE_API_URL (ver .env.production)
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  COLOMBIA_API_BASE_URL: 'https://api-colombia.com/api/v1',
  
  // Configuración de desarrollo
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Usar datos de prueba (para desarrollo sin backend) - CAMBIADO A FALSE PARA USAR BACKEND REAL
  USE_MOCK_DATA: false, // Usar backend real de Laravel
  
  // Timeout para peticiones
  REQUEST_TIMEOUT: 10000,
  
  // Configuración de autenticación
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user'
};

// Función para obtener la URL base de la API
export const getApiBaseUrl = () => {
  return ENV_CONFIG.API_BASE_URL;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => {
  return ENV_CONFIG.IS_DEVELOPMENT;
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return ENV_CONFIG.IS_PRODUCTION;
};
