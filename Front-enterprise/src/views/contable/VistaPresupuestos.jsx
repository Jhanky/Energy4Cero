import { useState } from 'react';
import { Calculator, Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function VistaPresupuestos() {
  const [selectedPeriod, setSelectedPeriod] = useState('2025');

  // Datos de presupuestos por categoría
  const presupuestos = [
    {
      categoria: 'Operaciones',
      presupuestado: 500000000,
      ejecutado: 425000000,
      porcentaje: 85,
      estado: 'normal'
    },
    {
      categoria: 'Marketing',
      presupuestado: 150000000,
      ejecutado: 165000000,
      porcentaje: 110,
      estado: 'excedido'
    },
    {
      categoria: 'Recursos Humanos',
      presupuestado: 300000000,
      ejecutado: 285000000,
      porcentaje: 95,
      estado: 'normal'
    },
    {
      categoria: 'Infraestructura',
      presupuestado: 200000000,
      ejecutado: 180000000,
      porcentaje: 90,
      estado: 'normal'
    },
    {
      categoria: 'Tecnología',
      presupuestado: 100000000,
      ejecutado: 75000000,
      porcentaje: 75,
      estado: 'bajo'
    },
    {
      categoria: 'Administración',
      presupuestado: 80000000,
      ejecutado: 78000000,
      porcentaje: 97.5,
      estado: 'normal'
    }
  ];

  // Datos para gráfico de evolución mensual
  const evolucionMensual = [
    { mes: 'Ene', presupuestado: 110, ejecutado: 95 },
    { mes: 'Feb', presupuestado: 110, ejecutado: 105 },
    { mes: 'Mar', presupuestado: 110, ejecutado: 108 },
    { mes: 'Abr', presupuestado: 110, ejecutado: 102 },
    { mes: 'May', presupuestado: 110, ejecutado: 112 },
    { mes: 'Jun', presupuestado: 110, ejecutado: 115 },
    { mes: 'Jul', presupuestado: 110, ejecutado: 109 },
    { mes: 'Ago', presupuestado: 110, ejecutado: 106 },
    { mes: 'Sep', presupuestado: 110, ejecutado: 118 },
    { mes: 'Oct', presupuestado: 110, ejecutado: 98 }
  ];

  // Datos para gráfico de distribución
  const distribucionPresupuesto = presupuestos.map(p => ({
    name: p.categoria,
    value: p.presupuestado,
    color: p.estado === 'excedido' ? '#ef4444' : p.estado === 'bajo' ? '#f59e0b' : '#10b981'
  }));

  const totalPresupuestado = presupuestos.reduce((sum, p) => sum + p.presupuestado, 0);
  const totalEjecutado = presupuestos.reduce((sum, p) => sum + p.ejecutado, 0);
  const porcentajeGlobal = (totalEjecutado / totalPresupuestado) * 100;
  const diferencia = totalEjecutado - totalPresupuestado;

  const stats = [
    {
      title: 'Presupuesto Total',
      value: `$${(totalPresupuestado / 1000000).toFixed(0)}M`,
      icon: Calculator,
      color: 'blue'
    },
    {
      title: 'Ejecutado',
      value: `$${(totalEjecutado / 1000000).toFixed(0)}M`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Disponible',
      value: `$${((totalPresupuestado - totalEjecutado) / 1000000).toFixed(0)}M`,
      icon: TrendingDown,
      color: 'purple'
    },
    {
      title: 'Ejecución',
      value: `${porcentajeGlobal.toFixed(1)}%`,
      icon: porcentajeGlobal > 100 ? AlertCircle : CheckCircle,
      color: porcentajeGlobal > 100 ? 'red' : 'orange'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'excedido':
        return 'bg-red-100 text-red-700';
      case 'bajo':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'excedido':
        return 'Excedido';
      case 'bajo':
        return 'Bajo Uso';
      default:
        return 'Normal';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            Gestión de Presupuestos
          </h1>
          <p className="text-slate-600 mt-2">
            Control y seguimiento de presupuestos por categoría
          </p>
        </div>

        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Estadísticas */}
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

      {/* Alerta de Estado General */}
      {porcentajeGlobal > 100 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Presupuesto Excedido</h3>
                <p className="text-sm text-red-700">
                  El presupuesto total ha sido excedido en {formatCurrency(Math.abs(diferencia))}. 
                  Se requiere revisión y ajustes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolución Mensual</CardTitle>
            <CardDescription>Comparación presupuestado vs ejecutado (millones COP)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={evolucionMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="presupuestado" fill="#8b5cf6" name="Presupuestado" />
                <Bar dataKey="ejecutado" fill="#10b981" name="Ejecutado" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución del Presupuesto</CardTitle>
            <CardDescription>Presupuesto asignado por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distribucionPresupuesto}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distribucionPresupuesto.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalle por Categoría */}
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos por Categoría</CardTitle>
          <CardDescription>Detalle de ejecución presupuestal por área</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {presupuestos.map((presupuesto, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{presupuesto.categoria}</h3>
                    <Badge className={getEstadoColor(presupuesto.estado)}>
                      {getEstadoLabel(presupuesto.estado)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {formatCurrency(presupuesto.ejecutado)} / {formatCurrency(presupuesto.presupuestado)}
                    </p>
                    <p className={`text-sm font-semibold ${
                      presupuesto.porcentaje > 100 ? 'text-red-600' : 
                      presupuesto.porcentaje < 80 ? 'text-yellow-600' : 
                      'text-green-600'
                    }`}>
                      {presupuesto.porcentaje.toFixed(1)}% ejecutado
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min(presupuesto.porcentaje, 100)} 
                  className={`h-3 ${
                    presupuesto.porcentaje > 100 ? 'bg-red-100' : 
                    presupuesto.porcentaje < 80 ? 'bg-yellow-100' : 
                    'bg-green-100'
                  }`}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Disponible: {formatCurrency(presupuesto.presupuestado - presupuesto.ejecutado)}</span>
                  {presupuesto.porcentaje > 100 && (
                    <span className="text-red-600 font-semibold">
                      Excedido en: {formatCurrency(presupuesto.ejecutado - presupuesto.presupuestado)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

