// Tipos de tickets
export const tiposTicket = [
  { id: 1, nombre: 'Mantenimiento Preventivo', color: '#3b82f6', prioridad: 'media' },
  { id: 2, nombre: 'Mantenimiento Correctivo', color: '#f59e0b', prioridad: 'alta' },
  { id: 3, nombre: 'Falla de Inversor', color: '#ef4444', prioridad: 'alta' },
  { id: 4, nombre: 'Falla de Paneles', color: '#ef4444', prioridad: 'alta' },
  { id: 5, nombre: 'Problema de Conexión', color: '#dc2626', prioridad: 'crítica' },
  { id: 6, nombre: 'Bajo Rendimiento', color: '#f59e0b', prioridad: 'media' },
  { id: 7, nombre: 'Consulta Técnica', color: '#06b6d4', prioridad: 'baja' },
  { id: 8, nombre: 'Solicitud de Inspección', color: '#8b5cf6', prioridad: 'media' },
  { id: 9, nombre: 'Actualización de Sistema', color: '#10b981', prioridad: 'baja' },
  { id: 10, nombre: 'Capacitación', color: '#06b6d4', prioridad: 'baja' }
];

// Estados de tickets
export const estadosTicket = [
  { id: 1, nombre: 'Abierto', color: '#ef4444' },
  { id: 2, nombre: 'En Proceso', color: '#f59e0b' },
  { id: 3, nombre: 'Esperando Cliente', color: '#8b5cf6' },
  { id: 4, nombre: 'Esperando Repuestos', color: '#f59e0b' },
  { id: 5, nombre: 'Resuelto', color: '#10b981' },
  { id: 6, nombre: 'Cerrado', color: '#64748b' },
  { id: 7, nombre: 'Cancelado', color: '#94a3b8' }
];

// Tipos de PQR
export const tiposPQR = [
  { id: 1, nombre: 'Petición', color: '#3b82f6', icono: '📝' },
  { id: 2, nombre: 'Queja', color: '#ef4444', icono: '😠' },
  { id: 3, nombre: 'Reclamo', color: '#f59e0b', icono: '⚠️' },
  { id: 4, nombre: 'Sugerencia', color: '#10b981', icono: '💡' },
  { id: 5, nombre: 'Felicitación', color: '#8b5cf6', icono: '⭐' }
];

// Categorías de PQR
export const categoriasPQR = [
  'Facturación',
  'Calidad del Servicio',
  'Tiempo de Respuesta',
  'Personal Técnico',
  'Instalación',
  'Mantenimiento',
  'Garantía',
  'Documentación',
  'Comunicación',
  'Otro'
];

// Prioridades
export const prioridades = [
  { id: 1, nombre: 'Baja', color: '#06b6d4' },
  { id: 2, nombre: 'Media', color: '#f59e0b' },
  { id: 3, nombre: 'Alta', color: '#ef4444' },
  { id: 4, nombre: 'Crítica', color: '#dc2626' }
];

