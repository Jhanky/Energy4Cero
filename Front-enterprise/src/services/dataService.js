// Servicio de datos que detecta automáticamente si usar datos de prueba o API real
import apiService from './api';
import mockDataService from './mockDataService';
import { ENV_CONFIG } from '../config/environment';
import { isMockDataEnabled } from '../config/mockConfig';
import * as supplyService from './supplyService';

class DataService {
  constructor() {
    this.useMockData = this.shouldUseMockData();
    this.service = this.useMockData ? mockDataService : apiService;
    

  }

  // Determinar si debe usar datos de prueba
  shouldUseMockData() {
    // Verificar si los datos de prueba están forzados en la configuración
    if (isMockDataEnabled()) {
      return true;
    }
    
    // En modo desarrollo, verificar la conectividad del backend
    if (ENV_CONFIG.IS_DEVELOPMENT) {
      // Verificar conectividad del backend
      const backendAvailable = this.checkBackendConnection();
      
      // Si el backend no está disponible, usar datos de prueba
      if (!backendAvailable) {
        return true;
      }
      
      return false; // Por defecto intentamos usar backend real
    }
    
    // En producción, usar backend real
    return false;
  }

  // Método para cambiar entre datos de prueba y API real
  setUseMockData(useMock) {
    this.useMockData = useMock;
    this.service = useMock ? mockDataService : apiService;
    
  }

