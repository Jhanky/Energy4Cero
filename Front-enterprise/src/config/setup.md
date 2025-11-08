# Configuración del Frontend

## 📋 Pasos para configurar el proyecto

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto Front-enterprise:

```bash
# .env.local
VITE_API_URL=http://localhost:8000/api
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
# o
pnpm dev
```

### 4. Verificar que el backend esté ejecutándose

El backend Laravel debe estar ejecutándose en `http://localhost:8000`:

```bash
cd ../Back-enterprise
php artisan serve
```

## 🔧 Configuración Actual

- **URL de la API:** `http://localhost:8000/api`
- **Puerto del frontend:** `5173` (por defecto de Vite)
- **Puerto del backend:** `8000`

## 🧪 Probar el Login

1. Abre el navegador en `http://localhost:5173`
2. Usa cualquiera de las credenciales de prueba:
   - **Admin:** `admin@air-e.com.co` / `admin123`
   - **Gerente:** `carlos.mendoza@air-e.com.co` / `gerente123`
   - **Contador:** `ana.rodriguez@air-e.com.co` / `contador123`
   - **Ingeniero:** `luis.martinez@air-e.com.co` / `ingeniero123`
   - **Técnico:** `maria.gonzalez@air-e.com.co` / `tecnico123`

## 🚨 Solución de Problemas

### Error de CORS
Si hay problemas de CORS, verifica que el backend tenga configurado CORS correctamente.

### Error de conexión
Verifica que:
1. El backend esté ejecutándose en el puerto 8000
2. La variable `VITE_API_URL` esté configurada correctamente
3. No haya firewall bloqueando la conexión