// Datos de ejemplo de tickets
export const ticketsEjemplo = [
  {
    id: 'TK-2025-001',
    proyectoId: 'PV-2025-001',
    proyectoNombre: 'Proyecto Solar Barranquilla Centro',
    cliente: 'Empresa Industrial del Caribe S.A.',
    tipo: 6,
    estado: 2,
    prioridad: 2,
    titulo: 'Bajo rendimiento del sistema fotovoltaico',
    descripcion: 'El cliente reporta que la generación de energía está 15% por debajo de lo esperado en las últimas dos semanas.',
    fechaCreacion: '2025-09-28',
    fechaUltimaActualizacion: '2025-10-02',
    fechaEstimadaResolucion: '2025-10-05',
    tecnicoAsignado: 'Carlos Martínez',
    tiempoRespuesta: 4, // horas
    tiempoResolucion: null,
    sla: 48, // horas
    comentarios: [
      { fecha: '2025-09-28 10:30', autor: 'Cliente', texto: 'Hemos notado una disminución en la generación' },
      { fecha: '2025-09-28 14:15', autor: 'Carlos Martínez', texto: 'Revisión programada para mañana' },
      { fecha: '2025-10-02 09:00', autor: 'Carlos Martínez', texto: 'Se detectó suciedad en paneles. Limpieza en proceso' }
    ],
    satisfaccion: null
  },
  {
    id: 'TK-2025-002',
    proyectoId: 'PV-2025-003',
    proyectoNombre: 'Parque Solar Comercial Riohacha',
    cliente: 'Inversiones Wayuu Energy S.A.S.',
    tipo: 3,
    estado: 4,
    prioridad: 3,
    titulo: 'Falla en inversor principal',
    descripcion: 'El inversor principal presenta error E047 y no está inyectando energía a la red.',
    fechaCreacion: '2025-09-25',
    fechaUltimaActualizacion: '2025-10-01',
    fechaEstimadaResolucion: '2025-10-08',
    tecnicoAsignado: 'Roberto Díaz',
    tiempoRespuesta: 2,
    tiempoResolucion: null,
    sla: 24,
    comentarios: [
      { fecha: '2025-09-25 08:00', autor: 'Cliente', texto: 'Sistema completamente fuera de servicio' },
      { fecha: '2025-09-25 10:00', autor: 'Roberto Díaz', texto: 'Diagnóstico: falla en tarjeta de control' },
      { fecha: '2025-10-01 11:30', autor: 'Roberto Díaz', texto: 'Repuesto solicitado al fabricante. ETA: 7 días' }
    ],
    satisfaccion: null
  },
  {
    id: 'TK-2025-003',
    proyectoId: 'PV-2025-002',
    proyectoNombre: 'Instalación Solar Residencial Santa Marta',
    cliente: 'María Fernanda Gómez',
    tipo: 1,
    estado: 5,
    prioridad: 2,
    titulo: 'Mantenimiento preventivo trimestral',
    descripcion: 'Mantenimiento preventivo programado: limpieza de paneles, revisión de conexiones y verificación de rendimiento.',
    fechaCreacion: '2025-09-20',
    fechaUltimaActualizacion: '2025-09-22',
    fechaEstimadaResolucion: '2025-09-22',
    tecnicoAsignado: 'Luis Hernández',
    tiempoRespuesta: 24,
    tiempoResolucion: 48,
    sla: 72,
    comentarios: [
      { fecha: '2025-09-20 14:00', autor: 'Sistema', texto: 'Mantenimiento programado automáticamente' },
      { fecha: '2025-09-22 09:00', autor: 'Luis Hernández', texto: 'Mantenimiento completado. Sistema operando óptimamente' }
    ],
    satisfaccion: 5
  },
  {
    id: 'TK-2025-004',
    proyectoId: 'PV-2025-006',
    proyectoNombre: 'Sistema Solar Hotel Playa',
    cliente: 'Hoteles del Caribe S.A.',
    tipo: 7,
    estado: 5,
    prioridad: 1,
    titulo: 'Consulta sobre lectura de medidor bidireccional',
    descripcion: 'El cliente solicita orientación sobre cómo interpretar las lecturas del medidor bidireccional instalado por Air-e.',
    fechaCreacion: '2025-09-18',
    fechaUltimaActualizacion: '2025-09-18',
    fechaEstimadaResolucion: '2025-09-18',
    tecnicoAsignado: 'Ana María Torres',
    tiempoRespuesta: 1,
    tiempoResolucion: 2,
    sla: 48,
    comentarios: [
      { fecha: '2025-09-18 10:00', autor: 'Cliente', texto: 'No entendemos las lecturas del medidor' },
      { fecha: '2025-09-18 11:00', autor: 'Ana María Torres', texto: 'Explicación enviada por correo con manual adjunto' }
    ],
    satisfaccion: 5
  },
  {
    id: 'TK-2025-005',
    proyectoId: 'PV-2024-087',
    proyectoNombre: 'Proyecto Solar Industrial Malambo',
    cliente: 'Manufacturas del Norte S.A.',
    tipo: 5,
    estado: 1,
    prioridad: 4,
    titulo: 'Sistema desconectado por Air-e',
    descripcion: 'Air-e desconectó el sistema por supuesta anomalía en el medidor. Requiere atención urgente.',
    fechaCreacion: '2025-10-03',
    fechaUltimaActualizacion: '2025-10-03',
    fechaEstimadaResolucion: '2025-10-03',
    tecnicoAsignado: 'Carlos Martínez',
    tiempoRespuesta: null,
    tiempoResolucion: null,
    sla: 4,
    comentarios: [
      { fecha: '2025-10-03 07:30', autor: 'Cliente', texto: 'URGENTE: Sistema desconectado desde ayer' }
    ],
    satisfaccion: null
  },
  {
    id: 'TK-2025-006',
    proyectoId: 'PV-2025-005',
    proyectoNombre: 'Instalación Solar Residencial Soledad',
    cliente: 'Jorge Luis Pérez',
    tipo: 8,
    estado: 3,
    prioridad: 2,
    titulo: 'Solicitud de inspección post-instalación',
    descripcion: 'Cliente solicita inspección para verificar que la instalación cumple con todos los estándares.',
    fechaCreacion: '2025-09-30',
    fechaUltimaActualizacion: '2025-10-01',
    fechaEstimadaResolucion: '2025-10-05',
    tecnicoAsignado: 'Roberto Díaz',
    tiempoRespuesta: 8,
    tiempoResolucion: null,
    sla: 72,
    comentarios: [
      { fecha: '2025-09-30 15:00', autor: 'Cliente', texto: 'Quisiera una inspección antes de la visita de Air-e' },
      { fecha: '2025-10-01 09:00', autor: 'Roberto Díaz', texto: 'Inspección programada para el viernes. Favor confirmar disponibilidad' },
      { fecha: '2025-10-01 10:30', autor: 'Sistema', texto: 'Esperando confirmación del cliente' }
    ],
    satisfaccion: null
  },
  {
    id: 'TK-2024-156',
    proyectoId: 'PV-2025-001',
    proyectoNombre: 'Proyecto Solar Barranquilla Centro',
    cliente: 'Empresa Industrial del Caribe S.A.',
    tipo: 2,
    estado: 6,
    prioridad: 3,
    titulo: 'Reemplazo de panel dañado por tormenta',
    descripcion: 'Un panel resultó dañado durante tormenta eléctrica. Se realizó reemplazo bajo garantía.',
    fechaCreacion: '2024-08-15',
    fechaUltimaActualizacion: '2024-08-20',
    fechaEstimadaResolucion: '2024-08-20',
    tecnicoAsignado: 'Luis Hernández',
    tiempoRespuesta: 3,
    tiempoResolucion: 120,
    sla: 48,
    comentarios: [
      { fecha: '2024-08-15 16:00', autor: 'Cliente', texto: 'Panel con grieta visible después de tormenta' },
      { fecha: '2024-08-15 19:00', autor: 'Luis Hernández', texto: 'Inspección confirmada. Daño cubierto por garantía' },
      { fecha: '2024-08-20 10:00', autor: 'Luis Hernández', texto: 'Panel reemplazado. Sistema operando normalmente' }
    ],
    satisfaccion: 4
  },
  {
    id: 'TK-2025-007',
    proyectoId: 'PV-2025-003',
    proyectoNombre: 'Parque Solar Comercial Riohacha',
    cliente: 'Inversiones Wayuu Energy S.A.S.',
    tipo: 10,
    estado: 5,
    prioridad: 1,
    titulo: 'Capacitación en monitoreo del sistema',
    descripcion: 'Capacitación al personal del cliente sobre uso de la plataforma de monitoreo.',
    fechaCreacion: '2025-09-15',
    fechaUltimaActualizacion: '2025-09-16',
    fechaEstimadaResolucion: '2025-09-16',
    tecnicoAsignado: 'Ana María Torres',
    tiempoRespuesta: 12,
    tiempoResolucion: 24,
    sla: 120,
    comentarios: [
      { fecha: '2025-09-15 11:00', autor: 'Cliente', texto: 'Necesitamos capacitación para el nuevo personal' },
      { fecha: '2025-09-16 14:00', autor: 'Ana María Torres', texto: 'Capacitación realizada. 5 personas capacitadas' }
    ],
    satisfaccion: 5
  }
];

