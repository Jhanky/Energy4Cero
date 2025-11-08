// Utilidades para manejo de fechas

/**
 * Formatea una fecha en el formato DD/MM/YYYY
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return date; // Si no se puede parsear, devolver tal cual
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return date;
  }
};

/**
 * Formatea una fecha en el formato YYYY-MM-DD (para inputs de fecha)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error al formatear fecha para input:', error);
    return '';
  }
};

/**
 * Verifica si una fecha está vencida
 * @param {string|Date} dueDate - Fecha límite
 * @returns {boolean} true si está vencida, false en caso contrario
 */
export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  
  try {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  } catch (error) {
    console.error('Error al verificar fecha vencida:', error);
    return false;
  }
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|Date} date1 - Primera fecha
 * @param {string|Date} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
export const daysDifference = (date1, date2) => {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    const timeDifference = d2.getTime() - d1.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  } catch (error) {
    console.error('Error al calcular diferencia de días:', error);
    return 0;
  }
};