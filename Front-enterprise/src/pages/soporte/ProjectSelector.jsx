import { useState, useEffect, useCallback } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import {
  Notification,
  AdvancedSearchBar,
  AdvancedFilters,
  AdvancedPagination,
  SkeletonTable
} from '../../shared/ui';
import { Check, X, Search } from 'lucide-react';
import dataService from '../../services/dataService';

const ProjectSelector = ({ show, onSelect, onClose, selectedProjectId = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    department: ''
  });

  // Estados de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Estados de proyectos (mock por ahora)
  const [estados] = useState([
    { id: 1, nombre: 'Solicitud Presentada', color: '#3b82f6' },
    { id: 2, nombre: 'Revisión de Completitud', color: '#f59e0b' },
    { id: 3, nombre: 'Revisión Técnica', color: '#10b981' },
    { id: 4, nombre: 'Concepto de Viabilidad', color: '#8b5cf6' },
    { id: 5, nombre: 'Instalación', color: '#ef4444' },
    { id: 6, nombre: 'Inspección', color: '#06b6d4' },
    { id: 7, nombre: 'Aprobación Final', color: '#84cc16' },
    { id: 8, nombre: 'Conexión', color: '#f97316' }
  ]);

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
      const response = await dataService.getProjects(params);

      if (response.success) {
        // Mapear los datos del backend al formato esperado
        const proyectosMapeados = response.data.data.map(proyecto => ({
          id: proyecto.code,
          backendId: proyecto.id,
          nombre: proyecto.name,
          cliente: proyecto.client ? {
            id: proyecto.client.id,
            name: proyecto.client.name,
            email: proyecto.client.email,
            phone: proyecto.client.phone
          } : 'Cliente no especificado',
          capacidadAC: proyecto.capacity_ac,
          estadoActual: proyecto.current_state_id,
          porcentajeAvance: proyecto.progress_percentage || 0,
          departamento: proyecto.department,
          municipio: proyecto.municipality,
          responsableActual: proyecto.current_responsible || 'No asignado'
        }));
        setProyectos(proyectosMapeados);
        setPagination(response.data.pagination || {
          current_page: 1,
          per_page: 10,
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

      // Mostrar mensaje de error claro
      const errorMessage = error.message || 'Error al cargar los proyectos. Verifique su conexión y que el backend esté funcionando.';
      showNotification('error', errorMessage);
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

  const handleSelectProject = (proyecto) => {
    onSelect({
      id: proyecto.backendId,
      name: proyecto.nombre,
      code: proyecto.id
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Seleccionar Proyecto</h2>
                <p className="text-slate-600">Elige el proyecto para el mantenimiento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Filtros y búsqueda */}
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
                }
              ]}
            />
          </div>

          {/* Tabla */}
          <div className="rounded-md border max-h-96 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>ID Proyecto</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Capacidad (kW)</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right w-24">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  <SkeletonTable columns={8} rows={pagination.per_page || 10} asRows={true} />
                ) : proyectos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron proyectos
                    </TableCell>
                  </TableRow>
                ) : (
                  proyectos.map((proyecto) => (
                    <TableRow
                      key={proyecto.id}
                      className={`transition-all duration-200 hover:bg-gray-50 ${
                        selectedProjectId === proyecto.backendId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
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
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: obtenerColorEstado(proyecto.estadoActual),
                            color: 'white'
                          }}
                        >
                          {obtenerNombreEstado(proyecto.estadoActual)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 w-16">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${proyecto.porcentajeAvance}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-slate-900">{proyecto.porcentajeAvance}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-600">{proyecto.responsableActual}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSelectProject(proyecto)}
                          className="h-8 px-3"
                          variant={selectedProjectId === proyecto.backendId ? "default" : "outline"}
                        >
                          {selectedProjectId === proyecto.backendId ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Seleccionado
                            </>
                          ) : (
                            'Seleccionar'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="mt-4">
            <AdvancedPagination
              pagination={pagination}
              onPageChange={(page) => fetchProyectos(page)}
              onPerPageChange={(perPage) => fetchProyectos(1, perPage)}
              loading={loading}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </div>

        {/* Modal de Notificación */}
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      </div>
    </div>
  );
};

export default ProjectSelector;