// Datos de ejemplo de PQRs
export const pqrsEjemplo = [
  {
    id: 'PQR-2025-001',
    tipo: 2,
    categoria: 'Tiempo de Respuesta',
    proyectoId: 'PV-2025-001',
    proyectoNombre: 'Proyecto Solar Barranquilla Centro',
    cliente: 'Empresa Industrial del Caribe S.A.',
    titulo: 'Demora en respuesta a solicitud de mantenimiento',
    descripcion: 'Hemos solicitado mantenimiento hace 5 días y aún no hemos recibido respuesta definitiva sobre la fecha de visita.',
    fechaCreacion: '2025-09-28',
    fechaRespuesta: '2025-09-29',
    fechaCierre: null,
    estado: 2,
    prioridad: 2,
    responsable: 'Sandra Mejía - Servicio al Cliente',
    canalRecepcion: 'Correo Electrónico',
    respuesta: 'Estimado cliente, lamentamos la demora. Hemos escalado su solicitud y el técnico se comunicará hoy mismo para programar la visita.',
    accionesTomadas: [
      'Escalamiento a supervisor técnico',
      'Asignación prioritaria de técnico',
      'Seguimiento diario hasta resolución'
    ],
    satisfaccionRespuesta: 3
  },
  {
    id: 'PQR-2025-002',
    tipo: 3,
    categoria: 'Facturación',
    proyectoId: 'PV-2025-006',
    proyectoNombre: 'Sistema Solar Hotel Playa',
    cliente: 'Hoteles del Caribe S.A.',
    titulo: 'Error en factura de Air-e después de conexión',
    descripcion: 'La factura de Air-e no refleja correctamente los créditos por energía inyectada a la red.',
    fechaCreacion: '2025-09-25',
    fechaRespuesta: '2025-09-26',
    fechaCierre: '2025-10-01',
    estado: 5,
    prioridad: 3,
    responsable: 'Carlos Mendoza - Coordinador Técnico',
    canalRecepcion: 'Llamada Telefónica',
    respuesta: 'Hemos verificado la configuración del medidor con Air-e. Se identificó un error en la parametrización que ya fue corregido. Air-e emitirá factura de ajuste.',
    accionesTomadas: [
      'Revisión técnica del medidor bidireccional',
      'Coordinación con Air-e para corrección',
      'Solicitud de factura de ajuste',
      'Verificación de factura corregida'
    ],
    satisfaccionRespuesta: 4
  },
  {
    id: 'PQR-2025-003',
    tipo: 4,
    categoria: 'Comunicación',
    proyectoId: 'PV-2025-003',
    proyectoNombre: 'Parque Solar Comercial Riohacha',
    cliente: 'Inversiones Wayuu Energy S.A.S.',
    titulo: 'Sugerencia: Reportes automáticos de generación',
    descripcion: 'Sería muy útil recibir reportes automáticos mensuales sobre la generación y el rendimiento del sistema.',
    fechaCreacion: '2025-09-20',
    fechaRespuesta: '2025-09-21',
    fechaCierre: '2025-09-22',
    estado: 5,
    prioridad: 1,
    responsable: 'Ana María Torres - Soporte Técnico',
    canalRecepcion: 'Plataforma Web',
    respuesta: 'Excelente sugerencia. Hemos configurado reportes automáticos mensuales que se enviarán el primer día de cada mes a su correo.',
    accionesTomadas: [
      'Configuración de reportes automáticos',
      'Personalización de métricas según necesidades del cliente',
      'Envío de reporte de prueba'
    ],
    satisfaccionRespuesta: 5
  },
  {
    id: 'PQR-2025-004',
    tipo: 5,
    categoria: 'Personal Técnico',
    proyectoId: 'PV-2025-002',
    proyectoNombre: 'Instalación Solar Residencial Santa Marta',
    cliente: 'María Fernanda Gómez',
    titulo: 'Felicitación por excelente servicio del técnico',
    descripcion: 'Quiero felicitar al técnico Luis Hernández por su profesionalismo, puntualidad y claridad en las explicaciones durante el mantenimiento.',
    fechaCreacion: '2025-09-22',
    fechaRespuesta: '2025-09-22',
    fechaCierre: '2025-09-22',
    estado: 5,
    prioridad: 1,
    responsable: 'Sandra Mejía - Servicio al Cliente',
    canalRecepcion: 'WhatsApp',
    respuesta: 'Muchas gracias por sus amables palabras. Hemos compartido su felicitación con Luis y su supervisor. Nos complace saber que el servicio cumplió sus expectativas.',
    accionesTomadas: [
      'Reconocimiento al técnico',
      'Registro en historial de desempeño',
      'Compartir con equipo como ejemplo'
    ],
    satisfaccionRespuesta: 5
  },
  {
    id: 'PQR-2025-005',
    tipo: 1,
    categoria: 'Garantía',
    proyectoId: 'PV-2024-087',
    proyectoNombre: 'Proyecto Solar Industrial Malambo',
    cliente: 'Manufacturas del Norte S.A.',
    titulo: 'Petición de extensión de garantía',
    descripcion: 'Solicitamos información sobre opciones para extender la garantía del sistema más allá de los 5 años estándar.',
    fechaCreacion: '2025-09-18',
    fechaRespuesta: '2025-09-19',
    fechaCierre: null,
    estado: 3,
    prioridad: 1,
    responsable: 'Carlos Mendoza - Coordinador Técnico',
    canalRecepcion: 'Correo Electrónico',
    respuesta: 'Hemos enviado a su correo las opciones de extensión de garantía disponibles con costos y coberturas. Esperamos su decisión para proceder.',
    accionesTomadas: [
      'Envío de propuesta de extensión de garantía',
      'Cotización personalizada',
      'Esperando respuesta del cliente'
    ],
    satisfaccionRespuesta: null
  },
  {
    id: 'PQR-2025-006',
    tipo: 2,
    categoria: 'Calidad del Servicio',
    proyectoId: 'PV-2025-005',
    proyectoNombre: 'Instalación Solar Residencial Soledad',
    cliente: 'Jorge Luis Pérez',
    titulo: 'Queja por retraso en proceso de conexión con Air-e',
    descripcion: 'El proceso de conexión con Air-e lleva más de 200 días y no vemos avances significativos. Necesitamos que se agilice.',
    fechaCreacion: '2025-10-01',
    fechaRespuesta: '2025-10-02',
    fechaCierre: null,
    estado: 2,
    prioridad: 3,
    responsable: 'Carlos Mendoza - Coordinador Técnico',
    canalRecepcion: 'Llamada Telefónica',
    respuesta: 'Entendemos su preocupación. Hemos contactado directamente al equipo de Nuevas Conexiones de Air-e para hacer seguimiento prioritario de su caso.',
    accionesTomadas: [
      'Escalamiento con Air-e',
      'Reunión con supervisor de Air-e',
      'Seguimiento semanal programado'
    ],
    satisfaccionRespuesta: null
  }
];

