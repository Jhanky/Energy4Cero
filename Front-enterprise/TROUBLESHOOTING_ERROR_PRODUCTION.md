# Error de Producción: "Cannot read properties of undefined (reading 'useLayoutEffect')"

## 📋 Información del Error

**Error:** `Uncaught TypeError: Cannot read properties of undefined (reading 'useLayoutEffect')`
**Archivo:** `vendor-lV6LUuJ2.js:1:31374`
**Entorno:** Producción únicamente
**Estado:** Persistente después del downgrade de React 19 → 18

## 🔍 Análisis del Problema

### Contexto
- El error ocurre solo en producción, no en desarrollo
- Se encuentra en el chunk `vendor` del build de Vite
- La línea específica (31374) sugiere que alguna dependencia está intentando acceder a `React.useLayoutEffect` cuando `React` es `undefined`

### Configuración Actual
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0"
}
```

### Chunking Configuration (vite.config.js)
```javascript
manualChunks(id) {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom')) {
      return 'react-vendor';
    }
    if (id.includes('@radix-ui')) {
      return 'radix-vendor';
    }
    if (id.includes('recharts')) {
      return 'charts-vendor';
    }
    if (id.includes('zod') || id.includes('react-hook-form')) {
      return 'utils-vendor';
    }
    return 'vendor'; // ← Este chunk contiene el error
  }
}
```

## 🚨 Posibles Causas

### 1. Dependencias en el Vendor Chunk
El chunk `vendor` contiene dependencias que no están en chunks específicos:
- `framer-motion` (^12.15.0)
- `lucide-react` (^0.510.0)
- `next-themes` (^0.4.6)
- `sonner` (^2.0.3)
- `tailwind-merge` (^3.3.0)
- `vaul` (^1.1.2)
- `cmdk` (^1.1.1)
- `input-otp` (^1.4.2)
- `embla-carousel-react` (^8.6.0)
- `date-fns` (^3.6.0)
- `jspdf` y `jspdf-autotable`
- `clsx`, `class-variance-authority`

### 2. Problemas de Importación
- Una dependencia podría estar esperando React disponible globalmente
- Problemas de tree-shaking en producción
- Conflictos entre versiones de dependencias

### 3. Problemas de Build/Deploy
- Los archivos en producción no se actualizaron correctamente
- Cache del navegador sirviendo archivos antiguos
- Problemas de CORS o configuración del servidor

## ✅ Soluciones Intentadas

### 1. Downgrade de React (COMPLETADO)
- ✅ Cambiado React 19 → 18.2.0
- ✅ Actualizados tipos de TypeScript
- ✅ Rebuild exitoso
- ❌ Error persiste

### 2. Modificación de Chunking Strategy (COMPLETADO)
- ✅ Separadas dependencias problemáticas en chunks individuales:
  - `animation-vendor`: framer-motion
  - `ui-vendor`: next-themes, sonner
  - `calendar-vendor`: react-big-calendar, react-day-picker
  - `pdf-vendor`: jspdf
- ✅ Vendor chunk reducido de 1,078.88 kB → 674.07 kB
- ✅ Build exitoso con nueva estructura de chunks
- 🔄 Pendiente probar en producción

### 3. Verificación de Build
- ✅ Build completa sin errores
- ✅ Archivos generados correctamente
- 🔄 Pendiente verificación en producción

## 🔧 Soluciones Propuestas

### Solución 1: Modificar Chunking Strategy
```javascript
// En vite.config.js
manualChunks(id) {
  if (id.includes('node_modules')) {
    // Incluir React en todos los chunks que lo necesiten
    if (id.includes('react') || id.includes('react-dom')) {
      return 'react-vendor';
    }
    // Mover dependencias problemáticas a chunks separados
    if (id.includes('framer-motion')) {
      return 'animation-vendor';
    }
    if (id.includes('next-themes') || id.includes('sonner')) {
      return 'ui-vendor';
    }
    // ... resto de la configuración
  }
}
```

### Solución 2: Externalizar React
```javascript
// En vite.config.js
build: {
  rollupOptions: {
    external: ['react', 'react-dom'],
    output: {
      globals: {
        'react': 'React',
        'react-dom': 'ReactDOM'
      }
    }
  }
}
```

### Solución 3: Forzar React como Global
```javascript
// En index.html (solo para producción)
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

