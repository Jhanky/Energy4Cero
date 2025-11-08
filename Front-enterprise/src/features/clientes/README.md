# 📦 Componentes de Clientes

Componentes específicos para el módulo de gestión de clientes.

---

## 📋 Componentes Disponibles

### 1. **ClientesTable**
Tabla para mostrar la lista de clientes con todas sus columnas.

**Props:**
```typescript
{
  clientes: Array<Cliente>,      // Lista de clientes a mostrar
  onView: (cliente) => void,     // Callback al ver detalles
  onEdit: (cliente) => void,     // Callback al editar
  onDelete: (cliente) => void    // Callback al eliminar
}
```

**Uso:**
```jsx
<ClientesTable
  clientes={clientes}
  onView={(cliente) => openModal('view', cliente)}
  onEdit={(cliente) => openModal('edit', cliente)}
  onDelete={openDeleteModal}
/>
```

**Características:**
- ✅ Muestra 9 columnas: NIC, Tipo, Nombre, Ciudad, Dirección, Consumo, Fecha, Responsable, Acciones
- ✅ Botones de acción con íconos (Ver, Editar, Eliminar)
- ✅ Hover effects en filas
- ✅ Mensaje cuando no hay datos

---

### 2. **ClientesFilters**
Panel de filtros colapsable para filtrar clientes.

**Props:**
```typescript
{
  showFilters: boolean,                          // Controla si está expandido
  onToggleFilters: () => void,                   // Toggle del panel
  filters: {                                     // Valores actuales
    client_type: string,
    city: string,
    responsable: string,
    consumption_range: string
  },
  onFilterChange: (key, value) => void,         // Cambio de filtro
  onClearFilters: () => void                    // Limpiar todos
}
```

**Uso:**
```jsx
<ClientesFilters
  showFilters={showFilters}
  onToggleFilters={() => setShowFilters(!showFilters)}
  filters={filters}
  onFilterChange={handleFilterChange}
  onClearFilters={clearFilters}
/>
```

**Características:**
- ✅ 4 filtros: Tipo de Cliente, Ciudad, Responsable, Consumo
- ✅ Badges con filtros activos
- ✅ Botón para limpiar filtros
- ✅ Contador de filtros activos

---

### 3. **ClienteModal**
Modal para crear, editar y ver detalles de clientes.

**Props:**
```typescript
{
  show: boolean,                    // Controla visibilidad
  mode: 'create' | 'edit' | 'view', // Modo del modal
  formData: {                       // Datos del formulario
    nic: string,
    name: string,
    email: string,
    phone: string,
    client_type: string,
    city: string,
    address: string,
    monthly_consumption_kwh: number,
    network_type: string
  },
  onFormChange: (data) => void,     // Actualizar form
  onSubmit: (e) => void,            // Enviar formulario
  onClose: () => void,              // Cerrar modal
  isSubmitting: boolean             // Estado de carga
}
```

**Uso:**
```jsx
<ClienteModal
  show={showModal}
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
- ✅ Validación de formulario
- ✅ Animación de carga en botón
- ✅ Deshabilita inputs en modo "ver"
- ✅ Títulos dinámicos según el modo

---

### 4. **ClienteDeleteModal**
Modal de confirmación para eliminar clientes.

**Props:**
```typescript
{
  show: boolean,                    // Controla visibilidad
  cliente: Cliente | null,          // Cliente a eliminar
  onConfirm: () => void,           // Confirmar eliminación
  onCancel: () => void             // Cancelar
}
```

**Uso:**
```jsx
<ClienteDeleteModal
  show={showDeleteModal}
  cliente={clientToDelete}
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>
```

**Características:**
- ✅ Muestra datos del cliente a eliminar
- ✅ Icono de advertencia
- ✅ Mensaje claro de confirmación
- ✅ Resumen del cliente (NIC, Tipo, Email)

---

## 🎨 Estilos y Diseño

Todos los componentes usan:
- **Tailwind CSS** para estilos
- **lucide-react** para iconos
- **Paleta de colores:** Verde (#16a34a) como color principal

---

## 📦 Exportaciones

Todos los componentes se exportan desde `index.js`:

```javascript
import { 
  ClientesTable, 
  ClientesFilters, 
  ClienteModal, 
  ClienteDeleteModal 
} from '.';
```

---

## 🔄 Flujo de Uso Típico

1. **Cargar Datos** → Vista carga clientes de API
2. **Mostrar Tabla** → `<ClientesTable />` renderiza datos
3. **Aplicar Filtros** → `<ClientesFilters />` filtra resultados
4. **Crear/Editar** → `<ClienteModal />` maneja formulario
5. **Eliminar** → `<ClienteDeleteModal />` confirma acción

---

## 🧪 Ejemplo Completo

```jsx
import { 
  ClientesTable, 
  ClientesFilters, 
  ClienteModal, 
  ClienteDeleteModal 
} from '.';

const MiVista = () => {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  
  return (
    <div>
      <ClientesFilters {...filterProps} />
      <ClientesTable
        clientes={clientes}
        onView={(c) => openModal('view', c)}
        onEdit={(c) => openModal('edit', c)}
        onDelete={openDeleteModal}
      />
      <ClienteModal
        show={showModal}
        mode={modalMode}
        {...modalProps}
      />
      <ClienteDeleteModal {...deleteProps} />
    </div>
  );
};
```

---

**Última actualización:** Octubre 2025

