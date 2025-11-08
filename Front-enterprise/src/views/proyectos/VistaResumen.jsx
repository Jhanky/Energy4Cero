import { useState, useEffect } from 'react';
import { TrendingUp, Zap, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { calcularDiasRetraso, obtenerColorSemaforo } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';

const VistaResumen = ({ estados }) => {
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const response = await proyectosService.getProjects();
        if (response.success) {
          // Mapear los datos del backend al formato esperado por el frontend
          const proyectosMapeados = response.data.data.map(proyecto => ({
            id: proyecto.code, // Usar el código del proyecto como ID
            nombre: proyecto.name,
            cliente: proyecto.client?.name || 'Cliente no especificado',
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
            fechaProximaAccion: proyecto.next_action_date,
            ingresosProyectados: proyecto.projected_revenue || 0 // Usar el valor del backend o 0 si no existe
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

  // Calcular KPIs
  const totalProyectos = proyectos.length;
  const proyectosConectados = proyectos.filter(p => p.estadoActual === 11).length;
  const capacidadTotal = proyectos.reduce((sum, p) => sum + p.capacidadAC, 0);
  const ingresosProyectados = proyectos.reduce((sum, p) => sum + (p.ingresosProyectados || 0), 0);
  
  const proyectosEnTiempo = proyectos.filter(p => obtenerColorSemaforo(p) === 'verde').length;
  const proyectosConAtencion = proyectos.filter(p => obtenerColorSemaforo(p) === 'amarillo').length;
  const proyectosRetrasados = proyectos.filter(p => obtenerColorSemaforo(p) === 'rojo').length;

  // Datos para gráfico de distribución por estado
  const distribucionEstados = estados.map(estado => ({
    nombre: estado.nombre,
    cantidad: proyectos.filter(p => p.estadoActual === estado.id).length,
    color: estado.color
  })).filter(d => d.cantidad > 0);

  // Datos para gráfico de semáforo
  const datosSemaforo = [
    { nombre: 'En Tiempo', valor: proyectosEnTiempo, color: '#22c55e' },
    { nombre: 'Atención', valor: proyectosConAtencion, color: '#fbbf24' },
    { nombre: 'Retrasados', valor: proyectosRetrasados, color: '#ef4444' }
  ];

  // Datos para línea de tiempo de ingresos (simulado)
  const ingresosRealizados = proyectos.filter(p => p.estadoActual === 11).reduce((sum, p) => sum + p.ingresosProyectados, 0);
  const ingresosEnProceso = proyectos.filter(p => p.estadoActual >= 1 && p.estadoActual <= 10).reduce((sum, p) => sum + p.ingresosProyectados, 0);

  const datosIngresos = [
    { mes: 'Ene', realizados: 0, proyectados: 0 },
    { mes: 'Feb', realizados: 0, proyectados: 0 },
    { mes: 'Mar', realizados: ingresosRealizados / 1000000, proyectados: (ingresosRealizados + ingresosEnProceso * 0.3) / 1000000 },
    { mes: 'Abr', realizados: ingresosRealizados / 1000000, proyectados: (ingresosRealizados + ingresosEnProceso * 0.6) / 1000000 },
    { mes: 'May', realizados: ingresosRealizados / 1000000, proyectados: (ingresosRealizados + ingresosEnProceso * 0.9) / 1000000 },
    { mes: 'Jun', realizados: ingresosRealizados / 1000000, proyectados: (ingresosRealizados + ingresosEnProceso) / 1000000 }
  ];

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Proyectos Activos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{totalProyectos}</p>
              <p className="text-sm text-slate-500 mt-1">{proyectosConectados} conectados</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Capacidad Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{(capacidadTotal / 1000).toFixed(2)}</p>
              <p className="text-sm text-slate-500 mt-1">MW en proceso</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ingresos Proyectados</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{formatearMoneda(ingresosProyectados)}</p>
              <p className="text-sm text-slate-500 mt-1">Total pipeline</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Conectados este Mes</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{proyectosConectados}</p>
              <p className="text-sm text-green-600 mt-1">+{proyectosConectados} vs mes anterior</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Semáforo de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-semibold text-green-900">En Tiempo</p>
          </div>
          <p className="text-4xl font-bold text-green-700">{proyectosEnTiempo}</p>
          <p className="text-sm text-green-600 mt-1">Proyectos sin retrasos</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm border border-yellow-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-900">Atención Requerida</p>
          </div>
          <p className="text-4xl font-bold text-yellow-700">{proyectosConAtencion}</p>
          <p className="text-sm text-yellow-600 mt-1">Requieren seguimiento</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm font-semibold text-red-900">Retrasados</p>
          </div>
          <p className="text-4xl font-bold text-red-700">{proyectosRetrasados}</p>
          <p className="text-sm text-red-600 mt-1">Acción inmediata</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por Estado */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribucionEstados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {distribucionEstados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Semáforo Visual */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado General de Proyectos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={datosSemaforo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, valor, percent }) => `${nombre}: ${valor} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="valor"
              >
                {datosSemaforo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Línea de Tiempo de Ingresos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Proyección de Ingresos (Millones COP)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={datosIngresos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(0)}M`} />
            <Legend />
            <Line type="monotone" dataKey="realizados" stroke="#22c55e" strokeWidth={3} name="Ingresos Realizados" />
            <Line type="monotone" dataKey="proyectados" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" name="Ingresos Proyectados" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VistaResumen;
