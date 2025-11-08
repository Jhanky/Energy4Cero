import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Circle } from 'lucide-react';
import { calcularDiasEnEstado, calcularDiasTotales, calcularDiasRetraso, obtenerColorSemaforo, calcularPorcentajePorEstado } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';
import projectService from '../../services/projectService';
import DetalleProyecto from './DetalleProyecto';

const VistaProyectos = ({ estados }) => {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [filtroSemaforo, setFiltroSemaforo] = useState('todos');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEstado, setEditingEstado] = useState(null);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await proyectosService.getProjects();
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
        } else {
          console.error('Error al cargar los proyectos:', response.message);
        }
      } catch (error) {
        console.error('Error al cargar los proyectos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarProyectos();
  }, []);

  // Filtrar proyectos
  const proyectosFiltrados = proyectos.filter(proyecto => {
    const nombreCliente = typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.name : proyecto.cliente;
    const emailCliente = typeof proyecto.cliente === 'object' && proyecto.cliente.email ? proyecto.cliente.email : '';
    const documentoCliente = typeof proyecto.cliente === 'object' && proyecto.cliente.nic ? proyecto.cliente.nic : '';
    
    const cumpleBusqueda = 
      proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (nombreCliente && nombreCliente.toLowerCase().includes(busqueda.toLowerCase())) ||
      (emailCliente && emailCliente.toLowerCase().includes(busqueda.toLowerCase())) ||
      (documentoCliente && documentoCliente.toLowerCase().includes(busqueda.toLowerCase())) ||
      proyecto.id.toLowerCase().includes(busqueda.toLowerCase());
    
    const cumpleEstado = filtroEstado === 'todos' || proyecto.estadoActual === parseInt(filtroEstado);
    const cumpleDepartamento = filtroDepartamento === 'todos' || proyecto.departamento === filtroDepartamento;
    const cumpleSemaforo = filtroSemaforo === 'todos' || obtenerColorSemaforo(proyecto) === filtroSemaforo;

    return cumpleBusqueda && cumpleEstado && cumpleDepartamento && cumpleSemaforo;
  });

  const departamentos = [...new Set(proyectos.map(p => p.departamento))];

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
        // Actualizar el estado en los datos locales
        const proyectosActualizados = proyectos.map(proyecto => 
          proyecto.id === proyectoId 
            ? { 
                ...proyecto, 
                estadoActual: parseInt(nuevoEstado),
                porcentajeAvance: calcularPorcentajePorEstado(parseInt(nuevoEstado))
              } 
            : proyecto
        );
        
        // Actualizar el estado visualmente
        setProyectos(proyectosActualizados);
        setEditingEstado(null);
      } else {
        console.error('Error al actualizar el estado del proyecto:', response.message);
      }
      
    } catch (error) {
      console.error('Error al actualizar el estado del proyecto:', error);
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
      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, cliente o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>
          </div>

          {/* Filtro Departamento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Departamento</label>
            <select
              value={filtroDepartamento}
              onChange={(e) => setFiltroDepartamento(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              {departamentos.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          {/* Filtro Semáforo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Semáforo</label>
            <select
              value={filtroSemaforo}
              onChange={(e) => setFiltroSemaforo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="verde">🟢 En tiempo</option>
              <option value="amarillo">🟡 Atención</option>
              <option value="rojo">🔴 Retrasado</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{proyectosFiltrados.length}</span> de <span className="font-semibold">{proyectos.length}</span> proyectos
          </p>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabla de Proyectos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  ID Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Capacidad (kW)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Estado Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Días en Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Avance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {proyectosFiltrados.map((proyecto) => (
                <tr key={proyecto.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{proyecto.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{proyecto.nombre}</div>
                    <div className="text-sm text-slate-500">{proyecto.departamento} - {proyecto.municipio}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      {typeof proyecto.cliente === 'object' && proyecto.cliente ? proyecto.cliente.name : proyecto.cliente}
                    </div>
                    {typeof proyecto.cliente === 'object' && proyecto.cliente && proyecto.cliente.email && (
                      <div className="text-sm text-slate-500">{proyecto.cliente.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">{proyecto.capacidadAC}</span>
                  </td>
                  <td className="px-6 py-4">
                    {editingEstado === proyecto.id ? (
                      <div className="relative">
                        <select
                          value={proyecto.estadoActual}
                          onChange={(e) => handleEstadoChange(proyecto.id, e.target.value)}
                          onBlur={handleEstadoBlur}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        >
                          {estados.map(estado => (
                            <option key={estado.id} value={estado.id}>
                              {estado.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: obtenerColorEstado(proyecto.estadoActual) }}
                        onClick={() => handleEstadoClick(proyecto)}
                        title="Clic para cambiar estado"
                      >
                        {obtenerNombreEstado(proyecto.estadoActual)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">{calcularDiasEnEstado(proyecto)} días</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${calcularPorcentajePorEstado(proyecto.estadoActual || 0)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-900">{calcularPorcentajePorEstado(proyecto.estadoActual || 0)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-900">{proyecto.responsableActual}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        // Pasar el ID del proyecto para que el DetalleProyecto pueda cargar los datos completos
                        setProyectoSeleccionado({
                          ...proyecto,
                          id: proyecto.backendId // Usar el ID real del backend para la API
                        });
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VistaProyectos;
