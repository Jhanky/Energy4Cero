import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Wrench, Move, Filter } from 'lucide-react';
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
import api from '../../services/api';

function VistaHerramientas() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    warehouse_id: '',
    project_id: '',
    tool_state_id: '',
    location_type: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    brand: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    supplier: '',
    warehouse_id: '',
    project_id: '',
    tool_state_id: '',
    is_active: true,
    notes: ''
  });
  const [moveData, setMoveData] = useState({
    warehouse_id: '',
    project_id: ''
  });
  const [options, setOptions] = useState({
    tool_states: [],
    warehouses: [],
    projects: []
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    in_warehouses: 0,
    in_projects: 0,
    unassigned: 0
  });


  // Cargar herramientas
  const loadTools = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        per_page: 50,
        ...filters
      };

      const response = await api.get('/tools', { params });
      setTools(response.data.data.tools);
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar opciones
  const loadOptions = async () => {
    try {
      const response = await api.get('/tools/options');
      setOptions(response.data.data.options);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  useEffect(() => {
    loadTools();
    loadOptions();
  }, [searchTerm, filters]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      brand: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      purchase_price: '',
      supplier: '',
      warehouse_id: '',
      project_id: '',
      tool_state_id: '',
      is_active: true,
      notes: ''
    });
  };

  // Resetear datos de movimiento
  const resetMoveData = () => {
    setMoveData({
      warehouse_id: '',
      project_id: ''
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (tool) => {
    setSelectedTool(tool);
    setFormData({
      name: tool.name,
      code: tool.code,
      description: tool.description || '',
      brand: tool.brand || '',
      model: tool.model || '',
      serial_number: tool.serial_number || '',
      purchase_date: tool.purchase_date || '',
      purchase_price: tool.purchase_price || '',
      supplier: tool.supplier || '',
      warehouse_id: tool.warehouse_id || '',
      project_id: tool.project_id || '',
      tool_state_id: tool.tool_state_id,
      is_active: tool.is_active,
      notes: tool.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo de movimiento
  const openMoveDialog = (tool) => {
    setSelectedTool(tool);
    setMoveData({
      warehouse_id: tool.warehouse_id || '',
      project_id: tool.project_id || ''
    });
    setIsMoveDialogOpen(true);
  };

  // Crear herramienta
  const handleCreate = async () => {
    try {
      await api.post('/tools', formData);
      console.log('Herramienta creada exitosamente');
      setIsCreateDialogOpen(false);
      loadTools();
    } catch (error) {
      console.error('Error creating tool:', error);
    }
  };

  // Actualizar herramienta
  const handleUpdate = async () => {
    try {
      await api.put(`/tools/${selectedTool.id}`, formData);
      console.log('Herramienta actualizada exitosamente');
      setIsEditDialogOpen(false);
      loadTools();
    } catch (error) {
      console.error('Error updating tool:', error);
    }
  };

  // Mover herramienta
  const handleMove = async () => {
    try {
      await api.patch(`/tools/${selectedTool.id}/move`, moveData);
      console.log('Herramienta movida exitosamente');
      setIsMoveDialogOpen(false);
      loadTools();
    } catch (error) {
      console.error('Error moving tool:', error);
    }
  };

  // Cambiar estado
  const handleToggleStatus = async (tool) => {
    try {
      await api.patch(`/tools/${tool.id}/toggle-status`);
      console.log(`Herramienta ${tool.is_active ? 'desactivada' : 'activada'} exitosamente`);
      loadTools();
    } catch (error) {
      console.error('Error toggling tool status:', error);
    }
  };

  // Eliminar herramienta
  const handleDelete = async (tool) => {
    if (!confirm(`¿Estás seguro de eliminar la herramienta "${tool.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/tools/${tool.id}`);
      console.log('Herramienta eliminada exitosamente');
      loadTools();
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  // Obtener nombre del estado de herramienta
  const getToolStateName = (toolStateId) => {
    const state = options.tool_states.find(s => s.value === toolStateId);
    return state ? state.label : 'Sin estado';
  };

  // Obtener color del estado de herramienta
  const getToolStateColor = (toolStateId) => {
    const state = options.tool_states.find(s => s.value === toolStateId);
    return state ? state.color : '#6b7280';
  };

  // Obtener ubicación de la herramienta
  const getToolLocation = (tool) => {
    if (tool.warehouse) {
      return `Bodega: ${tool.warehouse.name}`;
    } else if (tool.project) {
      return `Proyecto: ${tool.project.name}`;
    }
    return 'Sin asignar';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Herramientas</h1>
          <p className="text-gray-600 mt-1">Administra las herramientas del sistema</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Herramienta
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Wrench className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Bodegas</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.in_warehouses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proyectos</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.in_projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Asignar</CardTitle>
            <Wrench className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unassigned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
            <Wrench className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar herramientas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filters.location_type || "none"} onValueChange={(value) => setFilters({...filters, location_type: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ubicación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas</SelectItem>
                <SelectItem value="warehouse">En Bodega</SelectItem>
                <SelectItem value="project">En Proyecto</SelectItem>
                <SelectItem value="unassigned">Sin Asignar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.tool_state_id || "none"} onValueChange={(value) => setFilters({...filters, tool_state_id: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos los estados</SelectItem>
                {options.tool_states.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Cargando...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron herramientas
                    </TableCell>
                  </TableRow>
                ) : (
                  tools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell className="font-medium">{tool.code}</TableCell>
                      <TableCell>{tool.name}</TableCell>
                      <TableCell>
                        {tool.brand && tool.model ? `${tool.brand} ${tool.model}` : (tool.brand || tool.model || '-')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{ backgroundColor: getToolStateColor(tool.tool_state_id) }}
                          className="text-white"
                        >
                          {getToolStateName(tool.tool_state_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getToolLocation(tool)}</TableCell>
                      <TableCell>
                        <Badge variant={tool.is_active ? 'default' : 'secondary'}>
                          {tool.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(tool)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openMoveDialog(tool)}
                            title="Mover"
                          >
                            <Move className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(tool)}
                            title="Cambiar estado"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(tool)}
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
        </CardContent>
      </Card>

      {/* Diálogo de creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Herramienta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la herramienta"
                />
              </div>
              <div>
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Código único"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la herramienta"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Marca"
                />
              </div>
              <div>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Modelo"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serial_number">Número de Serie</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Número de serie"
                />
              </div>
              <div>
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Proveedor"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="purchase_date">Fecha de Compra</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">Precio de Compra</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tool_state_id">Estado *</Label>
                <Select value={formData.tool_state_id} onValueChange={(value) => setFormData({...formData, tool_state_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.tool_states.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="warehouse_id">Bodega</Label>
                <Select value={formData.warehouse_id || "none"} onValueChange={(value) => setFormData({...formData, warehouse_id: value === "none" ? "" : value, project_id: (value !== "none" && value) ? '' : formData.project_id})}>
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
              <div>
                <Label htmlFor="project_id">Proyecto</Label>
                <Select value={formData.project_id || "none"} onValueChange={(value) => setFormData({...formData, project_id: value === "none" ? "" : value, warehouse_id: (value !== "none" && value) ? '' : formData.warehouse_id})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {options.projects.map((project) => (
                      <SelectItem key={project.value} value={project.value}>
                        {project.label}
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
              <Label htmlFor="is_active">Activa</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Herramienta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de movimiento */}
      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Mover Herramienta</DialogTitle>
            <p className="text-sm text-gray-600">
              {selectedTool ? `Mover "${selectedTool.name}" a una nueva ubicación` : ''}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="move-warehouse">Bodega</Label>
              <Select value={moveData.warehouse_id || "none"} onValueChange={(value) => setMoveData({...moveData, warehouse_id: value === "none" ? "" : value, project_id: (value !== "none" && value) ? '' : moveData.project_id})}>
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
            <div>
              <Label htmlFor="move-project">Proyecto</Label>
              <Select value={moveData.project_id || "none"} onValueChange={(value) => setMoveData({...moveData, project_id: value === "none" ? "" : value, warehouse_id: (value !== "none" && value) ? '' : moveData.warehouse_id})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {options.projects.map((project) => (
                    <SelectItem key={project.value} value={project.value}>
                      {project.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleMove}>
                Mover Herramienta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaHerramientas;
