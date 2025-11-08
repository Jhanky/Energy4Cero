// Datos de ejemplo para proyectos fotovoltaicos

export const estados = [
  { id: 1, nombre: 'Preparación de Solicitud', color: '#94a3b8', duracionEstimada: 7 },
  { id: 2, nombre: 'Solicitud Presentada', color: '#60a5fa', duracionEstimada: 1 },
  { id: 3, nombre: 'Revisión de Completitud', color: '#fbbf24', duracionEstimada: 10 },
  { id: 4, nombre: 'Revisión Técnica', color: '#f59e0b', duracionEstimada: 15 },
  { id: 5, nombre: 'Concepto de Viabilidad Emitido', color: '#8b5cf6', duracionEstimada: 2 },
  { id: 6, nombre: 'Instalación en Proceso', color: '#3b82f6', duracionEstimada: 10 },
  { id: 7, nombre: 'Inspección Pendiente', color: '#06b6d4', duracionEstimada: 7 },
  { id: 8, nombre: 'Inspección Realizada', color: '#14b8a6', duracionEstimada: 1 },
  { id: 9, nombre: 'Observaciones de Inspección', color: '#f97316', duracionEstimada: 5 },
  { id: 10, nombre: 'Aprobación Final', color: '#84cc16', duracionEstimada: 3 },
  { id: 11, nombre: 'Conectado y Operando', color: '#22c55e', duracionEstimada: null },
  { id: 12, nombre: 'Suspendido', color: '#ef4444', duracionEstimada: null },
  { id: 13, nombre: 'Cancelado', color: '#991b1b', duracionEstimada: null }
];