// Funciones auxiliares
export const obtenerNombreTipoTicket = (idTipo) => {
  const tipo = tiposTicket.find(t => t.id === idTipo);
  return tipo ? tipo.nombre : 'Desconocido';
};

export const obtenerColorTipoTicket = (idTipo) => {
  const tipo = tiposTicket.find(t => t.id === idTipo);
  return tipo ? tipo.color : '#94a3b8';
};

export const obtenerNombreEstadoTicket = (idEstado) => {
  const estado = estadosTicket.find(e => e.id === idEstado);
  return estado ? estado.nombre : 'Desconocido';
};

export const obtenerColorEstadoTicket = (idEstado) => {
  const estado = estadosTicket.find(e => e.id === idEstado);
  return estado ? estado.color : '#94a3b8';
};

export const obtenerNombreTipoPQR = (idTipo) => {
  const tipo = tiposPQR.find(t => t.id === idTipo);
  return tipo ? tipo.nombre : 'Desconocido';
};

export const obtenerColorTipoPQR = (idTipo) => {
  const tipo = tiposPQR.find(t => t.id === idTipo);
  return tipo ? tipo.color : '#94a3b8';
};

export const obtenerIconoTipoPQR = (idTipo) => {
  const tipo = tiposPQR.find(t => t.id === idTipo);
  return tipo ? tipo.icono : '📄';
};

