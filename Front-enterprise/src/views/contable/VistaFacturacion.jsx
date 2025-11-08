import { useState } from 'react';
import { Receipt, Plus, Download, Send, Eye, CheckCircle, Clock, XCircle, AlertCircle, Filter, Search, FolderKanban, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

export default function VistaFacturacion() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Datos de ejemplo de proyectos
  const proyectos = [
    { id: 1, code: 'PROJ-001', name: 'Sistema Solar Empresa ABC', budget: 45000000, spent: 38000000 },
    { id: 2, code: 'PROJ-002', name: 'Sistema Solar Comercial XYZ', budget: 65000000, spent: 52000000 },
    { id: 3, code: 'PROJ-003', name: 'Sistema Solar Industrias DEF', budget: 95000000, spent: 78000000 }
  ];

  // Datos de ejemplo de centros de costo
  const centrosCosto = [
    { id: 1, code: 'CC-001', name: 'Materiales' },
    { id: 2, code: 'CC-002', name: 'Mano de Obra' },
    { id: 3, code: 'CC-003', name: 'Transporte' },
    { id: 4, code: 'CC-004', name: 'Equipos' },
    { id: 5, code: 'CC-005', name: 'Servicios' }
  ];

  // Datos de ejemplo de facturas
  const facturas = [
    {
      id: 'FAC-2025-001',
      proyecto: proyectos[0],
      centroCosto: centrosCosto[0],
      proveedor: 'Distribuidora Solar S.A.S',
      concepto: 'Paneles Solares 450W',
      fecha: '2025-10-01',
      vencimiento: '2025-10-31',
      valor: 15000000,
      pagado: 15000000,
      estado: 'pagada',
      metodoPago: 'Transferencia'
    },
    {
      id: 'FAC-2025-002',
      proyecto: proyectos[0],
      centroCosto: centrosCosto[1],
      proveedor: 'Instalaciones Técnicas Ltda',
      concepto: 'Instalación Sistema Solar',
      fecha: '2025-10-05',
      vencimiento: '2025-11-04',
      valor: 8000000,
      pagado: 0,
      estado: 'aprobada',
      metodoPago: null
    },
    {
      id: 'FAC-2025-003',
      proyecto: proyectos[1],
      centroCosto: centrosCosto[3],
      proveedor: 'Inversores del Caribe',
      concepto: 'Inversores 15kW',
      fecha: '2025-10-08',
      vencimiento: '2025-11-07',
      valor: 12000000,
      pagado: 0,
      estado: 'pendiente',
      metodoPago: null
    },
    {
      id: 'FAC-2025-004',
      proyecto: proyectos[2],
      centroCosto: centrosCosto[0],
      proveedor: 'Distribuidora Solar S.A.S',
      concepto: 'Paneles Solares 550W',
      fecha: '2025-09-15',
      vencimiento: '2025-10-15',
      valor: 25000000,
      pagado: 0,
      estado: 'vencida',
      metodoPago: null
    },
    {
      id: 'FAC-2025-005',
      proyecto: proyectos[1],
      centroCosto: centrosCosto[2],
      proveedor: 'Transportes Express',
      concepto: 'Transporte de Equipos',
      fecha: '2025-10-12',
      vencimiento: '2025-11-11',
      valor: 2500000,
      pagado: 0,
      estado: 'pendiente',
      metodoPago: null
    }
  ];

  const estadoConfig = {
    pagada: { label: 'Pagada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    aprobada: { label: 'Aprobada', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    vencida: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    rechazada: { label: 'Rechazada', color: 'bg-slate-100 text-slate-700', icon: XCircle },
    cancelada: { label: 'Cancelada', color: 'bg-slate-100 text-slate-700', icon: XCircle }
  };

  // Estadísticas
  const totalFacturas = facturas.length;
  const facturasPagadas = facturas.filter(f => f.estado === 'pagada').length;
  const facturasPendientes = facturas.filter(f => f.estado === 'pendiente').length;
  const facturasVencidas = facturas.filter(f => f.estado === 'vencida').length;
  
  const valorTotal = facturas.reduce((sum, f) => sum + f.valor, 0);
  const valorPagado = facturas.reduce((sum, f) => sum + f.pagado, 0);
  const valorPendiente = valorTotal - valorPagado;

  const stats = [
    { title: 'Total Facturado', value: `$${(valorTotal / 1000000).toFixed(0)}M`, color: 'blue', change: '+15.3%' },
    { title: 'Pagado', value: `$${(valorPagado / 1000000).toFixed(0)}M`, color: 'green', change: '+12.8%' },
    { title: 'Por Pagar', value: `$${(valorPendiente / 1000000).toFixed(0)}M`, color: 'orange', change: '+8.5%' },
    { title: 'Vencidas', value: facturasVencidas, color: 'red', change: '-5.2%' }
  ];

  const filteredFacturas = facturas.filter(factura => {
    const matchesSearch = factura.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         factura.concepto.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || factura.estado === filterStatus;
    const matchesProject = filterProject === 'all' || factura.proyecto.id.toString() === filterProject;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getDiasVencimiento = (vencimiento) => {
    const hoy = new Date();
    const fechaVenc = new Date(vencimiento);
    const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            Gestión de Facturación
          </h1>
          <p className="text-slate-600 mt-2">
            Administra facturas asociadas a proyectos y centros de costo
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Factura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Factura</DialogTitle>
              <DialogDescription>
                Ingresa los datos de la factura y asóciala a un proyecto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Número de Factura *</Label>
                  <Input placeholder="FAC-2025-XXX" />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Factura *</Label>
                  <Input type="date" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Proyecto *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {proyectos.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Centro de Costo *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar centro de costo" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCosto.map(cc => (
                        <SelectItem key={cc.id} value={cc.id.toString()}>
                          {cc.code} - {cc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Proveedor *</Label>
                <Input placeholder="Nombre del proveedor" />
              </div>

              <div className="space-y-2">
                <Label>Concepto *</Label>
                <Input placeholder="Descripción breve del concepto" />
              </div>

              <div className="space-y-2">
                <Label>Descripción Detallada</Label>
                <Textarea rows={3} placeholder="Detalles adicionales de la factura..." />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal *</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>IVA (19%)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Total *</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Vencimiento *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Archivo (PDF)</Label>
                  <Input type="file" accept=".pdf" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notas</Label>
                <Textarea rows={2} placeholder="Notas adicionales..." />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsCreateModalOpen(false)}>
                  Registrar Factura
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} vs mes anterior
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertas de Facturas Vencidas */}
      {facturasVencidas > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Facturas Vencidas</h3>
                <p className="text-sm text-red-700">
                  Tienes {facturasVencidas} factura(s) vencida(s) que requieren atención inmediata.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros y Búsqueda */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por proveedor, número de factura o concepto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-64">
                <FolderKanban className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {proyectos.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.code} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobada">Aprobada</SelectItem>
                <SelectItem value="pagada">Pagada</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="rechazada">Rechazada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas Registradas</CardTitle>
          <CardDescription>Lista de todas las facturas asociadas a proyectos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFacturas.map((factura) => {
              const estadoInfo = estadoConfig[factura.estado];
              const EstadoIcon = estadoInfo.icon;
              const diasVencimiento = getDiasVencimiento(factura.vencimiento);
              const presupuestoRestante = factura.proyecto.budget - factura.proyecto.spent;
              const porcentajeUsado = (factura.proyecto.spent / factura.proyecto.budget) * 100;
              
              return (
                <div key={factura.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Receipt className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{factura.id}</h3>
                        <Badge className={estadoInfo.color}>
                          <EstadoIcon className="w-3 h-3 mr-1" />
                          {estadoInfo.label}
                        </Badge>
                        <Badge variant="outline">
                          <FolderKanban className="w-3 h-3 mr-1" />
                          {factura.proyecto.code}
                        </Badge>
                        <Badge variant="outline">
                          <Target className="w-3 h-3 mr-1" />
                          {factura.centroCosto.code}
                        </Badge>
                      </div>
                      
                      <p className="text-sm font-medium text-slate-700 mb-1">{factura.concepto}</p>
                      <p className="text-sm text-slate-600 mb-2">{factura.proveedor}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-3">
                        <div>
                          <span className="font-medium">Emisión:</span> {factura.fecha}
                        </div>
                        <div>
                          <span className="font-medium">Vencimiento:</span> {factura.vencimiento}
                        </div>
                      </div>

                      {/* Información del Proyecto */}
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-700">
                            Presupuesto del Proyecto: {factura.proyecto.name}
                          </span>
                          <span className={`text-xs font-bold ${
                            porcentajeUsado > 90 ? 'text-red-600' : 
                            porcentajeUsado > 75 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {porcentajeUsado.toFixed(1)}% usado
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                          <div 
                            className={`h-full rounded-full ${
                              porcentajeUsado > 90 ? 'bg-red-500' : 
                              porcentajeUsado > 75 ? 'bg-orange-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Gastado: {formatCurrency(factura.proyecto.spent)}</span>
                          <span>Disponible: {formatCurrency(presupuestoRestante)}</span>
                          <span>Total: {formatCurrency(factura.proyecto.budget)}</span>
                        </div>
                      </div>

                      {factura.estado === 'pendiente' && diasVencimiento > 0 && diasVencimiento <= 7 && (
                        <div className="mt-2 text-xs text-orange-600 font-medium">
                          ⚠️ Vence en {diasVencimiento} días
                        </div>
                      )}
                      {factura.estado === 'vencida' && (
                        <div className="mt-2 text-xs text-red-600 font-medium">
                          ⚠️ Vencida hace {Math.abs(diasVencimiento)} días
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-6 flex-shrink-0">
                    <p className="text-xl font-bold text-slate-900 mb-1">{formatCurrency(factura.valor)}</p>
                    {factura.estado === 'pagada' && factura.metodoPago && (
                      <p className="text-sm text-green-600 mb-3">{factura.metodoPago}</p>
                    )}
                    {(factura.estado === 'pendiente' || factura.estado === 'vencida' || factura.estado === 'aprobada') && (
                      <p className="text-sm text-red-600 mb-3">
                        Por pagar: {formatCurrency(factura.valor)}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      {(factura.estado === 'pendiente' || factura.estado === 'vencida') && (
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {filteredFacturas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No se encontraron facturas
            </h3>
            <p className="text-slate-600">
              Intenta ajustar los filtros de búsqueda o registra una nueva factura
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

