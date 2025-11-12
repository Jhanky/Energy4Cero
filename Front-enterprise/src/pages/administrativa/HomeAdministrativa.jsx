import { useState, useEffect } from 'react';
import { Users, Shield, Settings, FileText, BarChart3, TrendingUp, TrendingDown, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';

const HomeAdministrativa = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({
    usuarios: 0,
    roles: 0,
    documentos: 0,
    configuraciones: 0
  });

  // Simulación de datos
  useEffect(() => {
    setStats({
      usuarios: 24,
      roles: 5,
      documentos: 18,
      configuraciones: 12
    });
  }, []);

  const quickActions = [
    { id: 'usuarios', nombre: 'Gestionar Usuarios', icono: Users, path: '/usuarios', color: 'bg-blue-500' },
    { id: 'roles', nombre: 'Roles y Permisos', icono: Shield, path: '/roles', color: 'bg-purple-500' },
    { id: 'documentacion', nombre: 'Documentación', icono: FileText, path: '/documentacion', color: 'bg-green-500' },
    { id: 'configuracion', nombre: 'Configuración', icono: Settings, path: '/configuracion', color: 'bg-orange-500' }
  ];

  const statsData = [
    {
      title: 'Total Usuarios',
      value: stats.usuarios,
      delta: 12.5,
      positive: true,
      prefix: '',
      suffix: '',
      bg: 'bg-zinc-950',
      icon: Users,
      svg: (
        <svg
          className="absolute right-0 top-0 h-full w-2/3 pointer-events-none"
          viewBox="0 0 300 200"
          fill="none"
          style={{ zIndex: 0 }}
        >
          <circle cx="220" cy="100" r="90" fill="#fff" fillOpacity="0.08" />
          <circle cx="260" cy="60" r="60" fill="#fff" fillOpacity="0.10" />
          <circle cx="200" cy="160" r="50" fill="#fff" fillOpacity="0.07" />
          <circle cx="270" cy="150" r="30" fill="#fff" fillOpacity="0.12" />
        </svg>
      ),
    },
    {
      title: 'Roles Activos',
      value: stats.roles,
      delta: 0,
      positive: true,
      prefix: '',
      suffix: '',
      bg: 'bg-fuchsia-600',
      icon: Shield,
      svg: (
        <svg
          className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <ellipse cx="170" cy="60" rx="40" ry="18" fill="#fff" fillOpacity="0.13" filter="url(#blur2)" />
          <rect x="120" y="20" width="60" height="20" rx="8" fill="#fff" fillOpacity="0.10" />
          <polygon points="150,0 200,0 200,50" fill="#fff" fillOpacity="0.07" />
          <circle cx="180" cy="100" r="14" fill="#fff" fillOpacity="0.16" />
        </svg>
      ),
    },
    {
      title: 'Documentos',
      value: stats.documentos,
      delta: 8.2,
      positive: true,
      prefix: '',
      suffix: '',
      bg: 'bg-blue-600',
      icon: FileText,
      svg: (
        <svg
          className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <rect x="120" y="0" width="70" height="70" rx="35" fill="#fff" fillOpacity="0.09" filter="url(#blur3)" />
          <ellipse cx="170" cy="80" rx="28" ry="12" fill="#fff" fillOpacity="0.12" />
          <polygon points="200,0 200,60 140,0" fill="#fff" fillOpacity="0.07" />
          <circle cx="150" cy="30" r="10" fill="#fff" fillOpacity="0.15" />
        </svg>
      ),
    },
    {
      title: 'Configuraciones',
      value: stats.configuraciones,
      delta: -2.1,
      positive: false,
      prefix: '',
      suffix: '',
      bg: 'bg-teal-600',
      icon: Settings,
      svg: (
        <svg
          className="absolute right-0 top-0 w-48 h-48 pointer-events-none"
          viewBox="0 0 200 200"
          fill="none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <filter id="blur4" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="16" />
            </filter>
          </defs>
          <polygon points="200,0 200,100 100,0" fill="#fff" fillOpacity="0.09" />
          <ellipse cx="170" cy="40" rx="30" ry="18" fill="#fff" fillOpacity="0.13" filter="url(#blur4)" />
          <rect x="140" y="60" width="40" height="18" rx="8" fill="#fff" fillOpacity="0.10" />
          <circle cx="150" cy="30" r="14" fill="#fff" fillOpacity="0.18" />
          <line x1="120" y1="0" x2="200" y2="80" stroke="#fff" strokeOpacity="0.08" strokeWidth="6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-8 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-white/8 rounded-full blur-md"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">¡Bienvenido de vuelta, {usuario?.name}!</h1>
              <p className="text-blue-100 text-lg">Panel de Control Administrativo - Sistema de Gestión Enterprise</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-blue-200">Sistema operativo - Todos los servicios activos</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-blue-200 text-sm">Última actualización</p>
              <p className="text-white font-semibold">{new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`relative overflow-hidden ${stat.bg} text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
              <CardHeader className="border-0 z-10 relative pb-2">
                <CardTitle className="text-white/90 text-sm font-medium flex items-center justify-between">
                  {stat.title}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="-me-1.5 text-white/80 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom" className="bg-slate-800 border-slate-700">
                      <DropdownMenuItem className="text-white hover:bg-slate-700">Ver detalles</DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-slate-700">Exportar datos</DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-slate-700">Configurar alertas</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 z-10 relative">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold tracking-tight">
                    {stat.prefix}{stat.value.toLocaleString()}{stat.suffix}
                  </span>
                  <Badge className="bg-white/20 font-semibold hover:bg-white/30 transition-colors">
                    {stat.delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stat.delta)}%
                  </Badge>
                </div>
                <div className="text-xs text-white/80 mt-2 border-t border-white/20 pt-2.5 flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  <span>Vs mes anterior</span>
                </div>
              </CardContent>
              {stat.svg}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => {
                  const Icono = action.icono;
                  return (
                    <div key={action.id} className="group relative overflow-hidden bg-gradient-to-r from-white to-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 from-blue-500 to-purple-500"></div>
                      <div className="relative z-10">
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icono className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{action.nombre}</h3>
                        <p className="text-sm text-slate-600 mt-1">Acceso directo</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Nuevo usuario registrado</p>
                    <p className="text-xs text-slate-600">Juan Pérez - Hace 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Rol de administrador actualizado</p>
                    <p className="text-xs text-slate-600">Permisos de seguridad - Hace 1 día</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Nuevo documento subido</p>
                    <p className="text-xs text-slate-600">Manual de procedimientos - Hace 3 días</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomeAdministrativa;