export const obtenerNombrePrioridad = (idPrioridad) => {
  const prioridad = prioridades.find(p => p.id === idPrioridad);
  return prioridad ? prioridad.nombre : 'Desconocido';
};

export const obtenerColorPrioridad = (idPrioridad) => {
  const prioridad = prioridades.find(p => p.id === idPrioridad);
  return prioridad ? prioridad.color : '#94a3b8';
};

export const calcularTiempoTranscurrido = (fechaCreacion) => {
  if (!fechaCreacion) return '0d';
  
  const hoy = new Date();
  let fecha = null;
  
  // Verificar si la fecha está en formato DD/MM/YYYY HH:mm (devuelto por el backend)
  if (typeof fechaCreacion === 'string' && fechaCreacion.includes('/')) {
    // Convertir DD/MM/YYYY HH:mm a YYYY-MM-DDTHH:mm:ss para que new Date() lo interprete correctamente
    const [datePart, timePart] = fechaCreacion.split(' ');
    if (datePart && timePart) {
      const [day, month, year] = datePart.split('/');
      fecha = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}:00`);
    } else {
      fecha = new Date(fechaCreacion);
    }
  } else {
    fecha = new Date(fechaCreacion);
  }
  
  // Si la fecha no es válida, devolver '0d'
  if (isNaN(fecha.getTime())) {
    return '0d';
  }

  const diferencia = hoy - fecha;
  const horas = Math.floor(diferencia / (1000 * 60 * 60));

  if (horas < 24) return `${horas}h`;
  const dias = Math.floor(horas / 24);
  return `${dias}d`;
};

export const verificarSLA = (ticket) => {
  if (!ticket.tiempoRespuesta || !ticket.sla) return 'ok';
  
  const tiempoTranscurrido = ticket.tiempoResolucion || 
    Math.floor((new Date() - new Date(ticket.fechaCreacion)) / (1000 * 60 * 60));
  
  if (tiempoTranscurrido > ticket.sla) return 'excedido';
  if (tiempoTranscurrido > ticket.sla * 0.8) return 'proximo';
  return 'ok';
};