  // Método para verificar conectividad del backend
  async checkBackendConnection() {
    try {
      
      const response = await fetch(`${ENV_CONFIG.API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        
        return true;
      } else {
        
        return false;
      }
    } catch (error) {
      
      return false;
    }
  }

  // Método para auto-detectar y configurar el servicio apropiado
  async autoConfigure() {
    // No cambiar automáticamente entre modos de datos simulados y reales
    // para evitar inconsistencias en el comportamiento del usuario
    if (ENV_CONFIG.IS_DEVELOPMENT && !this.useMockData) {
      
      // Verificar la conectividad pero no cambiar automáticamente el modo
      const backendAvailable = await this.checkBackendConnection();
      if (!backendAvailable) {
        
      }
    }
  }

  // Delegar todos los métodos al servicio activo
  async login(email, password) {
    
    
    
    
    
    const result = await this.service.login(email, password);
    
    
    
    
    return result;
  }

  async logout() {
    return await this.service.logout();
  }

  async getCurrentUser() {
    return await this.service.getCurrentUser();
  }

  async getProjects(params = {}) {
    // Para proyectos, siempre usar API real sin datos mock
    try {
      return await apiService.getProjects(params);
    } catch (error) {
      console.error('Error al obtener proyectos desde API:', error);
      // No usar datos mock, devolver error
      throw error;
    }
  }

  async getProject(id) {
    return await this.service.getProject(id);
  }

  async getEstados() {
    return await this.service.getEstados();
  }

  async getUsers(params = {}) {
    return await this.service.getUsers(params);
  }

  async getUser(id) {
    return await this.service.getUser(id);
  }

  async getClients(params = {}) {
    return await this.service.getClients(params);
  }

  async getClient(id) {
    return await this.service.getClient(id);
  }

  async getRoles(params = {}) {
    return await this.service.getRoles(params);
  }

  async getRole(id) {
    return await this.service.getRole(id);
  }

  async getDepartments() {
    return await this.service.getDepartments();
  }

  async getCities(departmentId) {
    return await this.service.getCities(departmentId);
  }

  async getProjectStatistics() {
    return await this.service.getProjectStatistics();
  }

  async getUserStatistics() {
    return await this.service.getUserStatistics();
  }

  async getClientStatistics() {
    return await this.service.getClientStatistics();
  }

  isAuthenticated() {
    return this.service.isAuthenticated();
  }

  getCurrentUserFromStorage() {
    return this.service.getCurrentUserFromStorage();
  }

  hasPermission(permission) {
    return this.service.hasPermission(permission);
  }

  hasRole(roleSlug) {
    return this.service.hasRole(roleSlug);
  }

  // Métodos para suministros
  async getPanels(params = {}) {
    const result = await this.service.getPanels(params);
    return result;
  }

  async getInverters(params = {}) {
    return await this.service.getInverters(params);
  }

  async getBatteries(params = {}) {
    return await this.service.getBatteries(params);
  }

  // Métodos de estadísticas
  async getPanelStatistics() {
    return await this.service.getPanelStatistics();
  }

  async getInverterStatistics() {
    return await this.service.getInverterStatistics();
  }

  async getBatteryStatistics() {
    return await this.service.getBatteryStatistics();
  }

  // Métodos CRUD para Suministros
  async createPanel(panelData) {
    return await this.service.createPanel(panelData);
  }

  async updatePanel(panelId, panelData) {
    return await this.service.updatePanel(panelId, panelData);
  }

  async deletePanel(panelId) {
    return await this.service.deletePanel(panelId);
  }


  async createInverter(inverterData) {
    return await this.service.createInverter(inverterData);
  }

  async updateInverter(inverterId, inverterData) {
    return await this.service.updateInverter(inverterId, inverterData);
  }

  async deleteInverter(inverterId) {
    return await this.service.deleteInverter(inverterId);
  }

  async createBattery(batteryData) {
    return await this.service.createBattery(batteryData);
  }

  async updateBattery(batteryId, batteryData) {
    return await this.service.updateBattery(batteryId, batteryData);
  }

  async deleteBattery(batteryId) {
    return await this.service.deleteBattery(batteryId);
  }

  // Métodos específicos de la API (solo disponibles cuando se usa ApiService)
  async createUser(userData) {
    if (this.useMockData) {
      throw new Error('Crear usuario no disponible en modo datos de prueba');
    }
    return await this.service.createUser(userData);
  }

  async updateUser(id, userData) {
    if (this.useMockData) {
      throw new Error('Actualizar usuario no disponible en modo datos de prueba');
    }
    return await this.service.updateUser(id, userData);
  }

  async deleteUser(id) {
    if (this.useMockData) {
      throw new Error('Eliminar usuario no disponible en modo datos de prueba');
    }
    return await this.service.deleteUser(id);
  }

  async createClient(clientData) {
    if (this.useMockData) {
      throw new Error('Crear cliente no disponible en modo datos de prueba');
    }
    return await this.service.createClient(clientData);
  }

  async updateClient(id, clientData) {
    if (this.useMockData) {
      throw new Error('Actualizar cliente no disponible en modo datos de prueba');
    }
    return await this.service.updateClient(id, clientData);
  }

  async deleteClient(id) {
    if (this.useMockData) {
      throw new Error('Eliminar cliente no disponible en modo datos de prueba');
    }
    return await this.service.deleteClient(id);
  }

  async bulkDeleteClients(clientIds) {
    if (this.useMockData) {
      throw new Error('Eliminar clientes en grupo no disponible en modo datos de prueba');
    }
    return await this.service.bulkDeleteClients(clientIds);
  }

  // Método para obtener permisos disponibles
  async getAvailablePermissions() {
    return await this.service.getAvailablePermissions();
  }

  // Método para obtener departamentos desde API externa
  async getDepartmentsFromApi() {
    return await this.service.getDepartmentsFromApi();
  }

  // Método para obtener ciudades desde API externa
  async getCitiesFromApi(departmentId) {
    return await this.service.getCitiesFromApi(departmentId);
  }

  // Métodos para mantenimientos
  async getMaintenances(params = {}) {
    return await this.service.getMaintenances(params);
  }

  async getMaintenance(id) {
    return await this.service.getMaintenance(id);
  }

  async createMaintenance(maintenanceData) {
    return await this.service.createMaintenance(maintenanceData);
  }

  async updateMaintenance(id, maintenanceData) {
    return await this.service.updateMaintenance(id, maintenanceData);
  }

  async deleteMaintenance(id) {
    return await this.service.deleteMaintenance(id);
  }

  async updateMaintenanceStatus(id, status) {
    return await this.service.updateMaintenanceStatus(id, status);
  }

  async getMaintenanceStatistics() {
    return await this.service.getMaintenanceStatistics();
  }

  // Método para obtener información del servicio actual
  getServiceInfo() {
    return {
      useMockData: this.useMockData,
      serviceName: this.useMockData ? 'MockDataService' : 'ApiService',
      backendUrl: ENV_CONFIG.API_BASE_URL,
      isDevelopment: ENV_CONFIG.IS_DEVELOPMENT
    };
  }
}

// Crear instancia única del servicio
const dataService = new DataService();

// Auto-configurar en desarrollo para verificar disponibilidad del backend
if (ENV_CONFIG.IS_DEVELOPMENT) {
  // Ejecutar la autoconfiguración en el próximo ciclo del evento para no bloquear la inicialización
  // Solo verificar al inicio, pero no cambiar el modo una vez establecido
  setTimeout(async () => {
    await dataService.autoConfigure();
  }, 0);
}

export default dataService;
