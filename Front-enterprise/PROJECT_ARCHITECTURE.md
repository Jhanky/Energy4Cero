# Guía de Arquitectura de Proyecto - VatioCore Frontend

Esta guía define la estructura estándar para el desarrollo de nuevos módulos y la refactorización de los existentes. El objetivo es mantener un código limpio, escalable y fácil de mantener, siguiendo una arquitectura basada en **Features** (Características).

## 1. Estructura de Directorios

La aplicación sigue una organización híbrida donde las páginas actúan como orquestadores y la lógica reside en módulos de características (`features`).

```
src/
├── features/               # Módulos de negocio (Lógica y UI específica)
│   └── [nombre-modulo]/
│       ├── components/     # Componentes "inteligentes" (Modales, Tablas conectadas)
│       ├── hooks/          # Lógica de negocio (useFeature.js)
│       ├── ui/             # Componentes de presentación pura (Tabs, Cards específicas)
│       └── utils/          # Utilidades específicas del módulo (opcional)
│
├── pages/                  # Vistas principales (Rutas)
│   └── [area]/             # (comercial, administrativa, etc.)
│       └── [NombrePage].jsx
│
├── shared/                 # Componentes reutilizables globalmente
│   └── ui/                 # (AdvancedTable, SearchBar, Pagination)
│
├── ui/                     # Componentes base (Shadcn/ui)
│   └── (button, input, dialog, etc.)
│
└── services/               # Comunicación con API
```

---

## 2. Definición de Capas

### A. Pages (`src/pages/`)
**Responsabilidad:** Orquestación y Layout.
*   **NO** deben contener lógica de negocio compleja ni llamadas directas a la API.
*   **SÍ** deben importar el custom hook del feature.
*   **SÍ** deben definir la estructura visual principal (Header, Tabs, Contenedores).

**Ejemplo (`SuministrosPage.jsx`):**
```jsx
const SuministrosPage = () => {
    // 1. Importar lógica del hook
    const { data, loading, openModal, handleDelete } = useSuministros();

    return (
        <div className="p-6">
            <Header />
            <Tabs />
            <Table data={data} loading={loading} />
            <Modals />
        </div>
    );
};
```

### B. Features (`src/features/`)
Aquí reside el núcleo de la funcionalidad. Cada módulo debe ser autocontenido.

#### 1. Hooks (`hooks/use[Feature].js`)
**Responsabilidad:** Lógica de Negocio y Estado.
*   Maneja todos los `useState`, `useEffect`.
*   Realiza las llamadas a `dataService`.
*   Gestiona la paginación, filtros y lógica de formularios.
*   Retorna todo lo necesario para que la Page y los Componentes funcionen.

**Patrón:**
```javascript
export const useSuministros = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        // Llamada a API
    }, []);

    return { data, loading, loadData };
};
```

#### 2. Components (`components/`)
**Responsabilidad:** Componentes complejos o con estado local mínimo.
*   **Modales:** Formularios de creación/edición (`ProductModal.jsx`).
*   **Tablas:** Estructura de visualización de datos (`SuministrosTable.jsx`).
*   Reciben datos y funciones a través de `props`.

#### 3. UI (`ui/`)
**Responsabilidad:** Componentes puramente visuales.
*   Elementos decorativos o de estructura específica del módulo.
*   Ejemplo: `SuministrosTabs.jsx`, `KpiCard.jsx`.
*   No suelen tener lógica, solo renderizan basado en props.

---

## 3. Flujo de Trabajo Recomendado

Para crear o refactorizar un módulo:

1.  **Crear el Hook (`useFeature.js`):**
    *   Define los estados necesarios (data, loading, pagination).
    *   Implementa las funciones de carga (loadData) y CRUD (create, update, delete).

2.  **Crear Componentes UI:**
    *   Diseña la Tabla (`FeatureTable.jsx`) usando los componentes de `@/ui`.
    *   Diseña el Modal (`FeatureModal.jsx`) para formularios.

3.  **Ensamblar la Página (`FeaturePage.jsx`):**
    *   Importa el hook.
    *   Conecta los estados y funciones del hook a los componentes.
    *   Asegura que el layout coincida con el diseño general (Títulos fuera de cards, espaciado consistente).

4.  **Rutas (`App.jsx`):**
    *   Asegura usar `ProtectedRoute` con el permiso correcto (ej. `commercial.read`).

---

## 4. Estándares de Código

*   **Imports:** Usar alias `@/ui` para componentes base.
*   **Estilos:** Usar Tailwind CSS y variables semánticas (`bg-card`, `text-foreground`) para soporte Dark Mode.
*   **Iconos:** Usar `lucide-react`.
*   **Feedback:** Usar `sonner` para notificaciones (toast).

---
*Referencia: Módulo de Suministros (Diciembre 2025)*
