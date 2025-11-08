import { useState, useEffect } from 'react';
import { X, Calendar, User, Users, FileText, Upload, Plus, Trash2, Search } from 'lucide-react';
import { tiposHito, tiposDocumento } from '../../data/hitos';
import userService from '../../services/userService';

const HitoModal = ({ isOpen, onClose, onSave, proyecto }) => {
  const [formData, setFormData] = useState({
    tipo: '',
    fecha: new Date().toISOString().split('T')[0],
    titulo: '',
    descripcion: '',
    responsable: '',
    participantes: [],
    documentos: [],
    notas: ''
  });

  const [busquedaParticipante, setBusquedaParticipante] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [mostrarListaUsuarios, setMostrarListaUsuarios] = useState(false);
  const [busquedaResponsable, setBusquedaResponsable] = useState('');
  const [usuariosFiltradosResponsable, setUsuariosFiltradosResponsable] = useState([]);
  const [mostrarListaResponsable, setMostrarListaResponsable] = useState(false);
  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo: '',
    archivo: null,
    nombre: '',
    tamaño: '',
    url: ''
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  // Función para obtener el icono según el rol
  const getRolIcono = (rol) => {
    const rolLower = rol?.toLowerCase() || '';
    if (rolLower.includes('admin') || rolLower.includes('sistema')) return '⚙️';
    if (rolLower.includes('gerente') || rolLower.includes('manager')) return '👔';
    if (rolLower.includes('contador') || rolLower.includes('contador')) return '💰';
    if (rolLower.includes('ingeniero') || rolLower.includes('ingenier')) return '👷';
    if (rolLower.includes('tecnico') || rolLower.includes('técnico') || rolLower.includes('instalador')) return '🔧';
    if (rolLower.includes('comercial') || rolLower.includes('ventas') || rolLower.includes('vendedor')) return '💼';
    if (rolLower.includes('soporte') || rolLower.includes('atención') || rolLower.includes('cliente')) return '🤝';
    if (rolLower.includes('desarrollador') || rolLower.includes('programador')) return '💻';
    return '👤'; // Icono por defecto
  };

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
  }, [isOpen]);

  // Efecto para actualizar el campo de búsqueda del responsable cuando cambian los usuarios
  useEffect(() => {
    if (formData.responsable && todosUsuarios.length > 0) {
      const responsableUsuario = todosUsuarios.find(u => u.id.toString() === formData.responsable.toString());
      if (responsableUsuario && busquedaResponsable === formData.responsable) {
        // Si el campo de búsqueda contiene solo el ID, reemplazarlo con el nombre
        setBusquedaResponsable(responsableUsuario.nombre);
      }
    }
  }, [todosUsuarios, formData.responsable, busquedaResponsable]);

  const cargarUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      const response = await userService.getUsers({ per_page: 100 });
      if (response.success && response.data && response.data.users) {
        // Transformar los usuarios para que tengan la misma estructura que los datos de ejemplo
        const usuariosTransformados = response.data.users.map(user => ({
          id: user.id,
          nombre: user.name || user.username || 'Nombre no disponible',
          cargo: user.position || user.role?.name || 'Usuario',
          rolIcono: getRolIcono(user.position || user.role?.name), // Icono basado en el rol
          email: user.email || '',
          telefono: user.phone || '',
          departamento: user.department || user.role?.name || 'General',
          activo: user.is_active !== false, // Suponiendo que si no está explícitamente inactivo, está activo
          avatar: user.avatar || getRolIcono(user.position || user.role?.name) // Usar avatar del backend o el icono del rol
        }));
        
        setTodosUsuarios(usuariosTransformados);
        setUsuariosFiltrados(usuariosTransformados);
        setUsuariosFiltradosResponsable(usuariosTransformados);
      } else {
        console.warn('La respuesta no contiene datos válidos:', response);
        // Usar array vacío si no hay datos válidos
        setTodosUsuarios([]);
        setUsuariosFiltrados([]);
        setUsuariosFiltradosResponsable([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // En caso de error, podríamos usar los datos de ejemplo como fallback
      const usuariosFallback = [
        { id: 1, nombre: 'Usuario no disponible', cargo: 'Sistema', rolIcono: '⚙️', email: 'system@empresa.com', telefono: '', departamento: 'Sistema', activo: true, avatar: '⚙️' }
      ];
      setTodosUsuarios(usuariosFallback);
      setUsuariosFiltrados(usuariosFallback);
      setUsuariosFiltradosResponsable(usuariosFallback);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTipoChange = (tipoId) => {
    const tipoSeleccionado = tiposHito.find(t => t.id === parseInt(tipoId));
    setFormData(prev => ({
      ...prev,
      tipo: tipoId,
      titulo: tipoSeleccionado ? tipoSeleccionado.nombre : ''
    }));
  };

  const handleBusquedaParticipante = (termino) => {
    setBusquedaParticipante(termino);
    if (termino.trim() === '') {
      setUsuariosFiltrados(todosUsuarios);
    } else {
      const usuarios = todosUsuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.cargo.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.departamento.toLowerCase().includes(termino.toLowerCase())
      );
      setUsuariosFiltrados(usuarios);
    }
    setMostrarListaUsuarios(termino.length > 0);
  };

  const handleBusquedaResponsable = (termino) => {
    setBusquedaResponsable(termino);
    if (termino.trim() === '') {
      setUsuariosFiltradosResponsable(todosUsuarios);
    } else {
      const usuarios = todosUsuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.cargo.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.departamento.toLowerCase().includes(termino.toLowerCase())
      );
      setUsuariosFiltradosResponsable(usuarios);
    }
    setMostrarListaResponsable(termino.length > 0);
  };

  const seleccionarParticipante = (usuario) => {
    // Almacenar el ID del usuario como string
    const participanteId = usuario.id.toString();
    if (!formData.participantes.includes(participanteId)) {
      setFormData(prev => ({
        ...prev,
        participantes: [...prev.participantes, participanteId]
      }));
    }
    setBusquedaParticipante('');
    setMostrarListaUsuarios(false);
  };

  const seleccionarResponsable = (usuario) => {
    // Almacenar el ID del usuario como string
    const responsableId = usuario.id.toString();
    setFormData(prev => ({
      ...prev,
      responsable: responsableId
    }));
    // Mostrar el nombre del usuario en lugar del ID
    setBusquedaResponsable(usuario.nombre);
    setMostrarListaResponsable(false);
  };

  const eliminarParticipante = (participante) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.filter(p => p !== participante)
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
        event.target.value = '';
        return;
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF.');
        event.target.value = '';
        return;
      }

      const tamaño = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      const nombre = file.name;
      
      setNuevoDocumento(prev => ({
        ...prev,
        archivo: file,
        nombre: nombre,
        tamaño: tamaño
      }));
    }
  };

  const agregarDocumento = () => {
    if (nuevoDocumento.tipo && nuevoDocumento.archivo) {
      const documento = {
        id: `DOC-${Date.now()}`,
        tipo: parseInt(nuevoDocumento.tipo),
        nombre: nuevoDocumento.nombre,
        tamaño: nuevoDocumento.tamaño,
        fechaSubida: new Date().toISOString().split('T')[0],
        url: '#',
        archivo: nuevoDocumento.archivo
      };
      
      setFormData(prev => ({
        ...prev,
        documentos: [...prev.documentos, documento]
      }));
      
      setNuevoDocumento({
        tipo: '',
        archivo: null,
        nombre: '',
        tamaño: '',
        url: ''
      });
      
      // Limpiar el input de archivo
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const eliminarDocumento = (documentoId) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter(d => d.id !== documentoId)
    }));
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.tipo) nuevosErrores.tipo = 'El tipo de hito es requerido';
    if (!formData.fecha) nuevosErrores.fecha = 'La fecha es requerida';
    if (!formData.titulo.trim()) nuevosErrores.titulo = 'El título es requerido';
    if (!formData.descripcion.trim()) nuevosErrores.descripcion = 'La descripción es requerida';
    if (!formData.responsable.trim()) nuevosErrores.responsable = 'El responsable es requerido';

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Verificar si se seleccionó un archivo pero no se agregó
    if (!formData.documentos || formData.documentos.length === 0) {
      // Si hay un archivo seleccionado en el input pero no se agregó como documento
      const fileInput = document.getElementById('file-input');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        showNotification('warning', 'Has seleccionado un archivo pero no lo has agregado. Recuerda hacer clic en "Agregar Documento" antes de crear el hito.');
        return; // Detener el proceso si hay un archivo seleccionado pero no agregado
      }
    }

    const hitoData = {
      id: `H-${proyecto.id}-${Date.now()}`,
      ...formData,
      tipo: parseInt(formData.tipo)
    };

    const handleSave = async () => {
      try {
        await onSave(hitoData);
        showNotification('success', 'Hito/Evento creado exitosamente');
      } catch (error) {
        console.error('Error al guardar el hito:', error);
        showNotification('error', 'Error al crear el hito/evento');
      } finally {
        // Cerrar modal después de un breve delay para mostrar la notificación
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    };

    handleSave();
    
    // Resetear formulario
    setFormData({
      tipo: '',
      fecha: new Date().toISOString().split('T')[0],
      titulo: '',
      descripcion: '',
      responsable: '',
      participantes: [],
      documentos: [],
      notas: ''
    });
    
    setBusquedaResponsable('');
  };

  const handleClose = () => {
    onClose();
    setErrors({});
    
    // Limpiar formulario
    setFormData({
      tipo: '',
      fecha: new Date().toISOString().split('T')[0],
      titulo: '',
      descripcion: '',
      responsable: '',
      participantes: [],
      documentos: [],
      notas: ''
    });
    
    setBusquedaParticipante('');
    setUsuariosFiltrados(obtenerUsuariosActivos());
    setMostrarListaUsuarios(false);
    setBusquedaResponsable('');
    setUsuariosFiltradosResponsable(obtenerUsuariosActivos());
    setMostrarListaResponsable(false);
    setNuevoDocumento({
      tipo: '',
      archivo: null,
      nombre: '',
      tamaño: '',
      url: ''
    });
    
    // Limpiar input de archivo
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000); // Ocultar después de 4 segundos
  };

  // Cerrar lista de usuarios al hacer clic fuera
  const handleClickOutside = (e) => {
    if (e.target.closest('.usuarios-dropdown')) return;
    setMostrarListaUsuarios(false);
    setMostrarListaResponsable(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClickOutside}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Crear Nuevo Hito/Evento</h2>
            <p className="text-sm text-slate-600 mt-1">Proyecto: {proyecto?.nombre}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Hito */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Hito/Evento *
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => handleTipoChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.tipo ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Seleccionar tipo...</option>
                {tiposHito.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.icono} {tipo.nombre}
                  </option>
                ))}
              </select>
              {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => handleInputChange('fecha', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fecha ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.fecha && <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Título del hito o evento"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción detallada del hito o evento"
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.descripcion ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
          </div>

          {/* Responsable */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Responsable *
            </label>
            <div className="relative usuarios-dropdown">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={busquedaResponsable}
                  onChange={(e) => handleBusquedaResponsable(e.target.value)}
                  placeholder="Buscar responsable por nombre, cargo o departamento..."
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.responsable ? 'border-red-500' : 'border-slate-300'
                  }`}
                  onFocus={() => setMostrarListaResponsable(busquedaResponsable.length > 0)}
                />
              </div>
              
              {/* Lista desplegable de usuarios para responsable */}
              {mostrarListaResponsable && usuariosFiltradosResponsable.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {usuariosFiltradosResponsable.map((usuario) => (
                    <button
                      key={usuario.id}
                      type="button"
                      onClick={() => seleccionarResponsable(usuario)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                    >
                      <span className="text-2xl">{usuario.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{usuario.nombre}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          {usuario.rolIcono && <span>{usuario.rolIcono}</span>}
                          {usuario.cargo}
                        </p>
                        <p className="text-xs text-slate-500">{usuario.departamento}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {mostrarListaResponsable && usuariosFiltradosResponsable.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 text-center text-slate-500">
                  No se encontraron usuarios
                </div>
              )}
            </div>
            {errors.responsable && <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>}
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Participantes
            </label>
            <div className="relative mb-3 usuarios-dropdown">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={busquedaParticipante}
                  onChange={(e) => handleBusquedaParticipante(e.target.value)}
                  placeholder="Buscar usuario por nombre, cargo o departamento..."
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onFocus={() => setMostrarListaUsuarios(busquedaParticipante.length > 0)}
                />
              </div>
              
              {/* Lista desplegable de usuarios */}
              {mostrarListaUsuarios && usuariosFiltrados.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {usuariosFiltrados.map((usuario) => (
                    <button
                      key={usuario.id}
                      type="button"
                      onClick={() => seleccionarParticipante(usuario)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                    >
                      <span className="text-2xl">{usuario.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{usuario.nombre}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          {usuario.rolIcono && <span>{usuario.rolIcono}</span>}
                          {usuario.cargo}
                        </p>
                        <p className="text-xs text-slate-500">{usuario.departamento}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {mostrarListaUsuarios && usuariosFiltrados.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 text-center text-slate-500">
                  No se encontraron usuarios
                </div>
              )}
            </div>
            
            {formData.participantes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Participantes seleccionados ({formData.participantes.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.participantes.map((participante, index) => {
                    // Buscar el nombre del participante basado en el ID
                    const usuario = todosUsuarios.find(u => u.id.toString() === participante.toString());
                    const nombreMostrar = usuario ? usuario.nombre : `Usuario ${participante}`;
                    return (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm"
                      >
                        <Users className="w-4 h-4" />
                        {nombreMostrar}
                        <button
                          type="button"
                          onClick={() => eliminarParticipante(participante)}
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-200 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Documentos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Documentos Adjuntos
            </label>
            
            {/* Formulario para agregar documento */}
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Documento *</label>
                  <select
                    value={nuevoDocumento.tipo}
                    onChange={(e) => setNuevoDocumento(prev => ({ ...prev, tipo: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.icono} {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seleccionar Archivo *</label>
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (máx. 10MB)
                  </p>
                </div>
                
              </div>
              
              <button
                type="button"
                onClick={agregarDocumento}
                disabled={!nuevoDocumento.tipo || !nuevoDocumento.archivo}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Agregar Documento
              </button>
            </div>

            {/* Lista de documentos agregados */}
            {formData.documentos.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-slate-700">
                    Documentos Agregados ({formData.documentos.length})
                  </h4>
                </div>
                {formData.documentos.map((doc) => {
                  const tipoDoc = tiposDocumento.find(t => t.id === doc.tipo);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{tipoDoc?.icono}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900 truncate">{doc.nombre}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{tipoDoc?.nombre}</span>
                            <span>•</span>
                            <span>{doc.tamaño}</span>
                            {doc.archivo && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 font-medium">Archivo seleccionado</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.archivo && (
                          <button
                            type="button"
                            onClick={() => {
                              // Crear URL temporal para previsualizar
                              const url = URL.createObjectURL(doc.archivo);
                              window.open(url, '_blank');
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Previsualizar archivo"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => eliminarDocumento(doc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar documento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => handleInputChange('notas', e.target.value)}
              placeholder="Notas adicionales o comentarios"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>


          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Crear Hito/Evento
            </button>
          </div>
        </form>
      </div>

      {/* Banner de notificación */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-right">
          <div className={`flex items-center gap-3 p-4 border rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HitoModal;
