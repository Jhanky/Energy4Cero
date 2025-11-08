// Configuración para datos de prueba
export const MOCK_CONFIG = {
  // Activar datos de prueba (DESHABILITADO) - Usar backend Laravel real
  ENABLED: false,
  
  // Simular delay de red (en milisegundos)
  NETWORK_DELAY: 500,
  
  // Credenciales de prueba para login
  TEST_CREDENTIALS: {
    email: 'admin@enterprise.com',
    password: 'password'
  },
  
  // Configuración de datos de prueba
  MOCK_DATA: {
    // Número de proyectos a mostrar por defecto
    DEFAULT_PROJECTS_COUNT: 10,
    
    // Número de usuarios de prueba
    USERS_COUNT: 5,
    
    // Número de clientes de prueba
    CLIENTS_COUNT: 8
  }
};

// Función para verificar si los datos de prueba están habilitados
export const isMockDataEnabled = () => {
  return MOCK_CONFIG.ENABLED;
};

// Función para obtener las credenciales de prueba
export const getTestCredentials = () => {
  return MOCK_CONFIG.TEST_CREDENTIALS;
};
