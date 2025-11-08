// Servicio de API para conectar con el backend Laravel
import { getApiBaseUrl, ENV_CONFIG } from '../config/environment';
// Servicio de API para conectar con el backend Laravel

class ApiService {
  constructor() {
    this.baseURL = getApiBaseUrl();
    this.token = localStorage.getItem(ENV_CONFIG.TOKEN_KEY);
  }

  // Actualizar token cuando el usuario hace login
  updateToken(token) {
    this.token = token;
  }

  // Configurar headers por defecto
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Obtener token del localStorage cada vez para asegurar que esté actualizado
    const token = localStorage.getItem(ENV_CONFIG.TOKEN_KEY);

    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      // 
      // 
    } else {
      // 
      // 
    }

    return headers;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      credentials: 'include', // Include credentials (cookies) with requests for proper authentication
      ...options,
    };

    // Determinar si se está enviando FormData
    if (options.body instanceof FormData) {
      // Para FormData, no establecemos Content-Type manualmente
      // El navegador lo hará automáticamente con el boundary correcto
      config.headers = this.getHeaders();
      delete config.headers['Content-Type'];
    } else {
      // Para otros tipos de datos, usar headers normales
      config.headers = this.getHeaders();
    }

    
    
    
    
    
    
    

    try {
      
      const response = await fetch(url, config);
      
      
      
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      
      
      
      // Si la respuesta es 401 (no autenticado), manejar según el contexto
      if (response.status === 401) {
        
        
        console.log('🚫 Es endpoint de login:', endpoint.includes('/auth/login'));
        
        // Solo limpiar sesión si no es un endpoint de login
        if (!endpoint.includes('/auth/login')) {
          
          this.handleUnauthorized();
          throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
        } else {
          // Para login, obtener el mensaje del servidor
          // No lanzar error aquí, dejar que se procese la respuesta JSON
          
        }
      }

      // Leer el cuerpo de la respuesta una sola vez y manejarlo apropiadamente
      let data;
      let responseText = '';
      
      try {
        // Primero intentar leer como texto para poder manejar errores mejor
        responseText = await response.text();
        
        // Si el texto está vacío, devolver objeto vacío
        if (!responseText.trim()) {
          data = {};
        } else {
          // Intentar parsear como JSON
          try {
            data = JSON.parse(responseText);
          } catch (jsonParseError) {
            // Si no se puede parsear como JSON, devolver el texto como mensaje
            data = {
              success: false,
              message: responseText
            };
          }
        }
      } catch (readError) {
        // Si no se puede leer el cuerpo de la respuesta, crear un objeto de error
        data = {
          success: false,
          message: `Error al leer la respuesta del servidor: ${readError.message}`
        };
      }

      console.log('📄 Datos procesados:', data);
      
      
      if (data && typeof data === 'object') {
        console.log('📄 Keys del objeto:', Object.keys(data));
        if (data.data) {
          
          console.log('📄 Data keys:', Object.keys(data.data));
          if (Array.isArray(data.data)) {
            
          } else if (data.data.data) {
            
          }
        }
      }

      if (!response.ok) {
        
        
        
        
        // Para errores 401 en login, devolver la respuesta con el mensaje del servidor
        if (response.status === 401 && endpoint.includes('/auth/login')) {
          return {
            success: false,
            message: data.message || 'Credenciales incorrectas'
          };
        }
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      
      
      return data;
    } catch (error) {
      
      
      
      
      
      
      // Si es un error de red, mostrar mensaje específico
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        
        console.error('❌ Error de red al intentar conectar con el backend:', error);
        console.error('📡 Verifique que el backend esté corriendo en la URL:', this.baseURL);
        throw new Error('Error de conexión. Verifique su conexión a internet y que el backend esté corriendo.');
      }
      
      throw error;
    }
  }

  // Manejar sesión no autorizada
  handleUnauthorized() {
    
    this.token = null;
    localStorage.removeItem(ENV_CONFIG.TOKEN_KEY);
    localStorage.removeItem(ENV_CONFIG.USER_KEY);
    
    // No recargar automáticamente aquí, dejar que el componente gestione la redirección
    // para evitar ciclos de recarga
    
  }

  // Métodos de autenticación
  async login(email, password) {
    try {
      
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      

      if (response.success && response.data.token) {
        
        this.token = response.data.token;
        localStorage.setItem(ENV_CONFIG.TOKEN_KEY, this.token);
        localStorage.setItem(ENV_CONFIG.USER_KEY, JSON.stringify(response.data.user));
        
        
      }

      return response;
    } catch (error) {
      
      throw error;
    }
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem(ENV_CONFIG.TOKEN_KEY, this.token);
      localStorage.setItem(ENV_CONFIG.USER_KEY, JSON.stringify(response.data.user));
    }

    return response;
  }

  async logout() {
    try {
      
      await this.request('/auth/logout', {
        method: 'POST',
      });
      
    } catch (error) {
      
    } finally {
      
      this.token = null;
      localStorage.removeItem(ENV_CONFIG.TOKEN_KEY);
      localStorage.removeItem(ENV_CONFIG.USER_KEY);
      
    }
  }

  async getCurrentUser() {
    
    const response = await this.request('/auth/me');
    
    return response;
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
    });

    if (response.success && response.data.token) {
      this.token = response.data.token;
      localStorage.setItem('auth_token', this.token);
    }

    return response;
  }

  // Métodos para roles
  async getRoles() {
    const response = await this.request('/roles');
    return response;
  }

  async getRole(id) {
    const response = await this.request(`/roles/${id}`);
    return response;
  }

  async createRole(roleData) {
    const response = await this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
    return response;
  }

  async updateRole(id, roleData) {
    const response = await this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    return response;
  }

  async deleteRole(id) {
    const response = await this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
    return response;
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated() {
    const token = localStorage.getItem(ENV_CONFIG.TOKEN_KEY);
    const user = localStorage.getItem(ENV_CONFIG.USER_KEY);

    return !!token && !!user;
  }

  // Método para obtener el usuario actual del localStorage
  getCurrentUserFromStorage() {
    const userData = localStorage.getItem(ENV_CONFIG.USER_KEY);
    
    return userData ? JSON.parse(userData) : null;
  }

  // Método para verificar permisos del usuario
  hasPermission(permission) {
    const user = this.getCurrentUserFromStorage();
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    return user.role.permissions.includes(permission);
  }

  // Método para verificar rol del usuario
  hasRole(roleSlug) {
    const user = this.getCurrentUserFromStorage();
    
    
    if (!user || !user.role) {
      
      return false;
    }
    
    return user.role.slug === roleSlug;
  }

  // Métodos para gestión de usuarios
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    return await this.request(url);
  }

  async getUser(id) {
    
    return await this.request(`/users/${id}`);
  }

  async createUser(userData) {
    
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    
    return await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    
    return await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleUserStatus(id) {
    
    return await this.request(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getUserStatistics() {
    
    return await this.request('/users/statistics');
  }

  // Métodos para gestión de roles
  async getRoles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/roles?${queryString}` : '/roles';
    
    return await this.request(url);
  }

  async getRole(id) {
    
    return await this.request(`/roles/${id}`);
  }

  async createRole(roleData) {
    
    return await this.request('/roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    });
  }

  async updateRole(id, roleData) {
    
    return await this.request(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
  }

  async deleteRole(id) {
    
    return await this.request(`/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleRoleStatus(id) {
    
    return await this.request(`/roles/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getRoleStatistics() {
    
    return await this.request('/roles/statistics');
  }

  async getAvailablePermissions() {
    
    return await this.request('/roles/permissions');
  }

  // Métodos para gestión de clientes
  async getClients(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/clients?${queryString}` : '/clients';
    
    
    
    
    
    console.log('🔑 Token del localStorage:', localStorage.getItem(ENV_CONFIG.TOKEN_KEY));
    
    try {
      const response = await this.request(url);
      
      
      
      
      console.log('👥 Data keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.data && response.data.data) {
        
        
      }
      
      return response;
    } catch (error) {
      
      
      
      
      throw error;
    }
  }

  async getClient(id) {
    
    return await this.request(`/clients/${id}`);
  }

  async createClient(clientData) {
    
    return await this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id, clientData) {
    try {
      const response = await this.request(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });
      
      return response;
    } catch (error) {
      console.error('✏️ ========== ERROR AL ACTUALIZAR CLIENTE ==========');
      console.error('✏️ Error completo:', error);
      console.error('✏️ Error message:', error.message);
      console.error('✏️ Error stack:', error.stack);
      throw error;
    }
  }

  async deleteClient(id) {
    
    return await this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleClientStatus(id) {
    
    return await this.request(`/clients/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getClientStatistics() {
    
    return await this.request('/clients/statistics');
  }

  async getClientOptions() {
    
    return await this.request('/clients/options');
  }

  // Métodos de estadísticas para suministros
  async getPanelStatistics() {
    
    return await this.request('/panels/statistics');
  }

  async getInverterStatistics() {
    
    return await this.request('/inverters/statistics');
  }

  async getBatteryStatistics() {
    
    return await this.request('/batteries/statistics');
  }

  // Métodos para gestión de contactos de clientes
  async getClientContacts(clientId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/clients/${clientId}/contacts?${queryString}` : `/clients/${clientId}/contacts`;
    
    return await this.request(url);
  }

  async getClientContact(clientId, contactId) {
    
    return await this.request(`/clients/${clientId}/contacts/${contactId}`);
  }

  async createClientContact(clientId, contactData) {
    
    return await this.request(`/clients/${clientId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateClientContact(clientId, contactId, contactData) {
    
    return await this.request(`/clients/${clientId}/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteClientContact(clientId, contactId) {
    
    return await this.request(`/clients/${clientId}/contacts/${contactId}`, {
      method: 'DELETE',
    });
  }

  async toggleClientContactStatus(clientId, contactId) {
    
    return await this.request(`/clients/${clientId}/contacts/${contactId}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async setClientContactPrimary(clientId, contactId) {
    
    return await this.request(`/clients/${clientId}/contacts/${contactId}/set-primary`, {
      method: 'PATCH',
    });
  }


  // Métodos para gestión de documentos
  async getDocuments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/documents?${queryString}` : '/documents';
    
    
    return await this.request(url);
  }

  async getDocument(id) {
    
    return await this.request(`/documents/${id}`);
  }

  async createDocument(documentData) {
    
    return await this.request('/documents', {
      method: 'POST',
      body: documentData,
    });
  }

  async updateDocument(id, documentData) {
    
    return await this.request(`/documents/${id}`, {
      method: 'PUT',
      body: documentData,
    });
  }

  async deleteDocument(id) {
    
    return await this.request(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async approveDocument(id) {
    
    return await this.request(`/documents/${id}/approve`, {
      method: 'PATCH',
    });
  }

  async toggleDocumentStatus(id) {
    
    return await this.request(`/documents/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  async getDocumentStatistics() {
    
    return await this.request('/documents/statistics');
  }

  async getDocumentOptions() {
    
    return await this.request('/documents/options');
  }

  // ========== MÉTODOS PARA SUMINISTROS ========== 

  // ========== PANELES ==========
  async getPanels(params = {}) {
    console.log('🔧 Solicitud de paneles con params:', params);
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/panels?${queryString}` : '/panels';
    const result = await this.request(url);
    console.log('🔧 Resultado de solicitud de paneles:', result);
    return result;
  }

  async getPanel(id) {
    return await this.request(`/panels/${id}`);
  }

  async createPanel(panelData) {
    console.log('🔧 Enviando solicitud POST a /panels con FormData:', Array.from(panelData.entries()));
    
    // Para FormData, no debemos establecer manualmente Content-Type
    // El navegador lo hará automáticamente con el boundary correcto
    const headers = { ...this.getHeaders() };
    delete headers['Content-Type'];
    
    return await this.request('/panels', {
      method: 'POST',
      body: panelData,
      headers: headers,
    });
  }

  async updatePanel(id, panelData) {
    console.log('🔧 Enviando solicitud POST a /panels/', id, 'con FormData:', Array.from(panelData.entries()));
    
    // Asegurarse de que _method está en el FormData para que Laravel lo reconozca
    if (!(panelData instanceof FormData)) {
      const formData = new FormData();
      for (const key in panelData) {
        formData.append(key, panelData[key]);
      }
      formData.append('_method', 'PUT');
      panelData = formData;
    } else {
      // Si ya es FormData, asegurarse de que _method está presente
      if (!panelData.has('_method')) {
        panelData.append('_method', 'PUT');
      }
    }
    
    // Para FormData, no debemos establecer manualmente Content-Type
    // El navegador lo hará automáticamente con el boundary correcto
    const headers = { ...this.getHeaders() };
    delete headers['Content-Type'];
    
    return await this.request(`/panels/${id}`, {
      method: 'POST',
      body: panelData,
      headers: headers,
    });
  }

  async deletePanel(id) {
    try {
      console.log('🔧 Enviando solicitud DELETE a /panels/', id);
      console.log('🔧 Tipo de ID:', typeof id);
      console.log('🔧 Valor de ID:', id);
      
      // Verificar que el ID sea válido
      if (!id) {
        throw new Error('ID de panel no válido');
      }
      
      const response = await this.request(`/panels/${id}`, {
        method: 'DELETE',
      });
      console.log('🔧 Respuesta DELETE panels:', response);
      return response;
    } catch (error) {
      console.error('🔧 Error en deletePanel:', error);
      throw error;
    }
  }


  async togglePanelStatus(id) {
    return await this.request(`/panels/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // ========== INVERSORES ==========
  async getInverters(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/inverters?${queryString}` : '/inverters';
    return await this.request(url);
  }

  async getInverter(id) {
    return await this.request(`/inverters/${id}`);
  }

  async createInverter(inverterData) {
    return await this.request('/inverters', {
      method: 'POST',
      body: inverterData,
      isFormData: true,
    });
  }

  async updateInverter(id, inverterData) {
    // Asegurarse de que _method está en el FormData para que Laravel lo reconozca
    if (!(inverterData instanceof FormData)) {
      const formData = new FormData();
      for (const key in inverterData) {
        formData.append(key, inverterData[key]);
      }
      formData.append('_method', 'PUT');
      inverterData = formData;
    } else {
      // Si ya es FormData, asegurarse de que _method está presente
      if (!inverterData.has('_method')) {
        inverterData.append('_method', 'PUT');
      }
    }
    
    return await this.request(`/inverters/${id}`, {
      method: 'POST',
      body: inverterData,
      isFormData: true,
    });
  }

  async deleteInverter(id) {
    return await this.request(`/inverters/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleInverterStatus(id) {
    return await this.request(`/inverters/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // ========== BATERÍAS ==========
  async getBatteries(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/batteries?${queryString}` : '/batteries';
    return await this.request(url);
  }

  async getBattery(id) {
    return await this.request(`/batteries/${id}`);
  }

  async createBattery(batteryData) {
    return await this.request('/batteries', {
      method: 'POST',
      body: batteryData,
      isFormData: true,
    });
  }

  async updateBattery(id, batteryData) {
    // Asegurarse de que _method está en el FormData para que Laravel lo reconozca
    if (!(batteryData instanceof FormData)) {
      const formData = new FormData();
      for (const key in batteryData) {
        formData.append(key, batteryData[key]);
      }
      formData.append('_method', 'PUT');
      batteryData = formData;
    } else {
      // Si ya es FormData, asegurarse de que _method está presente
      if (!batteryData.has('_method')) {
        batteryData.append('_method', 'PUT');
      }
    }
    
    return await this.request(`/batteries/${id}`, {
      method: 'POST',
      body: batteryData,
      isFormData: true,
    });
  }

  async deleteBattery(id) {
    return await this.request(`/batteries/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleBatteryStatus(id) {
    return await this.request(`/batteries/${id}/toggle-status`, {
      method: 'PATCH',
    });
  }

  // Métodos para obtener departamentos y ciudades
  async getDepartments() {
    return await getLocationDepartments();
  }

  async getCities(departmentId) {
    return await getLocationCitiesByDepartment(departmentId);
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;
