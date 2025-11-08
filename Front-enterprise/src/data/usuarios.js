// Usuarios registrados del sistema
export const usuariosRegistrados = [
  {
    id: 1,
    nombre: 'Sandra Mejía',
    cargo: 'Gerente Comercial',
    email: 'sandra.mejia@energy4.com',
    telefono: '+57 300 123 4567',
    departamento: 'Comercial',
    activo: true,
    avatar: '👩‍💼'
  },
  {
    id: 2,
    nombre: 'Carlos Rodríguez',
    cargo: 'Ingeniero de Proyectos',
    email: 'carlos.rodriguez@energy4.com',
    telefono: '+57 300 234 5678',
    departamento: 'Técnico',
    activo: true,
    avatar: '👨‍💻'
  },
  {
    id: 3,
    nombre: 'María González',
    cargo: 'Coordinadora de Instalaciones',
    email: 'maria.gonzalez@energy4.com',
    telefono: '+57 300 345 6789',
    departamento: 'Operaciones',
    activo: true,
    avatar: '👩‍🔧'
  },
  {
    id: 4,
    nombre: 'Andrés López',
    cargo: 'Especialista en Air-e',
    email: 'andres.lopez@energy4.com',
    telefono: '+57 300 456 7890',
    departamento: 'Técnico',
    activo: true,
    avatar: '👨‍🔧'
  },
  {
    id: 5,
    nombre: 'Laura Martínez',
    cargo: 'Asesora Comercial',
    email: 'laura.martinez@energy4.com',
    telefono: '+57 300 567 8901',
    departamento: 'Comercial',
    activo: true,
    avatar: '👩‍💼'
  },
  {
    id: 6,
    nombre: 'Diego Herrera',
    cargo: 'Supervisor de Calidad',
    email: 'diego.herrera@energy4.com',
    telefono: '+57 300 678 9012',
    departamento: 'Calidad',
    activo: true,
    avatar: '👨‍🔍'
  },
  {
    id: 7,
    nombre: 'Ana Ruiz',
    cargo: 'Coordinadora de Documentación',
    email: 'ana.ruiz@energy4.com',
    telefono: '+57 300 789 0123',
    departamento: 'Administrativo',
    activo: true,
    avatar: '👩‍📋'
  },
  {
    id: 8,
    nombre: 'Roberto Silva',
    cargo: 'Técnico en Instalaciones',
    email: 'roberto.silva@energy4.com',
    telefono: '+57 300 890 1234',
    departamento: 'Operaciones',
    activo: true,
    avatar: '👨‍🔧'
  },
  {
    id: 9,
    nombre: 'Carmen Vargas',
    cargo: 'Gerente de Operaciones',
    email: 'carmen.vargas@energy4.com',
    telefono: '+57 300 901 2345',
    departamento: 'Operaciones',
    activo: true,
    avatar: '👩‍💼'
  },
  {
    id: 10,
    nombre: 'Fernando Castro',
    cargo: 'Especialista en Mantenimiento',
    email: 'fernando.castro@energy4.com',
    telefono: '+57 300 012 3456',
    departamento: 'Técnico',
    activo: true,
    avatar: '👨‍🔧'
  },
  {
    id: 11,
    nombre: 'Patricia Morales',
    cargo: 'Asistente Administrativa',
    email: 'patricia.morales@energy4.com',
    telefono: '+57 300 123 4567',
    departamento: 'Administrativo',
    activo: true,
    avatar: '👩‍💻'
  },
  {
    id: 12,
    nombre: 'Jorge Ramírez',
    cargo: 'Coordinador de Logística',
    email: 'jorge.ramirez@energy4.com',
    telefono: '+57 300 234 5678',
    departamento: 'Logística',
    activo: true,
    avatar: '👨‍💼'
  }
];

// Función para obtener usuarios activos
export const obtenerUsuariosActivos = () => {
  return usuariosRegistrados.filter(usuario => usuario.activo);
};

// Función para buscar usuarios por nombre
export const buscarUsuarios = (termino) => {
  const usuariosActivos = obtenerUsuariosActivos();
  if (!termino) return usuariosActivos;
  
  return usuariosActivos.filter(usuario => 
    usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
    usuario.cargo.toLowerCase().includes(termino.toLowerCase()) ||
    usuario.departamento.toLowerCase().includes(termino.toLowerCase())
  );
};

// Función para obtener usuario por ID
export const obtenerUsuarioPorId = (id) => {
  return usuariosRegistrados.find(usuario => usuario.id === id);
};

// Función para obtener usuarios por departamento
export const obtenerUsuariosPorDepartamento = (departamento) => {
  return usuariosRegistrados.filter(usuario => 
    usuario.activo && usuario.departamento === departamento
  );
};
