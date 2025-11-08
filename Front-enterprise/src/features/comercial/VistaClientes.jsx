import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  User,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';
import dataService from '../../services/dataService';
import DataLoader from '../../shared/ui/DataLoader';

const VistaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    client_type: '',
    city: '',
    responsable: '',
    consumption_range: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    nic: '',
    name: '',
    email: '',
    phone: '',
    client_type: 'residencial',
    city: '',
    address: '',
    monthly_consumption_kwh: '',
    status: 'activo',
    network_type: ''
  });
  
  // Estados para modal de confirmación y notificaciones
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
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
    loadInitialData();
  }, []);

  useEffect(() => {
    loadClientes();
    loadStatistics();
  }, []);

  // Cargar clientes desde la API
  const loadClientes = async (page = 1) => {
    try {
      const response = await dataService.getClients({ page, per_page: 15 });
      
      if (response.success) {
        // La respuesta tiene los datos paginados
        let paginatedData = response.data;
        
        // Verificar y adaptar la estructura de respuesta según sea necesario
        if (response.data && response.data.data) {
          // Estructura esperada: { success: true, data: { data: [...], pagination_info } }
          paginatedData = response.data;
        } else if (response.data) {
          // Estructura alternativa: { success: true, data: { data: [...], ...pagination } }
          paginatedData = response.data;
        }
        
        const clientesData = paginatedData.data || [];
        
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        
        // Actualizar información de paginación
        setPagination({
          current_page: paginatedData.current_page || 1,
          last_page: paginatedData.last_page || 1,
          per_page: paginatedData.per_page || 15,
          total: paginatedData.total || 0,
          from: paginatedData.from || 0,
          to: paginatedData.to || 0
        });
      } else {
        throw new Error(response.message || 'Error al cargar clientes');
      }
    } catch (error) {
      
      setError(error.message || 'Error al cargar clientes');
      showNotification('error', 'Error al cargar los clientes');
      throw error; // Lanzamos el error para que pueda ser capturado por la función que llama
    }
  };

  // Cargar estadísticas desde la API
  const loadStatistics = async () => {
    try {
      const response = await dataService.getClientStatistics();
      
      if (response.success) {
        // No se utiliza estado de estadísticas en el componente actual
        // Se puede implementar si es necesario
      }
    } catch (error) {
      
      // No lanzamos el error porque las estadísticas no son críticas para la funcionalidad principal
    }
  };

  // Los clientes ya vienen filtrados y paginados del backend
  const filteredClientes = clientes;

  // Función para mostrar notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000); // Desaparece después de 4 segundos
  };

  // Funciones para manejar modales
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
        city: '',
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
        city: cliente.city || '',
        address: cliente.address || '',
        monthly_consumption_kwh: cliente.monthly_consumption_kwh || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Evitar múltiples envíos
    if (isSubmitting) return;
    
    // Validar que el NIC esté presente
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
        // Crear nuevo cliente
        const response = await dataService.createClient({
          ...formData,
          status: 'activo'
        });
        
        if (response.success) {
          showNotification('success', `Cliente "${formData.name}" creado exitosamente`);
          loadClientes();
          loadStatistics();
          closeModal();
        } else {
          // Mostrar errores de validación del backend
          if (response.errors) {
            const errorMessages = Object.values(response.errors).flat().join(', ');
            showNotification('error', errorMessages);
          } else {
            showNotification('error', response.message || 'Error al crear cliente');
          }
        }
      } else if (modalMode === 'edit') {
        // Editar cliente existente
        const response = await dataService.updateClient(selectedClient.id, formData);
        
        if (response.success) {
          showNotification('success', `Cliente "${formData.name}" actualizado exitosamente`);
          loadClientes();
          loadStatistics();
          closeModal();
        } else {
          // Mostrar errores de validación del backend
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

  const openDeleteModal = (cliente) => {
    setClientToDelete(cliente);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        const response = await dataService.deleteClient(clientToDelete.id);
        
        if (response.success) {
          showNotification('success', `Cliente "${clientToDelete.name}" eliminado exitosamente`);
          loadClientes();
          loadStatistics();
          setShowDeleteModal(false);
          setClientToDelete(null);
        } else {
          showNotification('error', response.message || 'Error al eliminar cliente');
        }
      } catch (error) {
        
        showNotification('error', error.message || 'Error de conexión');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Clientes - RECONSTRUIDO</h1>
        <p className="text-slate-600 mt-1">Administra la información de tus clientes y prospectos</p>
        <div className="text-xs text-gray-500 mt-1">
          Debug: {clientes.length} clientes cargados | Loading: {loading ? 'Sí' : 'No'} | Error: {error ? 'Sí' : 'No'}
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Barra de Búsqueda Principal */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Búsqueda Ampliada */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar clientes por nombre, email, teléfono, NIC o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Botón de Filtros */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                  showFilters 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              
              <button
                onClick={() => openModal('create')}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nuevo Cliente
              </button>
            </div>
          </div>
        </div>

        {/* Panel de Filtros Desplegable */}
        {showFilters && (
          <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros Avanzados
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Mostrando <span className="font-semibold text-green-600">{pagination.from}</span> a <span className="font-semibold text-green-600">{pagination.to}</span> de <span className="font-semibold text-green-600">{pagination.total}</span> clientes
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo de Cliente */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  Tipo de Cliente
                </label>
                <select 
                  value={filters.client_type}
                  onChange={(e) => setFilters({...filters, client_type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                >
                  <option value="">📋 Todos los tipos</option>
                  <option value="residencial">🏠 Residencial</option>
                  <option value="comercial">🏢 Comercial</option>
                  <option value="industrial">🏭 Industrial</option>
                </select>
              </div>
              
              {/* Ciudad */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" />
                  Ciudad
                </label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  placeholder="🏙️ Ej: Barranquilla..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                />
              </div>
              
              {/* Responsable */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Responsable
                </label>
                <input
                  type="text"
                  value={filters.responsable}
                  onChange={(e) => setFilters({...filters, responsable: e.target.value})}
                  placeholder="👤 Ej: María González..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                />
              </div>
              
              {/* Rango de Consumo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Consumo (kWh/mes)
                </label>
                <select 
                  value={filters.consumption_range}
                  onChange={(e) => setFilters({...filters, consumption_range: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
                >
                  <option value="">⚡ Todos los consumos</option>
                  <option value="bajo">🔋 Bajo (&lt; 200 kWh)</option>
                  <option value="medio">⚡ Medio (200-1000 kWh)</option>
                  <option value="alto">🔌 Alto (&gt; 1000 kWh)</option>
                </select>
              </div>
            </div>
            
            {/* Indicadores de Filtros Activos */}
            {(filters.client_type || filters.city || filters.responsable || filters.consumption_range) && (
              <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">Filtros activos:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.client_type && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {filters.client_type}
                      <button onClick={() => setFilters({...filters, client_type: ''})} className="hover:bg-blue-200 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.city && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Ciudad: {filters.city}
                      <button onClick={() => setFilters({...filters, city: ''})} className="hover:bg-purple-200 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.responsable && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Responsable: {filters.responsable}
                      <button onClick={() => setFilters({...filters, responsable: ''})} className="hover:bg-orange-200 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.consumption_range && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Consumo: {filters.consumption_range}
                      <button onClick={() => setFilters({...filters, consumption_range: ''})} className="hover:bg-green-200 rounded-full">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Botones de Acción de Filtros */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200">
              <button 
                onClick={() => {
                  setFilters({
                    client_type: '',
                    city: '',
                    responsable: '',
                    consumption_range: ''
                  });
                  setSearchTerm('');
                  showNotification('info', 'Todos los filtros han sido limpiados');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                Limpiar Todo
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-white transition-colors shadow-sm"
              >
                <ChevronUp className="w-4 h-4" />
                Ocultar Filtros
              </button>
              <div className="flex-1"></div>
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Los filtros se aplican automáticamente
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Clientes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando clientes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadClientes} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">NIC</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ciudad</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Dirección</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Consumo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha de Creación</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Responsable</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {cliente.nic || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cliente.client_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{cliente.name}</p>
                        <p className="text-sm text-slate-600">{cliente.email}</p>
                        <p className="text-sm text-slate-600">{cliente.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">
                        {cliente.city_text || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {cliente.address || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-900">
                        {cliente.monthly_consumption_kwh ? `${cliente.monthly_consumption_kwh} kWh/mes` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-CO') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {cliente.responsable || 'Sistema'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('view', cliente)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', cliente)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(cliente)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredClientes.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No se encontraron clientes</p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Crear Primer Cliente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paginación */}
      {!loading && !error && pagination.last_page > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            {/* Información de paginación */}
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-semibold text-slate-900">{pagination.from}</span> a{' '}
              <span className="font-semibold text-slate-900">{pagination.to}</span> de{' '}
              <span className="font-semibold text-slate-900">{pagination.total}</span> clientes
            </div>

            {/* Controles de paginación */}
            <div className="flex items-center gap-2">
              {/* Primera página */}
              <button
                onClick={() => loadClientes(1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Página anterior */}
              <button
                onClick={() => loadClientes(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Números de página */}
              <div className="flex items-center gap-1">
                {[...Array(pagination.last_page)].map((_, index) => {
                  const pageNumber = index + 1;
                  
                  // Mostrar solo algunas páginas alrededor de la actual
                  if (
                    pageNumber === 1 ||
                    pageNumber === pagination.last_page ||
                    (pageNumber >= pagination.current_page - 1 && pageNumber <= pagination.current_page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => loadClientes(pageNumber)}
                        className={`min-w-[40px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          pageNumber === pagination.current_page
                            ? 'bg-green-600 text-white'
                            : 'border border-slate-300 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === pagination.current_page - 2 ||
                    pageNumber === pagination.current_page + 2
                  ) {
                    return <span key={pageNumber} className="px-2 text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              {/* Página siguiente */}
              <button
                onClick={() => loadClientes(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Última página */}
              <button
                onClick={() => loadClientes(pagination.last_page)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crear/Editar/Ver Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {modalMode === 'create' ? '➕ Nuevo Cliente' : 
                   modalMode === 'edit' ? '✏️ Editar Cliente' : 
                   '👁️ Detalles del Cliente'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* NIC */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    NIC (Número de Identificación del Cliente)
                  </label>
                  <input
                    type="number"
                    value={formData.nic}
                    onChange={(e) => setFormData({...formData, nic: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: 123456789"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: Juan Pérez García"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="correo@ejemplo.com"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="3001234567"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                {/* Tipo de Cliente */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de Cliente *
                  </label>
                  <select
                    value={formData.client_type}
                    onChange={(e) => setFormData({...formData, client_type: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={modalMode === 'view'}
                    required
                  >
                    <option value="residencial">Residencial</option>
                    <option value="comercial">Comercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: Barranquilla"
                    disabled={modalMode === 'view'}
                  />
                </div>

                {/* Dirección */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Ej: Calle 72 #45-23"
                    disabled={modalMode === 'view'}
                  />
                </div>

                {/* Consumo Mensual y Tipo de Red */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Consumo Mensual (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.monthly_consumption_kwh}
                      onChange={(e) => setFormData({...formData, monthly_consumption_kwh: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="150.5"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Red
                    </label>
                    <select
                      value={formData.network_type}
                      onChange={(e) => setFormData({...formData, network_type: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    >
                      <option value="">Seleccionar tipo de red</option>
                      <option value="monofasico">Monofásico</option>
                      <option value="bifasico">Bifásico</option>
                      <option value="trifasico_220">Trifásico 220V</option>
                      <option value="trifasico_440">Trifásico 440V</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Botones del Modal */}
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        {modalMode === 'create' ? '✅ Crear Cliente' : '💾 Guardar Cambios'}
                      </>
                    )}
                  </button>
                </div>
              )}
              
              {modalMode === 'view' && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      setTimeout(() => openModal('edit', selectedClient), 100);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Confirmar Eliminación</h2>
                  <p className="text-sm text-slate-600">Esta acción no se puede deshacer</p>
                </div>
              </div>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6">
              <p className="text-slate-700 mb-2">
                ¿Estás seguro de que deseas eliminar al cliente:
              </p>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                <p className="font-semibold text-slate-900 text-lg mb-1">
                  {clientToDelete?.name}
                </p>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>📧 {clientToDelete?.email}</p>
                  <p>📱 {clientToDelete?.phone}</p>
                  <p>🏢 {clientToDelete?.client_type}</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">
                  <strong>Advertencia:</strong> Esta acción eliminará permanentemente todos los datos asociados a este cliente.
                </p>
              </div>
            </div>
            
            {/* Botones del Modal */}
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-6 py-2.5 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-out transform translate-x-0">
          <div className={`rounded-xl shadow-2xl border-2 p-4 min-w-[320px] max-w-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : notification.type === 'error'
              ? 'bg-red-50 border-red-200'
              : notification.type === 'warning'
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-6 h-6 ${
                notification.type === 'success' 
                  ? 'text-green-600' 
                  : notification.type === 'error'
                  ? 'text-red-600'
                  : notification.type === 'warning'
                  ? 'text-yellow-600'
                  : 'text-blue-600'
              }`}>
                {notification.type === 'success' && <CheckCircle className="w-6 h-6" />}
                {notification.type === 'error' && <XCircle className="w-6 h-6" />}
                {notification.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                {notification.type === 'info' && <Info className="w-6 h-6" />}
              </div>
              <div className="flex-1 pt-0.5">
                <p className={`font-semibold text-sm ${
                  notification.type === 'success' 
                    ? 'text-green-900' 
                    : notification.type === 'error'
                    ? 'text-red-900'
                    : notification.type === 'warning'
                    ? 'text-yellow-900'
                    : 'text-blue-900'
                }`}>
                  {notification.type === 'success' && '¡Éxito!'}
                  {notification.type === 'error' && '¡Error!'}
                  {notification.type === 'warning' && '¡Advertencia!'}
                  {notification.type === 'info' && 'Información'}
                </p>
                <p className={`text-sm mt-1 ${
                  notification.type === 'success' 
                    ? 'text-green-800' 
                    : notification.type === 'error'
                    ? 'text-red-800'
                    : notification.type === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                  notification.type === 'success' 
                    ? 'text-green-600 hover:bg-green-100' 
                    : notification.type === 'error'
                    ? 'text-red-600 hover:bg-red-100'
                    : notification.type === 'warning'
                    ? 'text-yellow-600 hover:bg-yellow-100'
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaClientes;