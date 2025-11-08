# 📦 Componentes de Suministros

Componentes específicos para el módulo de gestión de suministros (paneles, inversores y baterías).

---

## 📋 Componentes Disponibles

### 1. **SuministrosStats**
Tarjetas de estadísticas que muestran el resumen de cada tipo de suministro.

**Props:**
```typescript
{
  statistics: {
    total_paneles: number,
    total_inversores: number,
    total_baterias: number,
    precio_promedio_panel: number,
    precio_promedio_inversor: number,
    precio_promedio_bateria: number
  },
  formatPrice: (price: number) => string
}
```

**Uso:**
```jsx
<SuministrosStats 
  statistics={statistics} 
  formatPrice={formatPrice} 
/>
```

**Características:**
- ✅ 3 tarjetas: Paneles, Inversores, Baterías
- ✅ Íconos específicos y colores por tipo
- ✅ Contador de productos y precio promedio
- ✅ Diseño responsive

---

### 2. **SuministrosTabs**
Navegación por tabs para cambiar entre tipos de suministros.

**Props:**
```typescript
{
  activeTab: 'paneles' | 'inversores' | 'baterias',
  onTabChange: (tab: string) => void
}
```

**Uso:**
```jsx
<SuministrosTabs 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>
```

**Características:**
- ✅ 3 tabs: Paneles Solares, Inversores, Baterías
- ✅ Íconos y colores específicos por tab
- ✅ Estado activo con borde inferior
- ✅ Hover effects

---

### 3. **SuministrosFilters**
Panel de filtros para buscar y filtrar suministros.

**Props:**
```typescript
{
  activeTab: string,
  searchTerm: string,
  onSearchChange: (value: string) => void,
  filters: {
    brand: string,
    type: string,
    grid_type: string,
    price_range: string
  },
  onFilterChange: (key: string, value: string) => void,
  onApplyFilters: () => void,
  onClearFilters: () => void
}
```

**Uso:**
```jsx
<SuministrosFilters
  activeTab={activeTab}
  searchTerm={searchTerm}
  onSearchChange={setSearchTerm}
  filters={filters}
  onFilterChange={handleFilterChange}
  onApplyFilters={applyFilters}
  onClearFilters={clearFilters}
/>
```

**Características:**
- ✅ Búsqueda por texto
- ✅ Filtro por marca
- ✅ Filtro por tipo
- ✅ Filtro específico de red para inversores
- ✅ Rango de precios
- ✅ Badges con filtros activos
- ✅ Botones aplicar/limpiar

---

### 4. **SuministrosTable**
Tabla para mostrar la lista de suministros con todas sus columnas.

**Props:**
```typescript
{
  activeTab: string,
  data: Array<Suministro>,
  loading: boolean,
  error: string | null,
  onView: (item: Suministro) => void,
  onEdit: (item: Suministro) => void,
  onDelete: (item: Suministro) => void,
  onRetry: () => void,
  formatPrice: (price: number) => string,
  formatDate: (date: string) => string
}
```

**Uso:**
```jsx
<SuministrosTable
  activeTab={activeTab}
  data={data}
  loading={loading}
  error={error}
  onView={(item) => openModal('view', item)}
  onEdit={(item) => openModal('edit', item)}
  onDelete={openDeleteModal}
  onRetry={loadData}
  formatPrice={formatPrice}
  formatDate={formatDate}
/>
```

**Características:**
- ✅ 7 columnas: Producto, Potencia/Capacidad, Tipo, Precio, Ficha Técnica, Fecha, Acciones
- ✅ Configuración dinámica según el tipo de suministro
- ✅ Enlaces a fichas técnicas
- ✅ Estados de carga y error
- ✅ Botones de acción (Ver, Editar, Eliminar)

---

### 5. **SuministroModal**
Modal para crear, editar y ver detalles de suministros.

**Props:**
```typescript
{
  show: boolean,
  activeTab: string,
  mode: 'create' | 'edit' | 'view',
  formData: {
    brand: string,
    model: string,
    power: string,
    type: string,
    technical_sheet_url: string,
    price: string,
    capacity: string,
    voltage: string,
    system_type: string,
    grid_type: string
  },
  onFormChange: (data: object) => void,
  onSubmit: (e: Event) => void,
  onClose: () => void,
  isSubmitting: boolean
}
```

**Uso:**
```jsx
<SuministroModal
  show={showModal}
  activeTab={activeTab}
  mode={modalMode}
  formData={formData}
  onFormChange={setFormData}
  onSubmit={handleSubmit}
  onClose={closeModal}
  isSubmitting={isSubmitting}
/>
```

