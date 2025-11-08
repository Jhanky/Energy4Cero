import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Eye, Star, Phone, Mail, MapPin, Building2, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function VistaProveedores() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Datos de ejemplo de proveedores
  const proveedores = [
    {
      id: 1,
      code: 'PROV-001',
      businessName: 'Distribuidora Solar S.A.S',
      tradeName: 'Solar Distribuidora',
      taxId: '900123456-7',
      taxIdType: 'NIT',
      email: 'ventas@solardistribuidora.com',
      phone: '+57 1 234 5678',
      mobile: '+57 310 123 4567',
      address: 'Calle 100 #15-20',
      city: 'Bogotá',
      department: 'Cundinamarca',
      supplierType: 'materiales',
      productsServices: 'Paneles solares, inversores, estructuras de montaje',
      paymentTermsDays: 30,
      creditLimit: 50000000,
      rating: 5,
      isActive: true,
      contactName: 'Juan Pérez',
      contactPosition: 'Gerente Comercial',
      contactEmail: 'juan.perez@solardistribuidora.com',
      contactPhone: '+57 310 123 4567',
      totalPurchases: 125000000,
      pendingPayments: 15000000
    },
    {
      id: 2,
      code: 'PROV-002',
      businessName: 'Instalaciones Técnicas Ltda',
      tradeName: 'Instalaciones Técnicas',
      taxId: '800234567-8',
      taxIdType: 'NIT',
      email: 'info@instalacionestecnicas.com',
      phone: '+57 1 345 6789',
      mobile: '+57 320 234 5678',
      address: 'Carrera 50 #25-30',
      city: 'Medellín',
      department: 'Antioquia',
      supplierType: 'servicios',
      productsServices: 'Instalación de sistemas solares, mantenimiento',
      paymentTermsDays: 15,
      creditLimit: 30000000,
      rating: 4,
      isActive: true,
      contactName: 'María González',
      contactPosition: 'Directora de Operaciones',
      contactEmail: 'maria.gonzalez@instalacionestecnicas.com',
      contactPhone: '+57 320 234 5678',
      totalPurchases: 85000000,
      pendingPayments: 8000000
    },
    {
      id: 3,
      code: 'PROV-003',
      businessName: 'Inversores del Caribe S.A',
      tradeName: 'Inversores Caribe',
      taxId: '900345678-9',
      taxIdType: 'NIT',
      email: 'ventas@inversorescaribe.com',
      phone: '+57 5 456 7890',
      mobile: '+57 315 345 6789',
      address: 'Avenida El Río #45-60',
      city: 'Barranquilla',
      department: 'Atlántico',
      supplierType: 'equipos',
      productsServices: 'Inversores solares, sistemas de monitoreo',
      paymentTermsDays: 45,
      creditLimit: 40000000,
      rating: 5,
      isActive: true,
      contactName: 'Carlos Rodríguez',
      contactPosition: 'Gerente de Ventas',
      contactEmail: 'carlos.rodriguez@inversorescaribe.com',
      contactPhone: '+57 315 345 6789',
      totalPurchases: 95000000,
      pendingPayments: 12000000
    },
    {
      id: 4,
      code: 'PROV-004',
      businessName: 'Transportes Express S.A.S',
      tradeName: 'Express Transportes',
      taxId: '900456789-0',
      taxIdType: 'NIT',
      email: 'servicios@transportesexpress.com',
      phone: '+57 1 567 8901',
      mobile: '+57 318 456 7890',
      address: 'Calle 80 #70-15',
      city: 'Bogotá',
      department: 'Cundinamarca',
      supplierType: 'transporte',
      productsServices: 'Transporte de carga, logística',
      paymentTermsDays: 15,
      creditLimit: 20000000,
      rating: 4,
      isActive: true,
      contactName: 'Ana Martínez',
      contactPosition: 'Coordinadora de Servicios',
      contactEmail: 'ana.martinez@transportesexpress.com',
      contactPhone: '+57 318 456 7890',
      totalPurchases: 35000000,
      pendingPayments: 2500000
    }
  ];

  const tipoProveedorConfig = {
    materiales: { label: 'Materiales', color: 'bg-blue-100 text-blue-700' },
    servicios: { label: 'Servicios', color: 'bg-green-100 text-green-700' },
    equipos: { label: 'Equipos', color: 'bg-purple-100 text-purple-700' },
    transporte: { label: 'Transporte', color: 'bg-orange-100 text-orange-700' },
    otro: { label: 'Otro', color: 'bg-slate-100 text-slate-700' }
  };

  const filteredProveedores = proveedores.filter(proveedor => {
    const matchesSearch = proveedor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proveedor.tradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proveedor.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proveedor.taxId.includes(searchTerm);
    const matchesType = filterType === 'all' || proveedor.supplierType === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && proveedor.isActive) ||
                         (filterStatus === 'inactive' && !proveedor.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
      />
    ));
  };

  // Estadísticas
  const totalProveedores = proveedores.length;
  const proveedoresActivos = proveedores.filter(p => p.isActive).length;
  const totalCompras = proveedores.reduce((sum, p) => sum + p.totalPurchases, 0);
  const totalPendiente = proveedores.reduce((sum, p) => sum + p.pendingPayments, 0);

  const stats = [
    { title: 'Total Proveedores', value: totalProveedores, color: 'blue' },
    { title: 'Activos', value: proveedoresActivos, color: 'green' },
    { title: 'Total Compras', value: `$${(totalCompras / 1000000).toFixed(0)}M`, color: 'purple' },
    { title: 'Pagos Pendientes', value: `$${(totalPendiente / 1000000).toFixed(0)}M`, color: 'orange' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            Gestión de Proveedores
          </h1>
          <p className="text-slate-600 mt-2">
            Administra la información de tus proveedores
          </p>
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Proveedor</DialogTitle>
              <DialogDescription>
                Ingresa la información completa del proveedor
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
                <TabsTrigger value="comercial">Comercial</TabsTrigger>
                <TabsTrigger value="bancaria">Info Bancaria</TabsTrigger>
              </TabsList>

              <div className="max-h-[500px] overflow-y-auto mt-4">
                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Código *</Label>
                      <Input placeholder="PROV-XXX" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Proveedor *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="materiales">Materiales</SelectItem>
                          <SelectItem value="servicios">Servicios</SelectItem>
                          <SelectItem value="equipos">Equipos</SelectItem>
                          <SelectItem value="transporte">Transporte</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Razón Social *</Label>
                    <Input placeholder="Nombre legal de la empresa" />
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre Comercial</Label>
                    <Input placeholder="Nombre comercial (opcional)" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Identificación *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NIT">NIT</SelectItem>
                          <SelectItem value="CC">Cédula</SelectItem>
                          <SelectItem value="CE">Cédula Extranjería</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Identificación *</Label>
                      <Input placeholder="900123456-7" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Productos/Servicios que Ofrece</Label>
                    <Textarea rows={3} placeholder="Describe los productos o servicios..." />
                  </div>
                </TabsContent>

                <TabsContent value="contacto" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@empresa.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input placeholder="+57 1 234 5678" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Celular</Label>
                      <Input placeholder="+57 310 123 4567" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sitio Web</Label>
                      <Input placeholder="https://www.empresa.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input placeholder="Dirección completa" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Cundinamarca</SelectItem>
                          <SelectItem value="2">Antioquia</SelectItem>
                          <SelectItem value="3">Atlántico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Bogotá</SelectItem>
                          <SelectItem value="2">Medellín</SelectItem>
                          <SelectItem value="3">Barranquilla</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Contacto Principal</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input placeholder="Nombre del contacto" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo</Label>
                        <Input placeholder="Cargo del contacto" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="email@empresa.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Teléfono</Label>
                        <Input placeholder="+57 310 123 4567" />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="comercial" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Plazo de Pago (días)</Label>
                      <Input type="number" placeholder="30" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Límite de Crédito</Label>
                      <Input type="number" placeholder="50000000" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Calificación</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar calificación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excelente</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Muy Bueno</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Bueno</SelectItem>
                        <SelectItem value="2">⭐⭐ Regular</SelectItem>
                        <SelectItem value="1">⭐ Malo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea rows={4} placeholder="Notas adicionales sobre el proveedor..." />
                  </div>
                </TabsContent>

                <TabsContent value="bancaria" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input placeholder="Nombre del banco" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Cuenta</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ahorros">Ahorros</SelectItem>
                          <SelectItem value="corriente">Corriente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Cuenta</Label>
                      <Input placeholder="1234567890" />
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsCreateModalOpen(false)}>
                Registrar Proveedor
              </Button>
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
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, código o NIT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="materiales">Materiales</SelectItem>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="equipos">Equipos</SelectItem>
                <SelectItem value="transporte">Transporte</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Proveedores */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProveedores.map((proveedor) => {
          const tipoInfo = tipoProveedorConfig[proveedor.supplierType];
          
          return (
            <Card key={proveedor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">{proveedor.tradeName || proveedor.businessName}</h3>
                        <Badge className={tipoInfo.color}>{tipoInfo.label}</Badge>
                        {proveedor.isActive ? (
                          <Badge className="bg-green-100 text-green-700">Activo</Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700">Inactivo</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-1">{proveedor.businessName}</p>
                      <p className="text-sm text-slate-500 mb-3">{proveedor.taxIdType}: {proveedor.taxId}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {proveedor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-4 h-4" />
                          {proveedor.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {proveedor.city}, {proveedor.department}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        {renderStars(proveedor.rating)}
                        <span className="text-sm text-slate-600 ml-2">({proveedor.rating}/5)</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Plazo de Pago:</span>
                          <p className="font-semibold text-slate-900">{proveedor.paymentTermsDays} días</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Límite de Crédito:</span>
                          <p className="font-semibold text-slate-900">{formatCurrency(proveedor.creditLimit)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Total Compras:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(proveedor.totalPurchases)}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Pagos Pendientes:</span>
                          <p className="font-semibold text-orange-600">{formatCurrency(proveedor.pendingPayments)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProveedores.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No se encontraron proveedores
            </h3>
            <p className="text-slate-600">
              Intenta ajustar los filtros de búsqueda o registra un nuevo proveedor
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

