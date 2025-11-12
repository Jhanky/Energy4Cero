import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, Download, Upload, AlertTriangle, Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Skeleton } from '../../ui/skeleton';
import api from '../../services/api';

function VistaMateriales() {
  // Componente para skeleton loading de filas de tabla
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    warehouse_id: '',
    category: '',
    stock_status: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [formData, setFormData] = useState({
    product_id: '',
    description: '',
    quantity: '',
    unit_measure: '',
    category: '',
    warehouse_id: '',
    notes: '',
    is_active: true
  });
  const [importFile, setImportFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [options, setOptions] = useState({
    warehouses: [],
    categories: [],
    unit_measures: []
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    in_warehouses: 0,
    unassigned: 0,
    low_stock: 0,
    out_of_stock: 0
  });

  // Estado de paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Cargar materiales con paginación
  const loadMaterials = useCallback(async (page = 1, perPage, searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        per_page: perPage || pagination.per_page,
        ...filters
      };

      console.log('🔍 Intentando cargar materiales con params:', params);
      console.log('🔑 Token actual:', localStorage.getItem('auth_token'));

      const response = await api.get('/materials', { params });

      console.log('📡 Respuesta completa:', response);
      console.log('📊 Datos de respuesta:', response.data);

      // Verificar que la respuesta tenga la estructura esperada
      // Algunos endpoints pueden devolver datos directamente sin la envoltura 'data'
      let materialsData = [];
      let statsData = {};
      let paginationData = {};

      if (response.data && response.data.data) {
        // Estructura esperada: {success: true, data: {materials: [...], pagination: {...}, stats: {...}}, message: '...'}
        console.log('✅ Estructura esperada encontrada');
        materialsData = response.data.data.materials || [];
        statsData = response.data.data.stats || {};
        paginationData = response.data.data.pagination || {};
      } else if (response.data && response.data.materials) {
        // Estructura alternativa: {materials: [...], pagination: {...}, stats: {...}}
        console.log('✅ Estructura alternativa encontrada (datos directos)');
        materialsData = response.data.materials || [];
        statsData = response.data.stats || {};
        paginationData = response.data.pagination || {};
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response.data);
        // En caso de respuesta inesperada, limpiar los datos
        setMaterials([]);
        setStats({});
        setPagination({});
        return;
      }

      console.log('📊 Datos procesados:', {
        materials: materialsData.length,
        stats: statsData,
        pagination: paginationData
      });

      setMaterials(materialsData);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ Error loading materials:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      // En caso de error, limpiar los datos para evitar crashes
      setMaterials([]);
      setStats({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Cargar opciones
  const loadOptions = async () => {
    try {
      const response = await api.get('/materials/options');
      setOptions(response.data.options);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200); // Reducido de 500ms a 200ms para búsqueda más responsiva

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para cargar materiales cuando cambie la búsqueda debounced o filtros
  useEffect(() => {
    loadMaterials(1, undefined, debouncedSearchTerm); // Reset to page 1 when search/filters change
  }, [debouncedSearchTerm, filters, loadMaterials]);

  // Efecto para cargar opciones al montar el componente
  useEffect(() => {
    loadOptions();
  }, []);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      product_id: '',
      description: '',
      quantity: '',
      unit_measure: '',
      category: '',
      warehouse_id: '',
      notes: '',
      is_active: true
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (material) => {
    setSelectedMaterial(material);
    setFormData({
      product_id: material.product_id,
      description: material.description,
      quantity: material.quantity,
      unit_measure: material.unit_measure,
      category: material.category,
      warehouse_id: material.warehouse_id || '',
      notes: material.notes || '',
      is_active: material.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Crear material
  const handleCreate = async () => {
    try {
      await api.post('/materials', formData);
      console.log('Material creado exitosamente');
      setIsCreateDialogOpen(false);
      loadMaterials(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error creating material:', error);
    }
  };

  // Actualizar material
  const handleUpdate = async () => {
    try {
      await api.put(`/materials/${selectedMaterial.id}`, formData);
      console.log('Material actualizado exitosamente');
      setIsEditDialogOpen(false);
      loadMaterials(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  // Cambiar estado
  const handleToggleStatus = async (material) => {
    try {
      await api.patch(`/materials/${material.id}/toggle-status`);
      console.log(`Material ${material.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadMaterials(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error toggling material status:', error);
    }
  };

  // Eliminar material
  const handleDelete = async (material) => {
    if (!confirm(`¿Estás seguro de eliminar el material "${material.description}"?`)) {
      return;
    }

    try {
      await api.delete(`/materials/${material.id}`);
      console.log('Material eliminado exitosamente');
      loadMaterials(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  // Importar desde Excel
  const handleImport = async () => {
    if (!importFile) {
      alert('Por favor selecciona un archivo Excel');
      return;
    }

    const formDataImport = new FormData();
    formDataImport.append('file', importFile);

    try {
      const response = await api.post('/materials/import', formDataImport, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImportResults(response.data.results);
      console.log('Importación completada:', response.data.results);
      loadMaterials(1, undefined, debouncedSearchTerm); // Recargar la lista
    } catch (error) {
      console.error('Error importing materials:', error);
      setImportResults({ errors: [{ error: error.response?.data?.message || 'Error desconocido' }] });
    }
  };

  // Exportar a Excel
  const handleExport = async () => {
    try {
      const params = {
        search: searchTerm,
        ...filters
      };

      const response = await api.get('/materials/export', {
        params,
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `materiales_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting materials:', error);
    }
  };

  // Obtener ubicación del material
  const getMaterialLocation = (material) => {
    if (material.warehouse) {
      return `Bodega: ${material.warehouse.name}`;
    }
    return 'Sin asignar';
  };

  // Obtener color del stock
  const getStockColor = (quantity) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Obtener texto del stock
  const getStockText = (quantity) => {
    if (quantity === 0) return 'Sin stock';
    if (quantity < 10) return 'Stock bajo';
    return 'En stock';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Materiales</h1>
          <p className="text-gray-600 mt-1">Administra el inventario de materiales consumibles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Importar Excel
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar Excel
          </Button>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Material
          </Button>
        </div>
      </div>

      {/* Alertas de stock */}
      {(stats.low_stock > 0 || stats.out_of_stock > 0) && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {stats.out_of_stock > 0 && `${stats.out_of_stock} materiales sin stock. `}
            {stats.low_stock > 0 && `${stats.low_stock} materiales con stock bajo.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Bodegas</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_warehouses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unassigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.low_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.out_of_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Materiales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar materiales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 transition-all duration-200 ${loading && searchTerm ? 'ring-2 ring-blue-200 border-blue-300' : ''}`}
                />
                {loading && searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs text-blue-600 font-medium">Buscando...</span>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            <Select value={filters.category || "none"} onValueChange={(value) => setFilters({...filters, category: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas</SelectItem>
                {options.categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.warehouse_id || "none"} onValueChange={(value) => setFilters({...filters, warehouse_id: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bodega" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas</SelectItem>
                {options.warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.value} value={warehouse.value}>
                    {warehouse.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.stock_status || "none"} onValueChange={(value) => setFilters({...filters, stock_status: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado de Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos</SelectItem>
                <SelectItem value="in_stock">En stock</SelectItem>
                <SelectItem value="low_stock">Stock bajo</SelectItem>
                <SelectItem value="out_of_stock">Sin stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border transition-opacity duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Producto</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Unidad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  // Mostrar skeleton rows durante la carga
                  Array.from({ length: pagination.per_page || 15 }, (_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No se encontraron materiales
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell className="font-medium">{material.product_id}</TableCell>
                      <TableCell>{material.description}</TableCell>
                      <TableCell className="font-mono">{material.quantity}</TableCell>
                      <TableCell>{material.unit_measure}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{material.category}</Badge>
                      </TableCell>
                      <TableCell>{getMaterialLocation(material)}</TableCell>
                      <TableCell>
                        <Badge className={getStockColor(material.quantity)}>
                          {getStockText(material.quantity)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={material.is_active ? 'default' : 'secondary'}>
                          {material.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(material)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(material)}
                            title="Cambiar estado"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material)}
                            className="text-red-600 hover:text-red-700"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Información de paginación y controles */}
          {!loading && materials.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {pagination.from}-{pagination.to} de {pagination.total} materiales
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm">Elementos por página:</Label>
                  <Select
                    value={pagination.per_page.toString()}
                    onValueChange={(value) => {
                      const newPerPage = parseInt(value);
                      setPagination(prev => ({ ...prev, per_page: newPerPage }));
                      loadMaterials(1, newPerPage, debouncedSearchTerm);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => pagination.current_page > 1 && loadMaterials(pagination.current_page - 1, undefined, debouncedSearchTerm)}
                        className={pagination.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {/* Páginas */}
                    {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                      let pageNum;
                      if (pagination.last_page <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.current_page >= pagination.last_page - 2) {
                        pageNum = pagination.last_page - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => loadMaterials(pageNum, undefined, debouncedSearchTerm)}
                        isActive={pageNum === pagination.current_page}
                        className="cursor-pointer"
                      >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => pagination.current_page < pagination.last_page && loadMaterials(pagination.current_page + 1, undefined, debouncedSearchTerm)}
                        className={pagination.current_page >= pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_id">ID Producto *</Label>
                <Input
                  id="product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  placeholder="ID único del producto"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del material"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="unit_measure">Unidad/Medida *</Label>
                <Select value={formData.unit_measure} onValueChange={(value) => setFormData({...formData, unit_measure: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.unit_measures.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warehouse_id">Bodega</Label>
                <Select value={formData.warehouse_id || "none"} onValueChange={(value) => setFormData({...formData, warehouse_id: value === "none" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar bodega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {options.warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.value} value={warehouse.value}>
                        {warehouse.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Material
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Material</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-product_id">ID Producto *</Label>
                <Input
                  id="edit-product_id"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  placeholder="ID único del producto"
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción detallada del material"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-quantity">Cantidad *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-unit_measure">Unidad/Medida *</Label>
                <Select value={formData.unit_measure} onValueChange={(value) => setFormData({...formData, unit_measure: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.unit_measures.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-warehouse_id">Bodega</Label>
                <Select value={formData.warehouse_id || "none"} onValueChange={(value) => setFormData({...formData, warehouse_id: value === "none" ? "" : value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar bodega" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {options.warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.value} value={warehouse.value}>
                        {warehouse.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notas</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales"
                rows={2}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Activo</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Actualizar Material
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de importación */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Materiales desde Excel</DialogTitle>
            <p className="text-sm text-gray-600">
              Selecciona un archivo Excel con las columnas: ID_Producto, Descripción, Cantidad, Unidad/Medida, Categoría, Ubicación, Notas
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Archivo Excel</Label>
              <Input
                id="import-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
            </div>

            {importResults && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Resultados de la importación:</h4>
                <div className="text-sm space-y-1">
                  <div className="text-green-600">✅ Importados: {importResults.imported || 0}</div>
                  <div className="text-blue-600">🔄 Actualizados: {importResults.updated || 0}</div>
                  {importResults.errors && importResults.errors.length > 0 && (
                    <div className="text-red-600">
                      ❌ Errores: {importResults.errors.length}
                      <ul className="ml-4 mt-1">
                        {importResults.errors.slice(0, 3).map((error, index) => (
                          <li key={index} className="text-xs">• {error.error || error.row}</li>
                        ))}
                        {importResults.errors.length > 3 && (
                          <li className="text-xs">• ... y {importResults.errors.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsImportDialogOpen(false);
                setImportFile(null);
                setImportResults(null);
              }}>
                Cerrar
              </Button>
              <Button onClick={handleImport} disabled={!importFile}>
                Importar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaMateriales;
