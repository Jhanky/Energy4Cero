# Sistema de Diseño - Enterprise

## Visión General

Este documento establece las pautas de diseño para la aplicación Enterprise, asegurando consistencia visual y experiencia de usuario coherente en todas las sesiones de desarrollo.

## 🎨 Paleta de Colores

### Colores Primarios
La aplicación utiliza un esquema de colores basado en tonos verdes y azules, representando energía y confianza.

#### Verde Principal (Brand)
```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```
- **Uso**: Botones principales, enlaces activos, elementos destacados
- **RGB**: #1a1a1a (modo claro), #f8f9fa (modo oscuro)

#### Verde Secundario (Accent)
```css
--accent: oklch(0.97 0 0);
--accent-foreground: oklch(0.205 0 0);
```
- **Uso**: Fondos secundarios, hover states, elementos complementarios

### Estados y Feedback

#### Éxito
```css
--destructive: oklch(0.577 0.245 27.325);
```
- **Uso**: Mensajes de éxito, confirmaciones, estados positivos

#### Error/Destrucción
```css
--destructive: oklch(0.577 0.245 27.325);
```
- **Uso**: Errores, eliminación, acciones peligrosas

#### Advertencia
```css
--warning: oklch(0.769 0.188 70.08);
```
- **Uso**: Advertencias, atención requerida

#### Información
```css
--info: oklch(0.6 0.118 184.704);
```
- **Uso**: Información general, estados neutros

### Gráficos y Datos
```css
--chart-1: oklch(0.646 0.222 41.116);  /* Azul principal */
--chart-2: oklch(0.6 0.118 184.704);   /* Azul secundario */
--chart-3: oklch(0.398 0.07 227.392);  /* Púrpura */
--chart-4: oklch(0.828 0.189 84.429);  /* Amarillo */
--chart-5: oklch(0.769 0.188 70.08);   /* Naranja */
```

## 📝 Tipografía

### Familia de Fuentes
- **Principal**: Sistema (Inter, -apple-system, BlinkMacSystemFont, etc.)
- **Monospace**: Para código y datos técnicos

### Jerarquía Tipográfica

#### Títulos
- **H1**: `text-4xl font-bold` (36px) - Títulos de página principales
- **H2**: `text-3xl font-bold` (30px) - Secciones principales
- **H3**: `text-2xl font-semibold` (24px) - Subsecciones
- **H4**: `text-xl font-semibold` (20px) - Títulos de tarjetas/componentes
- **H5**: `text-lg font-medium` (18px) - Etiquetas importantes
- **H6**: `text-base font-medium` (16px) - Etiquetas secundarias

#### Texto Base
- **Párrafo**: `text-base` (16px) - Texto principal
- **Texto secundario**: `text-sm` (14px) - Descripciones, metadata
- **Texto pequeño**: `text-xs` (12px) - Etiquetas, footnotes

### Pesos de Fuente
- **Light**: 300 - Texto secundario
- **Regular**: 400 - Texto base
- **Medium**: 500 - Énfasis moderado
- **Semibold**: 600 - Títulos secundarios
- **Bold**: 700 - Títulos principales, botones

## 🎯 Iconos

### Biblioteca
- **Lucide React**: Biblioteca principal de iconos
- **Tamaño estándar**: `w-4 h-4` (16px) para elementos inline
- **Tamaño grande**: `w-5 h-5` (20px) para botones principales
- **Tamaño extra grande**: `w-6 h-6` (24px) para elementos destacados

### Uso Contextual
- **Navegación**: Iconos de 16px con texto
- **Acciones**: Iconos de 20px en botones
- **Estados**: Iconos específicos para feedback (check, x, alert-triangle)

### Iconos Comunes
```jsx
import {
  Users,        // Gestión de usuarios
  Settings,     // Configuración
  BarChart3,    // Análisis/Reportes
  DollarSign,   // Finanzas
  FolderKanban, // Proyectos
  ShoppingCart, // Comercio
  Package,      // Inventario
  Wrench,       // Técnico/Soporte
  Leaf,         // Energía/Ambiental
  CheckCircle,  // Éxito
  XCircle,      // Error
  AlertTriangle // Advertencia
} from 'lucide-react';
```

## 🧩 Componentes UI

### Botones

#### Variantes Principales
```jsx
// Botón primario (acción principal)
<Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
  Acción Principal
</Button>

// Botón secundario
<Button variant="secondary">
  Acción Secundaria
</Button>

// Botón outline
<Button variant="outline">
  Acción Terciaria
</Button>

// Botón danger
<Button variant="destructive">
  Eliminar
</Button>
```

#### Estados
- **Default**: Estado normal
- **Hover**: Oscurecer gradiente o agregar fondo
- **Active**: Reducir opacidad ligeramente
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Loading**: Spinner + texto "Cargando..."

