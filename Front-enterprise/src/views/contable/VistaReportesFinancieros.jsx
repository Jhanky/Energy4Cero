import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, PieChart as PieChartIcon, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

export default function VistaReportesFinancieros() {
  const [period, setPeriod] = useState('year');

  // Datos de Estado de Resultados
  const estadoResultados = {
    ingresos: {
      ventas: 2500000000,
      servicios: 800000000,
      otros: 150000000
    },
    costos: {
      materiales: 1200000000,
      manoObra: 450000000,
      otros: 200000000
    },
    gastosOperativos: {
      administrativos: 300000000,
      ventas: 250000000,
      marketing: 150000000
    }
  };

  const totalIngresos = Object.values(estadoResultados.ingresos).reduce((a, b) => a + b, 0);
  const totalCostos = Object.values(estadoResultados.costos).reduce((a, b) => a + b, 0);
  const totalGastos = Object.values(estadoResultados.gastosOperativos).reduce((a, b) => a + b, 0);
  const utilidadBruta = totalIngresos - totalCostos;
  const utilidadOperativa = utilidadBruta - totalGastos;
  const utilidadNeta = utilidadOperativa * 0.75; // Después de impuestos

  // Datos de Flujo de Caja
  const flujoCaja = [
    { mes: 'Ene', ingresos: 280, egresos: 220, neto: 60 },
    { mes: 'Feb', ingresos: 310, egresos: 240, neto: 70 },
    { mes: 'Mar', ingresos: 295, egresos: 235, neto: 60 },
    { mes: 'Abr', ingresos: 320, egresos: 250, neto: 70 },
    { mes: 'May', ingresos: 340, egresos: 260, neto: 80 },
    { mes: 'Jun', ingresos: 360, egresos: 270, neto: 90 },
    { mes: 'Jul', ingresos: 350, egresos: 265, neto: 85 },
    { mes: 'Ago', ingresos: 370, egresos: 280, neto: 90 },
    { mes: 'Sep', ingresos: 390, egresos: 290, neto: 100 },
    { mes: 'Oct', ingresos: 335, egresos: 275, neto: 60 }
  ];

  // Datos de Balance General
  const balanceGeneral = {
    activos: {
      corrientes: 1500000000,
      fijos: 2800000000,
      otros: 300000000
    },
    pasivos: {
      corrientes: 800000000,
      largo_plazo: 1200000000
    },
    patrimonio: 2600000000
  };

  const totalActivos = Object.values(balanceGeneral.activos).reduce((a, b) => a + b, 0);
  const totalPasivos = Object.values(balanceGeneral.pasivos).reduce((a, b) => a + b, 0);

  // Datos de Distribución de Ingresos
  const distribucionIngresos = [
    { name: 'Ventas', value: estadoResultados.ingresos.ventas, color: '#3b82f6' },
    { name: 'Servicios', value: estadoResultados.ingresos.servicios, color: '#10b981' },
    { name: 'Otros', value: estadoResultados.ingresos.otros, color: '#8b5cf6' }
  ];

  // Datos de Distribución de Costos
  const distribucionCostos = [
    { name: 'Materiales', value: estadoResultados.costos.materiales, color: '#ef4444' },
    { name: 'Mano de Obra', value: estadoResultados.costos.manoObra, color: '#f59e0b' },
    { name: 'Otros', value: estadoResultados.costos.otros, color: '#6b7280' }
  ];

  // Indicadores Financieros
  const indicadores = [
    {
      nombre: 'Margen Bruto',
      valor: ((utilidadBruta / totalIngresos) * 100).toFixed(1) + '%',
      descripcion: 'Utilidad bruta sobre ventas'
    },
    {
      nombre: 'Margen Operativo',
      valor: ((utilidadOperativa / totalIngresos) * 100).toFixed(1) + '%',
      descripcion: 'Utilidad operativa sobre ventas'
    },
    {
      nombre: 'Margen Neto',
      valor: ((utilidadNeta / totalIngresos) * 100).toFixed(1) + '%',
      descripcion: 'Utilidad neta sobre ventas'
    },
    {
      nombre: 'ROA',
      valor: ((utilidadNeta / totalActivos) * 100).toFixed(1) + '%',
      descripcion: 'Retorno sobre activos'
    },
    {
      nombre: 'ROE',
      valor: ((utilidadNeta / balanceGeneral.patrimonio) * 100).toFixed(1) + '%',
      descripcion: 'Retorno sobre patrimonio'
    },
    {
      nombre: 'Razón Corriente',
      valor: (balanceGeneral.activos.corrientes / balanceGeneral.pasivos.corrientes).toFixed(2),
      descripcion: 'Activos corrientes / Pasivos corrientes'
    }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Reportes Financieros
          </h1>
          <p className="text-slate-600 mt-2">
            Análisis financiero y estados contables
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="estado-resultados" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estado-resultados">Estado de Resultados</TabsTrigger>
          <TabsTrigger value="balance">Balance General</TabsTrigger>
          <TabsTrigger value="flujo-caja">Flujo de Caja</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>

        {/* Estado de Resultados */}
        <TabsContent value="estado-resultados" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Composición de Ingresos</CardTitle>
                <CardDescription>Distribución por tipo de ingreso</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribucionIngresos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribucionIngresos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Composición de Costos</CardTitle>
                <CardDescription>Distribución por tipo de costo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distribucionCostos}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribucionCostos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Estado de Resultados</CardTitle>
              <CardDescription>Período: {period === 'year' ? 'Año 2025' : period === 'quarter' ? 'Q4 2025' : 'Octubre 2025'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">Ingresos</h3>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ventas</span>
                      <span className="font-medium">{formatCurrency(estadoResultados.ingresos.ventas)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Servicios</span>
                      <span className="font-medium">{formatCurrency(estadoResultados.ingresos.servicios)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Otros Ingresos</span>
                      <span className="font-medium">{formatCurrency(estadoResultados.ingresos.otros)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-600 pt-2 border-t">
                      <span>Total Ingresos</span>
                      <span>{formatCurrency(totalIngresos)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">Costos de Ventas</h3>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Materiales</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.costos.materiales)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mano de Obra</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.costos.manoObra)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Otros Costos</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.costos.otros)})</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600 pt-2 border-t">
                      <span>Total Costos</span>
                      <span>({formatCurrency(totalCostos)})</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-green-600 text-lg pb-4 border-b">
                  <span>Utilidad Bruta</span>
                  <span>{formatCurrency(utilidadBruta)}</span>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-3">Gastos Operativos</h3>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Administrativos</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.gastosOperativos.administrativos)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ventas</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.gastosOperativos.ventas)})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Marketing</span>
                      <span className="font-medium text-red-600">({formatCurrency(estadoResultados.gastosOperativos.marketing)})</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-600 pt-2 border-t">
                      <span>Total Gastos</span>
                      <span>({formatCurrency(totalGastos)})</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-green-600 text-lg pb-4 border-b">
                  <span>Utilidad Operativa</span>
                  <span>{formatCurrency(utilidadOperativa)}</span>
                </div>

                <div className="flex justify-between font-bold text-green-700 text-xl">
                  <span>Utilidad Neta</span>
                  <span>{formatCurrency(utilidadNeta)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance General */}
        <TabsContent value="balance" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Activos</CardTitle>
                <CardDescription>Total: {formatCurrency(totalActivos)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Activos Corrientes</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.activos.corrientes)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Activos Fijos</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.activos.fijos)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-blue-50 rounded">
                    <span className="font-medium">Otros Activos</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.activos.otros)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pasivos y Patrimonio</CardTitle>
                <CardDescription>Total: {formatCurrency(totalPasivos + balanceGeneral.patrimonio)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-red-50 rounded">
                    <span className="font-medium">Pasivos Corrientes</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.pasivos.corrientes)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 rounded">
                    <span className="font-medium">Pasivos Largo Plazo</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.pasivos.largo_plazo)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-green-50 rounded">
                    <span className="font-medium">Patrimonio</span>
                    <span className="font-bold">{formatCurrency(balanceGeneral.patrimonio)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Flujo de Caja */}
        <TabsContent value="flujo-caja" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Caja Mensual</CardTitle>
              <CardDescription>Ingresos, egresos y flujo neto (millones COP)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={flujoCaja}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="ingresos" stackId="1" stroke="#10b981" fill="#10b981" name="Ingresos" />
                  <Area type="monotone" dataKey="egresos" stackId="2" stroke="#ef4444" fill="#ef4444" name="Egresos" />
                  <Line type="monotone" dataKey="neto" stroke="#3b82f6" strokeWidth={3} name="Flujo Neto" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Indicadores */}
        <TabsContent value="indicadores" className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            {indicadores.map((indicador, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{indicador.nombre}</CardTitle>
                  <CardDescription>{indicador.descripcion}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-slate-900">{indicador.valor}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

