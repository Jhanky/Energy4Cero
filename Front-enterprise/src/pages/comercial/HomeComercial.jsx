import { useState, useEffect } from 'react';
import { Users, ShoppingCart, Package, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const HomeComercial = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    clientes: 0,
    cotizaciones: 0,
    suministros: 0,
    ventas: 0
  });

  // Simulación de datos
  useEffect(() => {
    setStats({
      clientes: 42,
      cotizaciones: 18,
      suministros: 126,
      ventas: 15
    });
  }, []);

  const quickActions = [
    { id: 'clientes', nombre: 'Gestionar Clientes', icono: Users, path: '/clientes', color: 'bg-blue-500' },
    { id: 'cotizaciones', nombre: 'Cotizaciones', icono: FileText, path: '/cotizaciones', color: 'bg-green-500' },
    { id: 'suministros', nombre: 'Suministros', icono: Package, path: '/suministros', color: 'bg-purple-500' },
    { id: 'reportes', nombre: 'Reportes', icono: BarChart3, path: '/reportes-com', color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {usuario?.name}</h1>
            <p className="text-slate-600">Panel de Gestión Comercial</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Clientes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.clientes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Cotizaciones</p>
              <p className="text-2xl font-bold text-slate-900">{stats.cotizaciones}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Suministros</p>
              <p className="text-2xl font-bold text-slate-900">{stats.suministros}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Ventas</p>
              <p className="text-2xl font-bold text-slate-900">{stats.ventas}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
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
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Nuevo cliente registrado</p>
              <p className="text-xs text-slate-600">Hace 30 minutos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Cotización generada</p>
              <p className="text-xs text-slate-600">Hace 2 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeComercial;
