import { useState, useEffect } from 'react';
import { Wrench, HelpCircle, Settings, BarChart3, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const HomeSoporte = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    servicio: 0,
    mantenimiento: 0,
    tickets: 0,
    completados: 0
  });

  // Simulación de datos
  useEffect(() => {
    setStats({
      servicio: 15,
      mantenimiento: 8,
      tickets: 12,
      completados: 18
    });
  }, []);

  const quickActions = [
    { id: 'servicio', nombre: 'Servicio Técnico', icono: Wrench, path: '/servicio', color: 'bg-gray-500' },
    { id: 'mantenimiento', nombre: 'Mantenimiento', icono: Settings, path: '/mantenimiento', color: 'bg-blue-500' },
    { id: 'tickets', nombre: 'Tickets de Soporte', icono: HelpCircle, path: '/tickets', color: 'bg-green-500' },
    { id: 'reportes', nombre: 'Reportes', icono: BarChart3, path: '/reportes-soporte', color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {usuario?.name}</h1>
            <p className="text-slate-600">Panel de Soporte Técnico</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Servicios Técnicos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.servicio}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Mantenimientos</p>
              <p className="text-2xl font-bold text-slate-900">{stats.mantenimiento}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tickets de Soporte</p>
              <p className="text-2xl font-bold text-slate-900">{stats.tickets}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completados</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completados}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icono = action.icono;
            return (
              <div key={action.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icono className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-slate-900">{action.nombre}</h3>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Wrench className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Nuevo servicio técnico iniciado</p>
              <p className="text-xs text-slate-600">Hace 20 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Ticket de soporte resuelto</p>
              <p className="text-xs text-slate-600">Hace 1 hora</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSoporte;
