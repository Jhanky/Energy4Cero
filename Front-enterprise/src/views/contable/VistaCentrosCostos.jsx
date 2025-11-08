import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Building2, DollarSign, TrendingUp, Users } from 'lucide-react';

const VistaCentrosCostos = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    tipo: '',
    estado: '',
    responsable: ''
  });

  // Datos de prueba para centros de costos
  const [centrosCostos] = useState([
    {
      id: 'CC-001',
      nombre: 'Proyectos Solares - Atlántico',
      codigo: 'PS-ATL',
      tipo: 'Proyecto',
      descripcion: 'Centro de costos para proyectos solares en el departamento del Atlántico',
      responsable: 'Carlos Mendoza',
      presupuesto: 250000000,
      gastado: 185000000,
      disponible: 65000000,
      estado: 'activo',
      fechaCreacion: '2024-01-15',
      proyectos: 8,
      porcentajeUso: 74
    },
    {
      id: 'CC-002',
      nombre: 'Administración General',
      codigo: 'ADM-GEN',
      tipo: 'Administrativo',
      descripcion: 'Centro de costos para gastos administrativos generales de la empresa',
      responsable: 'María González',
      presupuesto: 50000000,
      gastado: 32000000,
      disponible: 18000000,
      estado: 'activo',
      fechaCreacion: '2024-01-01',
      proyectos: 0,
      porcentajeUso: 64
    },
    {
      id: 'CC-003',
      nombre: 'Marketing y Ventas',
      codigo: 'MKT-VEN',
      tipo: 'Comercial',
      descripcion: 'Centro de costos para actividades de marketing y ventas',
      responsable: 'Ana Rodríguez',
      presupuesto: 80000000,
      gastado: 45000000,
      disponible: 35000000,
      estado: 'activo',
      fechaCreacion: '2024-02-01',
      proyectos: 0,
      porcentajeUso: 56.25
    },
    {
      id: 'CC-004',
      nombre: 'Proyectos Solares - Magdalena',
      codigo: 'PS-MAG',
      tipo: 'Proyecto',
      descripcion: 'Centro de costos para proyectos solares en el departamento del Magdalena',
      responsable: 'Roberto Silva',
      presupuesto: 180000000,
      gastado: 120000000,
      disponible: 60000000,
      estado: 'activo',
      fechaCreacion: '2024-03-01',
      proyectos: 5,
      porcentajeUso: 66.67
    },
    {
      id: 'CC-005',
      nombre: 'Investigación y Desarrollo',
      codigo: 'I+D',
      tipo: 'Técnico',
      descripcion: 'Centro de costos para actividades de investigación y desarrollo tecnológico',
      responsable: 'Diego Herrera',
      presupuesto: 120000000,
      gastado: 95000000,
      disponible: 25000000,
      estado: 'activo',
      fechaCreacion: '2024-01-20',
      proyectos: 3,
      porcentajeUso: 79.17
    },
    {
      id: 'CC-006',
      nombre: 'Mantenimiento y Soporte',
      codigo: 'MANT-SOP',
      tipo: 'Técnico',
      descripcion: 'Centro de costos para actividades de mantenimiento y soporte técnico',
      responsable: 'Laura Martínez',
      presupuesto: 60000000,
      gastado: 60000000,
      disponible: 0,
      estado: 'cerrado',
      fechaCreacion: '2024-01-10',
      proyectos: 0,
      porcentajeUso: 100
    }
  ]);

  // Filtrar centros de costos
  const centrosFiltrados = centrosCostos.filter(centro => {
    const cumpleBusqueda = 
      centro.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centro.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const cumpleTipo = !filters.tipo || centro.tipo === filters.tipo;
    const cumpleEstado = !filters.estado || centro.estado === filters.estado;
    const cumpleResponsable = !filters.responsable || centro.responsable === filters.responsable;

    return cumpleBusqueda && cumpleTipo && cumpleEstado && cumpleResponsable;
  });

  const tipos = [...new Set(centrosCostos.map(c => c.tipo))];
  const responsables = [...new Set(centrosCostos.map(c => c.responsable))];

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'cerrado':
        return 'bg-red-100 text-red-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Proyecto':
        return 'bg-blue-100 text-blue-800';
      case 'Administrativo':
        return 'bg-purple-100 text-purple-800';
      case 'Comercial':
        return 'bg-green-100 text-green-800';
      case 'Técnico':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPorcentajeColor = (porcentaje) => {
    if (porcentaje >= 90) return 'text-red-600';
    if (porcentaje >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centros de Costos</h1>
          <p className="text-slate-600 mt-1">Administra los centros de costos y presupuestos</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Centro de Costos
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
                placeholder="Nombre, código, responsable o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Filtro Tipo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Todos los tipos</option>
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
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
              <option value="cerrado">Cerrado</option>
              <option value="pausado">Pausado</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{centrosFiltrados.length}</span> de <span className="font-semibold">{centrosCostos.length}</span> centros de costos
          </p>
        </div>
      </div>

      {/* Tabla de Centros de Costos */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Centro de Costos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Utilización
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {centrosFiltrados.map((centro) => (
                <tr key={centro.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{centro.nombre}</div>
                      <div className="text-sm text-slate-500">Código: {centro.codigo}</div>
                      <div className="text-xs text-slate-400 mt-1">{centro.descripcion}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoColor(centro.tipo)}`}>
                      {centro.tipo}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{centro.responsable}</div>
                    {centro.proyectos > 0 && (
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {centro.proyectos} proyecto(s)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">{formatearMoneda(centro.presupuesto)}</div>
                    <div className="text-sm text-slate-500">Disponible: {formatearMoneda(centro.disponible)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 w-20">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            centro.porcentajeUso >= 90 ? 'bg-red-500' : 
                            centro.porcentajeUso >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(centro.porcentajeUso, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getPorcentajeColor(centro.porcentajeUso)}`}>
                        {centro.porcentajeUso.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Gastado: {formatearMoneda(centro.gastado)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(centro.estado)}`}>
                      {centro.estado === 'activo' ? 'Activo' : 
                       centro.estado === 'cerrado' ? 'Cerrado' : 'Pausado'}
                    </span>
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

export default VistaCentrosCostos;
