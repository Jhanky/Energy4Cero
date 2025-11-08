import { useState, useEffect } from 'react';
import { X, Plus, Calendar, User, AlertTriangle, Wrench, FolderKanban, Search, FileText, Upload, Trash2 } from 'lucide-react';
import { 
  tiposTicket,
  estadosTicket,
  prioridades,
  obtenerNombreTipoTicket,
  obtenerNombreEstadoTicket,
  obtenerNombrePrioridad
} from '../../../data/tickets';
import userService from '../../../services/userService';
import proyectosService from '../../../services/proyectosService';
import ticketService from '../../../services/ticketService';

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

const FormTicket = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    proyectoId: '',
    cliente: '',
    tipo: '',
    prioridad: '',
    titulo: '',
    descripcion: '',
    tecnicoAsignado: [],
    archivos: []
  });
  
  const [busquedaTecnico, setBusquedaTecnico] = useState('');
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]);
  const [todosTecnicos, setTodosTecnicos] = useState([]);
  const [mostrarListaTecnicos, setMostrarListaTecnicos] = useState(false);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);

  useEffect(() => {
    cargarTecnicos();
    cargarProyectos();
  }, []);

  const cargarProyectos = async () => {
    try {
      setLoadingProyectos(true);
      const response = await proyectosService.getProjects({ per_page: 1000 }); // Obtener todos los proyectos
      if (response.success && response.data && Array.isArray(response.data.data)) {
        // La respuesta sigue la estructura de paginación de Laravel: { data: [...] }
        setProyectos(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Si la respuesta es directamente un array
        setProyectos(response.data);
      } else {
        console.warn('La respuesta de proyectos no contiene datos válidos:', response);
        setProyectos([]);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setProyectos([]); // Usar array vacío como fallback
    } finally {
      setLoadingProyectos(false);
    }
  };

  const cargarTecnicos = async () => {
    try {
      setLoadingTecnicos(true);
      const response = await userService.getUsers({ per_page: 100 });
      if (response.success && response.data && response.data.users) {
        // Transformar los usuarios para que tengan la misma estructura que los datos de ejemplo
        const tecnicosTransformados = response.data.users.map(user => ({
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
        
        setTodosTecnicos(tecnicosTransformados);
        setTecnicosFiltrados(tecnicosTransformados);
      } else {
        console.warn('La respuesta no contiene datos válidos:', response);
        // Usar array vacío si no hay datos válidos
        setTodosTecnicos([]);
        setTecnicosFiltrados([]);
      }
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      // En caso de error, podríamos usar los datos de ejemplo como fallback
      const tecnicosFallback = [
        { id: 1, nombre: 'Usuario no disponible', cargo: 'Sistema', rolIcono: '⚙️', email: 'system@empresa.com', telefono: '', departamento: 'Sistema', activo: true, avatar: '⚙️' }
      ];
      setTodosTecnicos(tecnicosFallback);
      setTecnicosFiltrados(tecnicosFallback);
    } finally {
      setLoadingTecnicos(false);
    }
  };

  const handleBusquedaTecnico = (termino) => {
    setBusquedaTecnico(termino);
    if (termino.trim() === '') {
      setTecnicosFiltrados(todosTecnicos);
    } else {
      const tecnicos = todosTecnicos.filter(tecnico => 
        tecnico.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        tecnico.cargo.toLowerCase().includes(termino.toLowerCase()) ||
        tecnico.departamento.toLowerCase().includes(termino.toLowerCase())
      );
      setTecnicosFiltrados(tecnicos);
    }
    setMostrarListaTecnicos(termino.length > 0);
  };

  const seleccionarTecnico = (tecnico) => {
    // Almacenar el ID del técnico como string
    const tecnicoId = tecnico.id.toString();
    if (!formData.tecnicoAsignado.includes(tecnicoId)) {
      setFormData(prev => ({
        ...prev,
        tecnicoAsignado: [...prev.tecnicoAsignado, tecnicoId]
      }));
    }
    setBusquedaTecnico('');
    setMostrarListaTecnicos(false);
  };

  const eliminarTecnico = (tecnico) => {
    setFormData(prev => ({
      ...prev,
      tecnicoAsignado: prev.tecnicoAsignado.filter(t => t !== tecnico)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'proyectoId') {
      console.log('Valor del proyecto seleccionado:', value, typeof value);
      console.log('Lista de proyectos actual:', proyectos);
      console.log('IDs de proyectos en la lista:', proyectos.map(p => p.id));
      
      // Intentar encontrar el proyecto con conversión de tipos
      let proyectoSeleccionado = proyectos.find(p => p.id === value);
      if (!proyectoSeleccionado) {
        proyectoSeleccionado = proyectos.find(p => p.id == value); // Comparación flexible
      }
      if (!proyectoSeleccionado) {
        proyectoSeleccionado = proyectos.find(p => String(p.id) === value); // Convertir a string
      }
      
      console.log('Proyecto seleccionado:', proyectoSeleccionado);
      if (proyectoSeleccionado) {
        console.log('Cliente del proyecto:', proyectoSeleccionado.client);
        console.log('Nombre del cliente:', proyectoSeleccionado.client?.name);
        console.log('Nombre del cliente (alternativo):', proyectoSeleccionado.client_name);
      } else {
        console.log('No se encontró el proyecto en la lista');
      }
      
      const nombreCliente = proyectoSeleccionado ? 
        (proyectoSeleccionado.client?.name || 
         proyectoSeleccionado.client_name || 
         '') : '';
         
      console.log('Nombre final del cliente a asignar:', nombreCliente);
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        cliente: nombreCliente
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Enviar el ticket al backend
      const response = await ticketService.createTicket(formData);
      
      if (response.success) {
        // Llamar al callback con los datos del ticket creado
        onSubmit(response.data); // Asumiendo que el backend devuelve el ticket creado en response.data
        // Opcional: limpiar el formulario después de enviarlo
        setFormData({
          proyectoId: '',
          cliente: '',
          tipo: '',
          prioridad: '',
          titulo: '',
          descripcion: '',
          tecnicoAsignado: [],
          archivos: []
        });
      } else {
        console.error('Error al crear el ticket:', response.message || 'Error desconocido');
        // Aquí puedes manejar el error como mejor te parezca (mostrar notificación, etc.)
      }
    } catch (error) {
      console.error('Error al enviar el ticket:', error);
      // Manejar el error de envío
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validar cada archivo
    const archivosValidos = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      
      if (file.size > maxSize) {
        alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo permitido es 10MB.`);
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`El archivo ${file.name} no es un tipo válido. Solo se permiten PDF e imágenes.`);
        return false;
      }
      
      return true;
    });
    
    // Agregar los archivos válidos al estado
    const archivosConInfo = archivosValidos.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nombre: file.name,
      tipo: file.type,
      tamaño: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      archivo: file,
      fecha: new Date().toISOString()
    }));
    
    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, ...archivosConInfo]
    }));
    
    // Limpiar el input de archivo
    e.target.value = '';
  };

  const eliminarArchivo = (archivoId) => {
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter(archivo => archivo.id !== archivoId)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Crear Nuevo Ticket</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proyecto
              </label>
              {loadingProyectos ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-xs text-slate-500">Cargando...</span>
                </div>
              ) : (
                <select
                  name="proyectoId"
                  value={formData.proyectoId}
                  onChange={handleChange}
                  required
                  className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar proyecto</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.name} ({proyecto.code})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cliente
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del cliente"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar tipo</option>
                {tiposTicket.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Prioridad
              </label>
              <select
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                required
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccionar prioridad</option>
                {prioridades.map(prioridad => (
                  <option key={prioridad.id} value={prioridad.id}>
                    {prioridad.nombre}
                  </option>
                ))}
              </select>
              {formData.prioridad && (
                <div className="mt-1">
                  <span 
                    className={`inline-block w-3 h-3 rounded-full mr-2`}
                    style={{ backgroundColor: prioridades.find(p => p.id == formData.prioridad)?.color }}
                  ></span>
                  <span className="text-xs text-slate-500">
                    {prioridades.find(p => p.id == formData.prioridad)?.nombre}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Técnicos Asignados
              </label>
              <div className="relative usuarios-dropdown">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={busquedaTecnico}
                    onChange={(e) => handleBusquedaTecnico(e.target.value)}
                    placeholder="Buscar técnico por nombre, cargo o departamento..."
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onFocus={() => setMostrarListaTecnicos(busquedaTecnico.length > 0)}
                  />
                </div>
                
                {/* Lista desplegable de técnicos */}
                {mostrarListaTecnicos && tecnicosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {tecnicosFiltrados.map((tecnico) => (
                      <button
                        key={tecnico.id}
                        type="button"
                        onClick={() => seleccionarTecnico(tecnico)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                      >
                        <p className="font-medium text-slate-900">{tecnico.nombre}</p>
                        <p className="text-sm text-slate-600">{tecnico.cargo}</p>
                      </button>
                    ))}
                  </div>
                )}
                
                {mostrarListaTecnicos && tecnicosFiltrados.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg p-4 text-center text-slate-500">
                    No se encontraron técnicos
                  </div>
                )}
              </div>
              
              {formData.tecnicoAsignado.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-slate-700">
                    Técnicos seleccionados ({formData.tecnicoAsignado.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tecnicoAsignado.map((tecnicoId, index) => {
                      // Buscar el nombre del técnico basado en el ID
                      const tecnico = todosTecnicos.find(t => t.id.toString() === tecnicoId.toString());
                      const nombreMostrar = tecnico ? tecnico.nombre : `Técnico ${tecnicoId}`;
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm"
                        >
                          {nombreMostrar}
                          <button
                            type="button"
                            onClick={() => eliminarTecnico(tecnicoId)}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Título del ticket"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows={4}
              className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripción detallada del problema"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Adjuntar Documentos
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                multiple
              />
              <div className="flex flex-col items-center">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <label
                  htmlFor="file-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  Seleccionar Archivos
                </label>
                <p className="mt-2 text-sm text-slate-500">
                  PDF, JPG, PNG (máx. 10MB cada uno)
                </p>
              </div>
            </div>

            {formData.archivos.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">
                  Archivos adjuntos ({formData.archivos.length})
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.archivos.map((archivo) => (
                    <div
                      key={archivo.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {archivo.nombre}
                          </p>
                          <p className="text-xs text-slate-500">
                            {archivo.tipo.split('/')[1].toUpperCase()} • {archivo.tamaño}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarArchivo(archivo.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>



          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormTicket;