import roleService from '../services/roleService';

// Función para probar el servicio de roles
const testRolesService = async () => {

  
  try {
    
    const response = await roleService.getRoles();
    
    
    
    
    
    
    if (response.success && response.data && response.data.roles) {
      
      response.data.roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.name} (${role.slug}) - Activo: ${role.is_active}`);
      });
    } else if (response.success && Array.isArray(response)) {
      // En caso de que la respuesta sea directamente un array
      
      response.forEach((role, index) => {
        console.log(`${index + 1}. ${role.name} (${role.slug}) - Activo: ${role.is_active}`);
      });
    } else {
      
    }
  } catch (error) {
    
    
  }
};

// Ejecutar la prueba
testRolesService();

export default testRolesService;