# 👥 Módulo de Clientes - Estructura Modular

Este módulo ha sido dividido en componentes específicos para mejorar la organización y mantenibilidad del código.

## 📁 Estructura de Archivos

```
clientes/
├── README.md                 # Este archivo
├── ClientesIndex.jsx         # Lista principal de clientes
├── CrearCliente.jsx          # Formulario para crear cliente
├── EditarCliente.jsx         # Formulario para editar cliente
└── VerCliente.jsx            # Vista de solo lectura de cliente
```

## 🎯 Componentes

### **ClientesIndex.jsx**
**Propósito:** Componente principal que muestra la lista de clientes con filtros y acciones.

**Funcionalidades:**
- ✅ Lista paginada de clientes
- ✅ Filtros y búsqueda avanzada
- ✅ Estadísticas de clientes
- ✅ Acciones: Ver, Editar, Activar/Desactivar, Eliminar
- ✅ Estados de carga y error

**Props que recibe:**
- `onEdit(cliente)` - Función para editar cliente
- `onCreate()` - Función para crear nuevo cliente
- `onView(cliente)` - Función para ver detalles del cliente

### **CrearCliente.jsx**
**Propósito:** Modal/formulario para crear un nuevo cliente.

**Funcionalidades:**
- ✅ Formulario completo de creación
- ✅ Validación de campos
- ✅ Selectores de ubicación dinámicos
- ✅ Campos específicos para energía solar
- ✅ Manejo de errores

**Props que recibe:**
- `onClose()` - Función para cerrar el modal
- `onSuccess()` - Función llamada después de crear exitosamente

### **EditarCliente.jsx**
**Propósito:** Modal/formulario para editar un cliente existente.

**Funcionalidades:**
- ✅ Formulario pre-poblado con datos del cliente
- ✅ Validación de campos
- ✅ Selectores de ubicación dinámicos
- ✅ Campos específicos para energía solar
- ✅ Manejo de errores

**Props que recibe:**
- `cliente` - Objeto con los datos del cliente a editar
- `onClose()` - Función para cerrar el modal
- `onSuccess()` - Función llamada después de editar exitosamente

### **VerCliente.jsx**
**Propósito:** Modal de solo lectura para ver los detalles completos de un cliente.

**Funcionalidades:**
- ✅ Vista completa de información del cliente
- ✅ Información técnica (consumo, tarifas, costos)
- ✅ Información del sistema (fechas, usuario creador)
- ✅ Formateo de datos (fechas, monedas, números)
- ✅ Diseño responsive

**Props que recibe:**
- `cliente` - Objeto con los datos del cliente a mostrar
- `onClose()` - Función para cerrar el modal

## 🔄 Flujo de Navegación

```
VistaClientes (Componente Principal)
    ↓
ClientesIndex (Vista por defecto)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   CrearCliente  │  EditarCliente  │   VerCliente    │
│   (Modal)       │   (Modal)       │   (Modal)       │
└─────────────────┴─────────────────┴─────────────────┘
    ↓                    ↓                    ↓
    └────────────────────┴────────────────────┘
                         ↓
                 ClientesIndex (Regreso)
```

## 🎨 Características de Diseño

### **Consistencia Visual**
- Todos los componentes usan el mismo sistema de colores
- Iconos consistentes de Lucide React
- Espaciado y tipografía uniforme
- Estados de carga y error estandarizados

### **Responsive Design**
- Grids adaptativos para diferentes tamaños de pantalla
- Modales que se ajustan al viewport
- Tablas con scroll horizontal en móviles

### **Accesibilidad**
- Labels descriptivos en formularios
- Títulos de botones con `title` attribute
- Contraste de colores adecuado
- Navegación por teclado

## 🔧 Funcionalidades Técnicas

### **Gestión de Estado**
- Estado local en cada componente
- Comunicación entre componentes via props
- Actualización de datos después de operaciones CRUD

### **Validación**
- Validación frontend en tiempo real
- Validación backend con mensajes de error
- Campos requeridos marcados con asterisco (*)

### **Integración API**
- Uso del servicio `apiService` centralizado
- Manejo de errores HTTP
- Estados de carga durante operaciones

### **Formateo de Datos**
- Fechas en formato colombiano
- Números con separadores de miles
- Monedas en pesos colombianos
- Porcentajes y decimales formateados

## 📊 Beneficios de la Modularización

### **✅ Mantenibilidad**
- Código más fácil de mantener y debuggear
- Responsabilidades claras por componente
- Menos acoplamiento entre funcionalidades

### **✅ Reutilización**
- Componentes pueden ser reutilizados en otras partes
- Lógica de formularios centralizada
- Funciones de utilidad compartidas

### **✅ Escalabilidad**
- Fácil agregar nuevas funcionalidades
- Estructura preparada para crecimiento
- Separación clara de concerns

### **✅ Testing**
- Componentes más fáciles de testear individualmente
- Mocks más simples para pruebas unitarias
- Cobertura de código más granular

## 🚀 Uso

```jsx
import VistaClientes from './VistaClientes';

// En tu ruta o componente padre
<VistaClientes />
```

El componente principal maneja automáticamente la navegación entre las diferentes vistas y modales.

## 🔄 Migración

La migración desde el componente monolítico mantiene la misma funcionalidad pero con mejor organización:

- **Antes:** 1 archivo de 1,131 líneas
- **Después:** 5 archivos especializados con responsabilidades claras
- **Funcionalidad:** 100% compatible
- **Mejoras:** Mejor organización, mantenibilidad y escalabilidad
