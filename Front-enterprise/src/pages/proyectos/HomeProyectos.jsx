import { useState, useEffect } from 'react';
import { FolderKanban, BarChart3, Target, Leaf, LayoutDashboard, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const HomeProyectos = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    proyectos: 0,
    completados: 0,
    enProgreso: 0,
    pendientes: 0
  });

  // Simulación de datos
  useEffect(() => {
    setStats({
      proyectos: 24,
      completados: 8,
      enProgreso: 12,
      pendientes: 4
    });
  }, []);

  const quickActions = [
    { id: 'resumen', nombre: 'Resumen Ejecutivo', icono: LayoutDashboard, path: '/resumen', color: 'bg-blue-500' },
    { id: 'proyectos', nombre: 'Proyectos', icono: FolderKanban, path: '/proyectos', color: 'bg-green-500' },
    { id: 'analisis', nombre: 'Análisis', icono: BarChart3, path: '/analisis', color: 'bg-purple-500' },
    { id: 'aire', nombre: 'Seguimiento Air-e', icono: Leaf, path: '/aire', color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <FolderKanban className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bienvenido, {usuario?.name}</h1>
            <p className="text-slate-600">Panel de Gestión de Proyectos</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Proyectos Totales</p>
              <p className="text-2xl font-bold text-slate-900">{stats.proyectos}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completados</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completados}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En Progreso</p>
              <p className="text-2xl font-bold text-slate-900">{stats.enProgreso}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pendientes</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendientes}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-slate-600" />
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
              <FolderKanban className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Nuevo proyecto iniciado</p>
              <p className="text-xs text-slate-600">Hace 1 hora</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Proyecto completado</p>
              <p className="text-xs text-slate-600">Hace 3 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProyectos;