### Formularios

#### Inputs
```jsx
<div>
  <Label className="block text-sm font-medium text-slate-700 mb-2">
    Etiqueta del Campo
  </Label>
  <Input
    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
    placeholder="Placeholder descriptivo"
  />
</div>
```

#### Validación
```jsx
// Error
<div className="text-red-600 text-sm mt-1">
  Mensaje de error descriptivo
</div>

// Éxito
<div className="text-green-600 text-sm mt-1">
  Campo válido
</div>
```

### Tarjetas (Cards)

#### Estructura Estándar
```jsx
<Card className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">Título de la Tarjeta</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Contenido principal */}
  </CardContent>
  <CardFooter>
    {/* Acciones de la tarjeta */}
  </CardFooter>
</Card>
```

### Tablas

#### Estructura
```jsx
<div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
  <div className="px-6 py-4 border-b border-slate-200">
    <h3 className="text-lg font-semibold">Título de la Tabla</h3>
  </div>
  <div className="overflow-x-auto">
    <Table>
      <TableHeader className="bg-slate-50">
        <TableRow>
          <TableHead className="px-6 py-4">Columna 1</TableHead>
          <TableHead className="px-6 py-4">Columna 2</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow className="hover:bg-slate-50">
          <TableCell className="px-6 py-4">Dato 1</TableCell>
          <TableCell className="px-6 py-4">Dato 2</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</div>
```

## 📐 Layout y Espaciado

### Sistema de Grid
- **Contenedor máximo**: `max-w-7xl mx-auto`
- **Padding lateral**: `px-4 sm:px-6 lg:px-8`
- **Gaps**: `gap-4`, `gap-6`, `gap-8`

### Márgenes y Padding
- **Espaciado pequeño**: `p-4` (16px), `m-2` (8px)
- **Espaciado medio**: `p-6` (24px), `m-4` (16px)
- **Espaciado grande**: `p-8` (32px), `m-6` (24px)

### Breakpoints Responsivos
- **sm**: 640px - Tablets pequeñas
- **md**: 768px - Tablets
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Desktops grandes

## 🎭 Animaciones y Transiciones

### Transiciones Estándar
```css
transition-all duration-200 ease-in-out
```

### Estados de Carga
```jsx
<div className="flex items-center justify-center">
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
  Cargando...
</div>
```

### Hover Effects
- **Botones**: Cambio de gradiente
- **Enlaces**: `hover:text-green-600`
- **Tarjetas**: `hover:shadow-md`
- **Filas de tabla**: `hover:bg-slate-50`

## 🌙 Modo Oscuro

### Variables CSS para Dark Mode
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --border: oklch(1 0 0 / 10%);
}
```

### Implementación
```jsx
import { useTheme } from 'next-themes';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="ghost"
      size="sm"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
```

## 📋 Patrones de Interacción

### Mensajes de Feedback
```jsx
// Éxito
<div className="bg-green-50 border border-green-200 rounded-xl p-4">
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
    <p className="text-green-800">Operación completada exitosamente</p>
  </div>
</div>

// Error
<div className="bg-red-50 border border-red-200 rounded-xl p-4">
  <div className="flex items-start gap-3">
    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
    <p className="text-red-800">Ha ocurrido un error</p>
  </div>
</div>
```

### Modales
```jsx
<Dialog>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Confirmar Acción</DialogTitle>
      <DialogDescription>
        ¿Está seguro de que desea continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="destructive">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 🚀 Mejores Prácticas

### Consistencia
1. **Usa siempre las variables CSS** definidas en lugar de colores hardcodeados
2. **Mantén la jerarquía tipográfica** establecida
3. **Aplica espaciado consistente** usando el sistema de grid
4. **Utiliza componentes shadcn/ui** para mantener consistencia

### Accesibilidad
1. **Contraste de color**: Mínimo 4.5:1 para texto normal
2. **Tamaño de toque**: Mínimo 44px para elementos interactivos
3. **Navegación por teclado**: Soporte completo para Tab y Enter
4. **Texto alternativo**: Para todas las imágenes e iconos

### Rendimiento
1. **Lazy loading** para componentes pesados
2. **Optimización de imágenes** con next/image cuando aplique
3. **Debounced inputs** para búsquedas en tiempo real
4. **Skeleton loaders** durante la carga de datos

### Mantenibilidad
1. **Componentes reutilizables** en `/ui`
2. **Hooks personalizados** en `/hooks`
3. **Utilidades compartidas** en `/lib`
4. **Documentación actualizada** de cambios al sistema de diseño

## 📚 Recursos Adicionales

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Radix UI Primitives](https://www.radix-ui.com/)

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0
**Mantenedor**: Equipo de Desarrollo Enterprise
