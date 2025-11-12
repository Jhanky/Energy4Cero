import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Wrench,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Calendar as CalendarIcon,
  X,
  Loader2,
  Upload,
  FileText,
  Paperclip,
  Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import dataService from '../../services/dataService';
import userService from '../../services/userService';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';


// Estilos personalizados para el calendario
const calendarStyles = `
  .event-critical {
    background-color: #ef4444 !important;
    border-color: #dc2626 !important;
    color: white !important;
  }

  .event-high {
    background-color: #f97316 !important;
    border-color: #ea580c !important;
    color: white !important;
  }

  .event-medium {
    background-color: #eab308 !important;
    border-color: #ca8a04 !important;
    color: black !important;
  }

  .event-low {
    background-color: #22c55e !important;
    border-color: #16a34a !important;
    color: white !important;
  }

  .event-default {
    background-color: #6b7280 !important;
    border-color: #4b5563 !important;
    color: white !important;
  }

  .calendar-container .rbc-calendar {
    font-family: inherit;
    border-radius: 8px;
    overflow: hidden;
  }

  .calendar-container .rbc-header {
    padding: 12px 8px;
    font-weight: 600;
    color: #374151;
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .calendar-container .rbc-event {
    border-radius: 4px;
    border: none;
    padding: 2px 6px;
    font-size: 12px;
    line-height: 1.2;
  }

  .calendar-container .rbc-event:hover {
    opacity: 0.8;
  }

  .calendar-container .rbc-today {
    background-color: #f0f9ff !important;
  }

  /* Estilos para vista de semana */
  .calendar-container .rbc-time-view .rbc-header {
    border-bottom: 1px solid #e5e7eb;
    background-color: #f9fafb;
  }

  .calendar-container .rbc-time-view .rbc-time-header-content {
    border-left: 1px solid #e5e7eb;
  }

  .calendar-container .rbc-time-view .rbc-time-header-cell {
    color: #6b7280;
    font-weight: 500;
  }

  .calendar-container .rbc-time-view .rbc-time-slot {
    border-top: 1px solid #f3f4f6;
  }

  .calendar-container .rbc-time-view .rbc-current-time-indicator {
    background-color: #3b82f6;
  }

  /* Estilos para vista de día */
  .calendar-container .rbc-time-view .rbc-day-slot .rbc-time-slot {
    border-top: 1px solid #f3f4f6;
  }

  .calendar-container .rbc-time-view .rbc-day-slot .rbc-time-slot:nth-child(even) {
    background-color: #fafafa;
  }

  /* Mejorar la legibilidad en vistas semana/día */
  .calendar-container .rbc-time-view .rbc-event {
    font-size: 11px;
    padding: 1px 4px;
  }

  .calendar-container .rbc-time-view .rbc-event.rbc-selected {
    outline: 2px solid #3b82f6;
  }

  /* Ocultar la toolbar predeterminada */
  .calendar-container .rbc-toolbar {
    display: none !important;
  }
`;

// Inyectar estilos
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = calendarStyles;
  document.head.appendChild(styleSheet);
}

