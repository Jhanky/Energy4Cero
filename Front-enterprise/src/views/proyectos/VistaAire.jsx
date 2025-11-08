import { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { calcularDiasEnEstado } from '../../data/proyectos';
import proyectosService from '../../services/proyectosService';

const VistaAire = ({ estados }) => {
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

  // Proyectos en espera de Air-e (estados 3, 4, 7, 8)
  const proyectosEsperandoAire = proyectos.filter(p => 
    [3, 4, 7, 8].includes(p.estadoActual)
  );

  // Calcular tiempos promedio de respuesta de Air-e
  const tiempoRevisionCompletitud = proyectos
    .filter(p => p.fechaRevisionCompletiudIniciada && p.fechaRevisionCompletiudFinalizada)
    .map(p => {
      const inicio = new Date(p.fechaRevisionCompletiudIniciada);
      const fin = new Date(p.fechaRevisionCompletiudFinalizada);
      return Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
    });
  
  const promedioCompletitud = tiempoRevisionCompletitud.length > 0
    ? tiempoRevisionCompletitud.reduce((a, b) => a + b, 0) / tiempoRevisionCompletitud.length
    : 0;

  const tiempoRevisionTecnica = proyectos
    .filter(p => p.fechaRevisionTecnicaIniciada && p.fechaRevisionTecnicaFinalizada)
    .map(p => {
      const inicio = new Date(p.fechaRevisionTecnicaIniciada);
      const fin = new Date(p.fechaRevisionTecnicaFinalizada);
      return Math.floor((fin - inicio) / (1000 * 60 * 60 * 24));
    });
  
  const promedioTecnica = tiempoRevisionTecnica.length > 0
    ? tiempoRevisionTecnica.reduce((a, b) => a + b, 0) / tiempoRevisionTecnica.length
    : 0;

  const tiempoHastaInspeccion = proyectos
    .filter(p => p.fechaInspeccionSolicitada && p.fechaInspeccionRealizada)
    .map(p => {
      const solicitud = new Date(p.fechaInspeccionSolicitada);
      const inspeccion = new Date(p.fechaInspeccionRealizada);
      return Math.floor((inspeccion - solicitud) / (1000 * 60 * 60 * 24));
    });
  
  const promedioInspeccion = tiempoHastaInspeccion.length > 0
    ? tiempoHastaInspeccion.reduce((a, b) => a + b, 0) / tiempoHastaInspeccion.length
    : 0;

  // Tasa de observaciones en primera revisión
  const proyectosConObservaciones = proyectos.filter(p => 
    p.observacionesAire && p.observacionesAire.length > 0 && p.estadoActual >= 3
  ).length;
  const proyectosRevisados = proyectos.filter(p => p.estadoActual >= 3).length;
  const tasaObservaciones = proyectosRevisados > 0 
    ? (proyectosConObservaciones / proyectosRevisados) * 100 
    : 0;

  // Datos para gráfico de tiempos de respuesta
  const datosRespuesta = [
    { etapa: 'Revisión Completitud', promedio: Math.round(promedioCompletitud), estimado: 10 },
    { etapa: 'Revisión Técnica', promedio: Math.round(promedioTecnica), estimado: 15 },
    { etapa: 'Hasta Inspección', promedio: Math.round(promedioInspeccion), estimado: 7 }
  ];

  // Histórico de interacciones (simulado)
  const historicoInteracciones = [
    { mes: 'Ene', solicitudes: 2, aprobaciones: 0, observaciones: 1 },
    { mes: 'Feb', solicitudes: 3, aprobaciones: 1, observaciones: 2 },
    { mes: 'Mar', solicitudes: 3, aprobaciones: 2, observaciones: 1 },
    { mes: 'Abr', solicitudes: 0, aprobaciones: 0, observaciones: 0 },
    { mes: 'May', solicitudes: 0, aprobaciones: 0, observaciones: 0 },
    { mes: 'Jun', solicitudes: 0, aprobaciones: 0, observaciones: 0 }
  ];

  const obtenerNombreEstado = (idEstado) => {
    const estado = estados.find(e => e.id === idEstado);
    return estado ? estado.nombre : 'Desconocido';
  };

  return (
    <div className="space-y-6">
      {/* KPIs de Air-e */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tiempo Promedio Completitud</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(promedioCompletitud)}</p>
          <p className="text-sm text-slate-500 mt-1">días (estimado: 10 días)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tiempo Promedio Técnica</p>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(promedioTecnica)}</p>
          <p className="text-sm text-slate-500 mt-1">días (estimado: 15 días)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tiempo Hasta Inspección</p>
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(promedioInspeccion)}</p>
          <p className="text-sm text-slate-500 mt-1">días (estimado: 7 días)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tasa de Observaciones</p>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{tasaObservaciones.toFixed(0)}%</p>
          <p className="text-sm text-slate-500 mt-1">en primera revisión</p>
        </div>
      </div>

      {/* Proyectos en Espera de Air-e */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Proyectos en Espera de Acción de Air-e ({proyectosEsperandoAire.length})
        </h3>
        
        {proyectosEsperandoAire.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">ID Proyecto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Días en Espera</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase">Observaciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {proyectosEsperandoAire.map(proyecto => (
                  <tr key={proyecto.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{proyecto.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{proyecto.nombre}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {obtenerNombreEstado(proyecto.estadoActual)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <span className={`font-semibold ${calcularDiasEnEstado(proyecto) > 15 ? 'text-red-600' : 'text-slate-900'}`}>
                        {calcularDiasEnEstado(proyecto)} días
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {proyecto.observacionesAire ? (
                        <span className="text-orange-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Con observaciones
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Sin observaciones
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-slate-600">No hay proyectos esperando acción de Air-e</p>
          </div>
        )}
      </div>

      {/* Gráficos de Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tiempos de Respuesta */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tiempos de Respuesta de Air-e (días)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={datosRespuesta}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="promedio" fill="#3b82f6" name="Tiempo Real" radius={[8, 8, 0, 0]} />
              <Bar dataKey="estimado" fill="#94a3b8" name="Tiempo Estimado" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Histórico de Interacciones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Histórico de Interacciones con Air-e</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historicoInteracciones}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="solicitudes" stroke="#3b82f6" strokeWidth={2} name="Solicitudes Presentadas" />
              <Line type="monotone" dataKey="aprobaciones" stroke="#22c55e" strokeWidth={2} name="Aprobaciones Recibidas" />
              <Line type="monotone" dataKey="observaciones" stroke="#f59e0b" strokeWidth={2} name="Observaciones Recibidas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Información sobre Air-e */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Información sobre Air-e Colombia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-blue-700 font-medium mb-2">Área de Cobertura</p>
            <p className="text-blue-900">Atlántico, Magdalena y La Guajira</p>
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium mb-2">Estado</p>
            <p className="text-blue-900">Empresa Intervenida (desde 2024)</p>
          </div>
          <div>
            <p className="text-sm text-blue-700 font-medium mb-2">Equipo de Conexiones</p>
            <p className="text-blue-900">23 personas dedicadas (Plan de Choque)</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Air-e ha implementado un plan de choque para agilizar las conexiones de proyectos de autogeneración 
            y generación distribuida. A la fecha, se han conectado aproximadamente 1,200 usuarios con ~70 MW de generación limpia.
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-4">💡 Recomendaciones para Optimizar Tiempos con Air-e</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Verificar disponibilidad de red antes de presentar solicitud</p>
              <p className="text-sm text-green-700">Usar el Módulo de Georreferenciación de Air-e para confirmar disponibilidad</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Completar toda la documentación requerida desde el inicio</p>
              <p className="text-sm text-green-700">Revisar checklist de la Resolución CREG 174 de 2021 antes de enviar</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Responder rápidamente a observaciones de Air-e</p>
              <p className="text-sm text-green-700">Monitorear el Sistema de Trámite en Línea diariamente</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Mantener comunicación proactiva con el equipo de Air-e</p>
              <p className="text-sm text-green-700">Contactar al equipo de Nuevas Conexiones ante dudas o retrasos</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VistaAire;
