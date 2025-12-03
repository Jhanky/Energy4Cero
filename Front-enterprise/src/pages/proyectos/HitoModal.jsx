import { useState, useEffect } from 'react';
import { X, Calendar, User, Users, FileText, Upload, Plus, Trash2, Search, Loader2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { toast } from 'sonner';
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
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        // Filtrar usuarios para excluir administradores y mostrar solo usuarios activos
        const usuariosFiltrados = response.data.users.filter(user => {
          // Excluir usuarios con rol de administrador
          const rolName = user.role?.name?.toLowerCase() || '';
          const position = user.position?.toLowerCase() || '';
          const isAdmin = rolName.includes('admin') || rolName.includes('administrator') || position.includes('admin');
          const isActive = user.is_active !== false;

          return !isAdmin && isActive;
        });

        // Transformar los usuarios filtrados para que tengan la misma estructura que los datos de ejemplo
        const usuariosTransformados = usuariosFiltrados.map(user => ({
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
        // Mostrar notificación de error
        toast.warning('No se pudieron cargar los usuarios. Puede continuar creando el hito sin asignar responsable o participantes.');
        // Usar array vacío si no hay datos válidos
        setTodosUsuarios([]);
        setUsuariosFiltrados([]);
        setUsuariosFiltradosResponsable([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Mostrar notificación de error
      toast.error('Error al cargar la lista de usuarios. Puede continuar creando el hito sin asignar responsable o participantes.');
      // En caso de error, usar array vacío
      setTodosUsuarios([]);
      setUsuariosFiltrados([]);
      setUsuariosFiltradosResponsable([]);
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
        toast.error('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
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
        toast.error('Tipo de archivo no permitido. Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF.');
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

    // Solo validar responsable si hay usuarios disponibles
    if (todosUsuarios.length > 0 && !formData.responsable.trim()) {
      nuevosErrores.responsable = 'El responsable es requerido';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    // Verificar si se seleccionó un archivo pero no se agregó
    if (!formData.documentos || formData.documentos.length === 0) {
      // Si hay un archivo seleccionado en el input pero no se agregó como documento
      const fileInput = document.getElementById('file-input');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        toast.warning('Has seleccionado un archivo pero no lo has agregado. Recuerda hacer clic en "Agregar Documento" antes de crear el hito.');
        return; // Detener el proceso si hay un archivo seleccionado pero no agregado
      }
    }

    // Activar estado de envío
    setSubmitting(true);

    const hitoData = {
      id: `H-${proyecto.id}-${Date.now()}`,
      ...formData,
      tipo: parseInt(formData.tipo)
    };

    try {
      await onSave(hitoData);
      toast.success('Hito/Evento creado exitosamente');

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

      // Cerrar modal después de un breve delay para mostrar la notificación
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error al guardar el hito:', error);
      toast.error('Error al crear el hito/evento');
    } finally {
      setSubmitting(false);
    }
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
    setUsuariosFiltrados(todosUsuarios);
    setMostrarListaUsuarios(false);
    setBusquedaResponsable('');
    setUsuariosFiltradosResponsable(todosUsuarios);
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

  // Cerrar lista de usuarios al hacer clic fuera
  const handleClickOutside = (e) => {
    if (e.target.closest('.usuarios-dropdown')) return;
    setMostrarListaUsuarios(false);
    setMostrarListaResponsable(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Hito/Evento</DialogTitle>
          <p className="text-sm text-muted-foreground">Proyecto: {proyecto?.nombre}</p>
        </DialogHeader>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de Hito */}
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Hito/Evento *</Label>
                  <Select value={formData.tipo} onValueChange={handleTipoChange} disabled={submitting}>
                    <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposHito.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.icono} {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange('fecha', e.target.value)}
                      disabled={submitting}
                      className={`pl-10 ${errors.fecha ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.fecha && <p className="text-sm text-destructive">{errors.fecha}</p>}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Título del hito o evento"
                  disabled={submitting}
                  className={errors.titulo ? 'border-destructive' : ''}
                />
                {errors.titulo && <p className="text-sm text-destructive">{errors.titulo}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción detallada del hito o evento"
                  rows={4}
                  disabled={submitting}
                  className={errors.descripcion ? 'border-destructive' : ''}
                />
                {errors.descripcion && <p className="text-sm text-destructive">{errors.descripcion}</p>}
              </div>

              {/* Responsable */}
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable {todosUsuarios.length > 0 ? '*' : '(Opcional)'}</Label>
                <div className="relative usuarios-dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="responsable"
                      type="text"
                      value={busquedaResponsable}
                      onChange={(e) => handleBusquedaResponsable(e.target.value)}
                      placeholder={loadingUsuarios ? "Cargando usuarios..." : "Buscar responsable por nombre, cargo o departamento..."}
                      disabled={loadingUsuarios}
                      className={`pl-10 ${errors.responsable ? 'border-destructive' : ''}`}
                      onFocus={() => setMostrarListaResponsable(busquedaResponsable.length > 0)}
                    />
                    {loadingUsuarios && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Lista desplegable de usuarios para responsable */}
                  {mostrarListaResponsable && usuariosFiltradosResponsable.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {usuariosFiltradosResponsable.map((usuario) => (
                        <button
                          key={usuario.id}
                          type="button"
                          onClick={() => seleccionarResponsable(usuario)}
                          className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 flex items-center gap-3"
                        >
                          <span className="text-2xl">{usuario.avatar}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{usuario.nombre}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {usuario.rolIcono && <span>{usuario.rolIcono}</span>}
                              {usuario.cargo}
                            </p>
                            <p className="text-xs text-muted-foreground">{usuario.departamento}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mostrarListaResponsable && usuariosFiltradosResponsable.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </div>
                  )}
                </div>
                {errors.responsable && <p className="text-sm text-destructive">{errors.responsable}</p>}
              </div>

              {/* Participantes */}
              <div className="space-y-2">
                <Label htmlFor="participantes">Participantes</Label>
                <div className="relative mb-3 usuarios-dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="participantes"
                      type="text"
                      value={busquedaParticipante}
                      onChange={(e) => handleBusquedaParticipante(e.target.value)}
                      placeholder={loadingUsuarios ? "Cargando usuarios..." : "Buscar usuario por nombre, cargo o departamento..."}
                      disabled={loadingUsuarios}
                      className="pl-10"
                      onFocus={() => setMostrarListaUsuarios(busquedaParticipante.length > 0)}
                    />
                    {loadingUsuarios && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Lista desplegable de usuarios */}
                  {mostrarListaUsuarios && usuariosFiltrados.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {usuariosFiltrados.map((usuario) => (
                        <button
                          key={usuario.id}
                          type="button"
                          onClick={() => seleccionarParticipante(usuario)}
                          className="w-full px-4 py-3 text-left hover:bg-muted border-b border-border last:border-b-0 flex items-center gap-3"
                        >
                          <span className="text-2xl">{usuario.avatar}</span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{usuario.nombre}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {usuario.rolIcono && <span>{usuario.rolIcono}</span>}
                              {usuario.cargo}
                            </p>
                            <p className="text-xs text-muted-foreground">{usuario.departamento}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {mostrarListaUsuarios && usuariosFiltrados.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </div>
                  )}
                </div>

                {formData.participantes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      Participantes seleccionados ({formData.participantes.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.participantes.map((participante, index) => {
                        // Buscar el nombre del participante basado en el ID
                        const usuario = todosUsuarios.find(u => u.id.toString() === participante.toString());
                        const nombreMostrar = usuario ? usuario.nombre : `Usuario ${participante}`;
                        return (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg text-sm"
                          >
                            <Users className="w-4 h-4" />
                            {nombreMostrar}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => eliminarParticipante(participante)}
                              className="h-auto p-1 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="space-y-4">
                <Label>Documentos Adjuntos</Label>

                {/* Formulario para agregar documento */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo-documento">Tipo de Documento *</Label>
                        <Select value={nuevoDocumento.tipo} onValueChange={(value) => setNuevoDocumento(prev => ({ ...prev, tipo: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposDocumento.map(tipo => (
                              <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                {tipo.icono} {tipo.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file-input">Seleccionar Archivo *</Label>
                        <Input
                          id="file-input"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                        />
                        <p className="text-xs text-muted-foreground">
                          Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (máx. 10MB)
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={agregarDocumento}
                      disabled={!nuevoDocumento.tipo || !nuevoDocumento.archivo}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Documento
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de documentos agregados */}
                {formData.documentos.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground">
                        Documentos Agregados ({formData.documentos.length})
                      </h4>
                    </div>
                    {formData.documentos.map((doc) => {
                      const tipoDoc = tiposDocumento.find(t => t.id === doc.tipo);
                      return (
                        <Card key={doc.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-2xl flex-shrink-0">{tipoDoc?.icono}</span>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-foreground truncate">{doc.nombre}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      // Crear URL temporal para previsualizar
                                      const url = URL.createObjectURL(doc.archivo);
                                      window.open(url, '_blank');
                                    }}
                                    title="Previsualizar archivo"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => eliminarDocumento(doc.id)}
                                  className="hover:bg-destructive hover:text-destructive-foreground"
                                  title="Eliminar documento"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notas">Notas Adicionales</Label>
                <Textarea
                  id="notas"
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  placeholder="Notas adicionales o comentarios"
                  rows={3}
                  disabled={submitting}
                />
              </div>

              {/* Botones */}
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registrando Hito...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Crear Hito/Evento
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default HitoModal;
