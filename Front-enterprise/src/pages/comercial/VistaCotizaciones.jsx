import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  DollarSign,
  User,
  Building,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import CotizacionModal from './CotizacionModal';
import CotizacionDeleteModal from './CotizacionDeleteModal';
import { Notification } from '../../shared/ui';
import { cotizacionesService } from '../../services/cotizacionesService';

const VistaCotizaciones = () => {
  const navigate = useNavigate();
  
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotationStatuses, setQuotationStatuses] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [clienteFilter, setClienteFilter] = useState('');
  const [vendedorFilter, setVendedorFilter] = useState('');

  // Estados para modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] = useState(null);

  // Estados para notificaciones y carga
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEstado, setEditingEstado] = useState(null);

  // Filtrar cotizaciones
  const cotizacionesFiltradas = cotizaciones.filter(cotizacion => {
    // Sanitize search term to prevent potential issues
    const sanitizedSearchTerm = searchTerm?.toLowerCase() || '';
    
    const cumpleBusqueda = 
      (cotizacion.number && cotizacion.number.toLowerCase().includes(sanitizedSearchTerm)) ||
      (cotizacion.client?.name && cotizacion.client.name.toLowerCase().includes(sanitizedSearchTerm)) ||
      (cotizacion.project_name && cotizacion.project_name.toLowerCase().includes(sanitizedSearchTerm));
    
    const cumpleEstado = !estadoFilter || (cotizacion.status?.name === estadoFilter);
    const cumpleCliente = !clienteFilter || (cotizacion.client?.type === clienteFilter);
    const cumpleVendedor = !vendedorFilter || (cotizacion.user?.name === vendedorFilter);

    return cumpleBusqueda && cumpleEstado && cumpleCliente && cumpleVendedor;
  });

  const getEstadoColor = (estadoName) => {
    switch (estadoName) {
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aceptada': return 'bg-green-100 text-green-800 border-green-200';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200';
      case 'borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contratada': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estadoName) => {
    switch (estadoName) {
      case 'enviada': return CheckCircle;
      case 'pendiente': return Clock;
      case 'aceptada': return CheckCircle;
      case 'rechazada': return XCircle;
      case 'borrador': return FileText;
      default: return FileText;
    }
  };

  const getEstadoLabel = (estadoName) => {
    switch (estadoName) {
      case 'enviada': return 'Enviada';
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'borrador': return 'Borrador';
      default: return estadoName;
    }
  };

  const formatPrice = (price) => {
    // Handle undefined, null, or invalid values
    if (price == null || isNaN(price) || price === '') {
      return '0 COP';
    }
    
    const numericValue = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericValue)) {
      return '0 COP';
    }
    
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(numericValue);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPower = (power) => {
    if (power == null || isNaN(power) || power === '') {
      return '0 kW';
    }
    
    const numericValue = typeof power === 'string' ? parseFloat(power) : power;
    
    if (isNaN(numericValue)) {
      return '0 kW';
    }
    
    return `${numericValue} kW`;
  };

  // Funciones para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Funciones para modales
  const handleCreate = () => {
    setModalMode('create');
    setSelectedCotizacion(null);
    setShowModal(true);
  };

  const handleView = (cotizacion) => {
    navigate(`/cotizaciones/${cotizacion.id}`);
  };

  const handleDelete = (cotizacion) => {
    // Validate cotizacion object before showing delete modal
    if (!cotizacion || !cotizacion.id) {
      showNotification('error', 'Información de cotización inválida para eliminación.');
      return;
    }
    
    setCotizacionToDelete(cotizacion);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCotizacion(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCotizacionToDelete(null);
  };

  // Funciones CRUD
  const handleSubmit = async (cotizacionData) => { // cotizacionData is passed from CotizacionModal
    setIsSubmitting(true);
    try {
      // Validate input data
      if (!cotizacionData) {
        showNotification('error', 'Datos de cotización inválidos.');
        return;
      }
      
      let response;
      if (modalMode === 'create') {
        response = await cotizacionesService.createCotizacion(cotizacionData);
        if (response.success) {
          showNotification('success', 'Cotización creada exitosamente');
          fetchCotizaciones(); // Refresh the list
        } else {
          showNotification('error', response.message || 'Error al crear la cotización.');
        }
      } else if (modalMode === 'edit' && selectedCotizacion) {
        // Validate that selectedCotizacion has an ID
        const cotizacionId = selectedCotizacion.quotation_id || selectedCotizacion.id;
        if (!cotizacionId) {
          showNotification('error', 'ID de cotización no válido para actualización.');
          return;
        }
        
        response = await cotizacionesService.updateCotizacion(cotizacionId, cotizacionData);
        if (response.success) {
          showNotification('success', 'Cotización actualizada exitosamente');
          fetchCotizaciones(); // Refresh the list
        } else {
          showNotification('error', response.message || 'Error al actualizar la cotización.');
        }
      } else {
        showNotification('error', 'Modo de operación no válido.');
        return;
      }
      closeModal();
    } catch (error) {
      
      showNotification('error', error.message || 'Error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      // Validate cotizacionToDelete object
      if (!cotizacionToDelete || !cotizacionToDelete.id) {
        showNotification('error', 'Información de cotización inválida para eliminación.');
        closeDeleteModal();
        return;
      }
      
      const response = await cotizacionesService.deleteCotizacion(cotizacionToDelete.id);
      if (response.success) {
        showNotification('success', 'Cotización eliminada exitosamente');
        fetchCotizaciones(); // Refresh the list
      } else {
        showNotification('error', response.message || 'Error al eliminar la cotización.');
      }
      closeDeleteModal();
    } catch (error) {
      
      showNotification('error', error.message || 'Error al eliminar la cotización.');
    }
  };

  const handleDownload = async (cotizacion) => {
    try {
      // Validate cotizacion object
      if (!cotizacion || !cotizacion.id || !cotizacion.number) {
        showNotification('error', 'Información de cotización inválida para descarga.');
        return;
      }
      
      showNotification('info', `Generando PDF para cotización ${cotizacion.number}...`);
      const response = await cotizacionesService.generatePDF(cotizacion.id);
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank'); // Open PDF in new tab
        showNotification('success', 'PDF generado y descargando...');
      } else {
        showNotification('error', response.message || 'Error al generar el PDF.');
      }
    } catch (error) {
      
      showNotification('error', error.message || 'Error de conexión al generar PDF.');
    }
  };

  // Funciones para cambio de estado
  const handleEstadoClick = (cotizacion) => {
    setEditingEstado(cotizacion.id);
  };

  const handleEstadoChange = async (cotizacionId, statusId) => {
    try {
      // Validate inputs
      if (!cotizacionId || !statusId) {
        showNotification('error', 'ID de cotización o ID de estado no válido.');
        setEditingEstado(null);
        return;
      }
      
      // Validate that quotationStatuses is available
      if (!Array.isArray(quotationStatuses) || quotationStatuses.length === 0) {
        showNotification('error', 'No se han cargado los estados de cotización.');
        setEditingEstado(null);
        return;
      }
      
      // Verificar que el statusId existe en la lista de estados para evitar inyección de IDs inválidos
      const status = quotationStatuses.find(s => s.status_id == statusId);
      if (!status) {
        console.error('Estado no encontrado:', statusId);
        console.error('Estados disponibles:', quotationStatuses.map(s => ({id: s.status_id, name: s.name})));
        showNotification('error', 'Estado de cotización no encontrado con ID: ' + statusId);
        setEditingEstado(null);
        return;
      }
      
      const response = await cotizacionesService.changeCotizacionStatus(cotizacionId, statusId);
      if (response.success) {
        showNotification('success', `Estado actualizado a: ${status.name}`);
        fetchCotizaciones(); // Refresh the list
      } else {
        console.error('Error en la respuesta del backend:', response);
        showNotification('error', response.message || 'Error al actualizar el estado.');
      }
      setEditingEstado(null);
    } catch (error) {
      
      console.error('Error al actualizar estado:', error);
      showNotification('error', error.message || 'Error al actualizar el estado.');
      setEditingEstado(null);
    }
  };

  const handleEstadoBlur = () => {
    // Pequeño delay para permitir el clic en las opciones
    setTimeout(() => {
      setEditingEstado(null);
    }, 200);
  };

  // Función auxiliar para obtener el nombre del estado a partir del ID
  const getStatusNameFromId = (statusId) => {
    const statusMap = {
      1: 'borrador',
      2: 'enviada',
      3: 'pendiente',
      4: 'aceptada',
      5: 'rechazada',
      6: 'contratada'
    };
    return statusMap[statusId] || 'borrador';
  };

  // Función auxiliar para obtener el color del estado a partir del ID
  const getStatusColorFromId = (statusId) => {
    const colorMap = {
      1: '#9ca3af', // gris
      2: '#3b82f6', // azul
      3: '#f59e0b', // amarillo
      4: '#10b981', // verde
      5: '#ef4444', // rojo
      6: '#8b5cf6'  // morado
    };
    return colorMap[statusId] || '#9ca3af';
  };

  // Fetch quotations
  const fetchCotizaciones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: searchTerm,
        status: estadoFilter,
        client_type: clienteFilter,
        seller: vendedorFilter,
      };
      const response = await cotizacionesService.getCotizaciones(params);
       // Debug log
      
      // Check if the API returned the expected WIP message instead of data
      if (response.message && response.message.includes('WIP')) {
        
        setCotizaciones([]);
      } 
      // Check for success field (original logic)
      else if (response.success) {
        // Validate the response data before setting state
        if (response.data && Array.isArray(response.data.data)) {
          // Transform cotizaciones to ensure compatibility with frontend
          const formattedCotizaciones = response.data.data.map(cotizacion => ({
            ...cotizacion,
            id: cotizacion.quotation_id, // Ensure 'id' field exists for frontend compatibility
            number: cotizacion.quotation_number, // Ensure 'number' field exists for frontend compatibility
            issue_date: cotizacion.created_at, // Mapear created_at a issue_date
            total_power_kw: cotizacion.power_kwp, // Mapear power_kwp a total_power_kw
            // Agregar el estado si solo viene el ID
            status: cotizacion.status || {
              status_id: cotizacion.status_id,
              id: cotizacion.status_id,
              name: getStatusNameFromId(cotizacion.status_id), // Función auxiliar para obtener nombre del estado
              color: getStatusColorFromId(cotizacion.status_id) // Función auxiliar para obtener color del estado
            },
            client: {
              ...cotizacion.client,
              document: cotizacion.client.nic // Mapear nic a document si no existe
            }
          }));
          setCotizaciones(formattedCotizaciones);
        } else {
          setCotizaciones([]);
          
        }
      } else {
        setError(response.message || 'Error al cargar las cotizaciones.');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión al cargar cotizaciones.');
      
    } finally {
      setLoading(false);
    }
  }, [searchTerm, estadoFilter, clienteFilter, vendedorFilter]);

  // Fetch quotation statuses
  const fetchQuotationStatuses = useCallback(async () => {
    try {
      const response = await cotizacionesService.getStatuses();
       // Debug log
      
      // Handle different response formats
      // If response is an array (direct response), use it directly
      if (Array.isArray(response)) {
        // If it's an array of objects with id/name, use as-is
        if (response.length > 0 && typeof response[0] === 'object' && response[0].id && response[0].name) {
          setQuotationStatuses(response);
        } else if (response.length > 0) {
          // If it's an array of plain values, transform to objects with id and name
          const transformed = response.map((item, index) => {
            if (typeof item === 'object') {
              return item;
            } else {
              // If it's a plain value, create a fallback object
              return { id: item, name: item.toString() };
            }
          });
          setQuotationStatuses(transformed);
        } else {
          setQuotationStatuses([]);
        }
      }
      // If response has a success field and it's true
      else if (response.success) {
        if (response.data && Array.isArray(response.data)) {
          setQuotationStatuses(response.data);
        } else {
          setQuotationStatuses([]);
          
        }
      }
      // If response has no success field but is an object with an array-like structure
      else if (Array.isArray(response.data)) {
        setQuotationStatuses(response.data);
      }
      // If empty array is returned (which seems to be the case from the logs)
      else if (Array.isArray(response) && response.length === 0) {
        
        setQuotationStatuses([
          { id: 1, name: 'borrador' },
          { id: 2, name: 'enviada' },
          { id: 3, name: 'pendiente' },
          { id: 4, name: 'aceptada' },
          { id: 5, name: 'rechazada' }
        ]);
      }
      // If response has a message field but no success field
      else {
        
        // Provide fallback statuses if the API fails
        setQuotationStatuses([
          { id: 1, name: 'borrador' },
          { id: 2, name: 'enviada' },
          { id: 3, name: 'pendiente' },
          { id: 4, name: 'aceptada' },
          { id: 5, name: 'rechazada' }
        ]);
      }
    } catch (err) {
      
      // Provide fallback statuses if the API fails
      setQuotationStatuses([
        { id: 1, name: 'borrador' },
        { id: 2, name: 'enviada' },
        { id: 3, name: 'pendiente' },
        { id: 4, name: 'aceptada' },
        { id: 5, name: 'rechazada' }
      ]);
    }
  }, []);

  useEffect(() => {
    fetchCotizaciones();
    fetchQuotationStatuses();
  }, [fetchCotizaciones, fetchQuotationStatuses]);

  const vendedores = [...new Set(cotizaciones.map(c => c.user?.name || ''))].filter(Boolean).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Cotizaciones</h1>
          <p className="text-slate-600 mt-1">Administra las cotizaciones y propuestas comerciales</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </button>
      </div>


      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cotizaciones</p>
              <p className="text-2xl font-bold text-slate-900">{cotizaciones.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Aceptadas</p>
              <p className="text-2xl font-bold text-green-600">
                {cotizaciones.filter(c => c.status?.name === 'aceptada').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(cotizaciones.reduce((acc, c) => {
                  const value = parseFloat(c.total_value);
                  return isNaN(value) ? acc : acc + value;
                }, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Potencia Total</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatPower(cotizaciones.reduce((acc, c) => {
                  const power = parseFloat(c.total_power_kw);
                  return isNaN(power) ? acc : acc + power;
                }, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cotizaciones..."
              value={searchTerm}
              onChange={(e) => {
                // Limit input length to prevent potential DoS
                if (e.target.value.length <= 100) {
                  setSearchTerm(e.target.value);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          
          <select
            value={estadoFilter}
            onChange={(e) => {
              // Only allow valid status values from the API
              const validStatuses = Array.isArray(quotationStatuses) ? quotationStatuses.map(s => s.name) : [];
              if (e.target.value === '' || validStatuses.includes(e.target.value)) {
                setEstadoFilter(e.target.value);
              }
            }}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los estados</option>
            {Array.isArray(quotationStatuses) ? quotationStatuses.map(status => (
              <option key={status.id || (typeof status === 'object' ? JSON.stringify(status) : status)} value={status.name || status}>
                {status.name || status}
              </option>
            )) : null}
          </select>
          
          <select
            value={clienteFilter}
            onChange={(e) => {
              const validValues = ['', 'empresa', 'comercial', 'residencial', 'industrial'];
              if (validValues.includes(e.target.value)) {
                setClienteFilter(e.target.value);
              }
            }}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los tipos</option>
            <option value="empresa">Empresa</option>
            <option value="comercial">Comercial</option>
            <option value="residencial">Residencial</option>
            <option value="industrial">Industrial</option>
          </select>
          
          <select
            value={vendedorFilter}
            onChange={(e) => {
              // Only allow valid vendedor values from the dataset
              if (e.target.value === '' || vendedores.includes(e.target.value)) {
                setVendedorFilter(e.target.value);
              }
            }}
            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los vendedores</option>
            {vendedores.map(vendedor => (
              <option key={vendedor} value={vendedor}>{vendedor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Cotizaciones ({cotizacionesFiltradas.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Cotización</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Cliente</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Proyecto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Potencia</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Valor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Vendedor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">Cargando cotizaciones...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-red-500">Error: {error}</td>
                </tr>
              ) : cotizacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">No se encontraron cotizaciones</td>
                </tr>
              ) : (
                cotizacionesFiltradas.map((cotizacion) => {
                  const EstadoIcon = getEstadoIcon(cotizacion.status?.name);
                  return (
                    <tr key={cotizacion.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{cotizacion.number}</p>
                            <p className="text-sm text-slate-600">{formatDate(cotizacion.issue_date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            {cotizacion.client?.type === 'empresa' || cotizacion.client?.type === 'comercial' || cotizacion.client?.type === 'industrial' ? (
                              <Building className="w-4 h-4 text-slate-600" />
                            ) : (
                              <User className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{cotizacion.client?.name}</p>
                            <p className="text-sm text-slate-600">{cotizacion.client?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-900">{cotizacion.project_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {formatPower(cotizacion.total_power_kw || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {formatPrice(cotizacion.total_value || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {editingEstado === cotizacion.id ? (
                          <div className="relative">
                            <select
                              value={cotizacion.status?.status_id || ''}
                              onChange={(e) => {
                                const selectedStatusId = e.target.value;
                                
                                console.log('🔍 Valor de estado seleccionado:', {
                                  value: selectedStatusId,
                                  type: typeof selectedStatusId,
                                  parsed: parseInt(selectedStatusId, 10)
                                });
                                
                                if (selectedStatusId) {
                                  console.log('✅ Actualizando estado de cotización:', {
                                    cotizacionId: cotizacion.id,
                                    statusId: selectedStatusId
                                  });
                                  
                                  handleEstadoChange(cotizacion.id, selectedStatusId);
                                } else {
                                  console.error('❌ No se seleccionó un ID de estado válido:', selectedStatusId);
                                }
                              }}
                              onBlur={handleEstadoBlur}
                              className="w-full px-3 py-1.5 text-sm border border-green-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                              autoFocus
                            >
                              <option value="">Seleccionar estado...</option>
                              {Array.isArray(quotationStatuses) ? quotationStatuses.map(status => (
                                <option key={status.status_id} value={status.status_id}>
                                  {status.name}
                                </option>
                              )) : null}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <span 
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:shadow-sm transition-all border ${getEstadoColor(cotizacion.status?.name)}`}
                            onClick={() => handleEstadoClick(cotizacion)}
                            title="Clic para cambiar estado"
                          >
                            <div className={`w-2 h-2 rounded-full ${cotizacion.status?.color ? 'bg-current' : ''}`} style={{ backgroundColor: cotizacion.status?.color }}></div>
                            {getEstadoLabel(cotizacion.status?.name)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{cotizacion.user?.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleView(cotizacion)}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownload(cotizacion)}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(cotizacion)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cotización */}
      <CotizacionModal
        show={showModal}
        mode={modalMode}
        cotizacion={selectedCotizacion}
        onSubmit={handleSubmit}
        onClose={closeModal}
        isSubmitting={isSubmitting}
        quotationStatuses={quotationStatuses} // Pass statuses to modal
      />

      {/* Modal de Confirmación de Eliminación */}
      <CotizacionDeleteModal
        show={showDeleteModal}
        cotizacion={cotizacionToDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
      />

      {/* Notificación Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaCotizaciones;