### Solución 4: Verificar Dependencias Problemáticas
Revisar versiones de:
- `framer-motion`: Considerar downgrade a versión estable anterior
- `react-big-calendar`: Verificar compatibilidad con React 18
- `react-router-dom`: Versión 7 es nueva, considerar versión 6

### Solución 5: Limpiar Build Cache
```bash
# Limpiar completamente
rm -rf node_modules dist
pnpm install
pnpm build
```

### Solución 6: Modificar Imports
Si se identifica la dependencia problemática, modificar sus imports:
```javascript
// En lugar de
import { useLayoutEffect } from 'react'

// Usar
import { useLayoutEffect } from 'react'
import React from 'react'
```

## 🐛 Debugging Steps

### 1. Identificar la Dependencia Problemática
```bash
# Ver contenido del vendor chunk
npx vite-bundle-analyzer dist/stats.html

# O usar source-map-explorer
npx source-map-explorer dist/assets/vendor-lV6LUuJ2.js --html > vendor-analysis.html
```

### 2. Verificar en Desarrollo vs Producción
```bash
# Deshabilitar minificación para debugging
# En vite.config.js
build: {
  minify: false,
  sourcemap: true
}
```

### 3. Console Logging
Agregar logs en el código para identificar cuándo ocurre el error:
```javascript
// En main.jsx
console.log('React version:', React.version);
console.log('React object:', React);
```

### 4. Verificar Network Tab
- Confirmar que se están cargando los archivos correctos
- Verificar que no hay archivos cacheados
- Comprobar CORS headers

## 📝 Checklist de Verificación

### Antes del Deploy
- [ ] Build completado sin errores
- [ ] Archivos en `dist/` actualizados
- [ ] Verificar tamaños de chunks
- [ ] Probar `npm run preview` localmente

### Durante el Deploy
- [ ] Limpiar cache del servidor
- [ ] Verificar permisos de archivos
- [ ] Comprobar configuración del servidor web
- [ ] Verificar headers CORS

### Después del Deploy
- [ ] Hard refresh del navegador (Ctrl+F5)
- [ ] Verificar en incógnito mode
- [ ] Comprobar network tab
- [ ] Verificar console logs

## 🎯 Próximos Pasos Recomendados

1. **Implementar Solución 1**: Modificar la estrategia de chunking
2. **Probar Solución 4**: Verificar versiones de dependencias críticas
3. **Usar Solución 5**: Limpiar completamente y rebuild
4. **Debugging**: Usar source-map-explorer para identificar la dependencia exacta

## 📊 Estado Actual
- ✅ Downgrade React 19 → 18.2.0 completado
- ✅ Modificación de chunking strategy implementada
- ✅ Build exitoso con nueva estructura de chunks
- 🔄 Pendiente deploy y verificación en producción

### Nueva Estructura de Chunks (Build Actual)
```
vendor-DI86NohJ.js         674.07 kB  (reducido de 1,078.88 kB)
ui-vendor-CXoaXsGQ.js       34.70 kB  (next-themes, sonner)
pdf-vendor-bMu90X-t.js     370.23 kB  (jspdf)
charts-vendor-IMkDl8WC.js  281.91 kB  (recharts)
react-vendor-yt6JnmQP.js   443.81 kB  (React y React-DOM)
radix-vendor-CttiZxwU.js     0.22 kB  (@radix-ui components)
```

---

**Fecha de creación:** Diciembre 2025
**Última actualización:** Diciembre 2025
**Estado:** Solución implementada - Pendiente verificación en producción