**Características:**
- ✅ Tres modos: Crear, Editar, Ver
- ✅ Campos dinámicos según el tipo de suministro
- ✅ Validación de formulario
- ✅ Animación de carga en botón
- ✅ Enlaces a fichas técnicas
- ✅ Campos específicos para cada tipo:
  - **Paneles:** Marca, Modelo, Potencia, Tipo
  - **Inversores:** + Tipo de Sistema, Tipo de Red
  - **Baterías:** + Capacidad, Voltaje

---

### 6. **SuministroDeleteModal**
Modal de confirmación para eliminar suministros.

**Props:**
```typescript
{
  show: boolean,
  activeTab: string,
  item: Suministro | null,
  onConfirm: () => void,
  onCancel: () => void
}
```

**Uso:**
```jsx
<SuministroDeleteModal
  show={showDeleteModal}
  activeTab={activeTab}
  item={itemToDelete}
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>
```

**Características:**
- ✅ Muestra datos del producto a eliminar
- ✅ Icono de advertencia
- ✅ Resumen del producto (Marca, Modelo, Especificaciones)
- ✅ Botones de confirmación y cancelación

---

## 🎨 Configuración por Tipo de Suministro

### **Paneles Solares**
- **Ícono:** ☀️ (Sun)
- **Color:** Amarillo
- **Campos:** Marca, Modelo, Potencia (W), Tipo
- **Filtros:** Marca, Tipo, Precio

### **Inversores**
- **Ícono:** ⚡ (Cpu)
- **Color:** Azul
- **Campos:** Marca, Modelo, Potencia (W), Tipo de Sistema, Tipo de Red, Tipo
- **Filtros:** Marca, Tipo, Tipo de Red, Precio

### **Baterías**
- **Ícono:** 🔋 (Battery)
- **Color:** Verde
- **Campos:** Marca, Modelo, Capacidad (kWh), Voltaje (V), Tipo
- **Filtros:** Marca, Tipo, Precio

---

## 📦 Exportaciones

Todos los componentes se exportan desde `index.js`:

```javascript
import { 
  SuministrosStats,
  SuministrosTabs,
  SuministrosFilters,
  SuministrosTable,
  SuministroModal,
  SuministroDeleteModal
} from '.';
```

---

## 🔄 Flujo de Uso Típico

1. **Cargar Datos** → Vista carga suministros de API según tab activo
2. **Mostrar Estadísticas** → `<SuministrosStats />` muestra resumen
3. **Navegar Tabs** → `<SuministrosTabs />` cambia tipo de suministro
4. **Aplicar Filtros** → `<SuministrosFilters />` filtra resultados
5. **Mostrar Tabla** → `<SuministrosTable />` renderiza datos
6. **Crear/Editar** → `<SuministroModal />` maneja formulario
7. **Eliminar** → `<SuministroDeleteModal />` confirma acción

---

## 🧪 Ejemplo Completo

```jsx
import { 
  SuministrosStats,
  SuministrosTabs,
  SuministrosFilters,
  SuministrosTable,
  SuministroModal,
  SuministroDeleteModal
} from '.';

const MiVista = () => {
  const [activeTab, setActiveTab] = useState('paneles');
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  return (
    <div>
      <SuministrosStats statistics={stats} formatPrice={formatPrice} />
      <SuministrosTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <SuministrosFilters {...filterProps} />
      <SuministrosTable
        activeTab={activeTab}
        data={data}
        onView={(item) => openModal('view', item)}
        onEdit={(item) => openModal('edit', item)}
        onDelete={openDeleteModal}
        {...tableProps}
      />
      <SuministroModal {...modalProps} />
      <SuministroDeleteModal {...deleteProps} />
    </div>
  );
};
```

---

## 🎯 Características Especiales

### **Campos Dinámicos**
Los formularios se adaptan automáticamente según el tipo de suministro:

- **Paneles:** Potencia en Watts
- **Inversores:** Potencia + Tipo de Sistema + Tipo de Red
- **Baterías:** Capacidad en kWh + Voltaje

### **Filtros Inteligentes**
- Filtro de "Tipo de Red" solo aparece para inversores
- Placeholders dinámicos según el tipo de producto
- Búsqueda unificada en todos los campos

### **Estados de Carga**
- Loading spinner durante carga de datos
- Estados de error con botón de reintentar
- Animación de carga en botones de envío

---

**Última actualización:** Octubre 2025

