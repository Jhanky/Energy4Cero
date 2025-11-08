import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserX,
  MapPin,
  Building,
  User,
  Globe,
  Calendar,
  Target,
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import apiService from '../../../services/api';

const ClientesIndex = ({ onEdit, onCreate, onView }) => {
  // VERSIÓN ACTUALIZADA - Barra de búsqueda ampliada y filtros colapsables
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    city: '',
    network_type: '',
    is_active: ''
  });
  const [statistics, setStatistics] = useState(null);
  const [showFilters, setShowFilters] = useState(false); // Estado para mostrar/ocultar filtros

  useEffect(() => {
    loadClientes();
    loadStatistics();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      

      
      const response = await fetch('http://localhost:8000/api/clients', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      
      if (data.success) {
        const clientesData = data.data.data || data.data || [];
        
        setClientes(clientesData);
      } else {
        throw new Error(data.message || 'Error al cargar clientes');
      }
    } catch (error) {
      
      setError('Error al cargar clientes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiService.getClientStatistics();
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        
      }
    } catch (error) {
      
    }
  };

  const handleDelete = async (cliente) => {
    if (!window.confirm(`¿Estás seguro de eliminar al cliente ${cliente.name}?`)) {
      return;
    }

    // Guardamos el estado anterior por si necesitamos revertir
    const previousClientes = [...clientes];
    
    // Actualización optimista: removemos el cliente del estado inmediatamente
    setClientes(prevClientes => prevClientes.filter(c => c.id !== cliente.id));

    try {
      const response = await apiService.deleteClient(cliente.id);

      if (!response.success) {
        // Si falla, revertimos el cambio
        setClientes(previousClientes);
        throw new Error(response.message || 'Error al eliminar cliente');
      }
      // Si tiene éxito, el cliente ya fue removido del estado
      // Actualizamos estadísticas
      loadStatistics();
    } catch (error) {
      // En caso de error, revertimos
      setClientes(previousClientes);
      setError('Error al eliminar cliente: ' + error.message);
    }
  };

  const handleToggleStatus = async (cliente) => {
    // Guardamos el estado anterior
    const previousClientes = [...clientes];
    
    // Actualización optimista: cambiamos el estado inmediatamente
    setClientes(prevClientes => 
      prevClientes.map(c => 
        c.id === cliente.id 
          ? { ...c, is_active: !c.is_active, status: c.is_active ? 'inactivo' : 'activo' }
          : c
      )
    );

    try {
      const response = await apiService.toggleClientStatus(cliente.id);

      if (!response.success) {
        // Si falla, revertimos el cambio
        setClientes(previousClientes);
        throw new Error(response.message || 'Error al cambiar estado');
      }
      // Actualizamos estadísticas
      loadStatistics();
    } catch (error) {
      // En caso de error, revertimos
      setClientes(previousClientes);
      setError('Error al cambiar estado: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      case 'prospecto': return 'bg-blue-100 text-blue-800';
      case 'potencial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'comercial': return Building;
      case 'residencial': return User;
      case 'industrial': return Building;
      default: return User;
    }
  };

  const getClientTypeLabel = (type) => {
    switch (type) {
      case 'comercial': return 'Comercial';
      case 'residencial': return 'Residencial';
      case 'industrial': return 'Industrial';
      default: return 'No especificado';
    }
  };

  const getNetworkTypeLabel = (networkType) => {
    switch (networkType) {
      case 'monofasico': return 'Monofásico';
      case 'bifasico': return 'Bifásico';
      case 'trifasico_220': return 'Trifásico 220V';
      case 'trifasico_440': return 'Trifásico 440V';
      default: return 'No especificado';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { date: 'N/A', time: '' };
    
    const date = new Date(dateString);
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = today - dateOnly;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return {
        date: 'Hoy',
        time: date.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    }
    
    if (diffDays === 1) {
      return {
        date: 'Ayer',
        time: date.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    }
    
    if (diffDays <= 7) {
      return {
        date: `Hace ${diffDays} días`,
        time: date.toLocaleTimeString('es-CO', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    }
    
    return {
      date: date.toLocaleDateString('es-CO'),
      time: date.toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = !searchTerm || 
      cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.phone?.includes(searchTerm) ||
      cliente.nic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      if (key === 'type') {
        return cliente.client_type === value;
      }
      
      if (key === 'city') {
        const cityName = cliente.city?.name || cliente.city || '';
        return cityName.toLowerCase().includes(value.toLowerCase());
      }
      
      if (key === 'network_type') {
        return cliente.network_type === value;
      }
      
      return cliente[key] === value;
    });
    
    return matchesSearch && matchesFilters;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Gestión de Clientes - VERSIÓN ACTUALIZADA</h1>
        <p className="text-slate-600 mt-1">Administra la información de tus clientes y prospectos</p>
        {/* Debug info */}
        <div className="text-xs text-gray-500 mt-1">
          Debug: {clientes.length} clientes cargados | Loading: {loading ? 'Sí' : 'No'} | Error: {error ? 'Sí' : 'No'}
        </div>
      </div>

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.total}</p>
                <p className="text-sm text-slate-600">Total Clientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.active}</p>
                <p className="text-sm text-slate-600">Activos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {statistics.by_status?.find(s => s.status === 'prospecto')?.count || 0}
                </p>
                <p className="text-sm text-slate-600">Prospectos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {statistics.by_status?.find(s => s.status === 'potencial')?.count || 0}
                </p>
                <p className="text-sm text-slate-600">Potenciales</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                onClick={onCreate}
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
          <div className="p-6 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Cliente</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Todos los tipos</option>
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="prospecto">Prospecto</option>
                  <option value="potencial">Potencial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={filters.city || ''}
                  onChange={(e) => setFilters({...filters, city: e.target.value})}
                  placeholder="Buscar por ciudad..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Red</label>
                <select
                  value={filters.network_type || ''}
                  onChange={(e) => setFilters({...filters, network_type: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                >
                  <option value="">Todos los tipos</option>
                  <option value="monofasico">Monofásico</option>
                  <option value="bifasico">Bifásico</option>
                  <option value="trifasico_220">Trifásico 220V</option>
                  <option value="trifasico_440">Trifásico 440V</option>
                </select>
              </div>
            </div>
            
            {/* Botones de Acción de Filtros */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={loadClientes}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={() => {
                  setFilters({
                    type: '',
                    status: '',
                    city: '',
                    network_type: '',
                    is_active: ''
                  });
                  setSearchTerm('');
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Limpiar Todo
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Ocultar Filtros
              </button>
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
              <UserX className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadClientes}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ciudad</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo de Red</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">NIC / Consumo</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha de Creación</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Registrado por</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClientes.map((cliente) => {
                  const TypeIcon = getTypeIcon(cliente.type);
                  return (
                    <tr key={cliente.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <TypeIcon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{cliente.name}</p>
                            <p className="text-sm text-slate-600">
                              {cliente.document_number && `${cliente.document_type}: ${cliente.document_number}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <TypeIcon className="w-3 h-3" />
                          {getClientTypeLabel(cliente.client_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cliente.status)}`}>
                          {cliente.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {cliente.city?.name || cliente.city || 'No especificada'}
                            </p>
                            {cliente.department?.name && (
                              <p className="text-xs text-slate-500">
                                {cliente.department.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-900">
                            {getNetworkTypeLabel(cliente.network_type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {cliente.nic && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <MapPin className="w-3 h-3" />
                              NIC: {cliente.nic}
                            </div>
                          )}
                          {cliente.monthly_consumption_kwh && (
                            <p className="text-xs text-slate-500">
                              {cliente.monthly_consumption_kwh} kWh/mes
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div>
                            {(() => {
                              const formattedDate = formatDate(cliente.created_at);
                              return (
                                <>
                                  <p className="text-sm font-medium text-slate-900">
                                    {formattedDate.date}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formattedDate.time}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-slate-600" />
                          </div>
                          <span className="text-sm text-slate-600">
                            {cliente.createdBy?.name || 'Sistema'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onView(cliente)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(cliente)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(cliente)}
                            className={`p-2 rounded-lg transition-colors ${
                              cliente.is_active 
                                ? 'text-slate-600 hover:text-red-600 hover:bg-red-50' 
                                : 'text-slate-600 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={cliente.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {cliente.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(cliente)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredClientes.length === 0 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No se encontraron clientes</p>
                <button
                  onClick={onCreate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crear Primer Cliente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientesIndex;
