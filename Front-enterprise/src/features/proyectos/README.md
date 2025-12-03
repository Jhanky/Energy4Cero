# 📁 Gestión de Proyectos

Esta carpeta contiene todos los componentes relacionados con la gestión de proyectos fotovoltaicos, siguiendo la arquitectura de features definida en `PROJECT_ARCHITECTURE.md`.

## 🏗️ Arquitectura

La implementación sigue el patrón de arquitectura híbrida donde las páginas actúan como orquestadores y la lógica reside en módulos de características (`features`).

### 📁 Estructura Completa

```
src/features/proyectos/
├── hooks/
│   ├── useProyectos.js              # Gestión de lista de proyectos
│   ├── useProyectoDetalle.js        # Datos básicos del proyecto
│   ├── useProyectoHitos.js          # Gestión de hitos y eventos
│   ├── useProyectoDocumentos.js     # Gestión documental
│   ├── useProyectoTimeline.js       # Timeline de estados
│   └── useProyectoObservaciones.js  # Observaciones editables
├── components/
│   ├── ProyectoStats.jsx            # Dashboard de estadísticas
│   ├── ProyectosTable.jsx           # Tabla de proyectos
│   ├── ProyectoModal.jsx            # Modal CRUD proyectos
│   ├── ProyectoInfoGeneral.jsx      # Info cliente/ubicación/especificaciones
│   ├── ProyectoInfoComercial.jsx    # Info comercial/fechas
│   ├── ProyectoTimelineEstados.jsx  # Timeline visual de estados
│   ├── ProyectoObservaciones.jsx    # Observaciones editables
│   ├── ProyectoProximaAccion.jsx    # Próxima acción
│   ├── ProyectoHitosTimeline.jsx    # Timeline de hitos
│   └── ProyectoDocumentosGrid.jsx   # Grid de documentos
├── ui/
│   ├── ProyectoFilters.jsx          # Filtros de proyectos
│   ├── ProyectoSearchBar.jsx        # Barra de búsqueda
│   ├── ProyectoTabs.jsx             # Navegación por pestañas
│   └── ProyectoHeader.jsx           # Header con navegación
├── index.js                         # Exportaciones centralizadas
└── README.md                        # Esta documentación
```

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1: Gestión de Proyectos (COMPLETADA)
- **VistaProyectos.jsx**: Página orquestadora refactorizada (~50 líneas vs 400+ líneas originales)
- **Hook useProyectos**: Gestión completa del estado, lógica CRUD y efectos
- **Componentes especializados**:
  - `ProyectoStats`: Dashboard con métricas en tiempo real
  - `ProyectosTable`: Tabla responsive con acciones (ver, editar, eliminar)
  - `ProyectoModal`: Formulario completo para creación/edición (sin campo responsable - viene de cotización)
  - `ProyectoFilters`: Filtros por estado y cliente
  - `ProyectoSearchBar`: Búsqueda con debounce
- **Correcciones aplicadas**:
  - Campo `estimated_cost` → `contract_value` (valor del contrato)
  - Responsable no editable (viene del usuario que realizó la cotización)
  - Fix error Radix UI SelectItem con valores vacíos

### ✅ Fase 2: Detalle de Proyecto (COMPLETADA)
- **DetalleProyecto.jsx**: Página orquestadora refactorizada (~150 líneas vs 800+ líneas originales)
- **Hooks especializados**:
  - `useProyectoDetalle`: Carga y actualización de datos básicos del proyecto
  - `useProyectoHitos`: Gestión completa de hitos y eventos con transformación de usuarios
  - `useProyectoDocumentos`: Gestión documental con búsqueda y filtrado
  - `useProyectoTimeline`: Timeline de estados del proyecto
  - `useProyectoObservaciones`: Edición de observaciones Air-e y comentarios internos
- **Componentes de vista especializados**:
  - `ProyectoInfoGeneral`: Información cliente, ubicación y especificaciones técnicas
  - `ProyectoInfoComercial`: Información comercial y fechas clave
  - `ProyectoTimelineEstados`: Timeline visual de estados del proyecto
  - `ProyectoObservaciones`: Edición de observaciones y comentarios
  - `ProyectoProximaAccion`: Próxima acción programada
  - `ProyectoHitosTimeline`: Timeline de hitos con detalles expandibles
  - `ProyectoDocumentosGrid`: Grid de documentos con búsqueda
- **Componentes UI especializados**:
  - `ProyectoTabs`: Navegación entre vistas (General, Hitos, Documentos)
  - `ProyectoHeader`: Header con título, progreso y navegación
- **Beneficios logrados**:
  - Reducción de complejidad: 800+ líneas → ~150 líneas en página principal
  - Separación clara de responsabilidades
  - Reutilización de componentes
  - Mejor mantenibilidad y testabilidad

## 📋 Próximas Funcionalidades (Opcionales)

### Vistas Adicionales
- **VistaResumen.jsx** - Resumen ejecutivo de proyectos
- **VistaAnalisis.jsx** - Análisis y métricas avanzadas
- **VistaAire.jsx** - Seguimiento específico de proyectos Air-e
- **VistaMapa.jsx** - Visualización geográfica de proyectos

### Mejoras de UX/UI
- **Notificaciones en tiempo real** para cambios de estado
- **Dashboard ejecutivo** con KPIs principales
- **Exportación de reportes** en múltiples formatos
- **Filtros avanzados** por fecha, ubicación, valor

## 🔧 Beneficios de la Reestructuración

- **Reducción de complejidad**: `VistaProyectos.jsx` pasó de 400+ a ~50 líneas
- **Reutilización**: Componentes del feature pueden usarse en múltiples vistas
- **Mantenibilidad**: Lógica centralizada en hooks, fácil de testear
- **Consistencia**: Sigue el patrón establecido en otros módulos (suministros, usuarios)
- **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar el código existente

## 📖 Uso

```jsx
import { useProyectos, ProyectoStats, ProyectosTable } from '@/features/proyectos';

// En un componente de página
const MiPagina = () => {
  const {
    proyectos, loading, stats,
    modalState, openModal, closeModal,
    handleSubmit, handleDelete
  } = useProyectos();

  return (
    <div>
      <ProyectoStats stats={stats} loading={loading} />
      <ProyectosTable
        proyectos={proyectos}
        loading={loading}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
};
```

## 🔗 Referencias

- [Guía de Arquitectura](../../PROJECT_ARCHITECTURE.md)
- [Módulo de Suministros](../suministros/) - Implementación de referencia
