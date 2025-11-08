import { useState, useEffect } from 'react';
import { X, Wrench, MessageSquare, User, Calendar, Clock, CheckCircle, AlertTriangle, Star, Reply, Search, FileText, Eye, Download } from 'lucide-react';
import { 
  tiposTicket,
  tiposPQR,
  prioridades,
  obtenerNombreTipoTicket,
  obtenerColorTipoTicket,
  obtenerNombreEstadoTicket,
  obtenerColorEstadoTicket,
  obtenerNombreTipoPQR,
  obtenerColorTipoPQR,
  obtenerNombrePrioridad,
  obtenerColorPrioridad,
  calcularTiempoTranscurrido
} from '../../../data/tickets';
import userService from '../../../services/userService';

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

const DetalleTicket = ({ ticket, onClose, onUpdate }) => {
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState(ticket.estado);
  const [prioridad, setPrioridad] = useState(ticket.prioridad);
  const [tecnico, setTecnico] = useState(ticket.tecnicoAsignado ? ticket.tecnicoAsignado.split(', ') : []);
  const [busquedaTecnico, setBusquedaTecnico] = useState('');
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]);
  const [todosTecnicos, setTodosTecnicos] = useState([]);
  const [mostrarListaTecnicos, setMostrarListaTecnicos] = useState(false);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);

  useEffect(() => {
    cargarTecnicos();
  }, []);

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

  const seleccionarTecnico = (tecnicoSeleccionado) => {
    // Almacenar el ID del técnico como string
    const tecnicoId = tecnicoSeleccionado.id.toString();
    if (!tecnico.includes(tecnicoId)) {
      setTecnico(prev => [...prev, tecnicoId]);
    }
    setBusquedaTecnico('');
    setMostrarListaTecnicos(false);
  };

  const eliminarTecnico = (tecnicoId) => {
    setTecnico(prev => prev.filter(t => t !== tecnicoId));
  };

  const handleSubmitComentario = (e) => {
    e.preventDefault();
    if (comentario.trim()) {
      const nuevoComentario = {
        fecha: new Date().toISOString(),
        autor: 'Técnico Actual', // En una implementación real, esto vendría del usuario autenticado
        texto: comentario
      };
      
      // Actualizar el ticket con el nuevo comentario
      const ticketActualizado = {
        ...ticket,
        comentarios: [...ticket.comentarios, nuevoComentario]
      };
      
      onUpdate(ticketActualizado);
      setComentario('');
    }
  };

  const handleActualizarTicket = () => {
    // Obtener los nombres de los técnicos seleccionados
    const nombresTecnicos = tecnico.map(tecnicoId => {
      const tecnicoObj = todosTecnicos.find(t => t.id.toString() === tecnicoId.toString());
      return tecnicoObj ? tecnicoObj.nombre : `Técnico ${tecnicoId}`;
    });
    
    const ticketActualizado = {
      ...ticket,
      estado: parseInt(estado),
      prioridad: parseInt(prioridad),
      tecnicoAsignado: nombresTecnicos.join(', '), // Guardar como string separado por comas
      fechaUltimaActualizacion: new Date().toISOString().split('T')[0]
    };
    
    onUpdate(ticketActualizado);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{ticket.titulo}</h2>
              <p className="text-sm text-slate-600">{ticket.id} • {ticket.proyectoNombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Cliente</span>
              </div>
              <p className="text-sm text-slate-900">{ticket.cliente}</p>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Tipo</span>
              </div>
              <span 
                className={`text-xs px-2 py-1 rounded-full ${obtenerColorTipoTicket(ticket.tipo)} text-white`}
              >
                {obtenerNombreTipoTicket(ticket.tipo)}
              </span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Creado</span>
              </div>
              <p className="text-sm text-slate-900">{calcularTiempoTranscurrido(ticket.fechaCreacion)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>Abierto</option>
                <option value={2}>En Proceso</option>
                <option value={3}>Esperando Cliente</option>
                <option value={4}>Esperando Repuestos</option>
                <option value={5}>Resuelto</option>
                <option value={6}>Cerrado</option>
                <option value={7}>Cancelado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {prioridades.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              {prioridad && (
                <div className="mt-1">
                  <span 
                    className={`inline-block w-3 h-3 rounded-full mr-2`}
                    style={{ backgroundColor: prioridades.find(p => p.id == prioridad)?.color }}
                  ></span>
                  <span className="text-xs text-slate-500">
                    {prioridades.find(p => p.id == prioridad)?.nombre}
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
              
              {tecnico.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-sm font-medium text-slate-700">
                    Técnicos seleccionados ({tecnico.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tecnico.map((tecnicoId, index) => {
                      // Buscar el nombre del técnico basado en el ID
                      const tecnicoObj = todosTecnicos.find(t => t.id.toString() === tecnicoId.toString());
                      const nombreMostrar = tecnicoObj ? tecnicoObj.nombre : `Técnico ${tecnicoId}`;
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-900">{ticket.descripcion}</p>
            </div>
          </div>

          {/* Sección de archivos adjuntos */}
          {ticket.archivos && ticket.archivos.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Archivos Adjuntos</label>
              <div className="space-y-2">
                {ticket.archivos.map((archivo) => (
                  <div
                    key={archivo.id || archivo.nombre}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {archivo.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          {archivo.tipo ? archivo.tipo.split('/')[1].toUpperCase() : 'ARCHIVO'} • {archivo.tamaño || (archivo.archivo ? (archivo.archivo.size / (1024 * 1024)).toFixed(2) + ' MB' : '')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {archivo.tipo && (archivo.tipo.startsWith('image/') || archivo.tipo === 'application/pdf') && (
                        <button
                          type="button"
                          onClick={() => {
                            // Para archivos de imagen o PDF se puede abrir una vista previa
                            if (archivo.archivo) {
                              // Si es un archivo local (como en el form), crear una URL temporal
                              const url = URL.createObjectURL(archivo.archivo);
                              window.open(url, '_blank');
                            } else {
                              // Si es un archivo ya almacenado, se podría tener una URL diferente
                              console.log('Archivo previamente guardado:', archivo);
                            }
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full"
                          title="Ver archivo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          // Para descargar el archivo
                          if (archivo.archivo) {
                            const url = URL.createObjectURL(archivo.archivo);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = archivo.nombre;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          } else {
                            console.log('Descarga del archivo no implementada para archivos remotos');
                          }
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-100 rounded-full"
                        title="Descargar archivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Comentarios</h3>
              <button
                onClick={handleActualizarTicket}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Actualizar Ticket
              </button>
            </div>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {ticket.comentarios.map((com, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-900">{com.autor}</span>
                    </div>
                    <span className="text-xs text-slate-600">{com.fecha}</span>
                  </div>
                  <p className="text-sm text-slate-700">{com.texto}</p>
                </div>
              ))}
              
              {ticket.comentarios.length === 0 && (
                <p className="text-sm text-slate-500 italic">No hay comentarios aún</p>
              )}
            </div>
            
            <form onSubmit={handleSubmitComentario} className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Reply className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">Agregar Comentario</span>
              </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escribe un comentario..."
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Agregar Comentario
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleTicket;