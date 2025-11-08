import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react';

const VistaProveedores = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    departamento: ''
  });

  // Datos de prueba para proveedores
  const [proveedores] = useState([
    {
      id: 'PROV-001',
      nombre: 'SolarTech Colombia S.A.S.',
      nit: '900123456-7',
      categoria: 'Paneles Solares',
      contacto: 'Carlos Mendoza',
      telefono: '+57 300 123 4567',
      email: 'ventas@solartech.com.co',
      direccion: 'Calle 100 #15-20, Bogotá',
      departamento: 'Cundinamarca',
      estado: 'activo',
      fechaRegistro: '2024-01-15',
      productos: ['Paneles monocristalinos', 'Paneles policristalinos', 'Inversores'],
      calificacion: 4.8
    },
    {
      id: 'PROV-002',
      nombre: 'Inversores del Caribe Ltda.',
      nit: '800234567-8',
      categoria: 'Inversores',
      contacto: 'María González',
      telefono: '+57 300 234 5678',
      email: 'comercial@inversorescaribe.com',
      direccion: 'Carrera 50 #25-15, Barranquilla',
      departamento: 'Atlántico',
      estado: 'activo',
      fechaRegistro: '2024-02-20',
      productos: ['Inversores string', 'Inversores centrales', 'Microinversores'],
      calificacion: 4.6
    },
    {
      id: 'PROV-003',
      nombre: 'Baterías Energía S.A.',
      nit: '700345678-9',
      categoria: 'Baterías',
      contacto: 'Roberto Silva',
      telefono: '+57 300 345 6789',
      email: 'info@bateriasenergia.com',
      direccion: 'Avenida 30 #10-45, Medellín',
      departamento: 'Antioquia',
      estado: 'activo',
      fechaRegistro: '2024-03-10',
      productos: ['Baterías de litio', 'Baterías de plomo-ácido', 'Sistemas de almacenamiento'],
      calificacion: 4.9
    },
    {
      id: 'PROV-004',
      nombre: 'Estructuras Metálicas Pro',
      nit: '600456789-0',
      categoria: 'Estructuras',
      contacto: 'Ana Rodríguez',
      telefono: '+57 300 456 7890',
      email: 'ventas@estructuraspro.com',
      direccion: 'Calle 80 #20-30, Cali',
      departamento: 'Valle del Cauca',
      estado: 'inactivo',
      fechaRegistro: '2024-01-05',
      productos: ['Estructuras para paneles', 'Sistemas de montaje', 'Herrajes'],
      calificacion: 4.2
    },
    {
      id: 'PROV-005',
      nombre: 'Material Eléctrico Solar',
      nit: '500567890-1',
      categoria: 'Material Eléctrico',
      contacto: 'Diego Herrera',
      telefono: '+57 300 567 8901',
      email: 'comercial@materialelectrico.com',
      direccion: 'Carrera 7 #40-25, Bogotá',
      departamento: 'Cundinamarca',
      estado: 'activo',
      fechaRegistro: '2024-04-12',
      productos: ['Cables solares', 'Conectores MC4', 'Protectores de sobretensión'],
      calificacion: 4.7
    }
  ]);

  // Filtrar proveedores
  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const cumpleBusqueda = 
      proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proveedor.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleCategoria = !filters.categoria || proveedor.categoria === filters.categoria;
    const cumpleEstado = !filters.estado || proveedor.estado === filters.estado;
    const cumpleDepartamento = !filters.departamento || proveedor.departamento === filters.departamento;

    return cumpleBusqueda && cumpleCategoria && cumpleEstado && cumpleDepartamento;
  });

  const categorias = [...new Set(proveedores.map(p => p.categoria))];
  const departamentos = [...new Set(proveedores.map(p => p.departamento))];

  const getEstadoColor = (estado) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getCalificacionStars = (calificacion) => {
    const stars = [];
    const fullStars = Math.floor(calificacion);
    const hasHalfStar = calificacion % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }
    if (hasHalfStar) {
      stars.push('☆');
    }
    return stars.join('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h1>
          <p className="text-slate-600 mt-1">Administra los proveedores y sus productos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Proveedor
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Nombre, NIT, contacto o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filtro Categoría */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
            <select
              value={filters.categoria}
              onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estado</label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{proveedoresFiltrados.length}</span> de <span className="font-semibold">{proveedores.length}</span> proveedores
          </p>
        </div>
      </div>

      {/* Tabla de Proveedores */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Calificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{proveedor.nombre}</div>
                      <div className="text-sm text-slate-500">NIT: {proveedor.nit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {proveedor.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{proveedor.contacto}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {proveedor.telefono}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {proveedor.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {proveedor.departamento}
                    </div>
                    <div className="text-sm text-slate-500">{proveedor.direccion}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(proveedor.estado)}`}>
                      {proveedor.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-sm">{getCalificacionStars(proveedor.calificacion)}</span>
                      <span className="text-sm text-slate-600">({proveedor.calificacion})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VistaProveedores;
