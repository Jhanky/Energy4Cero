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
  Home,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import ClienteModal from './ClienteModal';
import ClienteDeleteModal from './ClienteDeleteModal';
import ClienteBulkDeleteModal from './ClienteBulkDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';

const VistaClientes = () => {
  const { user: loggedInUser } = useAuth();

  // Estados para datos del backend
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
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
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedClient, setSelectedClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    client_type: 'residencial', // valor por defecto
    email: '',
    phone: '',
    nic: '', // NIC (Número Úico de Identificación)
    responsible_user_id: '', // ID del usuario responsable
    department_id: '',
    city_id: '',
    address: '',
    monthly_consumption: '', // Nuevo campo para consumo mensual en kW/h
    notes: '',
    is_active: true
  });

  // Estados para usuarios y carga
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para selección múltiple y eliminación en grupo
  const [selectedClients, setSelectedClients] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Estados para notificaciones
  const [notification, setNotification] = useState(null);

  // Función para mostrar notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    
    // Cerrar automáticamente la notificación después de 3 segundos
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Función para cargar clientes con paginación
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

        // Formatear clientes combinando con información del responsable
        const formattedClientes = clientesData.map(cliente => {
          // Usar directamente el responsable que viene en la respuesta del cliente
          const responsableUser = cliente.responsible_user || null;

          // Combinar información de ubicación (departamento y ciudad)
          const location = {};
          if (cliente.department_id) {
            // Si el cliente ya tiene información del nombre del departamento, usarla
            location.department = cliente.department?.name || cliente.department_id;
          } else {
            location.department = '-';
          }

          if (cliente.city_id) {
            // Si el cliente ya tiene información del nombre de la ciudad, usarla
            location.city = cliente.city?.name || cliente.city_id;
          } else {
            location.city = '-';
          }

          return {
            ...cliente,
            status: cliente.is_active ? 'active' : 'inactive',
            client_type: cliente.client_type || 'residencial',
            responsibleUser: responsableUser,
            location: location
          };
        });

        setClientes(formattedClientes);
        setStats(response.data.stats || {});
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 15,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0
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

  // Cargar usuarios disponibles
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

  // Cargar datos al montar el componente y cuando cambien los filtros o búsqueda
  useEffect(() => {
    loadClientes();
  }, [debouncedSearchTerm, filters]);



  const getTypeIcon = (type) => {
    switch (type) {
      case 'comercial': return Building;
      case 'industrial': return Building;
      case 'residencial': return Home;
      default: return Users;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'comercial': return 'bg-purple-100 text-purple-800';
      case 'industrial': return 'bg-blue-100 text-blue-800';
      case 'residencial': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'comercial': return 'Comercial';
      case 'industrial': return 'Industrial';
      case 'residencial': return 'Residencial';
      default: return type;
    }
  };





  // Funciones para modales
  const handleCreate = () => {
    setModalMode('create');
    setSelectedClient(null);
    setFormData({
      name: '',
      client_type: 'residencial', // valor por defecto
      email: '',
      phone: '',
      nic: '', // NIC (Número Úico de Identificación)
      responsible_user_id: loggedInUser?.id || '', // ID del usuario responsable
      department_id: '',
      city_id: '',
      address: '',
      monthly_consumption: '', // Nuevo campo para consumo mensual en kW/h
      notes: '',
      is_active: true
    });
    
    // Cargar usuarios si no están cargados
    if (users.length === 0) {
      loadData();
    }
    
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
      monthly_consumption: cliente.monthly_consumption || '', // Nuevo campo
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

  // Función para verificar si ya existe un cliente con los mismos datos
  const checkExistingClient = async (field, value, currentClientId = null) => {
    if (!value) return null; // No verificar si el valor está vacío

    try {
      // Buscar cliente con el valor específico
      const response = await dataService.getClients({ [field]: value });
      
      if (response && response.success) {
        let existingClients = [];
        
        if (response.data && response.data.clients && Array.isArray(response.data.clients)) {
          existingClients = response.data.clients;
        } else if (response.data && Array.isArray(response.data)) {
          existingClients = response.data;
        }
        
        // Filtrar para excluir al cliente actual en modo edición
        const filteredClients = currentClientId 
          ? existingClients.filter(client => client.client_id !== currentClientId && client[field] === value)
          : existingClients.filter(client => client[field] === value);
          
        return filteredClients.length > 0 ? filteredClients[0] : null;
      }
    } catch (error) {
      console.error(`Error verificando existencia de ${field}:`, error);
    }
    
    return null;
  };

  // Funciones CRUD (conectadas al backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones previas
      if (!formData.name?.trim()) {
        throw new Error('El nombre es obligatorio');
      }
      
      if (!formData.email?.trim()) {
        throw new Error('El email es obligatorio');
      }

      // Validar que el tipo de cliente sea uno de los valores permitidos
      const validClientTypes = ['residencial', 'comercial', 'industrial'];
      if (!validClientTypes.includes(formData.client_type)) {
        throw new Error('Tipo de cliente no válido. Debe ser: residencial, comercial o industrial');
      }

      // Validaciones adicionales para departamento y ciudad
      if (formData.department_id && !formData.city_id) {
        throw new Error('Debe seleccionar una ciudad si ha seleccionado un departamento');
      }

      if (formData.city_id && !formData.department_id) {
        throw new Error('Debe seleccionar un departamento antes de seleccionar una ciudad');
      }

      // Verificar si ya existe un cliente con el mismo email, NIC o teléfono en modo de creación
      if (modalMode === 'create') {
        let existingClient = null;
        let duplicateField = '';

        // Verificar email duplicado
        existingClient = await checkExistingClient('email', formData.email);
        if (existingClient) {
          duplicateField = 'email';
          throw new Error(`Ya existe un cliente registrado con el email: ${formData.email}`);
        }

        // Verificar NIC duplicado
        if (formData.nic) {
          existingClient = await checkExistingClient('nic', formData.nic);
          if (existingClient) {
            duplicateField = 'NIC';
            throw new Error(`Ya existe un cliente registrado con el NIC: ${formData.nic}`);
          }
        }

        // Verificar teléfono duplicado
        if (formData.phone) {
          existingClient = await checkExistingClient('phone', formData.phone);
          if (existingClient) {
            duplicateField = 'teléfono';
            throw new Error(`Ya existe un cliente registrado con el teléfono: ${formData.phone}`);
          }
        }
      }

      let response;
      // Preparar datos para enviar, asegurando que los valores nulos se manejen adecuadamente
      const clientDataToSend = {
        ...formData,
        department_id: formData.department_id || null,
        city_id: formData.city_id || null,
        responsible_user_id: loggedInUser?.id,
      };
      
      if (modalMode === 'create') {
        response = await dataService.createClient(clientDataToSend);
      } else {
        response = await dataService.updateClient(selectedClient.client_id, clientDataToSend);
      }

      if (response && response.success) {
        showNotification('success', modalMode === 'create' ? 'Cliente creado exitosamente' : 'Cliente actualizado exitosamente');
        closeModal();
        loadData(); // Recargar la lista de clientes
      } else if (response && response.errors) {
        // Mostrar errores de validación específicos
        const errorMessages = Object.values(response.errors).flat();
        throw new Error(errorMessages.join(', ') || response?.message || 'Error en la validación de datos');
      } else {
        throw new Error(response?.message || response?.error || 'Error al procesar el cliente');
      }
    } catch (error) {
      
      showNotification('error', error.message || 'Error al procesar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    try {
      const response = await dataService.deleteClient(clientToDelete.client_id);

      if (response && response.success) {
        showNotification('success', 'Cliente eliminado exitosamente');
        // Cerrar el modal inmediatamente después de éxito
        setShowDeleteModal(false);
        setClientToDelete(null);
        loadData(); // Recargar la lista de clientes
      } else {
        throw new Error(response?.message || response?.error || 'Error al eliminar el cliente');
      }
    } catch (error) {

      showNotification('error', error.message || 'Error al eliminar el cliente');
    } finally {
      setIsDeleting(false);
    }
  };

  // Funciones para selección múltiple y eliminación en grupo
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

  const handleBulkDelete = () => {
    const clientsToDelete = clientes.filter(cliente =>
      selectedClients.includes(cliente.id)
    );
    setSelectedClients(clientsToDelete);
    setShowBulkDeleteModal(true);
  };

  const closeBulkDeleteModal = () => {
    setShowBulkDeleteModal(false);
    setSelectedClients([]);
  };

  const confirmBulkDelete = async () => {
    if (selectedClients.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const clientIds = selectedClients.map(client => client.id);
      const response = await dataService.bulkDeleteClients(clientIds);

      if (response && response.success) {
        const deletedCount = response.data?.deleted_count || 0;
        const requestedCount = response.data?.requested_count || clientIds.length;
        showNotification('success', `Se eliminaron ${deletedCount} de ${requestedCount} clientes exitosamente`);
        setShowBulkDeleteModal(false);
        setSelectedClients([]);
        loadData(); // Recargar la lista de clientes
      } else {
        throw new Error(response?.message || response?.error || 'Error al eliminar clientes en grupo');
      }
    } catch (error) {
      showNotification('error', error.message || 'Error al eliminar clientes en grupo');
    } finally {
      setIsBulkDeleting(false);
    }
  };

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
            <button
              onClick={handleBulkDelete}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2"
              disabled={isBulkDeleting}
            >
              <Trash2 className="w-5 h-5" />
              Eliminar ({selectedClients.length})
            </button>
          )}
          <button
            onClick={handleCreate}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
            disabled={isSubmitting}
          >
            <Plus className="w-5 h-5" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-red-800 font-medium">Error de carga</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Clientes</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Residenciales</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats.residential || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Comerciales</p>
              <p className="text-2xl font-bold text-orange-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (stats.commercial || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
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

          {/* Tabla */}
          <div className="rounded-md border transition-opacity duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedClients.length === clientes.length && clientes.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                  </TableHead>
                  <TableHead>NIC</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Consumo Mensual</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={10} rows={pagination.per_page || 15} asRows={true} />
                ) : clientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      No se encontraron clientes
                    </TableCell>
                  </TableRow>
                ) : (
                  clientes.map((cliente) => {
                    const TypeIcon = getTypeIcon(cliente.client_type);
                    return (
                      <TableRow key={cliente.id} className="transition-all duration-200 hover:bg-gray-50">
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedClients.includes(cliente.id)}
                            onChange={() => handleSelectClient(cliente.id)}
                            className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">
                              {cliente.nic || '-'}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {cliente.id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              {TypeIcon && <TypeIcon className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{cliente.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(cliente.client_type)}`}>
                            {getTypeLabel(cliente.client_type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="w-4 h-4" />
                              {cliente.email}
                            </div>
                            {cliente.phone && (
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Phone className="w-4 h-4" />
                                {cliente.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4" />
                              {cliente.location?.city || '-'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {cliente.location?.department || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-900">
                              {cliente.responsibleUser?.name || 'No asignado'}
                            </div>
                            <div className="text-xs text-slate-500">
                              {cliente.responsibleUser?.email || '-'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span className="font-medium text-slate-900">
                                {cliente.monthly_consumption ? `${cliente.monthly_consumption} kW/h` : '-'}
                              </span>
                            </div>
                            {cliente.location && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{cliente.location.radiation} kWh/día, {cliente.location.peak_sun_hours} HS</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cliente.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {cliente.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(cliente)}
                              className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Editar cliente"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cliente)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

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
        onSubmit={handleSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        users={users}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ClienteDeleteModal
        show={showDeleteModal}
        cliente={clientToDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />

      {/* Modal de Eliminación en Grupo */}
      <ClienteBulkDeleteModal
        show={showBulkDeleteModal}
        selectedClients={selectedClients}
        onConfirm={confirmBulkDelete}
        onCancel={closeBulkDeleteModal}
        isDeleting={isBulkDeleting}
      />

      {/* Notificación Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaClientes;
