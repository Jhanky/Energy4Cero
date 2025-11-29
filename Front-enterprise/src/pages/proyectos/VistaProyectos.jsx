import { useState, useEffect } from 'react';
import {
  FolderOpen,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Loader2,
  User,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { StatusBadge } from '../../ui/status-badge';
import dataService from '../../services/dataService';
import { useAuth } from '../../contexts/AuthContext';
import ProyectoDeleteModal from './ProyectoDeleteModal';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';

const VistaProyectos = () => {
  const { user: loggedInUser } = useAuth();

  // Estados para datos del backend
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    in_progress: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    client_id: ''
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
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Estados para formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    project_state_id: 1,
    estimated_cost: '',
    start_date: '',
    end_date: '',
    responsible_user_id: '',
    location: '',
    notes: ''
  });

  // Estados para clientes y usuarios
  const [clientes, setClientes] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para notificaciones
  const [notification, setNotification] = useState(null);

  // Función para mostrar notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Función para obtener el estado del proyecto como string para StatusBadge
  const getEstadoProyecto = (estadoId) => {
    const estadoMap = {
      1: 'preparacion-solicitud',
      2: 'solicitud-presentada',
      3: 'revision-completitud',
      4: 'revision-tecnica',
      5: 'concepto-viabilidad',
      6: 'instalacion-proceso',
      7: 'inspeccion-pendiente',
      8: 'inspeccion-realizada',
      9: 'observaciones-inspeccion',
      10: 'aprobacion-final',
      11: 'conectado-operando',
      12: 'suspendido',
      13: 'cancelado'
    };
    return estadoMap[estadoId] || 'neutral';
  };

  // Función para cargar proyectos con paginación
  const loadProyectos = async (page = 1, perPage = pagination.per_page) => {
    try {
      setLoading(true);
      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...filters
      };

      const response = await dataService.getProjects(params);

      if (response.success) {
        let proyectosData = [];

        if (response.data && response.data.projects && Array.isArray(response.data.projects)) {
          proyectosData = response.data.projects;
        } else if (response.data && Array.isArray(response.data)) {
          proyectosData = response.data;
        }

        // Formatear proyectos
        const formattedProyectos = proyectosData.map(proyecto => ({
          ...proyecto,
          status: getEstadoProyecto(proyecto.project_state_id),
          client: proyecto.client || null,
          responsible_user: proyecto.responsible_user || null
        }));

        setProyectos(formattedProyectos);
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
        showNotification('error', 'Error al cargar proyectos: ' + response.message);
      }
    } catch (error) {
      showNotification('error', 'Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes y usuarios
  const loadClientes = async () => {
    try {
      const response = await dataService.getClients();
      if (response.success) {
        setClientes(response.data.data || response.data);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

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
    await Promise.all([loadProyectos(), loadClientes(), loadUsers()]);
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
    loadProyectos();
  }, [debouncedSearchTerm, filters]);

  // Funciones para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  // Funciones para modales
  const handleEdit = (proyecto) => {
    setModalMode('edit');
    setSelectedProyecto(proyecto);
    setFormData({
      name: proyecto.name || '',
      description: proyecto.description || '',
      client_id: proyecto.client_id || '',
      project_state_id: proyecto.project_state_id || 1,
      estimated_cost: proyecto.estimated_cost || '',
      start_date: proyecto.start_date || '',
      end_date: proyecto.end_date || '',
      responsible_user_id: proyecto.responsible_user_id || '',
      location: proyecto.location || '',
      notes: proyecto.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (proyecto) => {
    setUserToDelete(proyecto);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProyecto(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  // Funciones CRUD
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (!formData.name?.trim()) {
        throw new Error('El nombre del proyecto es obligatorio');
      }

      if (!formData.client_id) {
        throw new Error('Debe seleccionar un cliente');
      }

      let response;
      if (modalMode === 'create') {
        response = await dataService.createProject(formData);
      } else {
        response = await dataService.updateProject(selectedProyecto.id, formData);
      }

      if (response && response.success) {
        showNotification('success', modalMode === 'create' ? 'Proyecto creado exitosamente' : 'Proyecto actualizado exitosamente');
        closeModal();
        loadData();
      } else {
        throw new Error(response?.message || 'Error al procesar el proyecto');
      }
    } catch (error) {
      showNotification('error', error.message || 'Error al procesar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await dataService.deleteProject(userToDelete.id);

      if (response && response.success) {
        showNotification('success', 'Proyecto eliminado exitosamente');
        closeDeleteModal();
        loadData();
      } else {
        throw new Error(response?.message || 'Error al eliminar el proyecto');
      }
    } catch (error) {
      showNotification('error', error.message || 'Error al eliminar el proyecto');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Proyectos</h1>
          <p className="text-slate-600 mt-1">Administra los proyectos de la empresa</p>
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
              <p className="text-sm font-medium text-slate-600">Total Proyectos</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En Progreso</p>
              <p className="text-2xl font-bold text-yellow-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.in_progress}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.completed}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(stats.total_value)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <AdvancedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar proyectos..."
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
                  options: [
                    { value: 'preparacion-solicitud', label: 'Preparación' },
                    { value: 'solicitud-presentada', label: 'Solicitud Presentada' },
                    { value: 'revision-completitud', label: 'Revisión Completitud' },
                    { value: 'revision-tecnica', label: 'Revisión Técnica' },
                    { value: 'concepto-viabilidad', label: 'Concepto Viabilidad' },
                    { value: 'instalacion-proceso', label: 'Instalación Proceso' },
                    { value: 'inspeccion-pendiente', label: 'Inspección Pendiente' },
                    { value: 'inspeccion-realizada', label: 'Inspección Realizada' },
                    { value: 'observaciones-inspeccion', label: 'Observaciones Inspección' },
                    { value: 'aprobacion-final', label: 'Aprobación Final' },
                    { value: 'conectado-operando', label: 'Conectado Operando' },
                    { value: 'suspendido', label: 'Suspendido' },
                    { value: 'cancelado', label: 'Cancelado' }
                  ]
                },
                {
                  key: 'client_id',
                  label: 'Cliente',
                  options: clientes.map(cliente => ({
                    value: cliente.id.toString(),
                    label: cliente.name
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
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Costo Estimado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={7} rows={pagination.per_page || 15} asRows={true} />
                ) : proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{proyecto.name}</p>
                            <p className="text-sm text-slate-600">{proyecto.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900">
                            {proyecto.client?.name || 'Sin cliente'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {proyecto.client?.email || ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge variant={proyecto.status} size="sm">
                          {proyecto.status.replace('-', ' ').toUpperCase()}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-slate-900">
                            {proyecto.responsible_user?.name || 'No asignado'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {proyecto.responsible_user?.email || ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-900">
                          {formatCurrency(proyecto.estimated_cost)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            Inicio: {formatDate(proyecto.start_date)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            Fin: {formatDate(proyecto.end_date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleEdit(proyecto)}
                            className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Editar proyecto"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(proyecto)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar proyecto"
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
            onPageChange={(page) => loadProyectos(page)}
            onPerPageChange={(perPage) => loadProyectos(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal de Confirmación de Eliminación */}
      <ProyectoDeleteModal
        show={showDeleteModal}
        proyecto={userToDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteModal}
        isDeleting={isDeleting}
      />

      {/* Notificación Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaProyectos;
