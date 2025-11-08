import React from 'react';

/**
 * Componente para usar iconos de Flaticon
 * 
 * @param {string} name - Nombre del icono (sin extensión)
 * @param {number} size - Tamaño del icono en píxeles
 * @param {string} color - Color del icono (hex, rgb, o nombre de color)
 * @param {string} className - Clases CSS adicionales
 * @param {object} props - Props adicionales
 */
const FlaticonIcon = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  className = '', 
  ...props 
}) => {
  // Importar el icono dinámicamente
  const IconComponent = React.lazy(() => 
    import(`../flaticon/${name}.svg`)
      .catch(() => {
        
        // Fallback a un icono por defecto
        return import(`../flaticon/default.svg`);
      })
  );

  const iconStyle = {
    width: size,
    height: size,
    color: color,
    fill: 'currentColor'
  };

  return (
    <React.Suspense fallback={<div style={iconStyle} />}>
      <IconComponent 
        style={iconStyle}
        className={`flaticon-icon ${className}`}
        {...props}
      />
    </React.Suspense>
  );
};

export default FlaticonIcon;
