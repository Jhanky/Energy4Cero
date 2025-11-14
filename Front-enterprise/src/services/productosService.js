import apiService from './api';

class ProductosService {
  // Obtener todos los paneles activos
  async getPanels(params = {}) {
    try {
      const queryString = new URLSearchParams({
        is_active: 'true',
        per_page: '1000', // Obtener todos los paneles
        ...params
      }).toString();
      const url = `/panels?${queryString}`;
      console.log(`📥 Solicitando paneles con URL: ${url}`);
      const response = await apiService.request(url);
      console.log('📥 Respuesta de paneles:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener paneles:', error);
      throw error;
    }
  }

  // Obtener todos los inversores activos con filtros opcionales
  async getInverters(params = {}) {
    try {
      const queryString = new URLSearchParams({
        is_active: 'true',
        per_page: '1000', // Obtener todos los inversores
        ...params
      }).toString();
      const url = `/inverters?${queryString}`;
      console.log(`📥 Solicitando inversores con URL: ${url}`);
      const response = await apiService.request(url);
      console.log('📥 Respuesta de inversores:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener inversores:', error);
      throw error;
    }
  }

  // Obtener todos las baterías activas
  async getBatteries(params = {}) {
    try {
      const queryString = new URLSearchParams({
        is_active: 'true',
        per_page: '1000', // Obtener todas las baterías
        ...params
      }).toString();
      const url = `/batteries?${queryString}`;
      console.log(`📥 Solicitando baterías con URL: ${url}`);
      const response = await apiService.request(url);
      console.log('📥 Respuesta de baterías:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al obtener baterías:', error);
      throw error;
    }
  }

  // Obtener inversores filtrados por tipo de red y sistema
  async getInvertersForQuotation(gridType, systemType) {
    try {
      const filteredResponse = await this.getInverters({
        grid_type: gridType,
        system_type: systemType
      });

      // Si no hay resultados filtrados, devolver todos los inversores activos
      if (!filteredResponse.success || !filteredResponse.data.inverters || filteredResponse.data.inverters.length === 0) {
        console.log('No se encontraron inversores filtrados, devolviendo todos los activos');
        return this.getInverters(); // Devuelve todos los inversores activos
      }

      return filteredResponse;
    } catch (error) {
      console.error('Error al obtener inversores filtrados:', error);
      // En caso de error, devolver todos los inversores
      return this.getInverters();
    }
  }
}

export const productosService = new ProductosService();
export default productosService;
