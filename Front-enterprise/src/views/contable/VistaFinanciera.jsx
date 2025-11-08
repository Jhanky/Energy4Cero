import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, AlertTriangle, Target, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { calcularDiasTotales, calcularDiasRetraso } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';

const VistaFinanciera = ({ estados }) => {
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
            ingresosProyectados: proyecto.projected_revenue || 0, // Usar el valor del backend o 0 si no existe
            margenEstimado: proyecto.estimated_margin || 0, // Usar el margen del backend o 0 si no existe
            valorContrato: proyecto.contract_value || 0 // Usar el valor del contrato del backend o 0 si no existe
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

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Calcular indicadores financieros
  const ingresosRealizados = proyectos
    .filter(p => p.estadoActual === 11)
    .reduce((sum, p) => sum + (p.ingresosProyectados || 0), 0);

  const ingresosEnProceso = proyectos
    .filter(p => p.estadoActual >= 1 && p.estadoActual <= 10)
    .reduce((sum, p) => sum + p.ingresosProyectados, 0);

  const ingresosProyectados = proyectos
    .reduce((sum, p) => sum + p.ingresosProyectados, 0);

  const ingresosEnRiesgo = proyectos
    .filter(p => calcularDiasRetraso(p) > 0 || p.estadoActual === 12)
    .reduce((sum, p) => sum + p.ingresosProyectados, 0);

  // Velocidad de generación de ingresos (ingresos por día)
  const diasTranscurridos = Math.max(...proyectos.map(p => calcularDiasTotales(p)));
  const velocidadIngresos = diasTranscurridos > 0 ? ingresosRealizados / diasTranscurridos : 0;

  // Proyección de ingresos (simulado)
  const proyeccionIngresos = [
    { mes: 'Ene 2025', realizados: 0, proyectados: 0 },
    { mes: 'Feb 2025', realizados: 0, proyectados: ingresosProyectados * 0.1 / 1000000 },
    { mes: 'Mar 2025', realizados: ingresosRealizados / 1000000, proyectados: ingresosProyectados * 0.3 / 1000000 },
    { mes: 'Abr 2025', realizados: ingresosRealizados / 1000000, proyectados: ingresosProyectados * 0.5 / 1000000 },
    { mes: 'May 2025', realizados: ingresosRealizados / 1000000, proyectados: ingresosProyectados * 0.7 / 1000000 },
    { mes: 'Jun 2025', realizados: ingresosRealizados / 1000000, proyectados: ingresosProyectados * 0.85 / 1000000 },
    { mes: 'Jul 2025', realizados: ingresosRealizados / 1000000, proyectados: ingresosProyectados / 1000000 }
  ];

  // Análisis de margen por proyecto
  const analisisMargen = proyectos.map(p => ({
    nombre: p.id,
    margen: p.margenEstimado,
    ingresos: p.ingresosProyectados / 1000000
  })).sort((a, b) => b.ingresos - a.ingresos).slice(0, 8);

  // Ingresos por estado
  const ingresosPorEstado = estados.map(estado => {
    const proyectosEnEstado = proyectos.filter(p => p.estadoActual === estado.id);
    const ingresos = proyectosEnEstado.reduce((sum, p) => sum + p.ingresosProyectados, 0);
    return {
      estado: estado.nombre,
      ingresos: ingresos / 1000000,
      proyectos: proyectosEnEstado.length
    };
  }).filter(d => d.ingresos > 0);

  return (
    <div className="space-y-6">
      {/* KPIs Financieros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-800">Ingresos Realizados</p>
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-900">{formatearMoneda(ingresosRealizados)}</p>
          <p className="text-sm text-green-700 mt-1">Proyectos conectados</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-800">Ingresos en Proceso</p>
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-900">{formatearMoneda(ingresosEnProceso)}</p>
          <p className="text-sm text-blue-700 mt-1">Pipeline activo</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-800">Ingresos Proyectados</p>
            <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-900">{formatearMoneda(ingresosProyectados)}</p>
          <p className="text-sm text-purple-700 mt-1">Total pipeline</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-red-800">Ingresos en Riesgo</p>
            <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-700" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-900">{formatearMoneda(ingresosEnRiesgo)}</p>
          <p className="text-sm text-red-700 mt-1">Proyectos retrasados</p>
        </div>
      </div>

      {/* Velocidad de Generación de Ingresos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Velocidad de Generación de Ingresos</h3>
            <p className="text-sm text-slate-600">Ingresos generados por día de operación</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
            <p className="text-sm text-blue-700 mb-2">Velocidad Actual</p>
            <p className="text-3xl font-bold text-blue-900">{formatearMoneda(velocidadIngresos)}</p>
            <p className="text-sm text-blue-600 mt-1">por día</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
            <p className="text-sm text-green-700 mb-2">Proyección Mensual</p>
            <p className="text-3xl font-bold text-green-900">{formatearMoneda(velocidadIngresos * 30)}</p>
            <p className="text-sm text-green-600 mt-1">estimado</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6">
            <p className="text-sm text-purple-700 mb-2">Proyección Anual</p>
            <p className="text-3xl font-bold text-purple-900">{formatearMoneda(velocidadIngresos * 365)}</p>
            <p className="text-sm text-purple-600 mt-1">estimado</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Proyección de Ingresos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Proyección de Ingresos Acumulados (Millones COP)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={proyeccionIngresos}>
            <defs>
              <linearGradient id="colorRealizados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorProyectados" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toFixed(0)}M`} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="realizados" 
              stroke="#22c55e" 
              fillOpacity={1} 
              fill="url(#colorRealizados)" 
              name="Ingresos Realizados"
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="proyectados" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorProyectados)" 
              name="Ingresos Proyectados"
              strokeWidth={3}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Análisis de Margen e Ingresos por Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análisis de Margen */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Proyectos por Ingresos y Margen</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={analisisMargen}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="ingresos" fill="#3b82f6" name="Ingresos (M COP)" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="margen" fill="#22c55e" name="Margen (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ingresos por Estado */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingresos por Estado (Millones COP)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={ingresosPorEstado} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" />
              <YAxis dataKey="estado" type="category" width={150} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => `$${value.toFixed(0)}M`} />
              <Bar dataKey="ingresos" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resumen Consolidado */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl shadow-lg p-8 text-white">
        <h3 className="text-2xl font-bold mb-6">Resumen Financiero Consolidado</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-200 text-sm mb-1">Tasa de Conversión</p>
            <p className="text-3xl font-bold">
              {((ingresosRealizados / ingresosProyectados) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Margen Promedio</p>
            <p className="text-3xl font-bold">
              {(proyectos.reduce((sum, p) => sum + p.margenEstimado, 0) / proyectos.length).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Valor Promedio Proyecto</p>
            <p className="text-2xl font-bold">
              {formatearMoneda(proyectos.reduce((sum, p) => sum + p.valorContrato, 0) / proyectos.length)}
            </p>
          </div>
          <div>
            <p className="text-blue-200 text-sm mb-1">Pipeline Activo</p>
            <p className="text-3xl font-bold">
              {proyectos.filter(p => p.estadoActual >= 1 && p.estadoActual <= 10).length}
            </p>
            <p className="text-sm text-blue-200">proyectos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VistaFinanciera;
