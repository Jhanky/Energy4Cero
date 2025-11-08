import { useState, useEffect } from 'react';
import { X, Upload, FileText, Plus, Trash2, Search } from 'lucide-react';
import { tiposDocumento } from '../../data/hitos';
import { obtenerUsuariosActivos } from '../../data/usuarios';
import userService from '../../services/userService';

const DocumentoModal = ({ isOpen, onClose, onSave, proyecto }) => {
  const [formData, setFormData] = useState({
    titulo: '',  // Nuevo campo título para el conjunto de documentos
    responsable: '',
    fecha: new Date().toISOString().split('T')[0],
    documentos: [], // Lista de documentos individuales (similar a hitos)
    descripcion: ''
  });

  const [nuevoDocumento, setNuevoDocumento] = useState({
    tipo: '',
    archivo: null,
    nombre: '',
    tamaño: ''
  });

  const [busquedaResponsable, setBusquedaResponsable] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [mostrarListaResponsable, setMostrarListaResponsable] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarUsuarios();
    }
  }, [isOpen]);

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
          email: user.email || '',
          telefono: user.phone || '',
          departamento: user.department || user.role?.name || 'General',
          activo: user.is_active !== false, // Suponiendo que si no está explícitamente inactivo, está activo
          avatar: user.avatar || '👤' // Usar avatar del backend o un default
        }));
        
        setTodosUsuarios(usuariosTransformados);
        setUsuariosFiltrados(usuariosTransformados);
      } else {
        console.warn('La respuesta no contiene datos válidos:', response);
        // Usar array vacío si no hay datos válidos
        setTodosUsuarios([]);
        setUsuariosFiltrados([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // En caso de error, podríamos usar los datos de ejemplo como fallback
      const usuariosFallback = [
        { id: 1, nombre: 'Usuario no disponible', cargo: 'Sistema', email: 'system@empresa.com', telefono: '', departamento: 'Sistema', activo: true, avatar: '👤' }
      ];
      setTodosUsuarios(usuariosFallback);
      setUsuariosFiltrados(usuariosFallback);
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

  const handleBusquedaResponsable = (termino) => {
    setBusquedaResponsable(termino);
    if (!termino.trim()) {
      setUsuariosFiltrados(todosUsuarios);
    } else {
      const usuarios = todosUsuarios.filter(usuario => 
        usuario.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.cargo.toLowerCase().includes(termino.toLowerCase()) ||
        usuario.departamento.toLowerCase().includes(termino.toLowerCase())
      );
      setUsuariosFiltrados(usuarios);
    }
    setMostrarListaResponsable(termino.length > 0);
  };

  const seleccionarResponsable = (usuario) => {
    const responsableTexto = `${usuario.nombre} - ${usuario.cargo}`;
    setFormData(prev => ({
      ...prev,
      responsable: responsableTexto
    }));
    setBusquedaResponsable(responsableTexto);
    setMostrarListaResponsable(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño máximo (10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (file.size > maxSize) {
        alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo permitido es 10MB.`);
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
        alert(`Tipo de archivo no permitido para ${file.name}. Formatos permitidos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF.`);
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

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formData.titulo.trim()) nuevosErrores.titulo = 'El título es requerido';
    if (!formData.responsable.trim()) nuevosErrores.responsable = 'El responsable es requerido';
    if (formData.documentos.length === 0) nuevosErrores.documentos = 'Debe agregar al menos un documento';

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
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
      
      // Resetear el formulario para nuevo documento
      setNuevoDocumento({
        tipo: '',
        archivo: null,
        nombre: '',
        tamaño: ''
      });
      
      // Limpiar input de archivo
      const fileInput = document.getElementById('documento-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const eliminarDocumento = (documentoId) => {
    setFormData(prev => ({
      ...prev,
      documentos: prev.documentos.filter(doc => doc.id !== documentoId)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Crear un objeto con los datos del grupo de documentos
    const grupoDocumentosData = {
      titulo: formData.titulo,
      responsable: formData.responsable,
      fecha: formData.fecha,
      descripcion: formData.descripcion,
      documentos: formData.documentos, // Lista de documentos
      proyectoId: proyecto.id
    };

    onSave(grupoDocumentosData);
    showNotification('success', `Grupo de documentación subido exitosamente (${formData.documentos.length} archivos)`);
    
    // Cerrar modal después de un breve delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleClose = () => {
    onClose();
    setErrors({});
    
    // Limpiar formulario
    setFormData({
      titulo: '',
      responsable: '',
      fecha: new Date().toISOString().split('T')[0],
      documentos: [],
      descripcion: ''
    });
    
    setNuevoDocumento({
      tipo: '',
      archivo: null,
      nombre: '',
      tamaño: '',
      descripcion: ''
    });
    
    setBusquedaResponsable('');
    setUsuariosFiltrados(obtenerUsuariosActivos());
    setMostrarListaResponsable(false);
    
    // Limpiar input de archivo
    const fileInput = document.getElementById('documento-file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Cerrar lista de usuarios al hacer clic fuera
  const handleClickOutside = (e) => {
    if (e.target.closest('.usuarios-dropdown')) return;
    setMostrarListaResponsable(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClickOutside}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Subir Nuevo Documento</h2>
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
          {/* Título del grupo de documentos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título del Grupo de Documentación *
            </label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Nombre del grupo de documentación (ej: Documentos de instalación, Fotografías del proyecto)"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.titulo ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                
                {/* Lista desplegable de usuarios */}
                {mostrarListaResponsable && usuariosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {usuariosFiltrados.map((usuario) => (
                      <button
                        key={usuario.id}
                        type="button"
                        onClick={() => seleccionarResponsable(usuario)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex items-center gap-3"
                      >
                        <span className="text-2xl">{usuario.avatar}</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{usuario.nombre}</p>
                          <p className="text-sm text-slate-600">{usuario.cargo}</p>
                          <p className="text-xs text-slate-500">{usuario.departamento}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {mostrarListaResponsable && usuariosFiltrados.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 text-center text-slate-500">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
              {errors.responsable && <p className="text-red-500 text-sm mt-1">{errors.responsable}</p>}
            </div>
          </div>

          {/* Documentos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Documentos
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
                      id="documento-file-input"
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
                    Documentos Subidos ({formData.documentos.length})
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
                      <button
                        type="button"
                        onClick={() => eliminarDocumento(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Descripción General */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción General del Grupo
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Agrega una descripción general para este grupo de documentación"
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
              <Upload className="w-4 h-4" />
              Subir Documento
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

export default DocumentoModal;