export const proyectosEjemplo = [
  {
    id: 'PV-2025-001',
    nombre: 'Proyecto Solar Barranquilla Centro',
    cliente: 'Empresa Industrial del Caribe S.A.',
    numeroCuenta: '7950794',
    tipoProyecto: 'AGPE',
    departamento: 'Atlántico',
    municipio: 'Barranquilla',
    direccion: 'Calle 72 #45-23',
    coordenadas: '10.9639° N, 74.7964° W',
    capacidadDC: 85,
    capacidadAC: 75,
    potenciaNominal: 75,
    numeroInversores: 3,
    fabricanteInversores: 'Huawei',
    modeloInversores: 'SUN2000-25KTL',
    numeroPaneles: 170,
    potenciaPaneles: 500,
    nivelTension: '220V',
    numeroTransformador: 'TR-45892',
    puntoConexion: 'Subestación Norte',
    entregaExcedentes: true,
    valorContrato: 285000000,
    fechaContrato: '2025-01-15',
    responsableComercial: 'Carlos Mendoza',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 285000000,
    ingresosProyectados: 285000000,
    margenEstimado: 28,
    fechaInicio: '2025-01-20',
    fechaSolicitudPresentada: '2025-02-05',
    fechaRevisionCompletiudIniciada: '2025-02-06',
    fechaRevisionCompletiudFinalizada: '2025-02-15',
    fechaRevisionTecnicaIniciada: '2025-02-16',
    fechaRevisionTecnicaFinalizada: '2025-03-05',
    fechaConceptoViabilidad: '2025-03-07',
    fechaInstalacionIniciada: '2025-03-10',
    fechaInstalacionFinalizada: null,
    fechaInspeccionSolicitada: null,
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-04-15',
    estadoActual: 6,
    porcentajeAvance: 55,
    observacionesAire: 'Instalación en progreso según cronograma',
    accionesCorrectivas: '',
    comentariosInternos: 'Cliente muy satisfecho con el avance',
    responsableActual: 'Equipo de Instalación',
    proximaAccion: 'Completar instalación de paneles',
    fechaProximaAccion: '2025-03-25'
  },
  {
    id: 'PV-2025-002',
    nombre: 'Instalación Solar Residencial Santa Marta',
    cliente: 'María Fernanda Gómez',
    numeroCuenta: '8234567',
    tipoProyecto: 'AGPE',
    departamento: 'Magdalena',
    municipio: 'Santa Marta',
    direccion: 'Carrera 15 #28-45',
    coordenadas: '11.2408° N, 74.2099° W',
    capacidadDC: 12,
    capacidadAC: 10,
    potenciaNominal: 10,
    numeroInversores: 1,
    fabricanteInversores: 'Fronius',
    modeloInversores: 'Primo 10.0-1',
    numeroPaneles: 24,
    potenciaPaneles: 500,
    nivelTension: '120V',
    numeroTransformador: 'TR-23451',
    puntoConexion: 'Red de Distribución Local',
    entregaExcedentes: false,
    valorContrato: 42000000,
    fechaContrato: '2025-02-10',
    responsableComercial: 'Ana Rodríguez',
    canalVenta: 'Digital',
    ticketPromedio: 42000000,
    ingresosProyectados: 42000000,
    margenEstimado: 32,
    fechaInicio: '2025-02-12',
    fechaSolicitudPresentada: '2025-02-20',
    fechaRevisionCompletiudIniciada: '2025-02-21',
    fechaRevisionCompletiudFinalizada: null,
    fechaRevisionTecnicaIniciada: null,
    fechaRevisionTecnicaFinalizada: null,
    fechaConceptoViabilidad: null,
    fechaInstalacionIniciada: null,
    fechaInstalacionFinalizada: null,
    fechaInspeccionSolicitada: null,
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-04-05',
    estadoActual: 3,
    porcentajeAvance: 20,
    observacionesAire: 'Falta certificado de instalador eléctrico',
    accionesCorrectivas: 'Solicitar certificado actualizado al cliente',
    comentariosInternos: 'Cliente ha sido notificado',
    responsableActual: 'Air-e',
    proximaAccion: 'Enviar certificado faltante',
    fechaProximaAccion: '2025-03-15'
  },
  {
    id: 'PV-2025-003',
    nombre: 'Parque Solar Comercial Riohacha',
    cliente: 'Inversiones Wayuu Energy S.A.S.',
    numeroCuenta: '9876543',
    tipoProyecto: 'GD',
    departamento: 'La Guajira',
    municipio: 'Riohacha',
    direccion: 'Km 5 Vía a Maicao',
    coordenadas: '11.5444° N, 72.9072° W',
    capacidadDC: 950,
    capacidadAC: 850,
    potenciaNominal: 850,
    numeroInversores: 17,
    fabricanteInversores: 'SMA',
    modeloInversores: 'Sunny Tripower CORE1',
    numeroPaneles: 1900,
    potenciaPaneles: 500,
    nivelTension: '440V',
    numeroTransformador: 'TR-89234',
    puntoConexion: 'Subestación Riohacha',
    entregaExcedentes: true,
    valorContrato: 3200000000,
    fechaContrato: '2024-11-20',
    responsableComercial: 'Luis Martínez',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 3200000000,
    ingresosProyectados: 3200000000,
    margenEstimado: 25,
    fechaInicio: '2024-12-01',
    fechaSolicitudPresentada: '2025-01-10',
    fechaRevisionCompletiudIniciada: '2025-01-11',
    fechaRevisionCompletiudFinalizada: '2025-01-20',
    fechaRevisionTecnicaIniciada: '2025-01-21',
    fechaRevisionTecnicaFinalizada: '2025-02-10',
    fechaConceptoViabilidad: '2025-02-12',
    fechaInstalacionIniciada: '2025-02-15',
    fechaInstalacionFinalizada: '2025-03-05',
    fechaInspeccionSolicitada: '2025-03-06',
    fechaInspeccionRealizada: '2025-03-12',
    fechaAprobacionFinal: '2025-03-15',
    fechaConexion: '2025-03-18',
    fechaEstimadaFinalizacion: '2025-03-20',
    estadoActual: 11,
    porcentajeAvance: 100,
    observacionesAire: 'Proyecto aprobado y conectado exitosamente',
    accionesCorrectivas: '',
    comentariosInternos: 'Proyecto modelo para futuros desarrollos',
    responsableActual: 'Equipo O&M',
    proximaAccion: 'Monitoreo continuo de producción',
    fechaProximaAccion: null
  },
  {
    id: 'PV-2025-004',
    nombre: 'Sistema Solar Agroindustrial Ciénaga',
    cliente: 'Agrícola del Magdalena Ltda.',
    numeroCuenta: '7234891',
    tipoProyecto: 'AGPE',
    departamento: 'Magdalena',
    municipio: 'Ciénaga',
    direccion: 'Vereda El Retén',
    coordenadas: '11.0061° N, 74.2466° W',
    capacidadDC: 180,
    capacidadAC: 160,
    potenciaNominal: 160,
    numeroInversores: 4,
    fabricanteInversores: 'Huawei',
    modeloInversores: 'SUN2000-40KTL',
    numeroPaneles: 360,
    potenciaPaneles: 500,
    nivelTension: '440V',
    numeroTransformador: 'TR-67823',
    puntoConexion: 'Subestación Ciénaga',
    entregaExcedentes: true,
    valorContrato: 580000000,
    fechaContrato: '2025-01-25',
    responsableComercial: 'Carlos Mendoza',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 580000000,
    ingresosProyectados: 580000000,
    margenEstimado: 27,
    fechaInicio: '2025-02-01',
    fechaSolicitudPresentada: '2025-02-15',
    fechaRevisionCompletiudIniciada: '2025-02-16',
    fechaRevisionCompletiudFinalizada: '2025-02-28',
    fechaRevisionTecnicaIniciada: '2025-03-01',
    fechaRevisionTecnicaFinalizada: null,
    fechaConceptoViabilidad: null,
    fechaInstalacionIniciada: null,
    fechaInstalacionFinalizada: null,
    fechaInspeccionSolicitada: null,
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-05-10',
    estadoActual: 4,
    porcentajeAvance: 35,
    observacionesAire: 'Revisión técnica en proceso. Se requiere estudio de conexión simplificado.',
    accionesCorrectivas: 'Contratar estudio de conexión con empresa certificada',
    comentariosInternos: 'Esperando respuesta de Air-e sobre alcance del estudio',
    responsableActual: 'Air-e',
    proximaAccion: 'Esperar resultado de revisión técnica',
    fechaProximaAccion: '2025-03-20'
  },
  {
    id: 'PV-2025-005',
    nombre: 'Instalación Solar Residencial Soledad',
    cliente: 'Jorge Luis Pérez',
    numeroCuenta: '7456123',
    tipoProyecto: 'AGPE',
    departamento: 'Atlántico',
    municipio: 'Soledad',
    direccion: 'Calle 38 #25-67',
    coordenadas: '10.9185° N, 74.7693° W',
    capacidadDC: 8,
    capacidadAC: 7,
    potenciaNominal: 7,
    numeroInversores: 1,
    fabricanteInversores: 'Growatt',
    modeloInversores: 'MIN 7000TL-XH',
    numeroPaneles: 16,
    potenciaPaneles: 500,
    nivelTension: '120V',
    numeroTransformador: 'TR-34567',
    puntoConexion: 'Red de Distribución Local',
    entregaExcedentes: false,
    valorContrato: 28000000,
    fechaContrato: '2025-02-28',
    responsableComercial: 'Ana Rodríguez',
    canalVenta: 'Digital',
    ticketPromedio: 28000000,
    ingresosProyectados: 28000000,
    margenEstimado: 30,
    fechaInicio: '2025-03-01',
    fechaSolicitudPresentada: '2025-03-08',
    fechaRevisionCompletiudIniciada: null,
    fechaRevisionCompletiudFinalizada: null,
    fechaRevisionTecnicaIniciada: null,
    fechaRevisionTecnicaFinalizada: null,
    fechaConceptoViabilidad: null,
    fechaInstalacionIniciada: null,
    fechaInstalacionFinalizada: null,
    fechaInspeccionSolicitada: null,
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-04-25',
    estadoActual: 2,
    porcentajeAvance: 10,
    observacionesAire: '',
    accionesCorrectivas: '',
    comentariosInternos: 'Solicitud recién presentada',
    responsableActual: 'Air-e',
    proximaAccion: 'Esperar inicio de revisión de completitud',
    fechaProximaAccion: '2025-03-12'
  },
  {
    id: 'PV-2025-006',
    nombre: 'Sistema Solar Hotel Playa',
    cliente: 'Hoteles del Caribe S.A.',
    numeroCuenta: '8567234',
    tipoProyecto: 'AGPE',
    departamento: 'Magdalena',
    municipio: 'Santa Marta',
    direccion: 'Rodadero Sur, Calle 9 #1-45',
    coordenadas: '11.2042° N, 74.2275° W',
    capacidadDC: 95,
    capacidadAC: 85,
    potenciaNominal: 85,
    numeroInversores: 3,
    fabricanteInversores: 'SMA',
    modeloInversores: 'Sunny Tripower 25000TL',
    numeroPaneles: 190,
    potenciaPaneles: 500,
    nivelTension: '220V',
    numeroTransformador: 'TR-78234',
    puntoConexion: 'Subestación Rodadero',
    entregaExcedentes: true,
    valorContrato: 320000000,
    fechaContrato: '2025-02-05',
    responsableComercial: 'Luis Martínez',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 320000000,
    ingresosProyectados: 320000000,
    margenEstimado: 26,
    fechaInicio: '2025-02-10',
    fechaSolicitudPresentada: '2025-02-25',
    fechaRevisionCompletiudIniciada: '2025-02-26',
    fechaRevisionCompletiudFinalizada: '2025-03-08',
    fechaRevisionTecnicaIniciada: '2025-03-09',
    fechaRevisionTecnicaFinalizada: '2025-03-22',
    fechaConceptoViabilidad: '2025-03-24',
    fechaInstalacionIniciada: '2025-03-26',
    fechaInstalacionFinalizada: '2025-04-08',
    fechaInspeccionSolicitada: '2025-04-09',
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-04-20',
    estadoActual: 7,
    porcentajeAvance: 70,
    observacionesAire: 'Inspección programada para próxima semana',
    accionesCorrectivas: '',
    comentariosInternos: 'Instalación completada sin inconvenientes',
    responsableActual: 'Air-e',
    proximaAccion: 'Esperar inspección de Air-e',
    fechaProximaAccion: '2025-04-15'
  },
  {
    id: 'PV-2024-087',
    nombre: 'Proyecto Solar Industrial Malambo',
    cliente: 'Manufacturas del Norte S.A.',
    numeroCuenta: '7123456',
    tipoProyecto: 'AGPE',
    departamento: 'Atlántico',
    municipio: 'Malambo',
    direccion: 'Zona Industrial, Manzana 5',
    coordenadas: '10.8594° N, 74.7739° W',
    capacidadDC: 220,
    capacidadAC: 200,
    potenciaNominal: 200,
    numeroInversores: 5,
    fabricanteInversores: 'Huawei',
    modeloInversores: 'SUN2000-40KTL',
    numeroPaneles: 440,
    potenciaPaneles: 500,
    nivelTension: '440V',
    numeroTransformador: 'TR-56789',
    puntoConexion: 'Subestación Malambo',
    entregaExcedentes: true,
    valorContrato: 720000000,
    fechaContrato: '2024-12-10',
    responsableComercial: 'Carlos Mendoza',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 720000000,
    ingresosProyectados: 720000000,
    margenEstimado: 24,
    fechaInicio: '2024-12-15',
    fechaSolicitudPresentada: '2025-01-05',
    fechaRevisionCompletiudIniciada: '2025-01-06',
    fechaRevisionCompletiudFinalizada: '2025-01-18',
    fechaRevisionTecnicaIniciada: '2025-01-19',
    fechaRevisionTecnicaFinalizada: '2025-02-05',
    fechaConceptoViabilidad: '2025-02-07',
    fechaInstalacionIniciada: '2025-02-10',
    fechaInstalacionFinalizada: '2025-02-28',
    fechaInspeccionSolicitada: '2025-03-01',
    fechaInspeccionRealizada: '2025-03-08',
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-03-25',
    estadoActual: 9,
    porcentajeAvance: 85,
    observacionesAire: 'Se encontraron 3 observaciones menores en la inspección: 1) Falta etiquetado en 2 inversores, 2) Cable de tierra sin protección mecánica en tramo de 3m, 3) Falta documentación de pruebas de aislamiento',
    accionesCorrectivas: 'Equipo técnico corrigiendo observaciones. Estimado 5 días.',
    comentariosInternos: 'Observaciones menores, fáciles de corregir',
    responsableActual: 'Equipo de Instalación',
    proximaAccion: 'Completar correcciones y solicitar re-inspección',
    fechaProximaAccion: '2025-03-18'
  },
  {
    id: 'PV-2025-008',
    nombre: 'Instalación Solar Comercial Barranquilla',
    cliente: 'Supermercados La Economía',
    numeroCuenta: '7890123',
    tipoProyecto: 'AGPE',
    departamento: 'Atlántico',
    municipio: 'Barranquilla',
    direccion: 'Calle 85 #52-14',
    coordenadas: '11.0041° N, 74.8070° W',
    capacidadDC: 65,
    capacidadAC: 58,
    potenciaNominal: 58,
    numeroInversores: 2,
    fabricanteInversores: 'Fronius',
    modeloInversores: 'Symo 24.0-3',
    numeroPaneles: 130,
    potenciaPaneles: 500,
    nivelTension: '220V',
    numeroTransformador: 'TR-23890',
    puntoConexion: 'Red de Distribución Local',
    entregaExcedentes: true,
    valorContrato: 195000000,
    fechaContrato: '2025-02-20',
    responsableComercial: 'Ana Rodríguez',
    canalVenta: 'Contacto Directo',
    ticketPromedio: 195000000,
    ingresosProyectados: 195000000,
    margenEstimado: 29,
    fechaInicio: '2025-02-22',
    fechaSolicitudPresentada: null,
    fechaRevisionCompletiudIniciada: null,
    fechaRevisionCompletiudFinalizada: null,
    fechaRevisionTecnicaIniciada: null,
    fechaRevisionTecnicaFinalizada: null,
    fechaConceptoViabilidad: null,
    fechaInstalacionIniciada: null,
    fechaInstalacionFinalizada: null,
    fechaInspeccionSolicitada: null,
    fechaInspeccionRealizada: null,
    fechaAprobacionFinal: null,
    fechaConexion: null,
    fechaEstimadaFinalizacion: '2025-04-30',
    estadoActual: 1,
    porcentajeAvance: 5,
    observacionesAire: '',
    accionesCorrectivas: '',
    comentariosInternos: 'Recopilando documentación del cliente',
    responsableActual: 'Equipo Interno',
    proximaAccion: 'Completar documentación y verificar disponibilidad de red',
    fechaProximaAccion: '2025-03-14'
  }
];

