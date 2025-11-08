# Inicio del Proyecto Enterprise - Backend

## Requisitos Previos

### Backend (Laravel)
- PHP 8.1 o superior
- Composer
- MySQL 8.0 o superior
- Node.js 16+ (para algunas herramientas de desarrollo)
- Git

### Frontend (React + Vite)
- Node.js 16+ LTS
- npm o yarn
- Git

## Configuración Inicial

### 1. Clonar Repositorios
```bash
# Clonar ambos repositorios
git clone <repositorio-backend> Backend-Enterprise
git clone <repositorio-frontend> Front-enterprise
```

### 2. Configurar Backend
```bash
# Navegar al directorio del backend
cd Backend-Enterprise

# Instalar dependencias de PHP
composer install

# Copiar archivo de entorno
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Configurar base de datos en .env
# DB_DATABASE=gestion
# DB_USERNAME=root
# DB_PASSWORD=tu_contraseña

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders (datos iniciales)
php artisan db:seed

# Iniciar servidor de desarrollo
php artisan serve
# El backend estará disponible en http://127.0.0.1:8000
```

### 3. Configurar Frontend
```bash
# Navegar al directorio del frontend
cd Front-enterprise

# Instalar dependencias de Node.js
npm install

# Copiar archivo de entorno
cp .env.example .env

# Configurar la URL del API en .env
# VITE_API_URL=http://127.0.0.1:8000/api

# Iniciar servidor de desarrollo
npm run dev
# El frontend estará disponible en http://127.0.0.1:5173
```

## Estructura de Desarrollo

### Backend
```
Backend-Enterprise/
├── app/                    # Código de la aplicación
│   ├── Http/              # Controladores y middleware
│   │   └── Controllers/
│   │       └── Api/       # Controladores API
│   ├── Models/            # Modelos de datos
│   ├── Services/          # Servicios de negocio
│   └── Traits/            # Traits reutilizables
├── config/                # Configuración de la aplicación
├── database/              # Base de datos (migraciones, seeders)
├── routes/                # Definición de rutas
├── resources/             # Recursos (vistas, idiomas)
├── storage/               # Almacenamiento (logs, archivos)
├── tests/                 # Pruebas unitarias e integración
└── .qwen/                 # Documentación del proyecto
```

### Frontend
```
Front-enterprise/
├── public/                # Archivos públicos estáticos
├── src/                   # Código fuente de la aplicación
│   ├── components/        # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios de API
│   ├── contexts/          # Contextos de React
│   ├── data/              # Datos estáticos y utilidades
│   ├── hooks/             # Hooks personalizados
│   ├── utils/             # Funciones utilitarias
│   └── shared/            # Componentes y utilidades compartidas
├── .qwen/                 # Documentación del proyecto
└── vite.config.js         # Configuración de Vite
```

## Comandos de Desarrollo

### Backend
```bash
# Servidor de desarrollo
php artisan serve

# Servidor de desarrollo en puerto específico
php artisan serve --port=8000

# Recargar configuración
php artisan config:cache

# Limpiar cache
php artisan cache:clear

# Ejecutar migraciones
php artisan migrate

# Revertir última migración
php artisan migrate:rollback

# Refrescar todas las migraciones
php artisan migrate:refresh

# Ejecutar seeders
php artisan db:seed

# Generar controlador API
php artisan make:controller Api/NombreController --api

# Generar modelo
php artisan make:model Nombre -mf

# Generar migración
php artisan make:migration create_nombre_table

# Generar seeder
php artisan make:seeder NombreSeeder

# Generar factory
php artisan make:factory NombreFactory

# Ejecutar tests
php artisan test

# Ver rutas registradas
php artisan route:list
```

### Frontend
```bash
# Servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar tests
npm run test

# Ejecutar linting
npm run lint

# Ejecutar formateo de código
npm run format

# Generar componentes
npm run generate:component NombreComponente

# Generar páginas
npm run generate:page NombrePagina

# Generar servicios
npm run generate:service NombreServicio
```

## Estructura de Carpetas .qwen

Ambos proyectos tienen una carpeta `.qwen` con documentación importante:

### Backend/.qwen/
- `registro_cambios.md` - Registro de cambios realizados
- `tareas_pendientes.md` - Tareas pendientes por implementar
- `resumen_proyecto.md` - Resumen general del proyecto
- `inicio_proyecto.md` - Guía de inicio del proyecto

### Frontend/.qwen/
- `registro_cambios.md` - Registro de cambios realizados
- `tareas_pendientes.md` - Tareas pendientes por implementar
- `resumen_proyecto.md` - Resumen general del proyecto
- `inicio_proyecto.md` - Guía de inicio del proyecto

## URLs de Desarrollo

### Backend
- **API Base URL:** `http://127.0.0.1:8000/api`
- **Documentación API:** `http://127.0.0.1:8000/api/documentation` (si está implementada)
- **Swagger/OpenAPI:** `http://127.0.0.1:8000/api/swagger` (si está implementada)

### Frontend
- **URL de desarrollo:** `http://127.0.0.1:5173`
- **Vite HMR:** Puerto automático (normalmente 5173 + 1 = 5174)

## Credenciales de Desarrollo

### Usuario Administrador por Defecto
```
Email: admin@energy4cero.com
Contraseña: password
```

### Usuarios de Prueba
```
Email: gerente@energy4cero.com
Contraseña: password

Email: comercial@energy4cero.com
Contraseña: password

Email: contador@energy4cero.com
Contraseña: password

Email: ingeniero@energy4cero.com
Contraseña: password

Email: tecnico@energy4cero.com
Contraseña: password
```

## Troubleshooting

### Problemas Comunes

#### 1. Error "Class '...' not found" en Backend
```bash
# Autocargar clases
composer dump-autoload

# Limpiar cache de Laravel
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

#### 2. Error "Module not found" en Frontend
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
rm package-lock.json
npm install
```

#### 3. Error de CORS en desarrollo
Verificar que `cors.php` tenga configurado:
```php
'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
```

#### 4. Error de migración "table doesn't exist"
```bash
# Crear base de datos si no existe
php artisan migrate:fresh
# o
php artisan migrate:refresh
```

#### 5. Error de autenticación
```bash
# Regenerar clave de aplicación
php artisan key:generate

# Limpiar cache de configuración
php artisan config:clear
php artisan config:cache
```

## Fecha de Última Actualización
2025-10-29

## Versión del Proyecto
1.0.0