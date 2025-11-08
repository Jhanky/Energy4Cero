import { useState, useEffect } from 'react';
import { Wrench, Search, Filter, Plus, Eye, Edit, Trash2, AlertTriangle, CheckCircle, Clock, User, FolderKanban } from 'lucide-react';
import ticketService from '../../../services/ticketService';
import FormTicket from './FormTicket';
import DetalleTicket from './DetalleTicket';
import {
  tiposTicket,
  estadosTicket,
  prioridades,
  obtenerNombreTipoTicket,
  obtenerColorTipoTicket,
  obtenerNombreEstadoTicket,
  obtenerColorEstadoTicket,
  obtenerNombrePrioridad,
  obtenerColorPrioridad,
  calcularTiempoTranscurrido
} from '../../../data/tickets';

const ListaTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    search: '',
    estado: '',
    tipo: '',
    prioridad: '',
    proyecto_id: '',
    cliente_id: '',
    assigned_to: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [mostrarFormTicket, setMostrarFormTicket] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarTickets();
  }, [filtros, paginaActual]);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: paginaActual,
        per_page: 15,
        ...filtros
      };

      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ticketService.getTickets(params);

      if (response.success) {
        setTickets(response.data.data || []);
        setTotalPaginas(response.data.last_page || 1);
      } else {
        setError(response.message || 'Error al cargar tickets');
        setTickets([]);
      }
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setError('Error de conexión al cargar tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPaginaActual(1); // Resetear a primera página cuando cambian filtros
  };

  const handleCrearTicket = (nuevoTicket) => {
    setTickets(prev => [nuevoTicket, ...prev]);
    setMostrarFormTicket(false);
  };

  const handleActualizarTicket = (ticketActualizado) => {
    setTickets(prev => prev.map(t => t.id === ticketActualizado.id ? ticketActualizado : t));
    setTicketSeleccionado(ticketActualizado);
  };

  const handleEliminarTicket = async (ticketId) => {
    if (!confirm('¿Está seguro de que desea eliminar este ticket?')) return;

    try {
      const response = await ticketService.deleteTicket(ticketId);
      if (response.success) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
      } else {
        alert('Error al eliminar el ticket: ' + response.message);
      }
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      alert('Error de conexión al eliminar el ticket');
    }
  };

  const handleCambiarEstado = async (ticketId, nuevoEstado) => {
    try {
      const response = await ticketService.updateTicketStatus(ticketId, { status_id: nuevoEstado });
      if (response.success) {
        setTickets(prev => prev.map(t =>
          t.id === ticketId ? { ...t, ticket_state: response.data.ticket_state } : t
        ));
      } else {
        alert('Error al cambiar estado: ' + response.message);
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error de conexión al cambiar estado');
    }
  };

  const renderFiltros = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, código..."
            value={filtros.search}
            onChange={(e) => handleFiltroChange('search', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Estado */}
        <select
          value={filtros.status_id}
          onChange={(e) => handleFiltroChange('status_id', e.target.value)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los estados</option>
          {estadosTicket.map(estado => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>

        {/* Tipo */}
        <select
          value={filtros.type_id}
          onChange={(e) => handleFiltroChange('type_id', e.target.value)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos los tipos</option>
          {tiposTicket.map(tipo => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nombre}
            </option>
          ))}
        </select>

        {/* Prioridad */}
        <select
          value={filtros.priority_id}
          onChange={(e) => handleFiltroChange('priority_id', e.target.value)}
          className="w-full py-2 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las prioridades</option>
          {prioridades.map(prioridad => (
            <option key={prioridad.id} value={prioridad.id}>
              {prioridad.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de limpiar filtros */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => {
            setFiltros({
              search: '',
              status_id: '',
              type_id: '',
              priority_id: '',
              proyecto_id: '',
              cliente_id: '',
              assigned_to: ''
            });
            setPaginaActual(1);
          }}
          className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium rounded-lg border border-slate-300 hover:bg-slate-50"
        >
          Limpiar Filtros
        </button>

        <div className="text-sm text-slate-600">
          {tickets.length} tickets encontrados
        </div>
      </div>
    </div>
  );

  const renderTicketCard = (ticket) => (
    <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-slate-900">{ticket.ticket_code}</span>
            <span className={`text-xs px-2 py-1 rounded-full`} style={{ backgroundColor: ticket.ticket_state?.color || '#ef4444' }}>
              {ticket.ticket_state?.name || 'Sin estado'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full`} style={{ backgroundColor: ticket.ticket_priority?.color || '#f59e0b' }}>
              {ticket.ticket_priority?.name || 'Sin prioridad'}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2">{ticket.title}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <User className="w-4 h-4" />
              <span>{ticket.client?.name || 'Cliente no disponible'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FolderKanban className="w-4 h-4" />
              <span>{ticket.project?.name || 'Proyecto no disponible'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span>Tipo: <span style={{ color: ticket.ticket_type?.color || '#f59e0b' }}>{ticket.ticket_type?.name || 'Sin tipo'}</span></span>
            <span>Creado: {calcularTiempoTranscurrido(ticket.created_at)}</span>
            {ticket.assigned_to && (
              <span>Asignado a: {ticket.assigned_to?.name || 'Usuario'}</span>
            )}
          </div>

          {ticket.description && (
            <p className="text-sm text-slate-700 line-clamp-2">{ticket.description}</p>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setTicketSeleccionado(ticket)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTicketSeleccionado(ticket);
              setModoEdicion(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEliminarTicket(ticket.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Estado:</span>
          <select
            value={ticket.status_id || ''}
            onChange={(e) => handleCambiarEstado(ticket.id, e.target.value)}
            className="text-xs py-1 px-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            {estadosTicket.map(estado => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>
        </div>

        {ticket.priority_id === 4 && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">CRÍTICO</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPaginacion = () => {
    if (totalPaginas <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
          disabled={paginaActual === 1}
          className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
          const pageNumber = Math.max(1, Math.min(totalPaginas - 4, paginaActual - 2)) + i;
          return (
            <button
              key={pageNumber}
              onClick={() => setPaginaActual(pageNumber)}
              className={`px-3 py-2 text-sm font-medium rounded-lg ${
                paginaActual === pageNumber
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 bg-white border border-slate-300 hover:bg-slate-50'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    );
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-slate-600">Cargando tickets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error al cargar tickets</h3>
        <p className="text-red-700">{error}</p>
        <button
          onClick={cargarTickets}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tickets de Soporte</h2>
            <p className="text-slate-600 mt-1">Gestión completa de tickets técnicos</p>
          </div>
          <button
            onClick={() => setMostrarFormTicket(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ticket
          </button>
        </div>
      </div>

      {/* Filtros */}
      {renderFiltros()}

      {/* Lista de tickets */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay tickets</h3>
          <p className="text-slate-600 mb-4">No se encontraron tickets que coincidan con los filtros aplicados.</p>
          <button
            onClick={() => setMostrarFormTicket(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Crear Primer Ticket
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {tickets.map(renderTicketCard)}
          </div>

          {/* Paginación */}
          {renderPaginacion()}
        </>
      )}

      {/* Formulario de ticket */}
      {mostrarFormTicket && (
        <FormTicket
          onSubmit={handleCrearTicket}
          onCancel={() => setMostrarFormTicket(false)}
        />
      )}

      {/* Detalle de ticket */}
      {ticketSeleccionado && (
        <DetalleTicket
          ticket={ticketSeleccionado}
          onClose={() => {
            setTicketSeleccionado(null);
            setModoEdicion(false);
          }}
          onUpdate={handleActualizarTicket}
          modoEdicion={modoEdicion}
        />
      )}
    </div>
  );
};

export default ListaTickets;
