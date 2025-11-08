import { useState, useEffect } from 'react';
import { X, Wrench, MessageSquare, User, Calendar, Clock, CheckCircle, AlertTriangle, Star, Reply, Search, FileText, Eye, Download, ExternalLink, Image as ImageIcon, File } from 'lucide-react';
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

// Componente para visualizar imágenes
const ImageViewer = ({ imageUrl, fileName, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-xl"
        >
          ✕
        </button>
        <img
          src={imageUrl}
          alt={fileName}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        <p className="text-white text-center mt-2">{fileName}</p>
      </div>
    </div>
  );
};

const DetalleTicket = ({ ticket, onClose, onUpdate }) => {
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState(ticket.status_id || ticket.estado);
  const [prioridad, setPrioridad] = useState(ticket.priority_id || ticket.prioridad);
  const [tecnico, setTecnico] = useState(ticket.assigned_to ? [ticket.assigned_to.id.toString()] : []);
  const [busquedaTecnico, setBusquedaTecnico] = useState('');
  const [tecnicosFiltrados, setTecnicosFiltrados] = useState([]);
  const [todosTecnicos, setTodosTecnicos] = useState([]);
  const [mostrarListaTecnicos, setMostrarListaTecnicos] = useState(false);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);
  const [imageViewer, setImageViewer] = useState(null);

  useEffect(() => {
    cargarTecnicos();
  }, []);

  const cargarTecnicos = async () => {
    try {
      setLoadingTecnicos(true);
      const response = await userService.getUsers({ per_page: 100 });
      if (response.success && response.data && response.data.users) {
        const tecnicosTransformados = response.data.users.map(user => ({
          id: user.id,
          nombre: user.name || user.username || 'Nombre no disponible',
          cargo: user.position || user.role?.name || 'Usuario',
          rolIcono: getRolIcono(user.position || user.role?.name),
          email: user.email || '',
          telefono: user.phone || '',
          departamento: user.department || user.role?.name || 'General',
          activo: user.is_active !== false,
          avatar: user.avatar || getRolIcono(user.position || user.role?.name)
        }));

        setTodosTecnicos(tecnicosTransformados);
        setTecnicosFiltrados(tecnicosTransformados);
      } else {
        setTodosTecnicos([]);
        setTecnicosFiltrados([]);
      }
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
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

  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    if (comentario.trim()) {
      try {
        const response = await ticketService.addCommentToTicket(ticket.id, {
          comment: comentario.trim(),
          is_internal: false
        });

        if (response.success) {
          const comentarioGuardado = {
            fecha: response.data.created_at || new Date().toISOString(),
            autor: response.data.user?.name || 'Técnico Actual',
            texto: comentario.trim()
          };

          const ticketActualizado = {
            ...ticket,
            comments: [...(ticket.comments || []), comentarioGuardado]
          };

          onUpdate(ticketActualizado);
          setComentario('');
        } else {
          alert('Error al guardar el comentario: ' + (response.message || 'Error desconocido'));
        }
      } catch (error) {
        console.error('Error al guardar comentario:', error);
        alert('Error de conexión al guardar el comentario');
      }
    }
  };

  const handleActualizarTicket = () => {
    const nombresTecnicos = tecnico.map(tecnicoId => {
      const tecnicoObj = todosTecnicos.find(t => t.id.toString() === tecnicoId.toString());
      return tecnicoObj ? tecnicoObj.nombre : `Técnico ${tecnicoId}`;
    });

    const ticketActualizado = {
      ...ticket,
      status_id: parseInt(estado),
      priority_id: parseInt(prioridad),
      assigned_to: tecnico.length > 0 ? { id: parseInt(tecnico[0]) } : null,
      fechaUltimaActualizacion: new Date().toISOString().split('T')[0]
    };

    onUpdate(ticketActualizado);
  };

  // Funciones para manejar archivos
  const handleViewFile = (attachment) => {
    // Usar URL relativa gracias al proxy configurado en Vite
    const fileUrl = `/storage/${attachment.file_path}`;

    if (attachment.mime_type?.startsWith('image/')) {
      setImageViewer({ url: fileUrl, name: attachment.original_name });
    } else if (attachment.mime_type === 'application/pdf') {
      window.open(fileUrl, '_blank');
    } else {
      window.open(fileUrl, '_blank');
    }
  };

  const handleDownloadFile = (attachment) => {
    // Usar URL relativa gracias al proxy configurado en Vite
    const fileUrl = `/storage/${attachment.file_path}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = attachment.original_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-600" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-600" />;
    return <File className="w-5 h-5 text-gray-600" />;
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{ticket.title}</h2>
                <p className="text-sm text-slate-600">{ticket.ticket_code}</p>
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
            {/* Información Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Columna Izquierda */}
              <div className="space-y-6">
                {/* Proyecto */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Proyecto</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <button
                        onClick={() => window.open(`/proyectos/${ticket.project?.id}`, '_blank')}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        {ticket.project?.name}
                      </button>
                      <p className="text-xs text-slate-500 mt-1">{ticket.project?.code}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Cliente */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Cliente</span>
                  </div>
                  <p className="text-sm text-slate-900">{ticket.client?.name}</p>
                  <p className="text-xs text-slate-500">{ticket.client?.email}</p>
                </div>

                {/* Tipo y Prioridad */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Tipo</span>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: ticket.ticket_type?.color || '#f59e0b' }}
                    >
                      {ticket.ticket_type?.name}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Prioridad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: ticket.ticket_priority?.color }}
                      ></span>
                      <span className="text-xs text-slate-700">{ticket.ticket_priority?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Estado y Fechas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Estado</span>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: ticket.ticket_state?.color || '#6b7280' }}
                    >
                      {ticket.ticket_state?.name}
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Creado</span>
                    </div>
                    <p className="text-xs text-slate-700">{ticket.created_at}</p>
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-6">
                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 min-h-[120px]">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{ticket.description}</p>
                  </div>
                </div>

                {/* Asignado a */}
                {ticket.assigned_to && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Asignado a</span>
                    </div>
                    <p className="text-sm text-slate-900">{ticket.assigned_to.name}</p>
                    <p className="text-xs text-slate-500">{ticket.assigned_to.email}</p>
                  </div>
                )}

                {/* Creado por */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Creado por</span>
                  </div>
                  <p className="text-sm text-slate-900">{ticket.created_by?.name}</p>
                  <p className="text-xs text-slate-500">{ticket.created_by?.email}</p>
                </div>
              </div>
            </div>

            {/* Archivos Adjuntos */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Archivos Adjuntos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ticket.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.mime_type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {attachment.original_name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatFileSize(attachment.file_size)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewFile(attachment)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          {attachment.mime_type?.startsWith('image/') ? 'Ver' : 'Abrir'}
                        </button>
                        <button
                          onClick={() => handleDownloadFile(attachment)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentarios */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Comentarios</h3>
                <button
                  onClick={handleActualizarTicket}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Actualizar Ticket
                </button>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-4">
                {ticket.comments && ticket.comments.length > 0 ? (
                  ticket.comments.map((comment, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-900">
                            {comment.user?.name || 'Usuario'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-600">{comment.created_at}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic text-center py-8">No hay comentarios aún</p>
                )}
              </div>

              <form onSubmit={handleSubmitComentario} className="border-t border-slate-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Reply className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Agregar Comentario</span>
                </div>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                  className="block w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Escribe un comentario..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar Comentario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewer && (
        <ImageViewer
          imageUrl={imageViewer.url}
          fileName={imageViewer.name}
          onClose={() => setImageViewer(null)}
        />
      )}
    </>
  );
};

export default DetalleTicket;
