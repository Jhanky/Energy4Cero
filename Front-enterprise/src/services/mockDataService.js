// Servicio de datos de prueba para desarrollo sin backend
import { proyectosEjemplo, estados } from '../data/proyectos';

class MockDataService {
  constructor() {
    this.proyectos = [...proyectosEjemplo];
    this.estados = [...estados];
    this.usuarios = this.generateMockUsers();
    this.clientes = this.generateMockClients();
    this.roles = this.generateMockRoles();
  }

  // Simular delay de red
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generar usuarios de prueba
  generateMockUsers() {
    return [
      {
        id: 1,
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@enterprise.com',
        role: { id: 1, name: 'Administrador', slug: 'administrador' },
        status: 'active',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'Ana Rodríguez',
        email: 'ana.rodriguez@enterprise.com',
        role: { id: 2, name: 'Comercial', slug: 'comercial' },
        status: 'active',
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        id: 3,
        name: 'Luis Martínez',
        email: 'luis.martinez@enterprise.com',
        role: { id: 3, name: 'Técnico', slug: 'tecnico' },
        status: 'active',
        created_at: '2024-01-20T10:00:00Z'
      }
    ];
  }

  // Generar clientes de prueba
  generateMockClients() {
    return [
      {
        id: 1,
        name: 'Empresa Industrial del Caribe S.A.',
        email: 'contacto@industrialcaribe.com',
        phone: '3001234567',
        address: 'Calle 72 #45-23, Barranquilla',
        city: 'Barranquilla',
        department: 'Atlántico',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 2,
        name: 'María Fernanda Gómez',
        email: 'maria.gomez@email.com',
        phone: '3002345678',
        address: 'Carrera 15 #28-45, Santa Marta',
        city: 'Santa Marta',
        department: 'Magdalena',
        status: 'active',
        created_at: '2024-02-10T10:00:00Z'
      },
      {
        id: 3,
        name: 'Inversiones Wayuu Energy S.A.S.',
        email: 'info@wayuuenergy.com',
        phone: '3003456789',
        address: 'Km 5 Vía a Maicao, Riohacha',
        city: 'Riohacha',
        department: 'La Guajira',
        status: 'active',
        created_at: '2024-11-20T10:00:00Z'
      }
    ];
  }

  // Generar roles de prueba
  generateMockRoles() {
    return [
      {
        id: 1,
        name: 'Administrador',
        slug: 'administrador',
        permissions: ['users.read', 'users.write', 'clients.read', 'clients.write', 'projects.read', 'projects.write'],
        status: 'active'
      },
      {
        id: 2,
        name: 'Comercial',
        slug: 'comercial',
        permissions: ['clients.read', 'clients.write', 'projects.read', 'projects.write'],
        status: 'active'
      },
      {
        id: 3,
        name: 'Técnico',
        slug: 'tecnico',
        permissions: ['projects.read', 'projects.write'],
        status: 'active'
      }
    ];
  }

  // Métodos de autenticación simulados
  async login(email, password) {

    
    await this.delay();
    
    // Simular credenciales válidas
    if (email === 'admin@enterprise.com' && password === 'password') {
      
      const user = {
        id: 1,
        name: 'Administrador',
        email: 'admin@enterprise.com',
        role: { id: 1, name: 'Administrador', slug: 'administrador' }
      };
      
      const token = 'mock_token_' + Date.now();
      
      // GUARDAR TOKEN Y USUARIO EN LOCALSTORAGE
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      
      
      const response = {
        success: true,
        message: 'Login exitoso',
        data: {
          token: token,
          user: user
        }
      };
      
      
      return response;
    }
    
    
    const errorResponse = {
      success: false,
      message: 'Credenciales incorrectas'
    };
    
    return errorResponse;
  }

  async getCurrentUser() {
    await this.delay();
    return {
      success: true,
      data: {
        id: 1,
        name: 'Administrador',
        email: 'admin@enterprise.com',
        role: { id: 1, name: 'Administrador', slug: 'administrador' }
      }
    };
  }

  async logout() {
    await this.delay();
    
    // LIMPIAR LOCALSTORAGE
    
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    
    
    return { success: true, message: 'Logout exitoso' };
  }

