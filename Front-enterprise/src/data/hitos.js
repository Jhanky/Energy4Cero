// Tipos de documentos
export const tiposDocumento = [
  { id: 1, nombre: 'Contrato', icono: '📄', color: '#3b82f6' },
  { id: 2, nombre: 'Plano Técnico', icono: '📐', color: '#8b5cf6' },
  { id: 3, nombre: 'Certificado', icono: '🏆', color: '#10b981' },
  { id: 4, nombre: 'Factura', icono: '💰', color: '#f59e0b' },
  { id: 5, nombre: 'Foto', icono: '📸', color: '#06b6d4' },
  { id: 6, nombre: 'Acta', icono: '📋', color: '#64748b' },
  { id: 7, nombre: 'Carta Air-e', icono: '✉️', color: '#ef4444' },
  { id: 8, nombre: 'Informe Técnico', icono: '📊', color: '#8b5cf6' },
  { id: 9, nombre: 'Permiso', icono: '✅', color: '#22c55e' },
  { id: 10, nombre: 'Otro', icono: '📎', color: '#94a3b8' }
];

// Tipos de eventos/hitos
export const tiposHito = [
  { id: 1, nombre: 'Firma de Contrato', icono: '✍️', color: '#3b82f6' },
  { id: 2, nombre: 'Pago Recibido', icono: '💵', color: '#10b981' },
  { id: 3, nombre: 'Documentación Enviada', icono: '📤', color: '#8b5cf6' },
  { id: 4, nombre: 'Respuesta Air-e', icono: '📨', color: '#ef4444' },
  { id: 5, nombre: 'Aprobación Recibida', icono: '✅', color: '#22c55e' },
  { id: 6, nombre: 'Inicio de Instalación', icono: '🔧', color: '#f59e0b' },
  { id: 7, nombre: 'Inspección Realizada', icono: '🔍', color: '#06b6d4' },
  { id: 8, nombre: 'Conexión Exitosa', icono: '⚡', color: '#10b981' },
  { id: 9, nombre: 'Entrega al Cliente', icono: '🤝', color: '#8b5cf6' },
  { id: 10, nombre: 'Observación/Problema', icono: '⚠️', color: '#f59e0b' },
  { id: 11, nombre: 'Reunión', icono: '👥', color: '#64748b' },
  { id: 12, nombre: 'Llamada Telefónica', icono: '📞', color: '#06b6d4' },
  { id: 13, nombre: 'Visita Técnica', icono: '🚗', color: '#3b82f6' },
  { id: 14, nombre: 'Capacitación', icono: '🎓', color: '#8b5cf6' },
  { id: 15, nombre: 'Mantenimiento', icono: '🔧', color: '#f59e0b' }
];

