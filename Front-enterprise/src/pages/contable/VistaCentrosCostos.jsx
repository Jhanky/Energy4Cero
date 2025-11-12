import { useState, useEffect, useCallback } from 'react';
import { Building2, DollarSign, TrendingUp, Users, X, Loader2, Plus, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import costCenterService from '../../services/costCenterService';
import userService from '../../services/userService';

const VistaCentrosCostos = () => {
  // Estados para búsqueda y filtros avanzados
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    responsable: ''
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estados para datos
  const [centrosCostos, setCentrosCostos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  // Estados para notificaciones
  const [notification, setNotification] = useState(null);

  // Estados para formularios
  const [costCenterForm, setCostCenterForm] = useState({
    name: '',
    description: '',
    status: 'activo'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para recargar datos cuando cambian los filtros o búsqueda
  useEffect(() => {
    loadCostCenters();
  }, [debouncedSearchTerm, filters, currentPage, perPage]);

  // Cargar datos iniciales
  useEffect(() => {
    loadUsers();
  }, []);

  // Cargar centros de costos con paginación del servidor
  const loadCostCenters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        per_page: perPage,
        search: debouncedSearchTerm,
        ...filters
      };

      const response = await costCenterService.getCostCenters(params);
      if (response.success) {
        // Transformar datos del API al formato del frontend
        const transformedData = response.data.cost_centers.map(center => ({
          id: center.id,
          nombre: center.name,
          codigo: center.code,
          tipo: center.type,
          descripcion: center.description,
          responsable: center.responsible_user?.name || 'Sin asignar',
          presupuesto: center.budget,
          gastado: center.spent || 0,
          disponible: center.available,
          estado: center.status,
          fechaCreacion: center.created_at,
          proyectos: center.projects_count || 0,
          porcentajeUso: center.usage_percentage || 0
        }));

        setCentrosCostos(transformedData);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotalRecords(response.data.pagination?.total || 0);
      } else {
        setError('Error al cargar centros de costos');
      }
    } catch (error) {
      console.error('Error loading cost centers:', error);
      setError('Error al cargar centros de costos');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, debouncedSearchTerm, filters]);

  const loadUsers = async () => {
    try {
      // TODO: Implementar servicio de usuarios cuando esté disponible
      // Por ahora usar datos mock hasta que se implemente el servicio
      setUsers([
        { id: 1, name: 'Carlos Mendoza' },
        { id: 2, name: 'María González' },
        { id: 3, name: 'Ana Rodríguez' },
        { id: 4, name: 'Roberto Silva' },
        { id: 5, name: 'Diego Herrera' },
        { id: 6, name: 'Laura Martínez' }
      ]);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Filtrar centros de costos
  const centrosFiltrados = centrosCostos.filter(centro => {
    const cumpleBusqueda = 
      centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleTipo = !filters.tipo || centro.tipo === filters.tipo;
    const cumpleEstado = !filters.estado || centro.estado === filters.estado;
    const cumpleResponsable = !filters.responsable || centro.responsable === filters.responsable;

    return cumpleBusqueda && cumpleTipo && cumpleEstado && cumpleResponsable;
  });

  const tipos = [...new Set(centrosCostos.map(c => c.tipo))];
  const responsables = [...new Set(centrosCostos.map(c => c.responsable))];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-red-100 text-red-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Proyecto':
        return 'bg-blue-100 text-blue-800';
      case 'Administrativo':
        return 'bg-purple-100 text-purple-800';
      case 'Comercial':
        return 'bg-green-100 text-green-800';
      case 'Técnico':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPorcentajeColor = (porcentaje) => {
    if (porcentaje >= 90) return 'text-red-600';
    if (porcentaje >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Funciones para manejar formularios
  const handleFormChange = (field, value) => {
    setCostCenterForm(prev => ({ ...prev, [field]: value }));
  };

  // Funciones para modales
  const handleCreateCostCenter = () => {
    setCostCenterForm({
      name: '',
      description: '',
      status: 'activo'
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleEditCostCenter = (costCenter) => {
    setSelectedCostCenter(costCenter);
    setCostCenterForm({
      code: costCenter.codigo,
      name: costCenter.nombre,
      type: costCenter.tipo,
      description: costCenter.descripcion,
      responsible_user_id: users.find(u => u.name === costCenter.responsable)?.id || '',
      budget: costCenter.presupuesto || '',
      status: costCenter.estado
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleDeleteCostCenter = (costCenter) => {
    setSelectedCostCenter(costCenter);
    setDeleteConfirmation('');
    setIsDeleteModalOpen(true);
  };

  // Funciones para submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!costCenterForm.name) {
      setFormErrors({
        name: 'El nombre es obligatorio'
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await costCenterService.createCostCenter({
        name: costCenterForm.name,
        description: costCenterForm.description,
        status: costCenterForm.status
      });

      if (response.success) {
        // Recargar la lista de centros de costos
        await loadCostCenters();
        setIsCreateModalOpen(false);
        console.log('Centro de costo creado exitosamente');
      } else {
        // Manejar errores de validación del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al crear el centro de costo' });
        }
      }
    } catch (error) {
      console.error('Error creating cost center:', error);
      setFormErrors({ general: 'Error al crear el centro de costo' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCostCenter) return;

    // Validación básica
    if (!costCenterForm.code || !costCenterForm.name || !costCenterForm.responsible_user_id) {
      setFormErrors({
        code: !costCenterForm.code ? 'El código es obligatorio' : '',
        name: !costCenterForm.name ? 'El nombre es obligatorio' : '',
        responsible_user_id: !costCenterForm.responsible_user_id ? 'El responsable es obligatorio' : ''
      });
      return;
    }

    // Validación de presupuesto para proyectos
    if (costCenterForm.type === 'Proyecto' && !costCenterForm.budget) {
      setFormErrors({
        budget: 'El presupuesto es obligatorio para centros de tipo Proyecto'
      });
      return;
    }

    setSubmitting(true);
    setFormErrors({});

    try {
      const response = await costCenterService.updateCostCenter(selectedCostCenter.id, {
        code: costCenterForm.code,
        name: costCenterForm.name,
        type: costCenterForm.type,
        description: costCenterForm.description,
        responsible_user_id: parseInt(costCenterForm.responsible_user_id),
        budget: costCenterForm.type === 'Proyecto' ? parseFloat(costCenterForm.budget) : null,
        status: costCenterForm.status
      });

      if (response.success) {
        // Recargar la lista de centros de costos
        await loadCostCenters();
        setIsEditModalOpen(false);
        setSelectedCostCenter(null);
        console.log('Centro de costo actualizado exitosamente');
      } else {
        // Manejar errores de validación del backend
        if (response.errors) {
          setFormErrors(response.errors);
        } else {
          setFormErrors({ general: response.message || 'Error al actualizar el centro de costo' });
        }
      }
    } catch (error) {
      console.error('Error updating cost center:', error);
      setFormErrors({ general: 'Error al actualizar el centro de costo' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation === 'Eliminar' && selectedCostCenter) {
      try {
        const response = await costCenterService.deleteCostCenter(selectedCostCenter.id);

        if (response.success) {
          // Recargar la lista de centros de costos
          await loadCostCenters();
          setIsDeleteModalOpen(false);
          setSelectedCostCenter(null);
          console.log('Centro de costo eliminado exitosamente');
        } else {
          console.error('Error deleting cost center:', response.message);
          // Aquí podrías mostrar un mensaje de error al usuario
        }
      } catch (error) {
        console.error('Error deleting cost center:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centros de Costos</h1>
          <p className="text-slate-600 mt-1">Administra los centros de costos y presupuestos</p>
        </div>
        <button
          onClick={handleCreateCostCenter}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Centro de Costos
        </button>
      </div>

      {/* Componentes Avanzados de Búsqueda y Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar y Filtrar Centros de Costos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedSearchBar
            placeholder="Buscar por nombre, código, responsable o tipo..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <AdvancedFilters
            filters={[
              {
                key: 'tipo',
                label: 'Tipo',
                value: filters.tipo,
                options: [
                  { value: '', label: 'Todos los tipos' },
                  ...tipos.map(tipo => ({
                    value: tipo,
                    label: tipo
                  }))
                ]
              },
              {
                key: 'estado',
                label: 'Estado',
                value: filters.estado,
                options: [
                  { value: '', label: 'Todos los estados' },
                  { value: 'activo', label: 'Activo' },
                  { value: 'cerrado', label: 'Cerrado' },
                  { value: 'pausado', label: 'Pausado' }
                ]
              },
              {
                key: 'responsable',
                label: 'Responsable',
                value: filters.responsable,
                options: [
                  { value: '', label: 'Todos los responsables' },
                  ...responsables.map(responsable => ({
                    value: responsable,
                    label: responsable
                  }))
                ]
              }
            ]}
            onChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
            onClear={() => setFilters({
              tipo: '',
              estado: '',
              responsable: ''
            })}
          />
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Mostrando <span className="font-semibold">{centrosCostos.length}</span> de <span className="font-semibold">{totalRecords}</span> centros de costos
            </span>
          </div>
        </CardContent>
      </Card>



      {/* Tabla de Centros de Costos */}
      <Card>
        <CardHeader>
          <CardTitle>Centros de Costos Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SkeletonTable columns={7} rows={perPage} />
          ) : centrosCostos.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No hay centros de costos</h3>
              <p className="mt-1 text-sm text-slate-500">Comienza creando tu primer centro de costos.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateCostCenter}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Centro de Costos
                </button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Centro de Costos</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Presupuesto</TableHead>
                    <TableHead>Utilización</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {centrosCostos.map((centro) => (
                    <TableRow key={centro.id}>
                      <TableCell>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{centro.nombre}</div>
                          <div className="text-sm text-slate-500">Código: {centro.codigo}</div>
                          <div className="text-xs text-slate-400 mt-1">{centro.descripcion}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(centro.tipo)}`}>
                          {centro.tipo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900">{centro.responsable}</div>
                        {centro.proyectos > 0 && (
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {centro.proyectos} proyecto(s)
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900">{formatearMoneda(centro.presupuesto)}</div>
                        <div className="text-sm text-slate-500">Disponible: {formatearMoneda(centro.disponible)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                centro.porcentajeUso >= 90 ? 'bg-red-500' :
                                centro.porcentajeUso >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(centro.porcentajeUso, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getPorcentajeColor(centro.porcentajeUso)}`}>
                            {centro.porcentajeUso.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Gastado: {formatearMoneda(centro.gastado)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(centro.estado)}`}>
                          {centro.estado === 'activo' ? 'Activo' :
                           centro.estado === 'cerrado' ? 'Cerrado' : 'Pausado'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCostCenter(centro)}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Editar centro de costo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCostCenter(centro)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar centro de costo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación Avanzada */}
              <div className="mt-6">
                <AdvancedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  perPage={perPage}
                  onPerPageChange={setPerPage}
                  totalRecords={totalRecords}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Componente de Notificaciones */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal de Crear Centro de Costos */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Registrar Nuevo Centro de Costos</h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={costCenterForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="Nombre del centro de costos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                  <textarea
                    value={costCenterForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    placeholder="Descripción del centro de costos"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                  <select
                    value={costCenterForm.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      'Registrar Centro'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Centro de Costos */}
      {isEditModalOpen && selectedCostCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Editar Centro de Costos</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={costCenterForm.code}
                      onChange={(e) => handleFormChange('code', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formErrors.code && <p className="text-sm text-red-600 mt-1">{formErrors.code}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Tipo *</label>
                    <select
                      value={costCenterForm.type}
                      onChange={(e) => handleFormChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="Proyecto">Proyecto</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Técnico">Técnico</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={costCenterForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                  <textarea
                    value={costCenterForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Responsable *</label>
                    <select
                      value={costCenterForm.responsible_user_id}
                      onChange={(e) => handleFormChange('responsible_user_id', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Seleccionar responsable</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                    {formErrors.responsible_user_id && <p className="text-sm text-red-600 mt-1">{formErrors.responsible_user_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
                    <select
                      value={costCenterForm.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                {costCenterForm.type === 'Proyecto' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Presupuesto *</label>
                    <input
                      type="number"
                      value={costCenterForm.budget}
                      onChange={(e) => handleFormChange('budget', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    {formErrors.budget && <p className="text-sm text-red-600 mt-1">{formErrors.budget}</p>}
                  </div>
                )}

                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{formErrors.general}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      'Actualizar Centro'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && selectedCostCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-600">Confirmar Eliminación</h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">¿Eliminar centro de costos?</p>
                    <p className="text-sm text-slate-600">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-900">{selectedCostCenter.nombre}</p>
                  <p className="text-sm text-slate-600">Código: {selectedCostCenter.codigo}</p>
                  <p className="text-sm text-slate-600">Tipo: {selectedCostCenter.tipo}</p>
                  {selectedCostCenter.gastado > 0 && (
                    <p className="text-sm text-red-600 font-medium mt-1">
                      ⚠️ Tiene gastos asociados: {formatearMoneda(selectedCostCenter.gastado)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Para confirmar, escriba <span className="font-bold text-red-600">"Eliminar"</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Escriba aquí..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteConfirmation !== 'Eliminar'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Eliminar Centro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaCentrosCostos;
