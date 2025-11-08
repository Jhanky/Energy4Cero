# 🔧 Componentes Comunes

Componentes reutilizables que se pueden usar en cualquier parte de la aplicación.

---

## 📋 Componentes Disponibles

### 1. **Notification**
Sistema de notificaciones toast para mostrar mensajes al usuario.

**Props:**
```typescript
{
  notification: {
    type: 'success' | 'error' | 'warning' | 'info',
    message: string
  } | null,
  onClose: () => void
}
```

**Uso:**
```jsx
const [notification, setNotification] = useState(null);

const showNotification = (type, message) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), 5000);
};

<Notification 
  notification={notification} 
  onClose={() => setNotification(null)} 
/>
```

**Características:**
- ✅ 4 tipos: success, error, warning, info
- ✅ Íconos automáticos según el tipo
- ✅ Colores específicos por tipo
- ✅ Animación de entrada desde la derecha
- ✅ Botón de cerrar
- ✅ Auto-cierre configurable

**Colores:**
- `success` → Verde
- `error` → Rojo
- `warning` → Amarillo
- `info` → Azul

---

### 2. **SearchBar**
Barra de búsqueda con ícono y botón de limpiar.

**Props:**
```typescript
{
  value: string,
  onChange: (e) => void,
  onClear: () => void,
  placeholder?: string  // Default: "Buscar..."
}
```

**Uso:**
```jsx
const [searchTerm, setSearchTerm] = useState('');

<SearchBar
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onClear={() => setSearchTerm('')}
  placeholder="Buscar clientes..."
/>
```

**Características:**
- ✅ Ícono de búsqueda a la izquierda
- ✅ Botón X para limpiar (solo visible si hay texto)
- ✅ Focus ring verde
- ✅ Placeholder personalizable

---

### 3. **Pagination**
Componente de paginación completo con controles y información.

**Props:**
```typescript
{
  pagination: {
    current_page: number,
    last_page: number,
    per_page: number,
    total: number,
    from: number,
    to: number
  },
  onPageChange: (page: number) => void
}
```

**Uso:**
```jsx
const [pagination, setPagination] = useState({
  current_page: 1,
  last_page: 10,
  per_page: 15,
  total: 150,
  from: 1,
  to: 15
});

<Pagination
  pagination={pagination}
  onPageChange={loadPage}
/>
```

**Características:**
- ✅ Información de registros (Mostrando X a Y de Z)
- ✅ Botones: Primera, Anterior, Páginas, Siguiente, Última
- ✅ Páginas numeradas con elipsis (...)
- ✅ Página actual resaltada en verde
- ✅ Botones deshabilitados cuando corresponde
- ✅ Se oculta automáticamente si solo hay 1 página

**Lógica de Páginas Mostradas:**
- Siempre muestra primera y última página
- Muestra página actual ± 1
- Usa "..." para páginas ocultas

---

### 4. **LoadingSpinner**
Spinner de carga con mensaje opcional.

**Props:**
```typescript
{
  message?: string  // Default: "Cargando..."
}
```

**Uso:**
```jsx
{loading && <LoadingSpinner message="Cargando clientes..." />}
```

**Características:**
- ✅ Ícono giratorio (Loader2 de lucide-react)
- ✅ Mensaje personalizable
- ✅ Centrado vertical y horizontalmente
- ✅ Color verde del tema

---

## 📦 Exportaciones

Todos los componentes se exportan desde `index.js`:

```javascript
import { 
  Notification, 
  SearchBar, 
  Pagination, 
  LoadingSpinner 
} from '.';
```

---

## 🎨 Estilos Consistentes

Todos los componentes usan:
- **Tailwind CSS**
- **lucide-react** para íconos
- **Paleta verde** (#16a34a) como color principal
- **Esquema de grises** (slate) para textos y bordes

---

## 🧩 Casos de Uso Comunes

### Flujo de Carga con Notificación

```jsx
const [loading, setLoading] = useState(false);
const [notification, setNotification] = useState(null);

const loadData = async () => {
  setLoading(true);
  try {
    const data = await api.getData();
    showNotification('success', 'Datos cargados exitosamente');
  } catch (error) {
    showNotification('error', 'Error al cargar datos');
  } finally {
    setLoading(false);
  }
};

return (
  <>
    <Notification notification={notification} onClose={clearNotification} />
    {loading ? (
      <LoadingSpinner message="Cargando datos..." />
    ) : (
      <DataTable data={data} />
    )}
  </>
);
```

### Búsqueda con Filtros

```jsx
const [searchTerm, setSearchTerm] = useState('');
const [filteredData, setFilteredData] = useState([]);

useEffect(() => {
  const filtered = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setFilteredData(filtered);
}, [searchTerm, data]);

return (
  <>
    <SearchBar
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onClear={() => setSearchTerm('')}
      placeholder="Buscar por nombre..."
    />
    <DataTable data={filteredData} />
  </>
);
```

### Lista Paginada

```jsx
const [pagination, setPagination] = useState({...});

const loadPage = async (page) => {
  const response = await api.getData({ page, per_page: 15 });
  setData(response.data);
  setPagination({
    current_page: response.current_page,
    last_page: response.last_page,
    total: response.total,
    from: response.from,
    to: response.to
  });
};

return (
  <>
    <DataTable data={data} />
    <Pagination 
      pagination={pagination} 
      onPageChange={loadPage} 
    />
  </>
);
```

---

## ⚙️ Personalización

### Notification - Tiempo de Auto-cierre

```jsx
const showNotification = (type, message, duration = 5000) => {
  setNotification({ type, message });
  setTimeout(() => setNotification(null), duration);
};
```

### SearchBar - Placeholder Dinámico

```jsx
<SearchBar
  placeholder={`Buscar entre ${total} registros...`}
  {...props}
/>
```

### Pagination - Items por Página

El componente es flexible con cualquier `per_page`, pero se recomienda:
- 10, 15, 20, 25, 50, 100

---

## 🚀 Mejores Prácticas

1. **Notification**: Usar tipos consistentes
   - `success` → Acciones completadas
   - `error` → Errores de API o validación
   - `warning` → Advertencias al usuario
   - `info` → Información general

2. **SearchBar**: Debounce para búsquedas en tiempo real
   ```jsx
   const debouncedSearch = useMemo(
     () => debounce((value) => performSearch(value), 300),
     []
   );
   ```

3. **Pagination**: Siempre validar la página actual
   ```jsx
   const safePage = Math.min(Math.max(1, page), lastPage);
   ```

4. **LoadingSpinner**: Usar mensajes descriptivos
   ```jsx
   <LoadingSpinner message="Cargando clientes..." />  // ✅
   <LoadingSpinner message="Espere..." />             // ❌
   ```

---

**Última actualización:** Octubre 2025

