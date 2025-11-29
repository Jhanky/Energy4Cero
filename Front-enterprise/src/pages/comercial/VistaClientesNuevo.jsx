import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building,
  Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { DataCard } from '../../ui/data-card';
import { DataTable } from '../../ui/data-table';
import { StatusBadge } from '../../ui/status-badge';
import { ActionButton } from '../../ui/action-button';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import ClienteModal from './ClienteModal';
import ClienteDeleteModal from './ClienteDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination
} from '../../shared/ui';

const VistaClientesNuevo = () => {
  const { user: loggedInUser } = useAuth();

  // Estados para datos del backend
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    residential: 0,
    commercial: 0,
    industrial: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    client_type: '',
    status: ''
  });

  // Estados de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'residencial',
    email: '',
    phone: '',
    nic: '',
    responsible_user_id: '',
    department_id: '',
    city_id: '',
    address: '',
    monthly_consumption: '',
    notes: '',
    is_active: true
  });

  // Estados para usuarios y carga
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para selección múltiple
  const [selectedClients, setSelectedClients] = useState([]);
  const [notification, setNotification] = useState(null);

  // Función para mostrar notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Función para cargar clientes
  const loadClientes = async (page = 1, perPage = pagination.per_page) => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...filters
      };

      const response = await dataService.getClients(params);

      if (response.success) {
        let clientesData = [];
        if (response.data && response.data.clients && Array.isArray(response.data.clients)) {
          clientesData = response.data.clients;
        } else if (response.data && Array.isArray(response.data)) {
          clientesData = response.data;
        }

        const formattedClientes = clientesData.map(cliente => ({
          ...cliente,
          status: cliente.is_active ? 'active' : 'inactive',
          client_type: cliente.client_type || 'residencial',
          location: {
            department: cliente.department?.name || cliente.department_id || '-',
            city: cliente.city?.name || cliente.city_id || '-'
          }
        }));

        setClientes(formattedClientes);
        setStats(response.data.stats || {});
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 15,
          total: 0, last_page: 1, from: 0, to: 0
        });
      } else {
        showNotification('error', 'Error al cargar clientes: ' + response.message);
      }
    } catch (error) {
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      const response = await dataService.getUsers();
      if (response.success) {
        setUsers(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadData = async () => {
    await Promise.all([loadClientes(), loadUsers()]);
  };

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar datos
  useEffect(() => {
    loadClientes();
  }, [debouncedSearchTerm, filters]);

  // Funciones de acción
  const handleCreate = () => {
    setModalMode('create');
    setSelectedClient(null);
    setFormData({
      name: '',
      client_type: 'residencial',
      email: '',
      phone: '',
      nic: '',
      responsible_user_id: loggedInUser?.id || '',
      department_id: '',
      city_id: '',
      address: '',
      monthly_consumption: '',
      notes: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (cliente) => {
    setModalMode('edit');
    setSelectedClient(cliente);
    setFormData({
      name: cliente.name,
      client_type: cliente.client_type || 'residencial',
      email: cliente.email,
      phone: cliente.phone || '',
      nic: cliente.nic || '',
      responsible_user_id: cliente.responsible_user_id || loggedInUser?.id || '',
      department_id: cliente.department_id || '',
      city_id: cliente.city_id || '',
      address: cliente.address || '',
      monthly_consumption: cliente.monthly_consumption || '',
      notes: cliente.notes || '',
      is_active: cliente.is_active !== undefined ? cliente.is_active : cliente.status === 'active'
    });
    setShowModal(true);
  };

  const handleDelete = (cliente) => {
    setClientToDelete(cliente);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  // Funciones para selección
  const handleSelectClient = (clientId) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedClients.length === clientes.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clientes.map(cliente => cliente.id));
    }
  };

  // Definir columnas para la tabla
  const columns = [
    {
      key: 'nic',
      title: 'NIC',
      render: (value, cliente) => (
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-900">
            {value || '-'}
          </div>
          <div className="text-xs text-slate-500">
            ID: {cliente.id}
          </div>
        </div>
      )
    },
    {
      key: 'name',
      title: 'Cliente',
      render: (value, cliente) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900">{value}</p>
          </div>
        </div>
      )
    },
    {
      key: 'client_type',
      title: 'Tipo',
      render: (value) => (
        <StatusBadge 
          variant={value}
          size="sm"
        >
          {value === 'residencial' ? 'Residencial' : 
           value === 'comercial' ? 'Comercial' : 
           value === 'industrial' ? 'Industrial' : value}
        </StatusBadge>
      )
    },
    {
      key: 'email',
      title: 'Contacto',
      render: (value, cliente) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Mail className="w-4 h-4" />
            {value}
          </div>
          {cliente.phone && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4" />
              {cliente.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'location',
      title: 'Ubicación',
      render: (location) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4" />
            {location?.city || '-'}
          </div>
          <div className="text-sm text-slate-500">
            {location?.department || '-'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Estado',
      render: (value, cliente) => (
        <StatusBadge 
          variant={value === 'active' ? 'active' : 'inactive'}
          size="sm"
        >
          {value === 'active' ? 'Activo' : 'Inactivo'}
        </StatusBadge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Clientes</h1>
          <p className="text-slate-600 mt-1">Administra la base de datos de clientes</p>
        </div>
        <div className="flex gap-3">
          {selectedClients.length > 0 && (
            <ActionButton
              variant="delete"
              onClick={() => console.log('Eliminar seleccionados:', selectedClients)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedClients.length})
            </ActionButton>
          )}
          <ActionButton
            variant="primary"
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </ActionButton>
        </div>
      </div>

      {/* Estadísticas con componentes estandarizados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DataCard
          title="Total Clientes"
          value={loading ? { type: 'loading' } : stats.total}
          icon={Users}
          iconVariant="primary"
          variant="default"
        />
        <DataCard
          title="Activos"
          value={loading ? { type: 'loading' } : stats.active}
          icon={Users}
          iconVariant="success"
          variant="success"
        />
        <DataCard
          title="Residenciales"
          value={loading ? { type: 'loading' } : (stats.residential || 0)}
          icon={Home}
          iconVariant="primary"
          variant="default"
        />
        <DataCard
          title="Comerciales"
          value={loading ? { type: 'loading' } : (stats.commercial || 0)}
          icon={Building}
          iconVariant="warning"
          variant="default"
        />
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <AdvancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar clientes..."
              loading={loading && searchTerm.length > 0}
              className="flex-1 min-w-[200px]"
            />
            <AdvancedFilters
              filters={filters}
              onFilterChange={setFilters}
              filterOptions={[
                {
                  key: 'client_type',
                  label: 'Tipo',
                  options: [
                    { value: 'residencial', label: 'Residencial' },
                    { value: 'comercial', label: 'Comercial' },
                    { value: 'industrial', label: 'Industrial' }
                  ]
                },
                {
                  key: 'status',
                  label: 'Estado',
                  options: [
                    { value: 'active', label: 'Activos' },
                    { value: 'inactive', label: 'Inactivos' }
                  ]
                }
              ]}
            />
          </div>

          {/* Tabla con componentes estandarizados */}
          <DataTable
            columns={columns}
            data={clientes}
            loading={loading}
            emptyMessage="No se encontraron clientes"
            selectionMode={true}
            selectedRows={selectedClients}
            onSelectRow={handleSelectClient}
            onSelectAll={handleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Paginación */}
          <AdvancedPagination
            pagination={pagination}
            onPageChange={(page) => loadClientes(page)}
            onPerPageChange={(perPage) => loadClientes(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal de Cliente */}
      <ClienteModal
        show={showModal}
        mode={modalMode}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleCreate}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        users={users}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ClienteDeleteModal
        show={showDeleteModal}
        cliente={clientToDelete}
        onConfirm={closeDeleteModal}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />

      {/* Notificación */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />

      {/* Notificación */}
      <Notification
