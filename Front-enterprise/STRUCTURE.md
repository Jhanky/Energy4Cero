# Estructura del Proyecto Front-enterprise

## Descripción General

Este proyecto es una aplicación empresarial desarrollada con React y siguiendo la metodología de Feature-Sliced Design para una arquitectura escalable y mantenible.

## Estructura del Directorio

```
src/
├── app/                    # Configuración de la aplicación
│   └── router/             # Configuración del enrutamiento principal
├── assets/                 # Recursos estáticos (imágenes, fuentes, etc.)
│   └── icons/              # Componentes de iconos
├── components/             # Componentes compartidos deprecados
├── config/                 # Configuraciones generales
├── constants/              # Constantes del proyecto
├── contexts/               # Contextos de React
├── data/                   # Datos estáticos para desarrollo y pruebas
├── docs/                   # Documentación del proyecto
├── entities/               # Entidades de negocio (vacío actualmente)
├── features/               # Features o módulos de negocio
│   ├── administrativa/     # Módulo de administración
│   │   ├── ui/             # Componentes UI del módulo
│   │   ├── model/          # Lógica de estado y efectos
│   │   └── lib/            # Utilidades específicas del feature
│   ├── clientes/           # Módulo de clientes
│   │   ├── ui/             # Componentes UI
│   │   ├── model/          # Lógica de estado
│   │   └── lib/            # Utilidades
│   ├── comercial/          # Módulo comercial
│   │   ├── clientes/       # Submódulo de clientes
│   │   ├── cotizaciones/   # Submódulo de cotizaciones
│   │   ├── suministros/    # Submódulo de suministros
│   │   ├── ui/             # Componentes UI
│   │   ├── model/          # Lógica de estado
│   │   └── lib/            # Utilidades
│   ├── contable/           # Módulo contable
│   │   ├── ui/             # Componentes UI
│   │   ├── model/          # Lógica de estado
│   │   └── lib/            # Utilidades
│   ├── proyectos/          # Módulo de proyectos
│   │   ├── ui/             # Componentes UI
│   │   ├── model/          # Lógica de estado
│   │   └── lib/            # Utilidades
│   └── soporte/            # Módulo de soporte
│       ├── ui/             # Componentes UI
│       ├── model/          # Lógica de estado
│       └── lib/            # Utilidades
├── hooks/                  # Hooks personalizados
├── layouts/                # Componentes de layout
│   └── Layout.jsx          # Layout principal de la aplicación
├── lib/                    # Librerías y utilidades generales
├── pages/                  # Componentes de página (vistas de nivel superior)
│   ├── administrativa/     # Páginas del módulo administrativo
│   ├── comercial/          # Páginas del módulo comercial
│   ├── contable/           # Páginas del módulo contable
│   ├── home/               # Páginas de inicio
│   ├── login/              # Páginas de login (vacío actualmente)
│   ├── proyectos/          # Páginas del módulo de proyectos
│   └── soporte/            # Páginas del módulo de soporte
├── routes/                 # Configuración de rutas (archivos deprecados)
├── services/               # Servicios de API
│   └── cotizacionesService # Servicios específicos para cotizaciones
├── shared/                 # Componentes y utilidades compartidas
│   ├── config/             # Configuraciones compartidas
│   ├── hooks/              # Hooks compartidos
│   ├── lib/                # Utilidades compartidas
│   └── ui/                 # Componentes de UI genéricos
├── styles/                 # Estilos globales
├── test/                   # Archivos de prueba
├── ui/                     # Componentes de UI de bajo nivel (shadcn/ui)
├── utils/                  # Utilidades generales
├── views/                  # Componentes de vista deprecados
├── widgets/                # Componentes complejos que combinan features
│   ├── auth/               # Componentes de autenticación
│   ├── login-form/         # Componentes del formulario de login
│   └── user-header/        # Componentes del header de usuario
├── _shared/                # Directorio deprecado
├── App.jsx                 # Componente principal de la aplicación
├── App.css                 # Estilos globales de la aplicación
└── main.jsx                # Punto de entrada de la aplicación
```

## Arquitectura por Capas

### 1. **Shared Layer (`shared/`)**
- Contiene componentes, utilidades y hooks genéricos reutilizables
- Componentes que no tienen lógica de negocio específica
- No debe contener lógica específica de features

