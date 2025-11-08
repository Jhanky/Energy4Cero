# Proyecto Enterprise - Resumen General

## Información del Proyecto

### Backend
- **Nombre:** Backend-Enterprise
- **Tecnología:** Laravel 10.x
- **Puerto de desarrollo:** 8000
- **URL de producción:** https://www.apitest.energy4cero.com/public/

### Frontend
- **Nombre:** Front-enterprise
- **Tecnología:** React + Vite
- **Puerto de desarrollo:** 5173
- **URL de producción:** https://enterprise.energy4cero.com/

## Funcionalidades Principales

### 1. Gestión de Clientes
- ✅ Creación, edición y eliminación de clientes
- ✅ Importación masiva desde Excel/CSV
- ✅ Visualización de detalles de clientes
- ✅ Búsqueda y filtrado avanzado
- ✅ Gestión de estados (activo/inactivo)

### 2. Gestión de Proyectos
- ✅ Creación, edición y eliminación de proyectos
- ✅ Seguimiento de estados del proyecto
- ✅ Gestión de hitos y eventos
- ✅ Asociación de documentos a proyectos
- ✅ Visualización de timeline de proyecto

### 3. Gestión de Hitos
- ✅ Creación de hitos con tipos específicos
- ✅ Asociación de responsables y participantes
- ✅ Adjuntar documentos a hitos
- ✅ Visualización en timeline del proyecto
- ✅ Gestión de estados de hitos

### 4. Gestión de Documentos
- ✅ Subida de documentos a proyectos y hitos
- ✅ Visualización y descarga de documentos
- ✅ Clasificación por tipos de documentos
- ✅ Búsqueda y filtrado de documentos

## Tecnologías Utilizadas

### Backend
- **Framework:** Laravel 10.x
- **PHP Version:** 8.1+
- **Database:** MySQL 8.0+
- **Authentication:** Laravel Sanctum
- **Authorization:** Spatie Laravel Permission
- **File Processing:** PhpOffice\PhpSpreadsheet
- **API Documentation:** (Pendiente de implementar)

### Frontend
- **Framework:** React 18.x
- **Bundler:** Vite 4.x
- **UI Library:** TailwindCSS + Lucide Icons
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Routing:** React Router DOM

## Estructura de Directorios

### Backend
```
Backend-Enterprise/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   └── Middleware/
│   ├── Models/
│   ├── Services/
│   └── Traits/
├── config/
├── database/
│   ├── migrations/
│   ├── seeders/
│   └── factories/
├── routes/
├── resources/
├── storage/
├── tests/
└── .qwen/
```

### Frontend
```
Front-enterprise/
├── public/
├── src/
│   ├── components/
│   │   ├── clientes/
│   │   ├── proyectos/
│   │   └── shared/
│   ├── pages/
│   │   ├── administrativa/
│   │   ├── comercial/
│   │   ├── contable/
│   │   ├── home/
│   │   ├── login/
│   │   ├── proyectos/
│   │   ├── soporte/
│   │   └── tareas/
│   ├── services/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── utils/
│   └── shared/
└── .qwen/
```

## Variables de Entorno

### Backend (.env)
```env
APP_NAME=Energy4Cero Backend
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
```

### Frontend (.env)
```env
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_NAME=Energy4Cero Enterprise
VITE_APP_VERSION=1.0.0
```

## Comandos Útiles

### Backend
```bash
# Instalar dependencias
composer install

# Iniciar servidor de desarrollo
php artisan serve

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders
php artisan db:seed

# Generar key de aplicación
php artisan key:generate

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Frontend
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## Desarrolladores

### Equipo Actual
- **Líder Técnico:** Jhan Carlos Polo
- **Desarrolladores Backend:** 
- **Desarrolladores Frontend:** 

### Contacto
- **Email de soporte:** 
- **Slack/Teams:** 

## Fecha de Última Actualización
2025-10-29

## Versión del Proyecto
1.0.0