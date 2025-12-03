import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Eye,
  Download,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import CotizacionModal from './CotizacionModal';
import CotizacionDeleteModal from './CotizacionDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import { cotizacionesService } from '../../services/cotizacionesService';

const VistaCotizaciones = () => {
  const navigate = useNavigate();

  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quotationStatuses, setQuotationStatuses] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    client_type: '',
    seller: ''
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

  // Estados para estadísticas
  const [statistics, setStatistics] = useState({
    total: 0,
    sum_total_value: 0,
    sum_power_kwp: 0,
    by_status: [],
    by_system_type: []
  });

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



  const getEstadoColor = (estadoName) => {
    switch (estadoName) {
      case 'enviada': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800';
      case 'aceptada': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'borrador': return 'bg-muted text-muted-foreground border-border';
      case 'contratada': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      default: return 'bg-muted text-muted-foreground border-border';
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
          fetchCotizaciones(pagination.current_page); // Refresh the list maintaining current page
          fetchStatistics(debouncedSearchTerm, filters); // Refresh statistics
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
          fetchCotizaciones(pagination.current_page); // Refresh the list maintaining current page
          fetchStatistics(debouncedSearchTerm, filters); // Refresh statistics
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
        fetchCotizaciones(pagination.current_page); // Refresh the list maintaining current page
        fetchStatistics(); // Refresh statistics
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

      // Recibir blob del servicio
      const { blob, filename } = await cotizacionesService.generatePDF(cotizacion.id);

      // Crear URL temporal para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear enlace temporal y hacer clic para descargar
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpiar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification('success', 'PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      showNotification('error', error.message || 'Error al generar el PDF.');
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
        console.error('Estados disponibles:', quotationStatuses.map(s => ({ id: s.status_id, name: s.name })));
        showNotification('error', 'Estado de cotización no encontrado con ID: ' + statusId);
        setEditingEstado(null);
        return;
      }

      const response = await cotizacionesService.changeCotizacionStatus(cotizacionId, statusId);
      if (response.success) {
        showNotification('success', `Estado actualizado a: ${status.name}`);
        fetchCotizaciones(pagination.current_page); // Refresh the list maintaining current page
        fetchStatistics(); // Refresh statistics
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

  // Fetch quotations with pagination
  const fetchCotizaciones = useCallback(async (page = 1, perPage = pagination.per_page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...filters
      };
      const response = await cotizacionesService.getCotizaciones(params);

      // Check if the API returned the expected WIP message instead of data
      if (response.message && response.message.includes('WIP')) {
        setCotizaciones([]);
        setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
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
          setPagination({
            current_page: response.data.current_page || 1,
            per_page: response.data.per_page || 15,
            total: response.data.total || 0,
            last_page: response.data.last_page || 1,
            from: response.data.from || 0,
            to: response.data.to || 0
          });
        } else {
          setCotizaciones([]);
          setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
        }
      } else {
        setError(response.message || 'Error al cargar las cotizaciones.');
        setCotizaciones([]);
        setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
      }
    } catch (err) {
      setError(err.message || 'Error de conexión al cargar cotizaciones.');
      setCotizaciones([]);
      setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters, pagination.per_page]);

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

  // Fetch statistics
  const fetchStatistics = useCallback(async (searchTerm = '', filters = {}) => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };
      const response = await cotizacionesService.getStatistics(params);
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      // Mantener valores por defecto en caso de error
    }
  }, []);

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCotizaciones();
    fetchQuotationStatuses();
    fetchStatistics('', filters);
  }, []);

  // Cargar datos cuando cambien los filtros o búsqueda
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchCotizaciones();
      fetchStatistics(debouncedSearchTerm, filters);
    }
  }, [debouncedSearchTerm, filters]);

  const vendedores = [...new Set(cotizaciones.map(c => c.user?.name || ''))].filter(Boolean).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Cotizaciones</h1>
          <p className="text-muted-foreground mt-1">Administra las cotizaciones y propuestas comerciales</p>
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
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Cotizaciones</p>
              <div className="text-2xl font-bold text-foreground">
                {loading ? <div className="animate-pulse bg-muted h-8 w-16 rounded"></div> : statistics.total || 0}
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Aceptadas</p>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {loading ? <div className="animate-pulse bg-muted h-8 w-16 rounded"></div> :
                  (statistics.by_status?.find(s => s.status_id === 4)?.count || 0) +
                  (statistics.by_status?.find(s => s.status_id === 6)?.count || 0)
                }
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? <div className="animate-pulse bg-muted h-8 w-24 rounded"></div> :
                  formatPrice(statistics.sum_total_value || 0)
                }
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Potencia Total</p>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {loading ? <div className="animate-pulse bg-muted h-8 w-20 rounded"></div> :
                  formatPower(statistics.sum_power_kwp || 0)
                }
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <AdvancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar cotizaciones..."
              loading={loading && searchTerm.length > 0}
              className="flex-1 min-w-[200px]"
            />
            <AdvancedFilters
              filters={filters}
              onFilterChange={setFilters}
              filterOptions={[
                {
                  key: 'status',
                  label: 'Estado',
                  options: Array.isArray(quotationStatuses) ? quotationStatuses.map(status => ({
                    value: status.name,
                    label: status.name
                  })) : []
                },
                {
                  key: 'client_type',
                  label: 'Tipo Cliente',
                  options: [
                    { value: 'empresa', label: 'Empresa' },
                    { value: 'comercial', label: 'Comercial' },
                    { value: 'residencial', label: 'Residencial' },
                    { value: 'industrial', label: 'Industrial' }
                  ]
                },
                {
                  key: 'seller',
                  label: 'Vendedor',
                  options: vendedores.map(vendedor => ({
                    value: vendedor,
                    label: vendedor
                  }))
                }
              ]}
            />
          </div>

          {/* Tabla */}
          <div className="rounded-md border transition-opacity duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cotización</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Potencia</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={8} rows={pagination.per_page || 15} asRows={true} />
                ) : cotizaciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron cotizaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  cotizaciones.map((cotizacion) => (
                    <TableRow key={cotizacion.id} className="transition-all duration-200 hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cotizacion.number}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(cotizacion.issue_date)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            {cotizacion.client?.type === 'empresa' || cotizacion.client?.type === 'comercial' || cotizacion.client?.type === 'industrial' ? (
                              <Building className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cotizacion.client?.name}</p>
                            <p className="text-sm text-muted-foreground">{cotizacion.client?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-foreground">{cotizacion.project_name}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatPower(cotizacion.total_power_kw || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-foreground">
                          {formatPrice(cotizacion.total_value || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {editingEstado === cotizacion.id ? (
                          <div className="relative">
                            <select
                              value={cotizacion.status?.status_id || ''}
                              onChange={(e) => {
                                const selectedStatusId = e.target.value;
                                if (selectedStatusId) {
                                  handleEstadoChange(cotizacion.id, selectedStatusId);
                                }
                              }}
                              onBlur={handleEstadoBlur}
                              className="w-full px-3 py-1.5 text-sm border border-input rounded-lg bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none text-foreground"
                              autoFocus
                            >
                              <option value="">Seleccionar estado...</option>
                              {Array.isArray(quotationStatuses) ? quotationStatuses.map(status => (
                                <option key={status.status_id} value={status.status_id}>
                                  {status.name}
                                </option>
                              )) : null}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
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
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{cotizacion.user?.name}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleView(cotizacion)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(cotizacion)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(cotizacion)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors"
                            title="Eliminar cotización"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <AdvancedPagination
            pagination={pagination}
            onPageChange={(page) => fetchCotizaciones(page)}
            onPerPageChange={(perPage) => fetchCotizaciones(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

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
