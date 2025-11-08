import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Zap,
  Battery,
  Cpu,
  Sun,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Settings,
  FileText,
  ExternalLink,
  Star,
  StarOff,
  Target,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import apiService from '../../../services/api';

const VistaSuministros = () => {
  const [activeTab, setActiveTab] = useState('paneles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    type: '',
    grid_type: '',
    power_range: '',
    price_range: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    power: '',
    type: '',
    technical_sheet_url: '',
    price: '',
    // Campos específicos por tipo
    capacity: '', // Para baterías
    voltage: '', // Para baterías
    system_type: '', // Para inversores
    grid_type: '' // Para inversores
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Datos reales del backend
  const [data, setData] = useState({
    paneles: [],
    inversores: [],
    baterias: []
  });

  const [statistics, setStatistics] = useState({
    total_paneles: 0,
    total_inversores: 0,
    total_baterias: 0,
    precio_promedio_panel: 0,
    precio_promedio_inversor: 0,
    precio_promedio_bateria: 0
  });

  useEffect(() => {
    loadData();
    loadStatistics();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (activeTab) {
        case 'paneles':
          response = await apiService.getPanels({
            search: searchTerm,
            brand: filters.brand,
            type: filters.type,
            price_range: filters.price_range
          });
          break;
        case 'inversores':
          response = await apiService.getInverters({
            search: searchTerm,
            brand: filters.brand,
            system_type: filters.type,
            grid_type: filters.grid_type,
            price_range: filters.price_range
          });
          break;
        case 'baterias':
          response = await apiService.getBatteries({
            search: searchTerm,
            brand: filters.brand,
            type: filters.type,
            price_range: filters.price_range
          });
          break;
        default:
          return;
      }

      if (response.success) {
        const newData = { ...data };
        // Acceder correctamente a los datos según el tipo de suministro
        if (activeTab === 'paneles') {
          newData[activeTab] = response.data.panels || [];
        } else if (activeTab === 'inversores') {
          newData[activeTab] = response.data.inverters || [];
        } else if (activeTab === 'baterias') {
          newData[activeTab] = response.data.batteries || [];
        }
        setData(newData);
      } else {
        setError(response.message || 'Error al cargar datos');
      }
    } catch (error) {
      
      setError('Error de conexión: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    return data[activeTab] || [];
  };

  const getTabConfig = () => {
    const configs = {
      paneles: {
        title: 'Paneles Solares',
        icon: Sun,
        color: 'yellow',
        fields: ['brand', 'model', 'power', 'type', 'technical_sheet_url', 'price'],
        powerUnit: 'W',
        priceLabel: 'Precio por Panel'
      },
      inversores: {
        title: 'Inversores',
        icon: Cpu,
        color: 'blue',
        fields: ['brand', 'model', 'power', 'system_type', 'grid_type', 'technical_sheet_url', 'price'],
        powerUnit: 'W',
        priceLabel: 'Precio del Inversor'
      },
      baterias: {
        title: 'Baterías',
        icon: Battery,
        color: 'green',
        fields: ['brand', 'model', 'capacity', 'voltage', 'type', 'technical_sheet_url', 'price'],
        powerUnit: 'kWh',
        priceLabel: 'Precio de la Batería'
      }
    };
    return configs[activeTab] || configs.paneles;
  };

  // Los datos ya vienen filtrados del backend, no necesitamos filtrar aquí
  const filteredData = getCurrentData();

  // Función para aplicar filtros
  const applyFilters = () => {
    loadData();
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      brand: '',
      type: '',
      grid_type: '',
      power_range: '',
      price_range: ''
    });
    setSearchTerm('');
    loadData();
  };

  // Función para manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const openModal = (mode, item = null) => {
    setModalMode(mode);
    setSelectedItem(item);
    
    if (mode === 'create') {
      setFormData({
        brand: '',
        model: '',
        power: '',
        type: '',
        technical_sheet_url: '',
        price: '',
        capacity: '',
        voltage: '',
        system_type: '',
        grid_type: ''
      });
    } else if (item) {
      setFormData({
        brand: item.brand || '',
        model: item.model || '',
        power: item.power || '',
        type: item.type || '',
        technical_sheet_url: item.technical_sheet_url || '',
        price: item.price || '',
        capacity: item.capacity || '',
        voltage: item.voltage || '',
        system_type: item.system_type || '',
        grid_type: item.grid_type || ''
      });
    }
    
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormErrors({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO');
  };

  const getTabIcon = (tab) => {
    const config = getTabConfig();
    return config.icon;
  };

  const getTabColor = (tab) => {
    const config = getTabConfig();
    return config.color;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Suministros</h1>
          <p className="text-slate-600 mt-1">Administra paneles, inversores y baterías para plantas fotovoltaicas</p>
        </div>
        <button
          onClick={() => openModal('create')}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo {getTabConfig().title.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex">
            {Object.entries({
              paneles: 'Paneles Solares',
              inversores: 'Inversores', 
              baterias: 'Baterías'
            }).map(([key, label]) => {
              const Icon = getTabIcon(key);
              const isActive = activeTab === key;
              const color = getTabColor(key);
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    isActive
                      ? `text-${color}-600 bg-${color}-50 border-b-2 border-${color}-600`
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="p-6 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${getTabConfig().title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Marca</label>
              <input
                type="text"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                placeholder="Filtrar por marca..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
              <input
                type="text"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                placeholder="Filtrar por tipo..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {activeTab === 'inversores' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Red</label>
                <select
                  value={filters.grid_type || ''}
                  onChange={(e) => handleFilterChange('grid_type', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="monofasico">Monofásico</option>
                  <option value="bifasico">Bifásico</option>
                  <option value="trifasico_220">Trifásico 220V</option>
                  <option value="trifasico_440">Trifásico 440V</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rango de Precio</label>
              <select
                value={filters.price_range}
                onChange={(e) => handleFilterChange('price_range', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Todos</option>
                <option value="0-100000">$0 - $100,000</option>
                <option value="100000-500000">$100,000 - $500,000</option>
                <option value="500000-1000000">$500,000 - $1,000,000</option>
                <option value="1000000+">$1,000,000+</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Cargando {getTabConfig().title.toLowerCase()}...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Producto</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Potencia/Capacidad</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Precio</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Ficha Técnica</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredData.map((item) => {
                const config = getTabConfig();
                const Icon = config.icon;
                
                return (
          <tr key={item[`${activeTab === 'paneles' ? 'panel' : activeTab === 'inversores' ? 'inverter' : 'battery'}_id`] || item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{item.brand}</p>
                          <p className="text-sm text-slate-600">{item.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-900">
                          {activeTab === 'baterias' 
                            ? `${item.capacity} kWh / ${item.voltage}V`
                            : `${item.power} W`
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {activeTab === 'inversores' 
                          ? `${item.system_type} - ${item.grid_type}`
                          : item.type
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-900">
                        {formatPrice(item.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.technical_sheet_path ? (
                        <a
                          href={`http://localhost:8000/storage/${item.technical_sheet_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                          Ver Ficha
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400">No disponible</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm text-slate-600">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('view', item)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', item)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`¿Estás seguro de eliminar este ${getTabConfig().title.slice(0, -1).toLowerCase()}?`)) {
                              try {
                                let response;
                                switch (activeTab) {
                                  case 'paneles':
                                    response = await apiService.deletePanel(item.panel_id);
                                    break;
                                  case 'inversores':
                                    response = await apiService.deleteInverter(item.inverter_id);
                                    break;
                                  case 'baterias':
                                    response = await apiService.deleteBattery(item.battery_id);
                                    break;
                                }
                                
                                if (response.success) {
                                  loadData();
                                  loadStatistics();
                                } else {
                                  setError(response.message || 'Error al eliminar');
                                }
                              } catch (error) {
                                
                                setError('Error al eliminar: ' + error.message);
                              }
                            }
                          }}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mb-4">No se encontraron {getTabConfig().title.toLowerCase()}</p>
              <button
                onClick={() => openModal('create')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Agregar Primer {getTabConfig().title.slice(0, -1)}
              </button>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  {modalMode === 'create' ? `Nuevo ${getTabConfig().title.slice(0, -1)}` : 
                   modalMode === 'edit' ? `Editar ${getTabConfig().title.slice(0, -1)}` : 
                   `Detalles del ${getTabConfig().title.slice(0, -1)}`}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Información Básica
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Marca *
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Modelo *
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({...formData, model: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {activeTab === 'baterias' ? 'Capacidad (kWh) *' : 'Potencia (W) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={activeTab === 'baterias' ? formData.capacity : formData.power}
                      onChange={(e) => setFormData({...formData, 
                        [activeTab === 'baterias' ? 'capacity' : 'power']: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  {activeTab === 'baterias' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Voltaje (V) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.voltage}
                        onChange={(e) => setFormData({...formData, voltage: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={modalMode === 'view'}
                      />
                    </div>
                  )}
                  
                  {activeTab === 'inversores' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tipo de Sistema *
                        </label>
                        <select
                          value={formData.system_type}
                          onChange={(e) => setFormData({...formData, system_type: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          disabled={modalMode === 'view'}
                        >
                          <option value="">Seleccionar</option>
                          <option value="On-Grid">On-Grid</option>
                          <option value="Off-Grid">Off-Grid</option>
                          <option value="Híbrido">Híbrido</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Tipo de Red *
                        </label>
                        <select
                          value={formData.grid_type}
                          onChange={(e) => setFormData({...formData, grid_type: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          disabled={modalMode === 'view'}
                        >
                          <option value="">Seleccionar</option>
                          <option value="Monofásico">Monofásico</option>
                          <option value="Trifásico">Trifásico</option>
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo *
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      placeholder={activeTab === 'paneles' ? 'Ej: Monocristalino, Policristalino' : 
                                   activeTab === 'baterias' ? 'Ej: Litio, Plomo-Ácido' : 
                                   'Ej: String, Microinversor'}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
                
                {/* Información Comercial */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                    Información Comercial
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Precio (COP) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      URL de Ficha Técnica
                    </label>
                    <input
                      type="url"
                      value={formData.technical_sheet_url}
                      onChange={(e) => setFormData({...formData, technical_sheet_url: e.target.value})}
                      placeholder="https://example.com/tech-sheet.pdf"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                    {formData.technical_sheet_url && (
                      <a
                        href={formData.technical_sheet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver ficha técnica
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {modalMode !== 'view' && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Guardando...' : (modalMode === 'create' ? 'Crear' : 'Actualizar')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VistaSuministros;
