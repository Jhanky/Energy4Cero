# 🛣️ Estructura de Rutas - Enterprise

Este documento describe la organización de las rutas de la aplicación React.

## 📋 **Estructura General**

```
/ (Layout)
├── /login (Login)
├── /resumen (VistaResumen) - Redirección por defecto
├── /proyectos (VistaProyectos)
├── /analisis (VistaAnalisis)
├── /aire (VistaAire)
├── /usuarios (VistaUsuarios)
├── /roles (VistaRoles)
├── /documentacion (VistaDocumentos)
├── /configuracion (ComingSoon)
├── /reportes-admin (ComingSoon)
├── /clientes (VistaClientes)
├── /suministros (VistaSuministros)
├── /prospectos (ComingSoon)
├── /ventas (ComingSoon)
├── /financiera (VistaFinanciera)
├── /presupuestos (ComingSoon)
├── /facturacion (ComingSoon)
├── /reportes-fin (ComingSoon)
├── /servicio (VistaServicioTecnico)
├── /mantenimiento (ComingSoon)
├── /tickets (ComingSoon)
└── /* (Redirect to /resumen)
```

## 🗂️ **Organización por Secciones**

### 📁 **Gestión de Proyectos**
- **`/resumen`** - Resumen ejecutivo de proyectos
- **`/proyectos`** - Gestión detallada de proyectos
- **`/analisis`** - Análisis y métricas de proyectos
- **`/aire`** - Seguimiento específico de proyectos Air-e

### 🏢 **Gestión Administrativa**
- **`/usuarios`** - Gestión de usuarios del sistema
- **`/roles`** - Gestión de roles y permisos
- **`/documentacion`** - Gestión de documentación
- **`/configuracion`** - Configuración del sistema (Coming Soon)
- **`/reportes-admin`** - Reportes administrativos (Coming Soon)

### 🛒 **Gestión Comercial**
- **`/clientes`** - Base de datos de clientes
- **`/suministros`** - Gestión de suministros
- **`/prospectos`** - Seguimiento de clientes potenciales (Coming Soon)
- **`/ventas`** - Gestión de ventas (Coming Soon)

### 💰 **Gestión Contable**
- **`/financiera`** - Indicadores financieros
- **`/presupuestos`** - Gestión de presupuestos (Coming Soon)
- **`/facturacion`** - Sistema de facturación (Coming Soon)
- **`/reportes-fin`** - Reportes financieros (Coming Soon)

### 🛠️ **Soporte**
- **`/servicio`** - Servicio técnico
- **`/mantenimiento`** - Programas de mantenimiento (Coming Soon)
- **`/tickets`** - Tickets de soporte (Coming Soon)

## 🔐 **Autenticación**

### **Rutas Protegidas**
- Todas las rutas excepto `/login` requieren autenticación
- Si no está autenticado, redirige a `/login`
- Si está autenticado y accede a `/login`, redirige a `/resumen`

### **Redirecciones**
- **Ruta raíz (`/`)**: Redirige a `/resumen`
- **Ruta no encontrada (`/*`)**: Redirige a `/resumen`

## 🎯 **Estados de las Rutas**

### **✅ Implementadas y Funcionales**
- `/resumen` - VistaResumen
- `/proyectos` - VistaProyectos
- `/analisis` - VistaAnalisis
- `/aire` - VistaAire
- `/usuarios` - VistaUsuarios
- `/roles` - VistaRoles
- `/documentacion` - VistaDocumentos
- `/clientes` - VistaClientes
- `/suministros` - VistaSuministros
- `/financiera` - VistaFinanciera
- `/servicio` - VistaServicioTecnico

### **🚧 En Desarrollo (Coming Soon)**
- `/configuracion` - Configuración
- `/reportes-admin` - Reportes Administrativos
- `/prospectos` - Prospectos
- `/ventas` - Ventas
- `/presupuestos` - Presupuestos
- `/facturacion` - Facturación
- `/reportes-fin` - Reportes Financieros
- `/mantenimiento` - Mantenimiento
- `/tickets` - Tickets de Soporte

## 🔄 **Flujo de Navegación**

### **1. Usuario No Autenticado**
```
Usuario accede a cualquier ruta
    ↓
Redirige a /login
    ↓
Usuario se autentica
    ↓
Redirige a /resumen
```

### **2. Usuario Autenticado**
```
Usuario accede a /login
    ↓
Redirige a /resumen
```

### **3. Ruta No Encontrada**
```
Usuario accede a ruta inexistente
    ↓
Redirige a /resumen
```

## 🎨 **Características de las Rutas**

### **Layout Compartido**
- Todas las rutas protegidas usan el componente `Layout`
- El layout incluye navegación, header y footer
- El contenido se renderiza en `<Outlet />`

### **Props Dinámicas**
- Las rutas de proyectos reciben `proyectos={proyectosEjemplo}` y `estados={estados}`
- Las rutas administrativas, comerciales y de soporte no requieren props adicionales

### **Componentes Coming Soon**
- Las rutas en desarrollo muestran el componente `ComingSoon`
- Incluyen el nombre de la página para contexto

## 🚀 **Próximas Mejoras**

### **Funcionalidades Planificadas**
- [ ] Rutas anidadas para subsecciones
- [ ] Lazy loading de componentes
- [ ] Rutas protegidas por roles
- [ ] Breadcrumbs de navegación
- [ ] Historial de navegación

### **Optimizaciones**
- [ ] Code splitting por sección
- [ ] Preloading de rutas frecuentes
- [ ] Caché de rutas visitadas
- [ ] Animaciones de transición
