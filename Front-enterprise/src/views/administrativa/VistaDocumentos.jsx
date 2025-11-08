import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Folder,
  Tag,
  Settings,
  BarChart3
} from 'lucide-react';
import apiService from '../../services/api';

const VistaDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    type: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    department: '',
    type: '',
    version: '00',
    effective_date: '',
    review_date: '',
    is_public: false,
    tags: '',
    file: null
  });
  const [statistics, setStatistics] = useState({});
  const [options, setOptions] = useState({});

  useEffect(() => {
    loadDocumentos();
    loadStatistics();
    loadOptions();
  }, []);

  const loadDocumentos = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        ...filters
      };
      
      
      
      console.log('🔑 Token en localStorage:', localStorage.getItem('auth_token'));
      console.log('👤 Usuario en localStorage:', localStorage.getItem('auth_user'));
      
      // Usar ruta temporal sin autenticación para testing
      const response = await fetch('http://localhost:8000/api/test-documents?' + new URLSearchParams(params), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      
      
      
      if (data.success) {
        const documentosData = data.data.data || data.data || [];
        
        
        setDocumentos(documentosData);
      } else {
        
        throw new Error(data.message || 'Error al cargar documentos');
      }
    } catch (error) {
      
      setError('Error al cargar documentos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test-documents/statistics', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatistics(data.data);
      }
    } catch (error) {
      
    }
  };

  const loadOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/test-documents/options', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setOptions(data.data);
      }
    } catch (error) {
      
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const openModal = (mode, documento = null) => {
    setModalMode(mode);
    setSelectedDocument(documento);
    
    if (mode === 'create') {
      setFormData({
        code: '',
        title: '',
        description: '',
        department: '',
        type: '',
        version: '00',
        effective_date: '',
        review_date: '',
        is_public: false,
        tags: '',
        file: null
      });
    } else if (documento) {
      setFormData({
        code: documento.code,
        title: documento.title,
        description: documento.description || '',
        department: documento.department,
        type: documento.type,
        version: documento.version,
        effective_date: documento.effective_date,
        review_date: documento.review_date || '',
        is_public: documento.is_public,
        tags: documento.tags || '',
        file: null
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocument(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      department: '',
      type: '',
      version: '00',
      effective_date: '',
      review_date: '',
      is_public: false,
      tags: '',
      file: null
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      let response;
      if (modalMode === 'create') {
        response = await apiService.createDocument(formDataToSend);
      } else {
        response = await apiService.updateDocument(selectedDocument.id, formDataToSend);
      }

      if (response.success) {
        closeModal();
        loadDocumentos();
        loadStatistics();
      } else {
        throw new Error(response.message || 'Error al guardar documento');
      }
    } catch (error) {
      
      setError('Error al guardar documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) return;
    
    try {
      setLoading(true);
      const response = await apiService.deleteDocument(id);
      
      if (response.success) {
        loadDocumentos();
        loadStatistics();
      } else {
        throw new Error(response.message || 'Error al eliminar documento');
      }
    } catch (error) {
      
      setError('Error al eliminar documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setLoading(true);
      const response = await apiService.approveDocument(id);
      
      if (response.success) {
        loadDocumentos();
        loadStatistics();
      } else {
        throw new Error(response.message || 'Error al aprobar documento');
      }
    } catch (error) {
      
      setError('Error al aprobar documento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      const response = await apiService.toggleDocumentStatus(id);
      
      if (response.success) {
        loadDocumentos();
        loadStatistics();
      } else {
        throw new Error(response.message || 'Error al cambiar estado');
      }
    } catch (error) {
      
      setError('Error al cambiar estado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (documento) => {
    window.open(`http://localhost:8000/api/documents/${documento.id}/download`, '_blank');
  };

  const handleView = (documento) => {
    window.open(`http://localhost:8000/api/documents/${documento.id}/view`, '_blank');
  };

  const getStatusIcon = (documento) => {
    if (!documento.is_active) return <XCircle className="w-4 h-4 text-red-500" />;
    if (documento.approved_at) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusLabel = (documento) => {
    if (!documento.is_active) return 'Inactivo';
    if (documento.approved_at) return 'Aprobado';
    return 'Pendiente';
  };

  const getStatusColor = (documento) => {
    if (!documento.is_active) return 'bg-red-100 text-red-800';
    if (documento.approved_at) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      'procedimiento': 'bg-blue-100 text-blue-800',
      'formato': 'bg-green-100 text-green-800',
      'manual': 'bg-purple-100 text-purple-800',
      'politica': 'bg-orange-100 text-orange-800',
      'registro': 'bg-yellow-100 text-yellow-800',
      'instructivo': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getDepartmentIcon = (department) => {
    const icons = {
      'DIR': <Settings className="w-4 h-4" />,
      'COM': <BarChart3 className="w-4 h-4" />,
      'ING': <Settings className="w-4 h-4" />,
      'OPE': <Settings className="w-4 h-4" />,
      'RRHH': <User className="w-4 h-4" />,
      'ADM': <Settings className="w-4 h-4" />,
      'SST': <AlertTriangle className="w-4 h-4" />
    };
    return icons[department] || <Folder className="w-4 h-4" />;
  };

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = !searchTerm || 
      documento.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (documento.description && documento.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = !filters.department || documento.department === filters.department;
    const matchesType = !filters.type || documento.type === filters.type;
    const matchesStatus = !filters.status || 
      (filters.status === 'approved' && documento.approved_at) ||
      (filters.status === 'pending' && !documento.approved_at) ||
      (filters.status === 'expired' && documento.review_date && new Date(documento.review_date) < new Date()) ||
      (filters.status === 'needs_review' && documento.review_date && new Date(documento.review_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesDepartment && matchesType && matchesStatus;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Gestión de Documentación</h1>
              <p className="text-slate-600 mt-2">Administra la documentación del sistema integrado de gestión</p>
            </div>
            <button
              onClick={() => openModal('create')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Documento
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Documentos</p>
                  <p className="text-2xl font-bold text-slate-900">{statistics.total || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Aprobados</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.approved || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Por Revisar</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.needs_review || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los Departamentos</option>
              {options.departments?.map(dept => (
                <option key={dept.value} value={dept.value}>{dept.label}</option>
              ))}
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los Tipos</option>
              {options.types?.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Todos los Estados</option>
              {options.statuses?.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Documentos */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-slate-600 mt-2">Cargando documentos...</p>
            </div>
          ) : filteredDocumentos.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No se encontraron documentos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Documento</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Departamento</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Versión</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDocumentos.map((documento) => (
                    <tr key={documento.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {getDepartmentIcon(documento.department)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {documento.title}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {documento.code}
                            </p>
                            {documento.description && (
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                {documento.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          {documento.department_label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(documento.type)}`}>
                          {documento.type_label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(documento)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(documento)}`}>
                            {getStatusLabel(documento)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">
                          v{documento.version}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(documento.effective_date).toLocaleDateString()}
                          </div>
                          {documento.review_date && (
                            <div className="text-xs text-slate-500 mt-1">
                              Revisión: {new Date(documento.review_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(documento)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(documento)}
                            className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', documento)}
                            className="p-1 text-slate-400 hover:text-yellow-600 transition-colors"
                            title="Editar"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                          {!documento.approved_at && (
                            <button
                              onClick={() => handleApprove(documento.id)}
                              className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                              title="Aprobar"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(documento.id)}
                            className={`p-1 transition-colors ${
                              documento.is_active 
                                ? 'text-slate-400 hover:text-red-600' 
                                : 'text-red-400 hover:text-red-600'
                            }`}
                            title={documento.is_active ? 'Desactivar' : 'Activar'}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {modalMode === 'create' ? 'Nuevo Documento' : 
                     modalMode === 'edit' ? 'Editar Documento' : 'Ver Documento'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Código del Documento *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="Ej: DIR-F-01"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Versión
                    </label>
                    <input
                      type="text"
                      value={formData.version}
                      onChange={(e) => setFormData({...formData, version: e.target.value})}
                      placeholder="00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Título del Documento *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Título del documento"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={modalMode === 'view'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del documento"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Departamento *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                      required
                    >
                      <option value="">Seleccionar Departamento</option>
                      {options.departments?.map(dept => (
                        <option key={dept.value} value={dept.value}>{dept.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Documento *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                      required
                    >
                      <option value="">Seleccionar Tipo</option>
                      {options.types?.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha de Vigencia *
                    </label>
                    <input
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Fecha de Revisión
                    </label>
                    <input
                      type="date"
                      value={formData.review_date}
                      onChange={(e) => setFormData({...formData, review_date: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="Tags separados por comas"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                {modalMode !== 'view' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Archivo PDF {modalMode === 'create' ? '*' : '(opcional)'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required={modalMode === 'create'}
                    />
                  </div>
                )}
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={modalMode === 'view'}
                  />
                  <label htmlFor="is_public" className="ml-2 block text-sm text-slate-700">
                    Documento público (accesible sin autenticación)
                  </label>
                </div>
                
                {modalMode !== 'view' && (
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VistaDocumentos;
