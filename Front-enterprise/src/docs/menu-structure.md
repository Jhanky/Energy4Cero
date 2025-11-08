# 🗂️ Estructura del Menú - Enterprise

## 📋 **5 Secciones Principales**

### 1. 🏢 **Gestión Administrativa** (Azul)
- **Gestión de Usuarios** - Administración de usuarios del sistema
- **Roles y Permisos** - Configuración de roles y permisos
- **Configuración** - Configuración general del sistema
- **Reportes Administrativos** - Reportes y estadísticas administrativas

### 2. 🛒 **Gestión Comercial** (Verde)
- **Gestión de Clientes** - Base de datos de clientes
- **Suministros** - Gestión de suministros e inventario
- **Prospectos** - Seguimiento de clientes potenciales
- **Ventas** - Seguimiento de ventas y oportunidades

### 3. 💰 **Gestión Contable** (Púrpura)
- **Indicadores Financieros** - Dashboard financiero
- **Presupuestos** - Gestión de presupuestos
- **Facturación** - Sistema de facturación
- **Reportes Financieros** - Reportes contables y financieros

### 4. 📁 **Gestión de Proyectos** (Naranja)
- **Resumen Ejecutivo** - Vista general de proyectos
- **Proyectos** - Gestión detallada de proyectos
- **Análisis** - Análisis y métricas de proyectos
- **Seguimiento Air-e** - Seguimiento específico de proyectos Air-e

### 5. 🛠️ **Soporte** (Gris)
- **Servicio Técnico** - Gestión de servicios técnicos
- **Mantenimiento** - Programas de mantenimiento
- **Tickets de Soporte** - Sistema de tickets
- **Documentación** - Manuales y documentación

## 🎨 **Sistema de Colores por Sección**

### **Colores Asignados**
- **Administrativa:** Azul (`blue-600`, `blue-50`)
- **Comercial:** Verde (`green-600`, `green-50`)
- **Contable:** Púrpura (`purple-600`, `purple-50`)
- **Proyectos:** Naranja (`orange-600`, `orange-50`)
- **Soporte:** Gris (`gray-600`, `gray-50`)

### **Estados Visuales**
- **Activo:** Color de la sección con fondo claro
- **Hover:** Gris claro para hover
- **Desplegado:** Menú desplegable con sombra
- **Seleccionado:** Color de la sección con fondo

## 🔧 **Funcionalidades del Menú**

### **Interacción**
- ✅ **Clic en sección:** Abre/cierra submenú
- ✅ **Clic en página:** Navega a la página
- ✅ **Clic fuera:** Cierra menú automáticamente
- ✅ **Indicadores visuales:** Flechas y colores

### **Responsive**
- ✅ **Desktop:** Menú horizontal con desplegables
- ✅ **Tablet:** Menú adaptativo
- ✅ **Mobile:** Menú colapsable (por implementar)

### **Accesibilidad**
- ✅ **Navegación por teclado**
- ✅ **Indicadores de estado**
- ✅ **Contraste adecuado**
- ✅ **Iconos descriptivos**

## 📱 **Estructura de Datos**

### **menuSections Array**
```javascript
const menuSections = [
  {
    id: 'administrativa',
    nombre: 'Gestión Administrativa',
    icono: Users,
    color: 'blue',
    paginas: [
      { id: 'usuarios', nombre: 'Gestión de Usuarios', icono: Users },
      // ... más páginas
    ]
  },
  // ... más secciones
];
```

### **Estados del Menú**
- **menuAbierto:** ID de la sección abierta (null si ninguna)
- **vistaActiva:** ID de la página activa
- **hasActivePage:** Boolean si la sección tiene página activa

## 🎯 **Páginas Implementadas**

### **✅ Completamente Funcionales**
- Resumen Ejecutivo
- Proyectos
- Análisis
- Seguimiento Air-e
- Indicadores Financieros
- Servicio Técnico

### **🚧 En Desarrollo**
- Gestión de Usuarios
- Roles y Permisos
- Configuración
- Gestión de Clientes
- Suministros
- Prospectos
- Ventas
- Presupuestos
- Facturación
- Mantenimiento
- Tickets de Soporte
- Documentación

## 🔄 **Flujo de Navegación**

### **1. Selección de Sección**
```
Usuario hace clic en "Gestión Administrativa"
    ↓
Se abre el submenú con las páginas
    ↓
Usuario hace clic en "Gestión de Usuarios"
    ↓
Se navega a la página y se cierra el menú
```

### **2. Estados Visuales**
```
Sección inactiva: Gris
    ↓
Sección con página activa: Color de la sección
    ↓
Submenú abierto: Desplegable con sombra
    ↓
Página activa: Color de la sección con fondo
```

## 🚀 **Próximas Mejoras**

### **Funcionalidades Planificadas**
- [ ] Búsqueda en menú
- [ ] Favoritos/páginas frecuentes
- [ ] Notificaciones por sección
- [ ] Menú móvil colapsable
- [ ] Breadcrumbs de navegación
- [ ] Historial de navegación

### **Optimizaciones**
- [ ] Lazy loading de páginas
- [ ] Caché de estados
- [ ] Animaciones suaves
- [ ] Transiciones mejoradas