// Componente de toolbar personalizada para el calendario
// Se define dentro del componente VistaMantenimiento para tener acceso a las funciones de estado
const createCustomToolbar = (setCalendarView, setCurrentDate) => {
  return (toolbarProps) => {
    // Extraer props del toolbar de react-big-calendar
    const { label, onNavigate, view, views } = toolbarProps;

    // Debug: mostrar qué props recibe el toolbar
    console.log('CustomToolbar props:', { label, onNavigate, view, views });

    const goToToday = () => {
      console.log('Navegando a HOY');
      onNavigate('TODAY');
    };

    const goToPrevious = () => {
      console.log('Navegando a ANTERIOR');
      onNavigate('PREV');
    };

    const goToNext = () => {
      console.log('Navegando a SIGUIENTE');
      onNavigate('NEXT');
    };

    const changeView = (newView) => {
      console.log('Cambiando vista a:', newView);
      setCalendarView(newView);
    };

    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        {/* Título del período actual */}
        <div className="text-lg font-semibold text-gray-900">
          {label}
        </div>

        {/* Controles de navegación y vista */}
        <div className="flex items-center gap-2">
          {/* Botones de navegación */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              className="h-8 px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 px-3 text-sm"
            >
              Hoy
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              className="h-8 px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-gray-300 mx-2"></div>

          {/* Selectores de vista */}
          <div className="flex items-center gap-1">
            {views && views.includes('month') && (
              <Button
                variant={view === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('month')}
                className="h-8 px-3 text-sm"
              >
                <CalendarIcon className="w-4 h-4 mr-1" />
                Mes
              </Button>
            )}

            {views && views.includes('week') && (
              <Button
                variant={view === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('week')}
                className="h-8 px-3 text-sm"
              >
                <CalendarDays className="w-4 h-4 mr-1" />
                Semana
              </Button>
            )}

            {views && views.includes('day') && (
              <Button
                variant={view === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeView('day')}
                className="h-8 px-3 text-sm"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Día
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };
};

// Componente Modal de Mantenimiento
const MaintenanceModal = ({
  show,
  mode,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
  availableProjects = [],
  availableUsers = [],
  loadingProjects = false,
  notification,
  setNotification
}) => {
  const [formErrors, setFormErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingEvidences, setExistingEvidences] = useState([]);

  // Estados para búsqueda de participantes (igual que en HitoModal)
  const [busquedaParticipante, setBusquedaParticipante] = useState('');
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [mostrarListaUsuarios, setMostrarListaUsuarios] = useState(false);
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

  // Función para cargar usuarios (igual que en HitoModal)
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
      } else {
        console.warn('La respuesta no contiene datos válidos:', response);
        // Mostrar notificación de error
        setNotification({ type: 'warning', message: 'No se pudieron cargar los usuarios. Puede continuar creando el mantenimiento sin asignar participantes.' });
        // Limpiar notificación después de 5 segundos
        setTimeout(() => setNotification(null), 5000);
        // Usar array vacío si no hay datos válidos
        setTodosUsuarios([]);
        setUsuariosFiltrados([]);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      // Mostrar notificación de error
      setNotification({ type: 'error', message: 'Error al cargar la lista de usuarios. Puede continuar creando el mantenimiento sin asignar participantes.' });
      // Limpiar notificación después de 5 segundos
      setTimeout(() => setNotification(null), 5000);
      // En caso de error, usar array vacío
      setTodosUsuarios([]);
      setUsuariosFiltrados([]);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Cargar usuarios cuando se abre el modal
  useEffect(() => {
    if (show) {
      cargarUsuarios();
    }
  }, [show]);

  // Limpiar errores cuando cambia el modo
  useEffect(() => {
    setFormErrors({});
    if (mode === 'edit' && formData?.maintenance_id) {
      // Cargar evidencias existentes
      setExistingEvidences(formData.evidences || []);
    } else {
      setExistingEvidences([]);
    }
    setUploadedFiles([]);
    // Limpiar búsqueda de participantes
    setBusquedaParticipante('');
    setUsuariosFiltrados(todosUsuarios);
    setMostrarListaUsuarios(false);
  }, [mode, formData, todosUsuarios]);

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  // Funciones para manejar participantes (igual que en HitoModal)
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

  const seleccionarParticipante = (usuario) => {
    const participanteId = usuario.id.toString();
    if (!formData.participants?.includes(participanteId)) {
      const nuevosParticipantes = [...(formData.participants || []), participanteId];
      onFormChange({ ...formData, participants: nuevosParticipantes });
    }
    setBusquedaParticipante('');
    setMostrarListaUsuarios(false);
  };

  const eliminarParticipante = (participanteId) => {
    const nuevosParticipantes = formData.participants?.filter(p => p !== participanteId) || [];
    onFormChange({ ...formData, participants: nuevosParticipantes });
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map(file => ({
      file,
      description: '',
      id: Date.now() + Math.random()
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeUploadedFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDescription = (fileId, description) => {
    setUploadedFiles(prev =>
      prev.map(f => f.id === fileId ? { ...f, description } : f)
    );
  };

  const removeExistingEvidence = (evidenceId) => {
    setExistingEvidences(prev => prev.filter(e => e.evidence_id !== evidenceId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {mode === 'create' && 'Nuevo Mantenimiento'}
              {mode === 'edit' && 'Editar Mantenimiento'}
              {mode === 'view' && 'Detalles del Mantenimiento'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.title ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                  placeholder="Ej: Mantenimiento Preventivo - Paneles Solares"
                />
                {formErrors.title && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.title[0]}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={mode === 'view'}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descripción detallada del mantenimiento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo *
                </label>
                <select
                  name="type"
                  value={formData.type || ''}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.type ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="preventive">Preventivo</option>
                  <option value="corrective">Correctivo</option>
                  <option value="predictive">Predictivo</option>
                  <option value="condition_based">Basado en condición</option>
                </select>
                {formErrors.type && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.type[0]}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prioridad *
                </label>
                <select
                  name="priority"
                  value={formData.priority || ''}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.priority ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">Seleccionar prioridad</option>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
                {formErrors.priority && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.priority[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fecha Programada *
                </label>
                <input
                  type="date"
                  name="scheduled_date"
                  value={formData.scheduled_date || ''}
                  onChange={(e) => handleInputChange('scheduled_date', e.target.value)}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.scheduled_date ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.scheduled_date && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.scheduled_date[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hora Programada *
                </label>
                <input
                  type="time"
                  name="scheduled_time"
                  value={formData.scheduled_time || ''}
                  onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                  disabled={mode === 'view'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formErrors.scheduled_time ? 'border-red-300 bg-red-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.scheduled_time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.scheduled_time[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Proyecto
                </label>
                {loadingProjects ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-xs text-slate-500">Cargando...</span>
                  </div>
                ) : (
                  <select
                    name="project_id"
                    value={formData.project_id || ''}
                    onChange={(e) => handleInputChange('project_id', e.target.value)}
                    disabled={mode === 'view'}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Seleccionar proyecto</option>
                    {availableProjects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </option>
                    ))}
                  </select>
                )}
              </div>



              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Participantes
                </label>
                <div className="relative usuarios-dropdown">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={busquedaParticipante}
                      onChange={(e) => handleBusquedaParticipante(e.target.value)}
                      placeholder={loadingUsuarios ? "Cargando usuarios..." : "Buscar usuario por nombre, cargo o departamento..."}
                      disabled={mode === 'view' || loadingUsuarios}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        loadingUsuarios ? 'bg-slate-50 cursor-not-allowed' : 'border-slate-300'
                      }`}
                      onFocus={() => setMostrarListaUsuarios(busquedaParticipante.length > 0)}
                    />
                    {loadingUsuarios && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
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
                          <span className="text-2xl">{usuario.rolIcono || getRolIcono('usuario')}</span>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{usuario.nombre}</p>
                            <p className="text-sm text-slate-500">{usuario.cargo} • {usuario.departamento}</p>
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

                {formData.participants && formData.participants.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-slate-700">
                      Participantes seleccionados ({formData.participants.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.participants.map((participanteId, index) => {
                        const usuario = availableUsers.find(u => u.id.toString() === participanteId.toString());
                        const nombreMostrar = usuario ? usuario.name : `Usuario ${participanteId}`;
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm"
                          >
                            <User className="w-4 h-4" />
                            {nombreMostrar}
                            <button
                              type="button"
                              onClick={() => eliminarParticipante(participanteId)}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  disabled={mode === 'view'}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Notas adicionales"
                />
              </div>
            </div>

            {/* Documentos/Evidencias */}
            {mode !== 'view' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Documentos y Evidencias
                </label>

                {/* Subida de nuevos archivos */}
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Archivos subidos recientemente */}
                {uploadedFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Archivos a subir:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((fileData) => (
                        <div key={fileData.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{fileData.file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(fileData.file.size)}</p>
                          </div>
                          <input
                            type="text"
                            placeholder="Descripción (opcional)"
                            value={fileData.description}
                            onChange={(e) => updateFileDescription(fileData.id, e.target.value)}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadedFile(fileData.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidencias existentes (solo en modo edición) */}
                {mode === 'edit' && existingEvidences.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos existentes:</h4>
                    <div className="space-y-2">
                      {existingEvidences.map((evidence) => (
                        <div key={evidence.evidence_id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Paperclip className="w-5 h-5 text-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{evidence.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(evidence.file_size)} • {evidence.description || 'Sin descripción'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExistingEvidence(evidence.evidence_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mostrar evidencias en modo vista */}
            {mode === 'view' && existingEvidences.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Documentos Adjuntos
                </label>
                <div className="space-y-2">
                  {existingEvidences.map((evidence) => (
                    <div key={evidence.evidence_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Paperclip className="w-5 h-5 text-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{evidence.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(evidence.file_size)} • {evidence.description || 'Sin descripción'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode !== 'view' && (
              <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Mantenimiento' : 'Actualizar Mantenimiento')}
                </button>
              </div>
            )}

            {mode === 'view' && (
              <div className="flex justify-end pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                >
                  Cerrar
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente Modal de Eliminación de Mantenimiento
const MaintenanceDeleteModal = ({ show, maintenance, onConfirm, onClose, isDeleting }) => {
  if (!show || !maintenance) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
            Eliminar Mantenimiento
          </h3>

          <p className="text-sm text-gray-600 text-center mb-6">
            ¿Estás seguro de que deseas eliminar el mantenimiento <strong>"{maintenance.title}"</strong>?
            Esta acción no se puede deshacer.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isDeleting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VistaMantenimiento = () => {
  const { hasPermission, user } = useAuth();
  const [view, setView] = useState('calendar'); // 'calendar', 'list', 'form', 'detail'
  const [maintenances, setMaintenances] = useState([]);
  const [currentMaintenance, setCurrentMaintenance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingCalendarDetail, setLoadingCalendarDetail] = useState(false);
  const [stats, setStats] = useState(null);
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week'
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados para modales
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [maintenanceFormData, setMaintenanceFormData] = useState({});
  const [maintenanceModalMode, setMaintenanceModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Datos mock para selects
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Configurar el localizer para react-big-calendar
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
      es: es,
    },
  });

  const canCreate = hasPermission('support.create');
  const canUpdate = hasPermission('support.update');
  const canDelete = hasPermission('support.delete');
  const canRead = hasPermission('support.read');

  useEffect(() => {
    if (canRead) {
      fetchMaintenances();
      fetchStats();
      fetchAvailableData();
    }
  }, [canRead]);

  const fetchAvailableData = async () => {
    setLoadingProjects(true);
    try {
      // Obtener proyectos disponibles
      const projectsResponse = await dataService.getProjects({ per_page: 100 });
      if (projectsResponse.success && projectsResponse.data?.data) {
        // Filtrar proyectos únicos por ID y mapear
        const uniqueProjects = projectsResponse.data.data
          .filter((project, index, self) =>
            index === self.findIndex(p => p.id === project.id)
          )
          .map(project => ({
            id: project.id,
            name: project.name,
            code: project.code || `PROJ-${project.id.toString().padStart(4, '0')}`
          }));
        setAvailableProjects(uniqueProjects);
      }

      // Obtener usuarios disponibles
      const usersResponse = await dataService.getUsers({ per_page: 100 });
      if (usersResponse.success && usersResponse.data?.data) {
        setAvailableUsers(usersResponse.data.data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        })));
      }
    } catch (error) {
      console.error('Error al obtener datos disponibles:', error);
      // Fallback a datos mock si falla la API
      setAvailableProjects([
        { id: 1, name: 'Proyecto Solar Residencial', code: 'PSR-2025-001' },
        { id: 2, name: 'Proyecto Industrial', code: 'PI-2025-002' },
        { id: 3, name: 'Sistema Fotovoltaico Empresarial', code: 'SFE-2025-003' },
        { id: 4, name: 'Sistema de Respaldo Hospital', code: 'SRH-2025-004' },
        { id: 5, name: 'Subestación Eléctrica', code: 'SE-2025-005' },
        { id: 6, name: 'Centro de Monitoreo', code: 'CM-2025-006' },
        { id: 7, name: 'Parque Eólico Costa', code: 'PEC-2025-007' }
      ]);

      setAvailableUsers([
        { id: 1, name: 'Juan Pérez' },
        { id: 2, name: 'María García' },
        { id: 3, name: 'Carlos Rodríguez' },
        { id: 4, name: 'Ana López' },
        { id: 5, name: 'Roberto Sánchez' },
        { id: 6, name: 'Patricia Morales' },
        { id: 7, name: 'Diego Fernández' }
      ]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const response = await dataService.getMaintenances();
      if (response.success && response.data?.maintenances) {
        setMaintenances(response.data.maintenances);
      } else {
        console.error('Error al obtener mantenimientos:', response.message);
        setMaintenances([]);
      }
    } catch (error) {
      console.error('Error al obtener mantenimientos:', error);
      setMaintenances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dataService.getMaintenanceStatistics();
      if (response.success && response.data?.statistics) {
        setStats(response.data.statistics);
      } else {
        console.error('Error al obtener estadísticas:', response.message);
        setStats(null);
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setStats(null);
    }
  };

  const handleCreateMaintenance = () => {
    setMaintenanceFormData({
      title: '',
      description: '',
      type: '',
      priority: '',
      scheduled_date: '',
      scheduled_time: '',
      project_id: '',
      selectedProject: null,
      notes: ''
    });
    setMaintenanceModalMode('create');
    setShowMaintenanceModal(true);
  };

  const handleEditMaintenance = (maintenance) => {
    // Formatear la fecha para que sea compatible con input type="date" (yyyy-MM-dd)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      // Si ya está en formato yyyy-MM-dd, devolverlo tal cual
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
      // Si viene en formato ISO, extraer solo la fecha
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setMaintenanceFormData({
      maintenance_id: maintenance.maintenance_id,
      title: maintenance.title || '',
      description: maintenance.description || '',
      type: maintenance.type || '',
      priority: maintenance.priority || '',
      scheduled_date: formatDateForInput(maintenance.scheduled_date) || '',
      scheduled_time: maintenance.scheduled_time || '',
      project_id: maintenance.project?.id || '',
      selectedProject: maintenance.project ? {
        id: maintenance.project.id,
        name: maintenance.project.name,
        code: maintenance.project.code || `PROJ-${maintenance.project.id.toString().padStart(4, '0')}`
      } : null,
      notes: maintenance.notes || '',
      evidences: maintenance.evidences || []
    });
    setMaintenanceModalMode('edit');
    setShowMaintenanceModal(true);
  };

  const handleViewMaintenance = (maintenance) => {
    setMaintenanceFormData({
      maintenance_id: maintenance.maintenance_id,
      title: maintenance.title || '',
      description: maintenance.description || '',
      type: maintenance.type || '',
      priority: maintenance.priority || '',
      scheduled_date: maintenance.scheduled_date || '',
      scheduled_time: maintenance.scheduled_time || '',
      project_id: maintenance.project?.id || '',
      notes: maintenance.notes || '',
      evidences: maintenance.evidences || []
    });
    setMaintenanceModalMode('view');
    setShowMaintenanceModal(true);
  };

  const handleDeleteMaintenance = (maintenance) => {
    setCurrentMaintenance(maintenance);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await dataService.deleteMaintenance(currentMaintenance.maintenance_id);
      if (response.success) {
        setMaintenances(prev => prev.filter(m => m.maintenance_id !== currentMaintenance.maintenance_id));
        setShowDeleteModal(false);
        setCurrentMaintenance(null);
        // Actualizar estadísticas después de eliminar
        fetchStats();
      } else {
        alert('Error al eliminar mantenimiento: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al eliminar mantenimiento: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (maintenance) => {
    const newStatus = maintenance.status === 'completed' ? 'scheduled' : 'completed';
    try {
      const response = await dataService.updateMaintenanceStatus(maintenance.maintenance_id, newStatus);
      if (response.success) {
        setMaintenances(prev =>
          prev.map(m =>
            m.maintenance_id === maintenance.maintenance_id
              ? { ...m, status: newStatus }
              : m
          )
        );
        if (currentMaintenance?.maintenance_id === maintenance.maintenance_id) {
          setCurrentMaintenance({ ...currentMaintenance, status: newStatus });
        }
        // Actualizar estadísticas después del cambio de estado
        fetchStats();
      } else {
        alert('Error al actualizar estado: ' + (response.message || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.target);
      const maintenanceData = {
        title: formData.get('title'),
        description: formData.get('description'),
        type: formData.get('type'),
        priority: formData.get('priority'),
        scheduled_date: formData.get('scheduled_date'),
        scheduled_time: formData.get('scheduled_time'),
        project_id: formData.get('project_id') || null,
        participants: maintenanceFormData.participants || null,
        notes: formData.get('notes') || null
      };

      let result;
      if (maintenanceModalMode === 'edit') {
        result = await dataService.updateMaintenance(maintenanceFormData.maintenance_id, maintenanceData);
        if (result.success) {
          setMaintenances(prev =>
            prev.map(m =>
              m.maintenance_id === maintenanceFormData.maintenance_id ? result.data.maintenance : m
            )
          );
        }
      } else {
        result = await dataService.createMaintenance(maintenanceData);
        if (result.success) {
          setMaintenances(prev => [result.data.maintenance, ...prev]);
        }
      }

      if (result.success) {
        setShowMaintenanceModal(false);
        setMaintenanceFormData({});
        // Actualizar estadísticas después de crear/actualizar
        fetchStats();
      } else {
        alert(result.message || 'Error al guardar mantenimiento');
      }
    } catch (error) {
      alert('Error al guardar mantenimiento: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowMaintenanceModal(false);
    setMaintenanceFormData({});
  };

  const handleBackToCalendar = () => {
    setView('calendar');
    setCurrentMaintenance(null);
  };

  const getEventClassName = (maintenance) => {
    switch (maintenance.priority) {
      case 'critical': return 'event-critical';
      case 'high': return 'event-high';
      case 'medium': return 'event-medium';
      case 'low': return 'event-low';
      default: return 'event-default';
    }
  };

  // Convertir mantenimientos a eventos del calendario
  const calendarEvents = maintenances.map(maintenance => {
    const eventDate = maintenance.scheduled_time
      ? new Date(`${maintenance.scheduled_date}T${maintenance.scheduled_time}`)
      : new Date(maintenance.scheduled_date);

    return {
      id: maintenance.maintenance_id,
      title: maintenance.title,
      start: eventDate,
      end: eventDate,
      resource: maintenance,
      className: getEventClassName(maintenance),
    };
  });

  const fetchMaintenanceDetail = async (maintenanceId) => {
    setLoadingDetail(true);
    try {
      const response = await dataService.getMaintenance(maintenanceId);
      if (response.success && response.data?.maintenance) {
        setCurrentMaintenance(response.data.maintenance);
        setView('detail');
      } else {
        console.error('Error al obtener detalles del mantenimiento:', response.message);
        setNotification({
          type: 'error',
          message: 'Error al cargar los detalles del mantenimiento'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error al obtener detalles del mantenimiento:', error);
      setNotification({
        type: 'error',
        message: 'Error al cargar los detalles del mantenimiento'
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setLoadingDetail(false);
      setLoadingCalendarDetail(false);
    }
  };

  const handleEventClick = (event) => {
    const maintenanceId = event.resource.maintenance_id;
    setLoadingCalendarDetail(true);
    fetchMaintenanceDetail(maintenanceId);
  };

  const EventComponent = ({ event }) => {
    const maintenance = event.resource;
    return (
      <div className="p-1 text-xs">
        <div className="flex items-center gap-1">
          {getTypeIcon(maintenance.type)}
          <span className="font-medium truncate">{maintenance.title}</span>
        </div>
        {maintenance.scheduled_time && (
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            <span className="truncate">{maintenance.scheduled_time}</span>
          </div>
        )}
        {maintenance.assigned_to && (
          <div className="flex items-center gap-1 mt-1">
            <User className="w-3 h-3" />
            <span className="truncate">{maintenance.assigned_to.name}</span>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'preventive': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'corrective': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'predictive': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'condition_based': return <AlertTriangle className="w-4 h-4 text-purple-600" />;
      default: return <Wrench className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!canRead) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Acceso denegado</h3>
          <p className="text-slate-600">No tiene permiso para ver los mantenimientos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
          notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
          notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
          notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
          'bg-blue-100 border border-blue-400 text-blue-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {notification.type === 'success' ? '✅' :
               notification.type === 'error' ? '❌' :
               notification.type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Mantenimiento</h1>
            <p className="text-slate-600">Programa y realiza seguimiento de mantenimientos programados</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'calendar' ? "default" : "outline"}
              size="sm"
              onClick={() => setView('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendario
            </Button>
            <Button
              variant={view === 'list' ? "default" : "outline"}
              size="sm"
              onClick={() => setView('list')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Lista
            </Button>
            <Button
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          {canCreate && (
            <Button onClick={handleCreateMaintenance}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Mantenimiento
            </Button>
          )}
        </div>
      </div>



      {/* Contenido principal */}
      {view === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle>Calendario de Mantenimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12" style={{ height: '600px' }}>
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando mantenimientos...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="calendar-container relative" style={{ height: '600px' }}>
                  <BigCalendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    culture="es"
                    messages={{
                      allDay: 'Todo el día',
                      previous: 'Anterior',
                      next: 'Siguiente',
                      today: 'Hoy',
                      month: 'Mes',
                      week: 'Semana',
                      day: 'Día',
                      agenda: 'Agenda',
                      date: 'Fecha',
                      time: 'Hora',
                      event: 'Evento',
                      noEventsInRange: 'No hay mantenimientos en este período.',
                      showMore: (total) => `+ Ver ${total} más`,
                    }}
                    onSelectEvent={handleEventClick}
                    components={{
                      event: EventComponent,
                      toolbar: createCustomToolbar(setCalendarView, setCurrentDate),
                    }}
                    eventPropGetter={(event) => ({
                      className: event.className,
                    })}
                    views={['month', 'week', 'day']}
                    view={calendarView}
                    onView={setCalendarView}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    popup
                    selectable
                  />

                  {/* Overlay de carga para detalles del calendario */}
                  {loadingCalendarDetail && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando detalles del mantenimiento...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Leyenda de colores */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Crítico</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span>Alto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span>Medio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Bajo</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Mantenimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenances.map((maintenance) => (
                <div key={maintenance.maintenance_id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(maintenance.type)}
                        <h3 className="font-medium text-gray-900">{maintenance.title}</h3>
                        <Badge className={getStatusColor(maintenance.status)}>
                          {maintenance.status}
                        </Badge>
                        <Badge className={getPriorityColor(maintenance.priority)}>
                          {maintenance.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{maintenance.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(maintenance.scheduled_date).toLocaleDateString()}
                          {maintenance.scheduled_time && ` ${maintenance.scheduled_time}`}
                        </span>
                        {maintenance.project && (
                          <span>Proyecto: {maintenance.project.name}</span>
                        )}
                        {maintenance.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {maintenance.assigned_to.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewMaintenance(maintenance)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMaintenance(maintenance)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMaintenance(maintenance)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {currentMaintenance ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Formulario de Mantenimiento</h3>
              <p className="text-gray-600 mb-4">
                Aquí se mostrará el formulario para crear/editar mantenimientos.
              </p>
              <p className="text-sm text-gray-500">
                Funcionalidad en desarrollo - Próximamente disponible
              </p>
              <Button onClick={handleBackToCalendar} className="mt-4">
                Volver al Calendario
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'detail' && (
        <div className="max-w-6xl mx-auto">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando detalles del mantenimiento...</p>
              </div>
            </div>
          ) : currentMaintenance && (
            <div className="space-y-6">
              {/* Header Principal */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="w-8 h-8 text-white">
                          {getTypeIcon(currentMaintenance.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                          {currentMaintenance.title}
                        </h1>
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`${getStatusColor(currentMaintenance.status)} px-3 py-1`}>
                            {currentMaintenance.status}
                          </Badge>
                          <Badge className={`${getPriorityColor(currentMaintenance.priority)} px-3 py-1`}>
                            {currentMaintenance.priority}
                          </Badge>
                        </div>
                        {currentMaintenance.description && (
                          <p className="text-gray-600 text-base leading-relaxed">
                            {currentMaintenance.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Botones de acciones en el header */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" onClick={handleBackToCalendar} className="px-4">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Volver al Calendario
                      </Button>
                      {canUpdate && (
                        <Button onClick={() => handleEditMaintenance(currentMaintenance)} className="px-4">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar Mantenimiento
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteMaintenance(currentMaintenance)}
                          className="px-4"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card de Programación */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Programación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Fecha Programada</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {new Date(currentMaintenance.scheduled_date).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    {currentMaintenance.scheduled_time && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Hora Programada</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {currentMaintenance.scheduled_time}
                        </p>
                      </div>
                    )}

                    {/* Detalles dentro de Programación */}
                    <div className="border-t pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Tipo de Mantenimiento</label>
                          <div className="flex items-center gap-2 mt-1">
                            {getTypeIcon(currentMaintenance.type)}
                            <span className="capitalize font-medium text-gray-900">
                              {currentMaintenance.type === 'preventive' && 'Preventivo'}
                              {currentMaintenance.type === 'corrective' && 'Correctivo'}
                              {currentMaintenance.type === 'predictive' && 'Predictivo'}
                              {currentMaintenance.type === 'condition_based' && 'Basado en condición'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Prioridad</label>
                          <Badge className={`${getPriorityColor(currentMaintenance.priority)} mt-1 px-3 py-1`}>
                            {currentMaintenance.priority === 'low' && 'Baja'}
                            {currentMaintenance.priority === 'medium' && 'Media'}
                            {currentMaintenance.priority === 'high' && 'Alta'}
                            {currentMaintenance.priority === 'critical' && 'Crítica'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Card de Proyecto */}
                {currentMaintenance.project && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
                        Proyecto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Información básica del proyecto */}
                      <div>
                        <p className="text-lg font-semibold text-gray-900 mb-1">
                          {currentMaintenance.project.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Código: {currentMaintenance.project.code || `PROJ-${currentMaintenance.project.id.toString().padStart(4, '0')}`}
                        </p>
                      </div>

                      {/* Información del Cliente dentro de Proyecto */}
                      {currentMaintenance.project?.additional_info?.client && (
                        <>
                          <div className="border-t pt-4">
                            <div className="space-y-3">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Cliente</label>
                                <p className="text-base font-semibold text-gray-900">
                                  {currentMaintenance.project.additional_info.client.name}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">Dirección</label>
                                <p className="text-sm text-gray-700">
                                  {currentMaintenance.project.additional_info.client.address || 'No especificada'}
                                </p>
                                {(currentMaintenance.project.additional_info.client.city || currentMaintenance.project.additional_info.client.department) && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {[currentMaintenance.project.additional_info.client.city, currentMaintenance.project.additional_info.client.department].filter(Boolean).join(', ')}
                                  </p>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Email</label>
                                  <p className="text-sm text-gray-700">
                                    {currentMaintenance.project.additional_info.client.email || 'No especificado'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                                  <p className="text-sm text-gray-700">
                                    {currentMaintenance.project.additional_info.client.phone || 'No especificado'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Potencia Instalada dentro de Proyecto */}
                      {currentMaintenance.project?.additional_info?.installed_power && (
                        <>
                          <div className="border-t pt-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500 mb-3 block">Potencia Instalada</label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {currentMaintenance.project.additional_info.installed_power.dc_kw && (
                                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                                    <p className="text-lg font-bold text-blue-600">
                                      {currentMaintenance.project.additional_info.installed_power.dc_kw}
                                    </p>
                                    <p className="text-xs text-blue-700 font-medium">kW DC</p>
                                  </div>
                                )}
                                {currentMaintenance.project.additional_info.installed_power.ac_kw && (
                                  <div className="text-center p-2 bg-green-50 rounded-lg">
                                    <p className="text-lg font-bold text-green-600">
                                      {currentMaintenance.project.additional_info.installed_power.ac_kw}
                                    </p>
                                    <p className="text-xs text-green-700 font-medium">kW AC</p>
                                  </div>
                                )}
                                {currentMaintenance.project.additional_info.installed_power.nominal_power && (
                                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                                    <p className="text-lg font-bold text-purple-600">
                                      {currentMaintenance.project.additional_info.installed_power.nominal_power}
                                    </p>
                                    <p className="text-xs text-purple-700 font-medium">kW Nominal</p>
                                  </div>
                                )}
                                {currentMaintenance.project.additional_info.installed_power.total_panels && (
                                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                                    <p className="text-lg font-bold text-orange-600">
                                      {currentMaintenance.project.additional_info.installed_power.total_panels}
                                    </p>
                                    <p className="text-xs text-orange-700 font-medium">Paneles</p>
                                  </div>
                                )}
                                {currentMaintenance.project.additional_info.installed_power.total_inverters && (
                                  <div className="text-center p-2 bg-red-50 rounded-lg">
                                    <p className="text-lg font-bold text-red-600">
                                      {currentMaintenance.project.additional_info.installed_power.total_inverters}
                                    </p>
                                    <p className="text-xs text-red-700 font-medium">Inversores</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Card de Equipos Instalados - Más compacto */}
                {currentMaintenance.project?.additional_info?.installed_equipment && currentMaintenance.project.additional_info.installed_equipment.length > 0 && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-indigo-600" />
                        Equipos Instalados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {currentMaintenance.project.additional_info.installed_equipment.map((equipmentGroup, index) => {
                          const getEquipmentTypeName = (type) => {
                            switch (type) {
                              case 'panel': return 'Paneles Solares';
                              case 'inverter': return 'Inversores';
                              case 'battery': return 'Baterías';
                              case 'structure': return 'Estructuras';
                              case 'cable': return 'Cableado';
                              case 'protector': return 'Protectores';
                              default: return type || 'Otros Equipos';
                            }
                          };

                          return (
                            <div key={index}>
                              <h4 className="font-semibold text-gray-900 mb-2 capitalize text-sm">
                                {getEquipmentTypeName(equipmentGroup.type)}
                              </h4>
                              <div className="space-y-2">
                                {equipmentGroup.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="bg-gray-50 px-3 py-3 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900">
                                      {item.brand}
                                    </span>
                                    <span className="text-gray-600 font-medium">
                                      Cantidad: {item.quantity}
                                    </span>
                                  </div>
                                  {item.model && (
                                    <div className="text-sm text-gray-700 mb-1">
                                      <span className="font-medium">Modelo:</span> {item.model}
                                    </div>
                                  )}
                                  {(item.power_info || item.capacity_info) && (
                                    <div className="text-sm text-gray-700">
                                      <span className="font-medium">
                                        {item.power_info ? 'Potencia:' : 'Capacidad:'}
                                      </span>{' '}
                                      {item.power_info || item.capacity_info}
                                    </div>
                                  )}
                                </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Participantes */}
              {currentMaintenance.participant_users && currentMaintenance.participant_users.length > 0 && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Participantes ({currentMaintenance.participant_users.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentMaintenance.participant_users.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{participant.name}</p>
                            <p className="text-sm text-gray-600">{participant.position || 'Sin cargo asignado'}</p>
                            <p className="text-xs text-gray-500">{participant.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Notas Adicionales */}
              {currentMaintenance.notes && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Notas Adicionales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {currentMaintenance.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Documentos Adjuntos */}
              {currentMaintenance.evidences && currentMaintenance.evidences.length > 0 && (
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-blue-600" />
                      Documentos Adjuntos ({currentMaintenance.evidences.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentMaintenance.evidences.map((evidence) => (
                        <div key={evidence.evidence_id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Paperclip className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {evidence.file_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {evidence.description || 'Sin descripción'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}


            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <MaintenanceModal
        show={showMaintenanceModal}
        mode={maintenanceModalMode}
        formData={maintenanceFormData}
        onFormChange={setMaintenanceFormData}
        onSubmit={handleFormSubmit}
        onClose={handleCloseModal}
        isSubmitting={isSubmitting}
        availableProjects={availableProjects}
        availableUsers={availableUsers}
        loadingProjects={loadingProjects}
        notification={notification}
        setNotification={setNotification}
      />

      <MaintenanceDeleteModal
        show={showDeleteModal}
        maintenance={currentMaintenance}
        onConfirm={handleConfirmDelete}
        onClose={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
      />


    </div>
  );
};

export default VistaMantenimiento;