// Función para calcular días en estado actual
export const calcularDiasEnEstado = (proyecto) => {
  const hoy = new Date();
  let fechaEstado;
  
  // Obtener el estado actual (puede venir de diferentes campos)
  const estadoActual = proyecto.current_state_id || proyecto.estadoActual;
  
  switch (estadoActual) {
    case 1:
      fechaEstado = new Date(proyecto.start_date || proyecto.fechaInicio);
      break;
    case 2:
      fechaEstado = new Date(proyecto.application_date || proyecto.fechaSolicitudPresentada);
      break;
    case 3:
      fechaEstado = new Date(proyecto.completeness_start_date || proyecto.fechaRevisionCompletiudIniciada);
      break;
    case 4:
      fechaEstado = new Date(proyecto.technical_review_start_date || proyecto.fechaRevisionTecnicaIniciada);
      break;
    case 5:
      fechaEstado = new Date(proyecto.feasibility_concept_date || proyecto.fechaConceptoViabilidad);
      break;
    case 6:
      fechaEstado = new Date(proyecto.installation_start_date || proyecto.fechaInstalacionIniciada);
      break;
    case 7:
      fechaEstado = new Date(proyecto.inspection_requested_date || proyecto.fechaInspeccionSolicitada);
      break;
    case 8:
      fechaEstado = new Date(proyecto.inspection_performed_date || proyecto.fechaInspeccionRealizada);
      break;
    case 9:
      fechaEstado = new Date(proyecto.inspection_performed_date || proyecto.fechaInspeccionRealizada);
      break;
    case 10:
      fechaEstado = new Date(proyecto.final_approval_date || proyecto.fechaAprobacionFinal);
      break;
    case 11:
      fechaEstado = new Date(proyecto.connection_date || proyecto.fechaConexion);
      break;
    default:
      return 0;
  }
  
  // Si la fecha no es válida, retornar 0
  if (isNaN(fechaEstado.getTime())) {
    return 0;
  }
  
  const diferencia = hoy - fechaEstado;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

// Función para calcular días totales del proyecto
export const calcularDiasTotales = (proyecto) => {
  const hoy = new Date();
  const fechaInicio = new Date(proyecto.start_date || proyecto.fechaInicio);
  // Si la fecha no es válida, retornar 0
  if (isNaN(fechaInicio.getTime())) {
    return 0;
  }
  const diferencia = hoy - fechaInicio;
  return Math.floor(diferencia / (1000 * 60 * 60 * 24));
};

// Función para calcular porcentaje de progreso basado en el estado actual
export const calcularPorcentajePorEstado = (estadoActualId) => {
  // Ajustamos manualmente para que los estados tengan un progreso más realista
  const mapeoEstados = {
    1: 5,    // Preparación de Solicitud
    2: 10,   // Solicitud Presentada
    3: 20,   // Revisión de Completitud
    4: 30,   // Revisión Técnica
    5: 40,   // Concepto de Viabilidad Emitido
    6: 50,   // Instalación en Proceso
    7: 70,   // Inspección Pendiente
    8: 80,   // Inspección Realizada
    9: 85,   // Observaciones de Inspección
    10: 95,  // Aprobación Final
    11: 100, // Conectado y Operando
    12: 0,   // Suspendido - reinicia el progreso
    13: 0    // Cancelado - reinicia el progreso
  };
  
  return mapeoEstados[estadoActualId] || 0;
};

// Función para calcular días de retraso
export const calcularDiasRetraso = (proyecto) => {
  const hoy = new Date();
  const fechaEstimada = new Date(proyecto.estimated_completion_date || proyecto.fechaEstimadaFinalizacion);
  
  // Si la fecha no es válida, retornar 0
  if (isNaN(fechaEstimada.getTime())) {
    return 0;
  }
  
  // Obtener el estado actual (puede venir de diferentes campos)
  const estadoActual = proyecto.current_state_id || proyecto.estadoActual;
  
  if (estadoActual === 11) return 0; // Ya conectado
  
  const diferencia = hoy - fechaEstimada;
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
};

// Función para obtener color de semáforo
export const obtenerColorSemaforo = (proyecto) => {
  const diasRetraso = calcularDiasRetraso(proyecto);
  const diasEnEstado = calcularDiasEnEstado(proyecto);
  
  // Obtener el estado actual (puede venir de diferentes campos)
  const estadoActual = proyecto.current_state_id || proyecto.estadoActual;
  const estado = estados.find(e => e.id === estadoActual);
  
  if (estadoActual === 11) return 'verde'; // Conectado
  if (estadoActual === 12 || estadoActual === 13) return 'rojo'; // Suspendido o cancelado
  
  if (diasRetraso > 0) return 'rojo';
  if (estado && estado.duracionEstimada && diasEnEstado > estado.duracionEstimada * 1.5) return 'amarillo';
  
  return 'verde';
};