// Hitos de ejemplo para proyectos
export const hitosProyectos = {
  'PV-2025-001': [
    {
      id: 'H-001-01',
      tipo: 1,
      fecha: '2025-02-15',
      titulo: 'Firma de Contrato',
      descripcion: 'Contrato firmado con Empresa Industrial del Caribe S.A. por valor de $450,000,000 COP para instalación de sistema fotovoltaico de 75 kW.',
      responsable: 'Sandra Mejía - Gerente Comercial',
      participantes: ['Sandra Mejía', 'Carlos Rodríguez (Cliente)', 'Asesor Jurídico'],
      documentos: [
        { id: 'DOC-001-01', tipo: 1, nombre: 'Contrato_PV2025001_Firmado.pdf', tamaño: '2.3 MB', fechaSubida: '2025-02-15', url: '#' },
        { id: 'DOC-001-02', tipo: 1, nombre: 'Anexo_Especificaciones_Tecnicas.pdf', tamaño: '1.8 MB', fechaSubida: '2025-02-15', url: '#' }
      ],
      notas: 'Cliente solicita inicio de instalación en marzo. Se acordó pago en 3 cuotas.',
      estado: 'completado'
    },
    {
      id: 'H-001-02',
      tipo: 2,
      fecha: '2025-02-20',
      titulo: 'Recepción de Anticipo (40%)',
      descripcion: 'Recibido anticipo del 40% del valor del contrato ($180,000,000 COP) mediante transferencia bancaria.',
      responsable: 'Departamento de Contabilidad',
      participantes: ['Contador', 'Gerente Financiero'],
      documentos: [
        { id: 'DOC-001-03', tipo: 4, nombre: 'Comprobante_Pago_Anticipo.pdf', tamaño: '456 KB', fechaSubida: '2025-02-20', url: '#' },
        { id: 'DOC-001-04', tipo: 4, nombre: 'Factura_001_Anticipo.pdf', tamaño: '892 KB', fechaSubida: '2025-02-20', url: '#' }
      ],
      notas: 'Pago recibido a tiempo. Se autorizó inicio de proceso de solicitud ante Air-e.',
      estado: 'completado'
    },
    {
      id: 'H-001-03',
      tipo: 3,
      fecha: '2025-03-10',
      titulo: 'Envío de Solicitud a Air-e',
      descripcion: 'Documentación completa enviada a Air-e para solicitud de conexión: planos, certificados de equipos, memoria de cálculo y formularios.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Ingeniero de Diseño'],
      documentos: [
        { id: 'DOC-001-05', tipo: 2, nombre: 'Plano_Unifilar_Sistema.pdf', tamaño: '3.2 MB', fechaSubida: '2025-03-10', url: '#' },
        { id: 'DOC-001-06', tipo: 2, nombre: 'Plano_Ubicacion_Paneles.pdf', tamaño: '2.7 MB', fechaSubida: '2025-03-10', url: '#' },
        { id: 'DOC-001-07', tipo: 3, nombre: 'Certificado_Inversor_Fronius.pdf', tamaño: '1.1 MB', fechaSubida: '2025-03-10', url: '#' },
        { id: 'DOC-001-08', tipo: 3, nombre: 'Certificado_Paneles_JA_Solar.pdf', tamaño: '987 KB', fechaSubida: '2025-03-10', url: '#' },
        { id: 'DOC-001-09', tipo: 10, nombre: 'Memoria_Calculo.pdf', tamaño: '1.5 MB', fechaSubida: '2025-03-10', url: '#' }
      ],
      notas: 'Radicado en Air-e con número 2025-ATL-0234. Tiempo estimado de respuesta: 10 días.',
      estado: 'completado'
    },
    {
      id: 'H-001-04',
      tipo: 4,
      fecha: '2025-03-25',
      titulo: 'Observaciones de Air-e - Revisión de Completitud',
      descripcion: 'Air-e solicita correcciones en plano unifilar y actualización de certificado de cámara de comercio del cliente.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Revisor Air-e'],
      documentos: [
        { id: 'DOC-001-10', tipo: 7, nombre: 'Oficio_Observaciones_Air-e.pdf', tamaño: '654 KB', fechaSubida: '2025-03-25', url: '#' }
      ],
      notas: 'Observaciones menores. Se corregirán en 2 días y se reenviará documentación.',
      estado: 'completado'
    },
    {
      id: 'H-001-05',
      tipo: 3,
      fecha: '2025-03-27',
      titulo: 'Reenvío de Documentación Corregida',
      descripcion: 'Documentación corregida según observaciones de Air-e. Plano unifilar actualizado y certificado de cámara vigente adjuntado.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza'],
      documentos: [
        { id: 'DOC-001-11', tipo: 2, nombre: 'Plano_Unifilar_Corregido_v2.pdf', tamaño: '3.3 MB', fechaSubida: '2025-03-27', url: '#' },
        { id: 'DOC-001-12', tipo: 10, nombre: 'Certificado_Camara_Comercio_2025.pdf', tamaño: '1.2 MB', fechaSubida: '2025-03-27', url: '#' }
      ],
      notas: 'Documentación reenviada. Esperando aprobación de completitud.',
      estado: 'completado'
    },
    {
      id: 'H-001-06',
      tipo: 6,
      fecha: '2025-04-15',
      titulo: 'Inicio de Instalación',
      descripcion: 'Inicio de trabajos de instalación en sitio. Montaje de estructura y paneles solares.',
      responsable: 'Luis Hernández - Supervisor de Instalación',
      participantes: ['Luis Hernández', 'Cuadrilla de Instalación (4 personas)'],
      documentos: [
        { id: 'DOC-001-13', tipo: 6, nombre: 'Acta_Inicio_Obra.pdf', tamaño: '789 KB', fechaSubida: '2025-04-15', url: '#' },
        { id: 'DOC-001-14', tipo: 5, nombre: 'Foto_Sitio_Antes_Instalacion_1.jpg', tamaño: '3.4 MB', fechaSubida: '2025-04-15', url: '#' },
        { id: 'DOC-001-15', tipo: 5, nombre: 'Foto_Sitio_Antes_Instalacion_2.jpg', tamaño: '3.2 MB', fechaSubida: '2025-04-15', url: '#' }
      ],
      notas: 'Cliente presente en inicio de obra. Condiciones climáticas favorables.',
      estado: 'completado'
    },
    {
      id: 'H-001-07',
      tipo: 13,
      fecha: '2025-05-20',
      titulo: 'Visita de Seguimiento - 70% Avance',
      descripcion: 'Visita técnica de seguimiento. Instalación de paneles completada al 70%. Revisión de calidad de montaje y conexiones.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Luis Hernández', 'Cliente'],
      documentos: [
        { id: 'DOC-001-16', tipo: 8, nombre: 'Informe_Avance_70_Porciento.pdf', tamaño: '2.1 MB', fechaSubida: '2025-05-20', url: '#' },
        { id: 'DOC-001-17', tipo: 5, nombre: 'Foto_Avance_Paneles_1.jpg', tamaño: '4.1 MB', fechaSubida: '2025-05-20', url: '#' },
        { id: 'DOC-001-18', tipo: 5, nombre: 'Foto_Avance_Paneles_2.jpg', tamaño: '3.9 MB', fechaSubida: '2025-05-20', url: '#' },
        { id: 'DOC-001-19', tipo: 5, nombre: 'Foto_Conexiones_Electricas.jpg', tamaño: '3.7 MB', fechaSubida: '2025-05-20', url: '#' }
      ],
      notas: 'Cliente satisfecho con avance. Se estima finalización en 2 semanas.',
      estado: 'completado'
    },
    {
      id: 'H-001-08',
      tipo: 10,
      fecha: '2025-06-05',
      titulo: 'Problema: Retraso en Revisión Técnica de Air-e',
      descripcion: 'Air-e no ha emitido concepto de viabilidad técnica después de 45 días. Se realizó llamada de seguimiento.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Supervisor Air-e'],
      documentos: [
        { id: 'DOC-001-20', tipo: 10, nombre: 'Registro_Llamada_Air-e.pdf', tamaño: '234 KB', fechaSubida: '2025-06-05', url: '#' }
      ],
      notas: 'Air-e indica sobrecarga de trabajo. Prometen respuesta en 10 días hábiles.',
      estado: 'pendiente'
    },
    {
      id: 'H-001-09',
      tipo: 12,
      fecha: '2025-09-28',
      titulo: 'Llamada con Cliente - Actualización de Estado',
      descripcion: 'Llamada con cliente para informar sobre estado actual del proyecto y retrasos con Air-e.',
      responsable: 'Sandra Mejía - Gerente Comercial',
      participantes: ['Sandra Mejía', 'Carlos Rodríguez (Cliente)'],
      documentos: [],
      notas: 'Cliente comprende situación pero solicita mayor proactividad en seguimiento con Air-e.',
      estado: 'completado'
    }
  ],
  'PV-2025-003': [
    {
      id: 'H-003-01',
      tipo: 1,
      fecha: '2024-12-10',
      titulo: 'Firma de Contrato',
      descripcion: 'Contrato firmado con Inversiones Wayuu Energy S.A.S. por valor de $3,200,000,000 COP para parque solar de 850 kW.',
      responsable: 'Sandra Mejía - Gerente Comercial',
      participantes: ['Sandra Mejía', 'Director Wayuu Energy', 'Asesor Jurídico'],
      documentos: [
        { id: 'DOC-003-01', tipo: 1, nombre: 'Contrato_PV2025003_Firmado.pdf', tamaño: '4.2 MB', fechaSubida: '2024-12-10', url: '#' }
      ],
      notas: 'Proyecto de gran envergadura. Cliente con experiencia en energía renovable.',
      estado: 'completado'
    },
    {
      id: 'H-003-02',
      tipo: 8,
      fecha: '2025-06-15',
      titulo: 'Conexión Exitosa a Red de Air-e',
      descripcion: 'Sistema conectado exitosamente a la red. Medidor bidireccional instalado y configurado. Sistema generando energía.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Técnico Air-e', 'Cliente'],
      documentos: [
        { id: 'DOC-003-15', tipo: 6, nombre: 'Acta_Conexion_Air-e.pdf', tamaño: '1.8 MB', fechaSubida: '2025-06-15', url: '#' },
        { id: 'DOC-003-16', tipo: 5, nombre: 'Foto_Medidor_Bidireccional.jpg', tamaño: '2.9 MB', fechaSubida: '2025-06-15', url: '#' },
        { id: 'DOC-003-17', tipo: 8, nombre: 'Informe_Puesta_Marcha.pdf', tamaño: '3.5 MB', fechaSubida: '2025-06-15', url: '#' }
      ],
      notas: 'Conexión exitosa. Sistema operando al 100% de capacidad.',
      estado: 'completado'
    },
    {
      id: 'H-003-03',
      tipo: 9,
      fecha: '2025-06-20',
      titulo: 'Entrega Formal al Cliente',
      descripcion: 'Entrega formal del proyecto. Capacitación al personal del cliente sobre operación y monitoreo del sistema.',
      responsable: 'Carlos Mendoza - Coordinador Técnico',
      participantes: ['Carlos Mendoza', 'Ana María Torres', 'Personal Cliente (5 personas)'],
      documentos: [
        { id: 'DOC-003-18', tipo: 6, nombre: 'Acta_Entrega_Final.pdf', tamaño: '2.1 MB', fechaSubida: '2025-06-20', url: '#' },
        { id: 'DOC-003-19', tipo: 10, nombre: 'Manual_Usuario_Sistema.pdf', tamaño: '8.7 MB', fechaSubida: '2025-06-20', url: '#' },
        { id: 'DOC-003-20', tipo: 3, nombre: 'Certificado_Garantia_5_Anos.pdf', tamaño: '1.2 MB', fechaSubida: '2025-06-20', url: '#' }
      ],
      notas: 'Cliente muy satisfecho. Proyecto referencia para futuros clientes.',
      estado: 'completado'
    },
    {
      id: 'H-003-04',
      tipo: 15,
      fecha: '2025-09-16',
      titulo: 'Mantenimiento Preventivo Trimestral',
      descripcion: 'Primer mantenimiento preventivo: limpieza de paneles, revisión de conexiones, verificación de inversores.',
      responsable: 'Luis Hernández - Supervisor Técnico',
      participantes: ['Luis Hernández', 'Cuadrilla Mantenimiento'],
      documentos: [
        { id: 'DOC-003-21', tipo: 8, nombre: 'Informe_Mantenimiento_Q3_2025.pdf', tamaño: '2.8 MB', fechaSubida: '2025-09-16', url: '#' },
        { id: 'DOC-003-22', tipo: 5, nombre: 'Fotos_Mantenimiento.zip', tamaño: '15.3 MB', fechaSubida: '2025-09-16', url: '#' }
      ],
      notas: 'Sistema operando óptimamente. Rendimiento 98% del esperado.',
      estado: 'completado'
    }
  ]
};

