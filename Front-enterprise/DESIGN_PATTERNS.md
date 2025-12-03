# Guía de Patrones de Diseño y Estilo - VatioCore Frontend

Esta guía establece los estándares de diseño y desarrollo para mantener la consistencia visual y funcional en toda la aplicación. Todos los nuevos componentes y modificaciones deben adherirse a estos principios.

## 1. Principios Fundamentales

*   **Mobile-First:** Diseñar siempre pensando en dispositivos móviles primero y escalar progresivamente (`sm:`, `md:`, `lg:`, `xl:`).
*   **Modo Oscuro Nativo:** Todos los componentes deben soportar modo claro y oscuro automáticamente utilizando variables semánticas. **Nunca** usar colores hardcoded (ej. `bg-white`, `text-black`) para elementos estructurales.
*   **Componentes Shadcn/ui:** Utilizar siempre los componentes base de `@/ui` en lugar de elementos HTML nativos cuando sea posible.

## 2. Sistema de Tema y Colores

Utilizamos variables CSS semánticas definidas en `src/App.css` y configuradas en Tailwind. Esto permite cambiar el tema globalmente sin tocar el código de los componentes.

### Referencia de Variables

| Variable Tailwind | Uso Correcto | No Usar (Hardcoded) |
| :--- | :--- | :--- |
| `bg-background` | Fondo principal de página | `bg-white`, `bg-gray-900` |
| `bg-card` | Fondo de tarjetas, modales, paneles | `bg-white`, `bg-slate-800` |
| `text-foreground` | Texto principal | `text-black`, `text-slate-900` |
| `text-muted-foreground` | Texto secundario, descripciones, iconos | `text-gray-500`, `text-slate-400` |
| `border-border` | Bordes de tarjetas, inputs, separadores | `border-gray-200`, `border-slate-700` |
| `bg-muted` | Fondos secundarios, items alternos, headers de tabla | `bg-gray-100`, `bg-slate-100` |
| `bg-primary` / `text-primary-foreground` | Botones principales, acciones destacadas | `bg-blue-600`, `text-white` |
| `text-destructive` | Acciones de peligro, errores | `text-red-600` |

### Ejemplo de Implementación

**❌ Incorrecto:**
```jsx
<div className="bg-white border border-gray-200 p-4 rounded-lg">
  <h2 className="text-slate-900 font-bold">Título</h2>
  <p className="text-gray-500">Descripción</p>
</div>
```

**✅ Correcto:**
```jsx
<div className="bg-card border border-border p-4 rounded-lg">
  <h2 className="text-foreground font-bold">Título</h2>
  <p className="text-muted-foreground">Descripción</p>
</div>
```

## 3. Estructura de Componentes

### Ubicación de Archivos

*   **`src/ui/`**: Componentes base de shadcn/ui (Button, Input, Card, etc.). **No modificar la lógica interna**, solo estilos si es estrictamente necesario.
*   **`src/shared/ui/`**: Componentes reutilizables compuestos (SearchBar, Pagination, Notification).
*   **`src/features/[modulo]/ui/`**: Componentes específicos de un módulo de negocio.

### Patrón de Importación

Usar siempre los alias configurados:
```javascript
import { Button } from '@/ui/button'; // ✅
import { Button } from '../../ui/button'; // ❌ Evitar rutas relativas largas
```

## 4. Patrones de UI Comunes

### Tablas de Datos

Las tablas deben seguir esta estructura para garantizar consistencia:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Título de la Tabla</CardTitle>
    {/* Filtros o acciones aquí */}
  </CardHeader>
  <CardContent>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Columna 1</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(item => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell className="text-right">...</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {/* Paginación aquí */}
  </CardContent>
</Card>
```

### Formularios

Usar componentes controlados y validación consistente.

```jsx
<div className="space-y-2">
  <Label htmlFor="email">Correo Electrónico</Label>
  <Input id="email" type="email" placeholder="ejemplo@correo.com" />
  <p className="text-sm text-muted-foreground">Mensaje de ayuda o error</p>
</div>
```

### Modales (Dialogs)

```jsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>Explicación breve de la acción.</DialogDescription>
    </DialogHeader>
    {/* Contenido del formulario */}
    <DialogFooter>
      <Button variant="outline" onClick={close}>Cancelar</Button>
      <Button onClick={submit}>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 5. Estados y Feedback

*   **Loading:** Usar `Skeleton` para estados de carga inicial y spinners (`Loader2` de lucide-react) para acciones en botones.
*   **Vacío:** Mostrar un mensaje claro cuando no hay datos en tablas o listas, usando `text-muted-foreground`.
*   **Notificaciones:** Usar `sonner` (`toast`) para feedback de operaciones (éxito/error).

## 6. Iconografía

*   Usar `lucide-react` para todos los iconos.
*   Tamaño estándar: `w-4 h-4` para botones pequeños/tablas, `w-5 h-5` o `w-6 h-6` para encabezados.
*   Color: `text-muted-foreground` por defecto, `text-foreground` para énfasis.

---
*Última actualización: Noviembre 2025*
