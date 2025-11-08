# 🎨 Iconos de Flaticon

## 📁 Estructura de Carpetas

```
src/assets/icons/
├── README.md
├── flaticon/
│   ├── user.svg
│   ├── building.svg
│   ├── chart.svg
│   └── ...
└── components/
    ├── FlaticonIcon.jsx
    └── index.js
```

## 🔧 Cómo Usar

### **1. Descargar Iconos de Flaticon**
1. Ve a [flaticon.com](https://www.flaticon.com)
2. Busca el icono que necesitas
3. Descarga en formato SVG
4. Guarda en `src/assets/icons/flaticon/`

### **2. Usar en Componentes**
```jsx
import { FlaticonIcon } from '@/assets/icons';

// Usar icono
<FlaticonIcon name="user" size={24} color="#3B82F6" />
<FlaticonIcon name="building" size={32} color="#10B981" />
```

### **3. Personalizar**
```jsx
<FlaticonIcon 
  name="chart" 
  size={20} 
  color="#EF4444" 
  className="hover:scale-110 transition-transform" 
/>
```

## 📋 **Iconos Disponibles**

- `user.svg` - Usuario
- `building.svg` - Edificio/Empresa
- `chart.svg` - Gráficos/Estadísticas
- `document.svg` - Documentos
- `settings.svg` - Configuración
- `search.svg` - Búsqueda
- `plus.svg` - Agregar
- `edit.svg` - Editar
- `delete.svg` - Eliminar
- `eye.svg` - Ver
- `download.svg` - Descargar
- `upload.svg` - Subir

## 🎨 **Colores Sugeridos**

- **Primario:** `#10B981` (Verde)
- **Secundario:** `#3B82F6` (Azul)
- **Peligro:** `#EF4444` (Rojo)
- **Advertencia:** `#F59E0B` (Amarillo)
- **Neutro:** `#6B7280` (Gris)