### 2. **Entities Layer (`entities/`)**
- Representa objetos de negocio fundamentales
- Contiene la lógica y componentes relacionados con entidades centrales
- Ejemplos: User, Role, Cliente

### 3. **Features Layer (`features/`)**
- Contiene funcionalidades específicas de negocio
- Cada feature es independiente y contiene su lógica
- Organizado en subdirectorios: ui/, model/, lib/
- Ejemplos: administrativa, comercial, contable, proyectos

### 4. **Widgets Layer (`widgets/`)**
- Componentes complejos que combinan múltiples features
- Componentes que cruzan diferentes áreas del negocio
- Ejemplos: UserHeader, LoginForm

### 5. **Pages Layer (`pages/`)**
- Componentes de nivel superior que representan vistas completas
- Orquestan features y widgets para formar páginas
- Mapean directamente a rutas de la aplicación

## Convenciones de Nomenclatura

### Directorios
- Usar kebab-case para nombres de directorios
- Nombres descriptivos que reflejen la funcionalidad
- Estructura: `feature-name/ui`, `feature-name/model`, `feature-name/lib`

### Componentes
- Usar PascalCase para nombres de componentes React
- Nombres descriptivos y específicos
- Sufijos: `Component.jsx`, `View.jsx`, `Modal.jsx`, `Form.jsx`

## Principios de Organización

1. **Principio de Responsabilidad Única**: Cada archivo y componente debe tener una sola responsabilidad.

2. **Separação de Preocupações**: 
   - Lógica de negocio separada de la presentación
   - Componentes UI separados de la lógica de datos

3. **Reusabilidad**: 
   - Componentes genéricos en `shared/ui/`
   - Componentes específicos en `features/feature-name/ui/`

4. **Escalabilidad**: 
   - Estructura fácil de extender
   - Nuevo features se agregan como nuevas carpetas

5. **Principios de Feature-Sliced Design**:
   - Separación clara entre capas
   - Independencia de features
   - Composición de componentes

## Componentes Clave

### Componentes de UI Comunes (`shared/ui/`)
- `LoadingSpinner.jsx` - Indicador de carga
- `Notification.jsx` - Componente de notificaciones
- `Pagination.jsx` - Componente de paginación
- `SearchBar.jsx` - Componente de búsqueda

### Componentes de Layout (`layouts/`)
- `Layout.jsx` - Layout principal con sidebar y header

### Componentes de Autenticación (`widgets/auth/`, `widgets/login-form/`)
- `ProtectedRoute.jsx` - Ruta protegida por autenticación
- `Login.jsx` - Formulario de login
- `UserHeader.jsx` - Header con información del usuario

## Dependencias y Configuración

### Tecnologías principales
- React 18 (con hooks)
- React Router DOM (para enrutamiento)
- Lucide React (librería de iconos)
- Tailwind CSS (estilos)
- Vite (herramienta de build)

## Convenciones de Desarrollo

### Para nuevos Features
1. Crear directorio en `features/feature-name/`
2. Dentro, crear subdirectorios: `ui/`, `model/`, `lib/`
3. Agregar componentes de UI en `ui/`
4. Agregar lógica de estado en `model/`
5. Agregar utilidades específicas del feature en `lib/`

### Para nuevos Componentes Compartidos
1. Colocar en `shared/ui/` si es un componente general
2. Colocar en `shared/lib/` si es una utilidad
3. Colocar en `shared/hooks/` si es un hook personalizado

## Rutas de la Aplicación

La aplicación tiene un sistema de rutas protegidas con autenticación y permisos específicos por rol. Las rutas principales incluyen:
- `/login` - Página de inicio de sesión
- `/home` - Página principal según rol del usuario
- `/cotizaciones` - Gestión de cotizaciones
- `/clientes` - Gestión de clientes
- `/proyectos` - Gestión de proyectos
- `/usuarios` - Gestión de usuarios
- `/roles` - Gestión de roles y permisos
- `/cotizaciones/:id` - Detalle de cotización específica

## Notas Importantes

- Los directorios `components/` y `views/` están deprecados pero se mantienen para compatibilidad temporal
- La configuración de rutas principal se encuentra en `App.jsx`
- El contexto de autenticación se maneja en `contexts/AuthContext.jsx`
- La mayoría de los componentes de UI de bajo nivel se encuentran en `ui/` siguiendo el patrón de shadcn/ui