  // Métodos para proyectos
  async getProjects(params = {}) {
    await this.delay();
    
    let filteredProjects = [...this.proyectos];
    
    // Aplicar filtros si existen
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredProjects = filteredProjects.filter(p => 
        p.nombre.toLowerCase().includes(search) ||
        p.cliente.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search)
      );
    }
    
    if (params.estado) {
      filteredProjects = filteredProjects.filter(p => p.estadoActual === parseInt(params.estado));
    }
    
    if (params.departamento) {
      filteredProjects = filteredProjects.filter(p => p.departamento === params.departamento);
    }
    
    return {
      success: true,
      data: {
        data: filteredProjects,
        total: filteredProjects.length,
        current_page: 1,
        per_page: 50
      }
    };
  }

  async getProject(id) {
    await this.delay();
    const proyecto = this.proyectos.find(p => p.id === id);
    
    if (!proyecto) {
      return {
        success: false,
        message: 'Proyecto no encontrado'
      };
    }
    
    return {
      success: true,
      data: proyecto
    };
  }

  async getEstados() {
    await this.delay();
    return {
      success: true,
      data: this.estados
    };
  }

  // Métodos para usuarios
  async getUsers(params = {}) {
    await this.delay();
    
    let filteredUsers = [...this.usuarios];
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredUsers = filteredUsers.filter(u => 
        u.name.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }
    
    return {
      success: true,
      data: {
        data: filteredUsers,
        total: filteredUsers.length
      }
    };
  }

  async getUser(id) {
    await this.delay();
    const user = this.usuarios.find(u => u.id === parseInt(id));
    
    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      };
    }
    
    return {
      success: true,
      data: user
    };
  }

  // Métodos para clientes
  async getClients(params = {}) {
    await this.delay();
    
    let filteredClients = [...this.clientes];
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredClients = filteredClients.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.city.toLowerCase().includes(search)
      );
    }
    
    return {
      success: true,
      data: {
        data: filteredClients,
        total: filteredClients.length
      }
    };
  }

  async getClient(id) {
    await this.delay();
    const client = this.clientes.find(c => c.id === parseInt(id));
    
    if (!client) {
      return {
        success: false,
        message: 'Cliente no encontrado'
      };
    }
    
    return {
      success: true,
      data: client
    };
  }

  // Métodos para roles
  async getRoles(params = {}) {
    await this.delay();
    return {
      success: true,
      data: {
        data: this.roles,
        total: this.roles.length
      }
    };
  }

  async getRole(id) {
    await this.delay();
    const role = this.roles.find(r => r.id === parseInt(id));
    
    if (!role) {
      return {
        success: false,
        message: 'Rol no encontrado'
      };
    }
    
    return {
      success: true,
      data: role
    };
  }


  // Métodos para estadísticas
  async getProjectStatistics() {
    await this.delay();
    
    const total = this.proyectos.length;
    const conectados = this.proyectos.filter(p => p.estadoActual === 11).length;
    const enProceso = this.proyectos.filter(p => [1,2,3,4,5,6,7,8,9,10].includes(p.estadoActual)).length;
    const suspendidos = this.proyectos.filter(p => p.estadoActual === 12).length;
    const cancelados = this.proyectos.filter(p => p.estadoActual === 13).length;
    
    return {
      success: true,
      data: {
        total,
        conectados,
        en_proceso: enProceso,
        suspendidos,
        cancelados,
        porcentaje_conectados: total > 0 ? Math.round((conectados / total) * 100) : 0
      }
    };
  }

  async getUserStatistics() {
    await this.delay();
    
    const total = this.usuarios.length;
    const activos = this.usuarios.filter(u => u.status === 'active').length;
    const inactivos = this.usuarios.filter(u => u.status === 'inactive').length;
    
    return {
      success: true,
      data: {
        total,
        activos,
        inactivos,
        porcentaje_activos: total > 0 ? Math.round((activos / total) * 100) : 0
      }
    };
  }

  async getClientStatistics() {
    await this.delay();
    
    const total = this.clientes.length;
    const activos = this.clientes.filter(c => c.status === 'active').length;
    const inactivos = this.clientes.filter(c => c.status === 'inactive').length;
    
    return {
      success: true,
      data: {
        total,
        activos,
        inactivos,
        porcentaje_activos: total > 0 ? Math.round((activos / total) * 100) : 0
      }
    };
  }

  // Métodos para verificar autenticación
  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    
    
    
    
    
    
    
    return !!token && !!user;
  }

  getCurrentUserFromStorage() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  hasPermission(permission) {
    const user = this.getCurrentUserFromStorage();
    if (!user || !user.role || !user.role.permissions) {
      return false;
    }
    return user.role.permissions.includes(permission);
  }

  hasRole(roleSlug) {
    const user = this.getCurrentUserFromStorage();
    if (!user || !user.role) {
      return false;
    }
    return user.role.slug === roleSlug;
  }

  // Métodos para suministros (paneles, inversores, baterías)
  async getPanels(params = {}) {
    await this.delay();
    
    const mockPanels = [
      {
        panel_id: 1,
        brand: 'Jinko Solar',
        model: 'JKM415M-54HL4-B',
        power: 415,
        type: 'Monocristalino',
        price: 850000,
        technical_sheet_url: 'https://example.com/jinko-415.pdf',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        panel_id: 2,
        brand: 'Canadian Solar',
        model: 'CS3K-395MS',
        power: 395,
        type: 'Monocristalino',
        price: 780000,
        technical_sheet_url: 'https://example.com/canadian-395.pdf',
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        panel_id: 3,
        brand: 'Trina Solar',
        model: 'TSM-400DE15M(II)',
        power: 400,
        type: 'Monocristalino',
        price: 820000,
        technical_sheet_url: 'https://example.com/trina-400.pdf',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        panel_id: 4,
        brand: 'Longi Solar',
        model: 'LR4-72HPH-450M',
        power: 450,
        type: 'Monocristalino',
        price: 900000,
        technical_sheet_url: 'https://example.com/longi-450.pdf',
        created_at: '2024-03-01T10:00:00Z'
      },
      {
        panel_id: 5,
        brand: 'JA Solar',
        model: 'JAM72S20-460/MR',
        power: 460,
        type: 'Monocristalino',
        price: 920000,
        technical_sheet_url: 'https://example.com/ja-460.pdf',
        created_at: '2024-03-15T10:00:00Z'
      }
    ];
    
    return {
      success: true,
      data: mockPanels
    };
  }

  async getInverters(params = {}) {
    await this.delay();
    
    const mockInverters = [
      {
        inverter_id: 1,
        brand: 'SMA',
        model: 'Sunny Tripower 10000TL',
        power: 10000,
        system_type: 'String',
        grid_type: 'Monofásico',
        price: 4500000,
        technical_sheet_url: 'https://example.com/sma-10000.pdf',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        inverter_id: 2,
        brand: 'Fronius',
        model: 'Primo 8.2-1',
        power: 8200,
        system_type: 'String',
        grid_type: 'Monofásico',
        price: 3800000,
        technical_sheet_url: 'https://example.com/fronius-8200.pdf',
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        inverter_id: 3,
        brand: 'Huawei',
        model: 'SUN2000-10KTL-M1',
        power: 10000,
        system_type: 'String',
        grid_type: 'Trifásico',
        price: 4200000,
        technical_sheet_url: 'https://example.com/huawei-10000.pdf',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        inverter_id: 4,
        brand: 'Growatt',
        model: 'MIN 5000TL-XH',
        power: 5000,
        system_type: 'Híbrido',
        grid_type: 'Monofásico',
        price: 2500000,
        technical_sheet_url: 'https://example.com/growatt-5000.pdf',
        created_at: '2024-03-01T10:00:00Z'
      },
      {
        inverter_id: 5,
        brand: 'Victron Energy',
        model: 'MultiPlus-II 48/5000/70-50',
        power: 5000,
        system_type: 'Off-Grid',
        grid_type: 'Monofásico',
        price: 6000000,
        technical_sheet_url: 'https://example.com/victron-multiplus.pdf',
        created_at: '2024-03-15T10:00:00Z'
      }
    ];
    
    return {
      success: true,
      data: mockInverters
    };
  }

  async getBatteries(params = {}) {
    await this.delay();
    
    const mockBatteries = [
      {
        battery_id: 1,
        brand: 'Tesla',
        model: 'Powerwall 2',
        capacity: 13.5,
        voltage: 48,
        type: 'Litio',
        price: 15000000,
        technical_sheet_url: 'https://example.com/tesla-powerwall.pdf',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        battery_id: 2,
        brand: 'LG Chem',
        model: 'RESU10H',
        capacity: 9.8,
        voltage: 48,
        type: 'Litio',
        price: 12000000,
        technical_sheet_url: 'https://example.com/lg-resu10h.pdf',
        created_at: '2024-02-01T10:00:00Z'
      },
      {
        battery_id: 3,
        brand: 'BYD',
        model: 'B-Box Pro',
        capacity: 11.0,
        voltage: 48,
        type: 'Litio',
        price: 11000000,
        technical_sheet_url: 'https://example.com/byd-bbox.pdf',
        created_at: '2024-01-20T10:00:00Z'
      },
      {
        battery_id: 4,
        brand: 'Pylontech',
        model: 'US2000C',
        capacity: 2.4,
        voltage: 48,
        type: 'Litio',
        price: 3000000,
        technical_sheet_url: 'https://example.com/pylontech-us2000c.pdf',
        created_at: '2024-03-01T10:00:00Z'
      },
      {
        battery_id: 5,
        brand: 'Enphase',
        model: 'IQ Battery 10',
        capacity: 10.0,
        voltage: 240,
        type: 'Litio',
        price: 10000000,
        technical_sheet_url: 'https://example.com/enphase-iq10.pdf',
        created_at: '2024-03-15T10:00:00Z'
      }
    ];
    
    return {
      success: true,
      data: mockBatteries
    };
  }

  // Métodos de estadísticas para suministros
  async getPanelStatistics() {
    await this.delay();
    
    const mockPanels = [
      { price: 850000 },
      { price: 780000 },
      { price: 820000 }
    ];
    
    const total = mockPanels.length;
    const average_price = mockPanels.reduce((sum, panel) => sum + panel.price, 0) / total;
    
    return {
      success: true,
      data: {
        total,
        average_price: Math.round(average_price)
      }
    };
  }

  async getInverterStatistics() {
    await this.delay();
    
    const mockInverters = [
      { price: 4500000 },
      { price: 3800000 },
      { price: 4200000 }
    ];
    
    const total = mockInverters.length;
    const average_price = mockInverters.reduce((sum, inverter) => sum + inverter.price, 0) / total;
    
    return {
      success: true,
      data: {
        total,
        average_price: Math.round(average_price)
      }
    };
  }

  async getBatteryStatistics() {
    await this.delay();
    
    const mockBatteries = [
      { price: 15000000 },
      { price: 12000000 },
      { price: 18000000 }
    ];
    
    const total = mockBatteries.length;
    const average_price = mockBatteries.reduce((sum, battery) => sum + battery.price, 0) / total;
    
    return {
      success: true,
      data: {
        total,
        average_price: Math.round(average_price)
      }
    };
  }

  // Métodos CRUD para Paneles
  async createPanel(panelData) {
    await this.delay();
    
    
    const newPanel = {
      panel_id: Date.now(),
      ...panelData,
      created_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newPanel,
      message: 'Panel creado exitosamente'
    };
  }

  async updatePanel(panelId, panelData) {
    await this.delay();
    
    
    return {
      success: true,
      data: { panel_id: panelId, ...panelData },
      message: 'Panel actualizado exitosamente'
    };
  }

  async deletePanel(panelId) {
    await this.delay();
    
    
    return {
      success: true,
      message: 'Panel eliminado exitosamente'
    };
  }

  // Métodos CRUD para Inversores
  async createInverter(inverterData) {
    await this.delay();
    
    
    const newInverter = {
      inverter_id: Date.now(),
      ...inverterData,
      created_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newInverter,
      message: 'Inversor creado exitosamente'
    };
  }

  async updateInverter(inverterId, inverterData) {
    await this.delay();
    
    
    return {
      success: true,
      data: { inverter_id: inverterId, ...inverterData },
      message: 'Inversor actualizado exitosamente'
    };
  }

  async deleteInverter(inverterId) {
    await this.delay();
    
    
    return {
      success: true,
      message: 'Inversor eliminado exitosamente'
    };
  }

  // Métodos CRUD para Baterías
  async createBattery(batteryData) {
    await this.delay();
    
    
    const newBattery = {
      battery_id: Date.now(),
      ...batteryData,
      created_at: new Date().toISOString()
    };
    
    return {
      success: true,
      data: newBattery,
      message: 'Batería creada exitosamente'
    };
  }

  async updateBattery(batteryId, batteryData) {
    await this.delay();
    
    
    return {
      success: true,
      data: { battery_id: batteryId, ...batteryData },
      message: 'Batería actualizada exitosamente'
    };
  }

  async deleteBattery(batteryId) {
    await this.delay();
    
    
    return {
      success: true,
      message: 'Batería eliminada exitosamente'
    };
  }
}

// Crear instancia única del servicio
const mockDataService = new MockDataService();

export default mockDataService;
