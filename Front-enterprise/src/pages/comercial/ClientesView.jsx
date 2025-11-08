import { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import dataService from '../../services/dataService';

// Componentes comunes
import { Notification, SearchBar, Pagination, LoadingSpinner } from '../../shared/ui';

// Componentes específicos de clientes
import { 
  ClientesTable, 
  ClientesFilters
} from '../../features/clientes/ui';
import ClienteModal from './ClienteModal';
import ClienteDeleteModal from './ClienteDeleteModal';

const ClientesView = () => {
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    client_type: '',
    city: '',
    responsable: '',
    consumption_range: ''
  });

  // Estados del modal principal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    nic: '',
    name: '',
    email: '',
    phone: '',
    client_type: 'residencial',
    department_id: '',
    city_id: '',
    address: '',
    monthly_consumption_kwh: '',
    status: 'activo',
    network_type: ''
  });

  // Estados del modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Estados de notificación y envío
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadInitialData = async () => {
    loadClientes();
  };

  // Cargar clientes
  const loadClientes = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dataService.getClients({ page, per_page: 15, sort_by: 'id', sort_order: 'desc' });
      
      if (response.success) {
        const paginatedData = response.data;
        const clientesData = paginatedData.data || [];
        
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 15,
          total: paginatedData.total || 0,
          from: paginatedData.from || 0,
          to: paginatedData.to || 0
        });
      } else {
        setError(response.message || 'Error al cargar clientes');
      }
    } catch (error) {
      
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Manejo de notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Manejo de modal principal
  const openModal = (mode, cliente = null) => {
    setModalMode(mode);
    setSelectedClient(cliente);
    
    if (mode === 'create') {
      setFormData({
        nic: '',
        name: '',
        email: '',
        phone: '',
        client_type: 'residencial',
        department_id: '',
        city_id: '',
        address: '',
        monthly_consumption_kwh: '',
        status: 'activo',
        network_type: ''
      });
    } else if (cliente) {
      setFormData({
        nic: cliente.nic || '',
        name: cliente.name || '',
        email: cliente.email || '',
        phone: cliente.phone || '',
        client_type: cliente.client_type || 'residencial',
        department_id: cliente.department_id || '',
        city_id: cliente.city_id || '',
        address: cliente.address || '',
        monthly_consumption_kwh: cliente.monthly_consumption || '',
        status: cliente.status || 'activo',
        network_type: cliente.network_type || ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClient(null);
    setIsSubmitting(false);
  };

  // Manejo de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!formData.nic) {
      showNotification('warning', 'El NIC es obligatorio');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validar NIC duplicado
      if (modalMode === 'create' || (modalMode === 'edit' && formData.nic !== selectedClient.nic)) {
        const nicExists = clientes.some(
          cliente => cliente.nic === parseInt(formData.nic) && 
          (modalMode === 'create' || cliente.id !== selectedClient.id)
        );
        
        if (nicExists) {
          showNotification('error', `El NIC ${formData.nic} ya está registrado`);
          setIsSubmitting(false);
          return;
        }
      }
      
      if (modalMode === 'create') {
        const response = await dataService.createClient({ ...formData, status: 'activo' });
        
        if (response.success) {
          showNotification('success', `Cliente "${formData.name}" creado exitosamente`);
          loadClientes();
          closeModal();
        } else {
          if (response.errors) {
            const errorMessages = Object.values(response.errors).flat().join(', ');
            showNotification('error', errorMessages);
          } else {
            showNotification('error', response.message || 'Error al crear cliente');
          }
        }
      } else if (modalMode === 'edit') {
        const response = await dataService.updateClient(selectedClient.client_id, formData);
        
        if (response.success) {
          showNotification('success', `Cliente "${formData.name}" actualizado exitosamente`);
          loadClientes();
          closeModal();
        } else {
          if (response.errors) {
            const errorMessages = Object.values(response.errors).flat().join(', ');
            showNotification('error', errorMessages);
          } else {
            showNotification('error', response.message || 'Error al actualizar cliente');
          }
        }
      }
    } catch (error) {
      
      showNotification('error', error.message || 'Error de conexión');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de modal de eliminación
  const openDeleteModal = (cliente) => {
    setClientToDelete(cliente);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        const response = await dataService.deleteClient(clientToDelete.client_id);
        
        if (response.success) {
          showNotification('success', `Cliente "${clientToDelete.name}" eliminado exitosamente`);
          loadClientes();
        } else {
          showNotification('error', response.message || 'Error al eliminar cliente');
        }
      } catch (error) {
        
        showNotification('error', 'Error de conexión');
      }
      
      setShowDeleteModal(false);
      setClientToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  // Manejo de filtros
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      client_type: '',
      city: '',
      responsable: '',
      consumption_range: ''
    });
  };

  // Clientes filtrados
  const filteredClientes = clientes;

  return (
    <div className="p-6 space-y-6">
      {/* Notificaciones */}
      <Notification 
        notification={notification} 
        onClose={() => setNotification(null)} 
      />

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h1>
              <p className="text-sm text-slate-600">Administra todos tus clientes y su información</p>
            </div>
          </div>
          <button
            onClick={() => openModal('create')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>

        {/* Barra de búsqueda */}
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
          placeholder="Buscar clientes por nombre, email, NIC o teléfono..."
        />
      </div>

      {/* Filtros */}
      <ClientesFilters
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      {/* Tabla de clientes */}
      {loading ? (
        <LoadingSpinner message="Cargando clientes..." />
      ) : error ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button 
            onClick={() => loadClientes()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ClientesTable
          clientes={filteredClientes}
          onEdit={openModal}
          onDelete={openDeleteModal}
        />
      )}

      {/* Paginación */}
      <Pagination
        pagination={pagination}
        onPageChange={loadClientes}
      />

      {/* Modal de Cliente */}
      <ClienteModal
        show={showModal}
        mode={modalMode}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ClienteDeleteModal
        show={showDeleteModal}
        cliente={clientToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
  );
};

export default ClientesView;

