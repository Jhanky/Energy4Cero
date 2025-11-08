import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { calcularDiasEnEstado } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';

const VistaAnalisis = ({ estados }) => {
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
            ticketPromedio: proyecto.average_ticket || 0, // Usar el valor del backend o 0 si no existe
            canalVenta: proyecto.sales_channel || 'No especificado' // Usar el canal de ventas del backend
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

  // Tiempo promedio por estado
  const tiempoPromedioEstados = estados.map(estado => {
    const proyectosEnEstado = proyectos.filter(p => p.estadoActual === estado.id);
    const tiempoTotal = proyectosEnEstado.reduce((sum, p) => sum + calcularDiasEnEstado(p), 0);
    const promedio = proyectosEnEstado.length > 0 ? tiempoTotal / proyectosEnEstado.length : 0;
    
    return {
      nombre: estado.nombre,
      promedio: Math.round(promedio),
      estimado: estado.duracionEstimada || 0,
      color: estado.color
    };
  }).filter(d => d.promedio > 0);

  // Evolución mensual (simulado)
  const evolucionMensual = [
    { mes: 'Ene', iniciados: 2, conectados: 0 },
    { mes: 'Feb', iniciados: 3, conectados: 1 },
    { mes: 'Mar', iniciados: 3, conectados: 2 },
    { mes: 'Abr', iniciados: 0, conectados: 0 },
    { mes: 'May', iniciados: 0, conectados: 0 },
    { mes: 'Jun', iniciados: 0, conectados: 0 }
  ];

  // Distribución geográfica
  const distribucionGeografica = [
    { departamento: 'Atlántico', proyectos: proyectos.filter(p => p.departamento === 'Atlántico').length, capacidad: proyectos.filter(p => p.departamento === 'Atlántico').reduce((sum, p) => sum + p.capacidadAC, 0) },
    { departamento: 'Magdalena', proyectos: proyectos.filter(p => p.departamento === 'Magdalena').length, capacidad: proyectos.filter(p => p.departamento === 'Magdalena').reduce((sum, p) => sum + p.capacidadAC, 0) },
    { departamento: 'La Guajira', proyectos: proyectos.filter(p => p.departamento === 'La Guajira').length, capacidad: proyectos.filter(p => p.departamento === 'La Guajira').reduce((sum, p) => sum + p.capacidadAC, 0) }
  ];

  // Análisis de canal de ventas
  const analisisCanal = [
    { 
      canal: 'Contacto Directo', 
      proyectos: proyectos.filter(p => p.canalVenta === 'Contacto Directo').length,
      ingresos: proyectos.filter(p => p.canalVenta === 'Contacto Directo').reduce((sum, p) => sum + p.ingresosProyectados, 0) / 1000000,
      ticketPromedio: proyectos.filter(p => p.canalVenta === 'Contacto Directo').reduce((sum, p) => sum + p.ticketPromedio, 0) / proyectos.filter(p => p.canalVenta === 'Contacto Directo').length / 1000000
    },
    { 
      canal: 'Digital', 
      proyectos: proyectos.filter(p => p.canalVenta === 'Digital').length,
      ingresos: proyectos.filter(p => p.canalVenta === 'Digital').reduce((sum, p) => sum + p.ingresosProyectados, 0) / 1000000,
      ticketPromedio: proyectos.filter(p => p.canalVenta === 'Digital').reduce((sum, p) => sum + p.ticketPromedio, 0) / proyectos.filter(p => p.canalVenta === 'Digital').length / 1000000
    }
  ];

  // Cuellos de botella
  const cuellosBottella = tiempoPromedioEstados
    .filter(e => e.estimado > 0 && e.promedio > e.estimado * 1.2)
    .sort((a, b) => (b.promedio - b.estimado) - (a.promedio - a.estimado))
    .slice(0, 5);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Tiempo Promedio por Estado */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tiempo Promedio por Estado (días)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={tiempoPromedioEstados} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" />
            <YAxis dataKey="nombre" type="category" width={200} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="promedio" fill="#3b82f6" name="Tiempo Real" radius={[0, 8, 8, 0]} />
            <Bar dataKey="estimado" fill="#94a3b8" name="Tiempo Estimado" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Evolución Mensual */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolución Mensual de Proyectos</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolucionMensual}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="iniciados" stroke="#3b82f6" strokeWidth={3} name="Proyectos Iniciados" />
            <Line type="monotone" dataKey="conectados" stroke="#22c55e" strokeWidth={3} name="Proyectos Conectados" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribución Geográfica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución por Departamento</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distribucionGeografica}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="departamento" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="proyectos" fill="#3b82f6" name="Número de Proyectos" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Capacidad por Departamento (kW)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribucionGeografica}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ departamento, capacidad }) => `${departamento}: ${capacidad} kW`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="capacidad"
              >
                {distribucionGeografica.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análisis de Canal de Ventas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Análisis por Canal de Ventas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {analisisCanal.map((canal, index) => (
            <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h4 className="text-lg font-semibold text-blue-900 mb-4">{canal.canal}</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700">Proyectos</p>
                  <p className="text-2xl font-bold text-blue-900">{canal.proyectos}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Ingresos Proyectados</p>
                  <p className="text-xl font-bold text-blue-900">${canal.ingresos.toFixed(0)}M</p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Ticket Promedio</p>
                  <p className="text-xl font-bold text-blue-900">${canal.ticketPromedio.toFixed(0)}M</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-green-900 mb-4">Total Consolidado</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-green-700">Proyectos</p>
                <p className="text-2xl font-bold text-green-900">{proyectos.length}</p>
              </div>
              <div>
                <p className="text-sm text-green-700">Ingresos Proyectados</p>
                <p className="text-xl font-bold text-green-900">
                  ${(proyectos.reduce((sum, p) => sum + p.ingresosProyectados, 0) / 1000000).toFixed(0)}M
                </p>
              </div>
              <div>
                <p className="text-sm text-green-700">Ticket Promedio</p>
                <p className="text-xl font-bold text-green-900">
                  ${(proyectos.reduce((sum, p) => sum + p.ticketPromedio, 0) / proyectos.length / 1000000).toFixed(0)}M
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuellos de Botella */}
      {cuellosBottella.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">⚠️ Cuellos de Botella Identificados</h3>
          <div className="space-y-3">
            {cuellosBottella.map((cuello, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{cuello.nombre}</p>
                    <p className="text-sm text-slate-600">
                      Tiempo real: <span className="font-medium text-red-600">{cuello.promedio} días</span> vs 
                      Estimado: <span className="font-medium">{cuello.estimado} días</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">+{cuello.promedio - cuello.estimado}</p>
                    <p className="text-sm text-red-600">días de retraso</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaAnalisis;
