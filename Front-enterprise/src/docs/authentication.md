# Sistema de Autenticación y Redirección Automática

## 🔐 **Características Implementadas**

### ✅ **Redirección Automática al Login**

1. **Logout Manual:**
   - Al hacer clic en "Cerrar Sesión"
   - Se limpia el localStorage
   - Se recarga la página automáticamente
   - Redirige al login

2. **Sesión Expirada:**
   - Detección automática de tokens expirados
   - Verificación cada 5 minutos
   - Verificación al volver a la pestaña
   - Pantalla de "Sesión Expirada" antes del redirect

3. **Errores 401:**
   - Interceptor automático en todas las peticiones API
   - Limpieza inmediata de sesión
   - Redirección automática al login

### 🛡️ **Hooks de Seguridad**

#### `useAuthGuard`
- Verifica autenticación cada 30 segundos
- Maneja redirección automática
- Limpia sesión en caso de error

#### `useSessionTimeout`
- Verificación periódica de sesión (5 minutos)
- Detección de cambios de visibilidad de página
- Manejo elegante de sesiones expiradas

### 🔄 **Flujo de Redirección**

```
Usuario hace logout
    ↓
Limpia localStorage
    ↓
Recarga página
    ↓
useAuth detecta no autenticado
    ↓
Muestra componente Login
```

### 🚨 **Casos de Redirección Automática**

1. **Token expirado:** API devuelve 401
2. **Logout manual:** Usuario hace clic en cerrar sesión
3. **Sesión inválida:** Verificación periódica falla
4. **Cambio de pestaña:** Al volver, verifica sesión
5. **Error de red:** Si no puede conectar con el backend

### 📱 **Componentes de UI**

#### `SessionExpired`
- Pantalla elegante cuando la sesión expira
- Auto-redirect después de 3 segundos
- Indicador visual de redirección

#### `Login`
- Formulario de autenticación
- Manejo de errores
- Credenciales de prueba incluidas

### 🔧 **Configuración**

El sistema está configurado para:
- **Verificación cada 30 segundos** (useAuthGuard)
- **Verificación cada 5 minutos** (useSessionTimeout)
- **Auto-redirect en 3 segundos** (SessionExpired)
- **Limpieza completa** de localStorage en logout

### 🧪 **Pruebas**

Para probar la redirección automática:

1. **Login normal:** Usar credenciales válidas
2. **Logout manual:** Hacer clic en "Cerrar Sesión"
3. **Simular expiración:** Cambiar token en localStorage
4. **Verificar redirección:** Debe volver al login automáticamente