// Funciones auxiliares
export const obtenerHitosProyecto = (proyectoId) => {
  return hitosProyectos[proyectoId] || [];
};

export const obtenerNombreTipoHito = (idTipo) => {
  const tipo = tiposHito.find(t => t.id === idTipo);
  return tipo ? tipo.nombre : 'Evento';
};

export const obtenerIconoTipoHito = (idTipo) => {
  const tipo = tiposHito.find(t => t.id === idTipo);
  return tipo ? tipo.icono : '📌';
};

export const obtenerColorTipoHito = (idTipo) => {
  const tipo = tiposHito.find(t => t.id === idTipo);
  return tipo ? tipo.color : '#94a3b8';
};

export const obtenerNombreTipoDocumento = (idTipo) => {
  const tipo = tiposDocumento.find(t => t.id === idTipo);
  return tipo ? tipo.nombre : 'Documento';
};

export const obtenerIconoTipoDocumento = (idTipo) => {
  const tipo = tiposDocumento.find(t => t.id === idTipo);
  return tipo ? tipo.icono : '📄';
};

export const contarDocumentosProyecto = (proyectoId) => {
  const hitos = obtenerHitosProyecto(proyectoId);
  return hitos.reduce((total, hito) => total + (hito.documentos?.length || 0), 0);
};

export const obtenerUltimoHito = (proyectoId) => {
  const hitos = obtenerHitosProyecto(proyectoId);
  if (hitos.length === 0) return null;
  return hitos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
};
