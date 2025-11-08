import { useState, useEffect } from 'react';
import { Wrench, MessageSquare, Clock, CheckCircle, AlertTriangle, TrendingUp, Users, Star, Plus, FolderKanban } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { 
  ticketsEjemplo, 
  pqrsEjemplo, 
  tiposTicket,
  estadosTicket,
  tiposPQR,
  obtenerNombreTipoTicket,
  obtenerColorTipoTicket,
  obtenerNombreEstadoTicket,
  obtenerColorEstadoTicket,
  obtenerNombreTipoPQR,
  obtenerColorTipoPQR,
  obtenerIconoTipoPQR,
  obtenerNombrePrioridad,
  obtenerColorPrioridad,
  calcularTiempoTranscurrido,
  verificarSLA
} from '../../../data/tickets';
import proyectosService from '../../../services/proyectosService';
import FormTicket from './FormTicket';
import FormPQR from './FormPQR';
import DetalleTicket from './DetalleTicket';
import DetallePQR from './DetallePQR';

const VistaServicioTecnico = () => {
  const [vistaActiva, setVistaActiva] = useState('resumen');
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [pqrSeleccionado, setPqrSeleccionado] = useState(null);
  const [mostrarFormTicket, setMostrarFormTicket] = useState(false);
  const [mostrarFormPQR, setMostrarFormPQR] = useState(false);
  
  // Estado para almacenar los tickets y PQRs actuales
  const [tickets, setTickets] = useState(ticketsEjemplo);
  const [pqrs, setPqrs] = useState(pqrsEjemplo);

  // Calcular KPIs
  const ticketsAbiertos = tickets.filter(t => [1, 2, 3, 4].includes(t.estado)).length;
  const ticketsResueltos = tickets.filter(t => t.estado === 5).length;
  const ticketsCriticos = tickets.filter(t => t.prioridad === 4 && [1, 2].includes(t.estado)).length;
  
  const tiempoPromedioResolucion = tickets
    .filter(t => t.tiempoResolucion)
    .reduce((sum, t) => sum + t.tiempoResolucion, 0) / 
    tickets.filter(t => t.tiempoResolucion).length || 0;

  const satisfaccionPromedio = tickets
    .filter(t => t.satisfaccion)
    .reduce((sum, t) => sum + t.satisfaccion, 0) / 
    tickets.filter(t => t.satisfaccion).length || 0;

  const pqrsAbiertas = pqrs.filter(p => [1, 2, 3].includes(p.estado)).length;
  const pqrsCerradas = pqrs.filter(p => p.estado === 5).length;
  
  const satisfaccionPQRPromedio = pqrs
    .filter(p => p.satisfaccionRespuesta)
    .reduce((sum, p) => sum + p.satisfaccionRespuesta, 0) / 
    pqrs.filter(p => p.satisfaccionRespuesta).length || 0;

  // Datos para gráficos
  const ticketsPorTipo = tiposTicket.map(tipo => ({
    nombre: tipo.nombre,
    cantidad: tickets.filter(t => t.tipo === tipo.id).length,
    color: tipo.color
  })).filter(d => d.cantidad > 0);

  const ticketsPorEstado = estadosTicket.map(estado => ({
    nombre: estado.nombre,
    cantidad: tickets.filter(t => t.estado === estado.id).length,
    color: estado.color
  })).filter(d => d.cantidad > 0);

  const pqrsPorTipo = tiposPQR.map(tipo => ({
    nombre: tipo.nombre,
    cantidad: pqrs.filter(p => p.tipo === tipo.id).length,
    color: tipo.color
  })).filter(d => d.cantidad > 0);

  const evolucionMensual = [
    { mes: 'Jun', tickets: 5, pqrs: 2, resueltos: 3 },
    { mes: 'Jul', tickets: 7, pqrs: 3, resueltos: 5 },
    { mes: 'Ago', tickets: 6, pqrs: 2, resueltos: 6 },
    { mes: 'Sep', tickets: 8, pqrs: 4, resueltos: 7 },
    { mes: 'Oct', tickets: 3, pqrs: 2, resueltos: 1 }
  ];

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const manejarCrearTicket = (nuevoTicket) => {
    setTickets(prev => [nuevoTicket, ...prev]);
    setMostrarFormTicket(false);
  };

  const manejarCrearPQR = (nuevaPQR) => {
    setPqrs(prev => [nuevaPQR, ...prev]);
    setMostrarFormPQR(false);
  };

  const manejarActualizarTicket = (ticketActualizado) => {
    setTickets(prev => prev.map(t => t.id === ticketActualizado.id ? ticketActualizado : t));
    setTicketSeleccionado(ticketActualizado);
  };

  const manejarActualizarPQR = (pqrActualizado) => {
    setPqrs(prev => prev.map(p => p.id === pqrActualizado.id ? pqrActualizado : p));
    setPqrSeleccionado(pqrActualizado);
  };

  const renderResumen = () => (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tickets Abiertos</p>
            <Wrench className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{ticketsAbiertos}</p>
          <p className="text-sm text-slate-500 mt-1">{ticketsCriticos} críticos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Tiempo Promedio Resolución</p>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{Math.round(tiempoPromedioResolucion)}h</p>
          <p className="text-sm text-slate-500 mt-1">últimos 30 días</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">PQRs Activas</p>
            <MessageSquare className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{pqrsAbiertas}</p>
          <p className="text-sm text-slate-500 mt-1">{pqrsCerradas} cerradas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-600">Satisfacción Cliente</p>
            <Star className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{satisfaccionPromedio.toFixed(1)}/5</p>
          <p className="text-sm text-slate-500 mt-1">{Math.round(satisfaccionPromedio * 20)}% satisfacción</p>
        </div>
      </div>

      {/* Tickets Críticos */}
      {ticketsCriticos > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Tickets Críticos Requieren Atención Inmediata ({ticketsCriticos})
          </h3>
          <div className="space-y-3">
            {tickets
              .filter(t => t.prioridad === 4 && [1, 2].includes(t.estado))
              .map(ticket => (
                <div key={ticket.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{ticket.titulo}</p>
                      <p className="text-sm text-slate-600 mt-1">{ticket.proyectoNombre} - {ticket.cliente}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                          {obtenerNombreTipoTicket(ticket.tipo)}
                        </span>
                        <span className="text-xs text-slate-600">
                          Creado hace {calcularTiempoTranscurrido(ticket.fechaCreacion)}
                        </span>
                        <span className="text-xs text-slate-600">
                          Técnicos: {ticket.tecnicoAsignado}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setTicketSeleccionado(ticket)}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Ver Detalle
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tickets por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketsPorTipo}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nombre, cantidad }) => `${nombre}: ${cantidad}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="cantidad"
              >
                {ticketsPorTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tickets por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ticketsPorEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                {ticketsPorEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolución Mensual */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolución Mensual</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={evolucionMensual}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} name="Tickets Creados" />
            <Line type="monotone" dataKey="pqrs" stroke="#f59e0b" strokeWidth={3} name="PQRs Recibidas" />
            <Line type="monotone" dataKey="resueltos" stroke="#22c55e" strokeWidth={3} name="Casos Resueltos" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PQRs por Tipo */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribución de PQRs</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pqrsPorTipo.map((tipo, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
              <div className="text-3xl mb-2">{obtenerIconoTipoPQR(tiposPQR.find(t => t.nombre === tipo.nombre)?.id)}</div>
              <p className="text-sm font-medium text-slate-700">{tipo.nombre}</p>
              <p className="text-2xl font-bold text-slate-900">{tipo.cantidad}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Servicio Técnico</h2>
            <p className="text-slate-600 mt-1">Gestión de tickets y PQRs</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setVistaActiva('resumen')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActiva === 'resumen'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setVistaActiva('tickets')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActiva === 'tickets'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tickets
            </button>
            <button
              onClick={() => setVistaActiva('pqrs')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                vistaActiva === 'pqrs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              PQRs
            </button>
          </div>
        </div>
      </div>

      {/* Contenido según vista activa */}
      {vistaActiva === 'resumen' && renderResumen()}
      {vistaActiva === 'tickets' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Lista de Tickets</h3>
            <button
              onClick={() => setMostrarFormTicket(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Ticket
            </button>
          </div>
          <div className="space-y-4">
            {tickets.map(ticket => (
              <div key={ticket.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-900">{ticket.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${obtenerColorEstadoTicket(ticket.estado)} text-white`}>
                        {obtenerNombreEstadoTicket(ticket.estado)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${obtenerColorPrioridad(ticket.prioridad)} text-white`}>
                        {obtenerNombrePrioridad(ticket.prioridad)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{ticket.titulo}</h4>
                    <p className="text-sm text-slate-600 mb-2">{ticket.cliente} - {ticket.proyectoNombre}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Técnicos: {ticket.tecnicoAsignado}</span>
                      <span>Creado: {calcularTiempoTranscurrido(ticket.fechaCreacion)}</span>
                      <span>Tipo: {obtenerNombreTipoTicket(ticket.tipo)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setTicketSeleccionado(ticket)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {vistaActiva === 'pqrs' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Lista de PQRs</h3>
            <button
              onClick={() => setMostrarFormPQR(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva PQR
            </button>
          </div>
          <div className="space-y-4">
            {pqrs.map(pqr => (
              <div key={pqr.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-900">{pqr.id}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${obtenerColorTipoPQR(pqr.tipo)} text-white`}>
                        {obtenerNombreTipoPQR(pqr.tipo)}
                      </span>
                      <span className="text-xs text-slate-500">{pqr.categoria}</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-1">{pqr.titulo}</h4>
                    <p className="text-sm text-slate-600 mb-2">{pqr.cliente} - {pqr.proyectoNombre}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Responsable: {pqr.responsable}</span>
                      <span>Creado: {calcularTiempoTranscurrido(pqr.fechaCreacion)}</span>
                      <span>Canal: {pqr.canalRecepcion}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPqrSeleccionado(pqr)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Ver Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formularios modales */}
      {mostrarFormTicket && (
        <FormTicket 
          onSubmit={manejarCrearTicket} 
          onCancel={() => setMostrarFormTicket(false)} 
        />
      )}
      
      {mostrarFormPQR && (
        <FormPQR 
          onSubmit={manejarCrearPQR} 
          onCancel={() => setMostrarFormPQR(false)} 
        />
      )}
      
      {/* Componentes de detalle */}
      {ticketSeleccionado && (
        <DetalleTicket 
          ticket={ticketSeleccionado} 
          onClose={() => setTicketSeleccionado(null)} 
          onUpdate={manejarActualizarTicket}
        />
      )}
      
      {pqrSeleccionado && (
        <DetallePQR 
          pqr={pqrSeleccionado} 
          onClose={() => setPqrSeleccionado(null)} 
          onUpdate={manejarActualizarPQR}
        />
      )}
    </div>
  );
};

export default VistaServicioTecnico;
