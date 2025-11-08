# 🌞 Enterprise - Sistema de Gestión Empresarial

## 📋 **Descripción**

**Enterprise** es un sistema de gestión de procesos empresariales especializado en proyectos de energía solar y fotovoltaicos. Proporciona una plataforma integral para la administración, seguimiento y control de proyectos energéticos.

## 🎯 **Características Principales**

### 🔐 **Sistema de Autenticación**
- Login seguro con validación de credenciales
- Manejo de errores específicos y descriptivos
- Redirección automática al logout
- Verificación de sesión en tiempo real

### 👥 **Gestión de Roles**
- **Administrador:** Acceso completo al sistema
- **Gerente:** Gestión de proyectos y equipos
- **Contador:** Control financiero y contable
- **Ingeniero:** Diseño y supervisión técnica
- **Técnico:** Ejecución y mantenimiento

### 🏗️ **Módulos del Sistema**
- **Dashboard Ejecutivo:** Resumen general de proyectos
- **Gestión de Proyectos:** Seguimiento y control
- **Análisis y Reportes:** Métricas y estadísticas
- **Control Financiero:** Presupuestos y costos
- **Gestión Técnica:** Especificaciones y mantenimiento

## 🚀 **Tecnologías**

### **Frontend**
- React 18 + Vite
- Tailwind CSS
- Lucide React (iconos)
- Hooks personalizados para autenticación

### **Backend**
- Laravel 10 + PHP 8.1
- Laravel Sanctum (autenticación API)
- Base de datos MySQL/PostgreSQL
- Sistema de roles y permisos

## 🛠️ **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+
- PHP 8.1+
- Composer
- MySQL/PostgreSQL

### **Frontend**
```bash
cd Front-enterprise
npm install
npm run dev
```

### **Backend**
```bash
cd Back-enterprise
composer install
php artisan migrate
php artisan db:seed
php artisan serve
```

## 🔧 **Configuración**

### **Variables de Entorno**
Crear archivo `.env.local` en el frontend:
```env
VITE_API_URL=http://localhost:8000/api
```

### **Base de Datos**
El sistema incluye seeders con:
- 5 roles principales
- Usuarios de ejemplo para cada rol
- Permisos predefinidos

## 📱 **Uso del Sistema**

### **Login**
1. Acceder a `http://localhost:5173`
2. Ingresar credenciales válidas
3. El sistema redirigirá automáticamente al dashboard

### **Navegación**
- **Dashboard:** Vista general de proyectos
- **Proyectos:** Gestión detallada de proyectos
- **Análisis:** Reportes y métricas
- **Financiero:** Control de costos
- **Técnico:** Especificaciones y mantenimiento

## 🔒 **Seguridad**

- Autenticación basada en tokens (Sanctum)
- Verificación de sesión automática
- Redirección segura en logout
- Validación de roles y permisos
- Manejo seguro de errores

## 📊 **Características Técnicas**

- **Responsive Design:** Adaptable a todos los dispositivos
- **Real-time Updates:** Actualizaciones en tiempo real
- **Error Handling:** Manejo robusto de errores
- **Performance:** Optimizado para rendimiento
- **Scalability:** Arquitectura escalable

## 🎨 **Diseño**

- **Tema:** Colores naturales (verde/esmeralda)
- **Iconografía:** Iconos relacionados con naturaleza y energía solar
- **UX:** Interfaz intuitiva y moderna
- **Accesibilidad:** Cumple estándares de accesibilidad

## 📈 **Roadmap**

- [ ] Módulo de inventario
- [ ] Sistema de notificaciones
- [ ] Integración con APIs externas
- [ ] Dashboard móvil
- [ ] Reportes avanzados

## 🤝 **Contribución**

Para contribuir al proyecto:
1. Fork del repositorio
2. Crear rama feature
3. Commit de cambios
4. Pull request

## 📄 **Licencia**

© 2025 Enterprise - Sistema de Gestión Empresarial
Todos los derechos reservados.