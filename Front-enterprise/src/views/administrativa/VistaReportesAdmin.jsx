import { useState } from 'react';
import { BarChart3, Users, FileText, Activity, Download, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function VistaReportesAdmin() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('users');

  // Datos de ejemplo para usuarios
  const userData = [
    { month: 'Ene', activos: 45, inactivos: 5, nuevos: 8 },
    { month: 'Feb', activos: 52, inactivos: 3, nuevos: 10 },
    { month: 'Mar', activos: 58, inactivos: 4, nuevos: 12 },
    { month: 'Abr', activos: 61, inactivos: 2, nuevos: 7 },
    { month: 'May', activos: 65, inactivos: 3, nuevos: 9 },
    { month: 'Jun', activos: 70, inactivos: 2, nuevos: 8 }
  ];

  // Datos de actividad del sistema
  const activityData = [
    { day: 'Lun', logins: 120, acciones: 450, errores: 5 },
    { day: 'Mar', logins: 135, acciones: 520, errores: 3 },
    { day: 'Mié', logins: 145, acciones: 580, errores: 7 },
    { day: 'Jue', logins: 128, acciones: 490, errores: 4 },
    { day: 'Vie', logins: 150, acciones: 610, errores: 2 },
    { day: 'Sáb', logins: 45, acciones: 180, errores: 1 },
    { day: 'Dom', logins: 30, acciones: 120, errores: 0 }
  ];

  // Datos de distribución por roles
  const roleData = [
    { name: 'Administrador', value: 5, color: '#3b82f6' },
    { name: 'Comercial', value: 25, color: '#10b981' },
    { name: 'Contable', value: 15, color: '#8b5cf6' },
    { name: 'Técnico', value: 20, color: '#f59e0b' },
    { name: 'Soporte', value: 10, color: '#6b7280' }
  ];

  // Estadísticas generales
  const stats = [
    {
      title: 'Usuarios Activos',
      value: '70',
      change: '+8.2%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Sesiones Hoy',
      value: '150',
      change: '+12.5%',
      icon: Activity,
      color: 'green'
    },
    {
      title: 'Documentos Generados',
      value: '1,234',
      change: '+23.1%',
      icon: FileText,
      color: 'purple'
    },
    {
      title: 'Tasa de Errores',
      value: '0.3%',
      change: '-45.2%',
      icon: BarChart3,
      color: 'orange'
    }
  ];

  const handleExport = (format) => {
    
    // Aquí iría la lógica de exportación
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Reportes Administrativos
          </h1>
          <p className="text-slate-600 mt-2">
            Análisis y estadísticas del sistema
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} vs período anterior
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gráfico de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Evolución de Usuarios</CardTitle>
            <CardDescription>Usuarios activos, inactivos y nuevos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activos" fill="#10b981" name="Activos" />
                <Bar dataKey="inactivos" fill="#ef4444" name="Inactivos" />
                <Bar dataKey="nuevos" fill="#3b82f6" name="Nuevos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Actividad */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad del Sistema</CardTitle>
            <CardDescription>Logins, acciones y errores por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins" strokeWidth={2} />
                <Line type="monotone" dataKey="acciones" stroke="#10b981" name="Acciones" strokeWidth={2} />
                <Line type="monotone" dataKey="errores" stroke="#ef4444" name="Errores" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por Roles y Tabla de Actividad */}
      <div className="grid grid-cols-3 gap-6">
        {/* Gráfico de Distribución por Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Roles</CardTitle>
            <CardDescription>Usuarios por tipo de rol</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tabla de Actividad Reciente */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones realizadas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: 'Juan Pérez', action: 'Creó una cotización', time: 'Hace 5 minutos', type: 'create' },
                { user: 'María García', action: 'Actualizó un cliente', time: 'Hace 12 minutos', type: 'update' },
                { user: 'Carlos López', action: 'Generó un reporte', time: 'Hace 23 minutos', type: 'report' },
                { user: 'Ana Martínez', action: 'Eliminó un documento', time: 'Hace 35 minutos', type: 'delete' },
                { user: 'Luis Rodríguez', action: 'Creó un nuevo usuario', time: 'Hace 1 hora', type: 'create' },
                { user: 'Sofia Torres', action: 'Aprobó una cotización', time: 'Hace 2 horas', type: 'approve' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-green-500' :
                      activity.type === 'update' ? 'bg-blue-500' :
                      activity.type === 'delete' ? 'bg-red-500' :
                      activity.type === 'approve' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{activity.user}</p>
                      <p className="text-sm text-slate-600">{activity.action}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

