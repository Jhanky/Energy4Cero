// Configuración de iconos de Flaticon
export const ICON_CONFIG = {
  // Tamaños predefinidos
  sizes: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64
  },
  
  // Colores del tema
  colors: {
    primary: '#10B981',    // Verde
    secondary: '#3B82F6',  // Azul
    danger: '#EF4444',     // Rojo
    warning: '#F59E0B',     // Amarillo
    info: '#06B6D4',       // Cian
    success: '#10B981',    // Verde
    neutral: '#6B7280',    // Gris
    white: '#FFFFFF',
    black: '#000000'
  },
  
  // Iconos disponibles
  available: [
    'user',
    'building',
    'chart',
    'document',
    'settings',
    'search',
    'plus',
    'edit',
    'delete',
    'eye',
    'download',
    'upload',
    'save',
    'cancel',
    'check',
    'close',
    'arrow-left',
    'arrow-right',
    'arrow-up',
    'arrow-down',
    'menu',
    'filter',
    'sort',
    'refresh',
    'copy',
    'share',
    'print',
    'email',
    'phone',
    'location',
    'calendar',
    'clock',
    'star',
    'heart',
    'like',
    'dislike',
    'comment',
    'message',
    'notification',
    'bell',
    'lock',
    'unlock',
    'key',
    'shield',
    'security',
    'privacy',
    'settings',
    'gear',
    'tool',
    'wrench',
    'hammer',
    'screwdriver'
  ]
};

// Función helper para obtener tamaño
export const getIconSize = (size) => {
  if (typeof size === 'number') return size;
  return ICON_CONFIG.sizes[size] || ICON_CONFIG.sizes.md;
};

// Función helper para obtener color
export const getIconColor = (color) => {
  return ICON_CONFIG.colors[color] || color || 'currentColor';
};
