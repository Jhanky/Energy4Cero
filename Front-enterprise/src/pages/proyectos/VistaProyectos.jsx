import { useState, useEffect, useCallback } from 'react';
import { Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import { calcularDiasEnEstado, calcularDiasTotales, calcularDiasRetraso, obtenerColorSemaforo, calcularPorcentajePorEstado } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';
import projectService from '../../services/projectService';
import DetalleProyecto from './DetalleProyecto';

const VistaProyectos = ({ estados }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    semaphore: ''
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

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEstado, setEditingEstado] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fetch proyectos with pagination
  const fetchProyectos = useCallback(async (page = 1, perPage = pagination.per_page) => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearchTerm,
        page,
        per_page: perPage,
        ...filters
      };
      const response = await proyectosService.getProjects(params);

      if (response.success) {
        // Mapear los datos del backend al formato esperado por el frontend
        const proyectosMapeados = response.data.data.map(proyecto => ({
          id: proyecto.code, // Usar el código del proyecto como ID para mostrar
          backendId: proyecto.id, // Guardar el ID real del backend
          nombre: proyecto.name,
          cliente: proyecto.client ? {
            id: proyecto.client.id,
            name: proyecto.client.name,
            client_type: proyecto.client.client_type,
            email: proyecto.client.email,
            phone: proyecto.client.phone,
            nic: proyecto.client.nic,
            address: proyecto.client.address,
            monthly_consumption: proyecto.client.monthly_consumption,
            notes: proyecto.client.notes,
            is_active: proyecto.client.is_active,
            department: proyecto.client.department,
            city: proyecto.client.city,
            responsibleUser: proyecto.client.responsibleUser,
            responsible_user_id: proyecto.client.responsible_user_id,
            department_id: proyecto.client.department_id,
            city_id: proyecto.client.city_id
          } : 'Cliente no especificado',
          capacidadAC: proyecto.capacity_ac,
          estadoActual: proyecto.current_state_id,
          porcentajeAvance: proyecto.progress_percentage || 0, // Usar el porcentaje de avance del backend
          departamento: proyecto.department,
          municipio: proyecto.municipality,
          direccion: proyecto.address,
          responsableActual: proyecto.current_responsible || 'No asignado',
          fechaInicio: proyecto.start_date,
          fechaEstimadaFinalizacion: proyecto.estimated_completion_date,
          fechaSolicitudPresentada: proyecto.application_date,
          fechaRevisionCompletiudIniciada: proyecto.completeness_start_date,
          fechaRevisionCompletiudFinalizada: proyecto.completeness_end_date,
          fechaRevisionTecnicaIniciada: proyecto.technical_review_start_date,
          fechaRevisionTecnicaFinalizada: proyecto.technical_review_end_date,
          fechaConceptoViabilidad: proyecto.feasibility_concept_date,
          fechaInstalacionIniciada: proyecto.installation_start_date,
          fechaInstalacionFinalizada: proyecto.installation_end_date,
          fechaInspeccionSolicitada: proyecto.inspection_requested_date,
          fechaInspeccionRealizada: proyecto.inspection_performed_date,
          fechaAprobacionFinal: proyecto.final_approval_date,
          fechaConexion: proyecto.connection_date,
          observacionesAire: proyecto.aire_observations || '',
          accionesCorrectivas: proyecto.corrective_actions || '',
          comentariosInternos: proyecto.internal_comments || '',
          proximaAccion: proyecto.next_action || '',
          fechaProximaAccion: proyecto.next_action_date
        }));
        setProyectos(proyectosMapeados);
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 15,
          total: 0,
          last_page: 1,
          from: 0,
          to: 0
        });
      } else {
        console.error('Error al cargar los proyectos:', response.message);
        setProyectos([]);
        setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
      }
    } catch (error) {
      console.error('Error al cargar los proyectos:', error);
      setProyectos([]);
      setPagination(prev => ({ ...prev, total: 0, last_page: 1, from: 0, to: 0 }));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filters, pagination.per_page]);

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchProyectos();
  }, []);

  // Cargar datos cuando cambien los filtros o búsqueda
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      fetchProyectos();
    }
  }, [debouncedSearchTerm, filters]);

  const departamentos = [...new Set(proyectos.map(p => p.departamento))];

  // Función para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const obtenerNombreEstado = (idEstado) => {
    const estado = estados.find(e => e.id === idEstado);
    return estado ? estado.nombre : 'Desconocido';
  };

  const obtenerColorEstado = (idEstado) => {
    const estado = estados.find(e => e.id === idEstado);
    return estado ? estado.color : '#94a3b8';
  };

  const renderSemaforo = (proyecto) => {
    const color = obtenerColorSemaforo(proyecto);
    const colorMap = {
      'verde': 'bg-green-500',
      'amarillo': 'bg-yellow-500',
      'rojo': 'bg-red-500'
    };
    return <div className={`w-3 h-3 rounded-full ${colorMap[color]}`}></div>;
  };

  const handleEstadoClick = (proyecto) => {
    setEditingEstado(proyecto.id);
  };

  const handleEstadoChange = async (proyectoId, nuevoEstado) => {
    try {
      // Obtener el ID real del proyecto para la API
      const proyectoOriginal = proyectos.find(p => p.id === proyectoId);
      if (!proyectoOriginal) return;

      // Llamar a la API para actualizar el estado del proyecto
      const response = await projectService.updateProjectState(proyectoOriginal.backendId, {
        current_state_id: parseInt(nuevoEstado)
      });

      if (response.success) {
        showNotification('success', `Estado actualizado a: ${obtenerNombreEstado(parseInt(nuevoEstado))}`);
        fetchProyectos(pagination.current_page); // Refresh the list maintaining current page
      } else {
        console.error('Error al actualizar el estado del proyecto:', response.message);
        showNotification('error', response.message || 'Error al actualizar el estado del proyecto');
      }

    } catch (error) {
      console.error('Error al actualizar el estado del proyecto:', error);
      showNotification('error', error.message || 'Error al actualizar el estado del proyecto');
    } finally {
      setEditingEstado(null);
    }
  };

  const handleEstadoBlur = () => {
    setEditingEstado(null);
  };

  if (proyectoSeleccionado) {
    return (
      <DetalleProyecto 
        proyecto={proyectoSeleccionado} 
        estados={estados}
        onVolver={() => setProyectoSeleccionado(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
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
                  options: estados.map(estado => ({
                    value: estado.id.toString(),
                    label: estado.nombre
                  }))
                },
                {
                  key: 'department',
                  label: 'Departamento',
                  options: departamentos.map(dep => ({
                    value: dep,
                    label: dep
                  }))
                },
                {
                  key: 'semaphore',
                  label: 'Semáforo',
                  options: [
                    { value: 'verde', label: '🟢 En tiempo' },
                    { value: 'amarillo', label: '🟡 Atención' },
                    { value: 'rojo', label: '🔴 Retrasado' }
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
                  <TableHead>ID Proyecto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Capacidad (kW)</TableHead>
                  <TableHead>Estado Actual</TableHead>
                  <TableHead>Días en Estado</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={9} rows={pagination.per_page || 15} asRows={true} />
                ) : proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
                        <span className="text-sm font-medium text-slate-900">{proyecto.id}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-slate-900">{proyecto.nombre}</div>
                        <div className="text-sm text-slate-500">{proyecto.departamento} - {proyecto.municipio}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-900">
                          {typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.name : proyecto.cliente}
                        </div>
                        {typeof proyecto.cliente === 'object' && proyecto.cliente && proyecto.cliente.email && (
                          <div className="text-sm text-slate-500">{proyecto.cliente.email}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-900">{proyecto.capacidadAC}</span>
                      </TableCell>
                      <TableCell>
                        {editingEstado === proyecto.id ? (
                          <div className="relative">
                            <select
                              value={proyecto.estadoActual}
                              onChange={(e) => handleEstadoChange(proyecto.id, e.target.value)}
                              onBlur={handleEstadoBlur}
                              className="w-full px-3 py-1.5 text-sm border border-green-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                              autoFocus
                            >
                              {estados.map(estado => (
                                <option key={estado.id} value={estado.id}>
                                  {estado.nombre}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:shadow-sm transition-all border ${obtenerColorEstado(proyecto.estadoActual) === '#94a3b8' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}`}
                            style={{
                              backgroundColor: obtenerColorEstado(proyecto.estadoActual) !== '#94a3b8' ? obtenerColorEstado(proyecto.estadoActual) : undefined,
                              color: obtenerColorEstado(proyecto.estadoActual) !== '#94a3b8' ? 'white' : undefined
                            }}
                            onClick={() => handleEstadoClick(proyecto)}
                            title="Clic para cambiar estado"
                          >
                            <div className={`w-2 h-2 rounded-full ${obtenerColorEstado(proyecto.estadoActual) !== '#94a3b8' ? 'bg-current' : 'bg-gray-400'}`}></div>
                            {obtenerNombreEstado(proyecto.estadoActual)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-900">{calcularDiasEnEstado(proyecto)} días</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${calcularPorcentajePorEstado(proyecto.estadoActual || 0)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-900">{calcularPorcentajePorEstado(proyecto.estadoActual || 0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{proyecto.responsableActual}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setProyectoSeleccionado({
                                ...proyecto,
                                id: proyecto.backendId
                              });
                            }}
                            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Exportar"
                          >
                            <Download className="w-4 h-4" />
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
            onPageChange={(page) => fetchProyectos(page)}
            onPerPageChange={(perPage) => fetchProyectos(1, perPage)}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Modal de Notificación */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaProyectos;
