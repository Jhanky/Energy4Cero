import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import api from '../../services/api';

function VistaBodegas() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    manager: '',
    is_active: true
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    with_tools: 0
  });


  // Cargar bodegas
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/warehouses', {
        params: { search: searchTerm, per_page: 50 }
      });

      if (response.success && response.data) {
        setWarehouses(response.data.warehouses || []);
        setStats(response.data.stats || {
          total: 0,
          active: 0,
          inactive: 0,
          with_tools: 0
        });
      } else {
        console.error('Respuesta inválida de la API:', response);
        setWarehouses([]);
        setStats({
          total: 0,
          active: 0,
          inactive: 0,
          with_tools: 0
        });
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      console.error('No se pudieron cargar las bodegas');
      setWarehouses([]);
      setStats({
        total: 0,
        active: 0,
        inactive: 0,
        with_tools: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, [searchTerm]);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      manager: '',
      is_active: true
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      description: warehouse.description || '',
      location: warehouse.location || '',
      manager: warehouse.manager || '',
      is_active: warehouse.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Crear bodega
  const handleCreate = async () => {
    // Validación básica
    if (!formData.name.trim()) {
      alert('El nombre de la bodega es obligatorio');
      return;
    }

    try {
      const response = await api.post('/warehouses', formData);
      if (response.success) {
        console.log('Bodega creada exitosamente');
        setIsCreateDialogOpen(false);
        resetForm();
        loadWarehouses();
      } else {
        console.error('Error al crear bodega:', response.message);
        alert(response.message || 'Error al crear la bodega');
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear la bodega';
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  // Actualizar bodega
  const handleUpdate = async () => {
    // Validación básica
    if (!formData.name.trim()) {
      alert('El nombre de la bodega es obligatorio');
      return;
    }

    try {
      const response = await api.put(`/warehouses/${selectedWarehouse.id}`, formData);
      if (response.success) {
        console.log('Bodega actualizada exitosamente');
        setIsEditDialogOpen(false);
        loadWarehouses();
      } else {
        console.error('Error al actualizar bodega:', response.message);
        alert(response.message || 'Error al actualizar la bodega');
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la bodega';
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  // Cambiar estado
  const handleToggleStatus = async (warehouse) => {
    try {
      const response = await api.patch(`/warehouses/${warehouse.id}/toggle-status`);
      if (response.success) {
        console.log(`Bodega ${warehouse.is_active ? 'desactivada' : 'activada'} exitosamente`);
        loadWarehouses();
      } else {
        console.error('Error al cambiar estado de bodega:', response.message);
        alert(response.message || 'Error al cambiar el estado de la bodega');
      }
    } catch (error) {
      console.error('Error toggling warehouse status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al cambiar el estado de la bodega';
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  // Eliminar bodega
  const handleDelete = async (warehouse) => {
    if (!confirm(`¿Estás seguro de eliminar la bodega "${warehouse.name}"?`)) {
      return;
    }

    try {
      const response = await api.delete(`/warehouses/${warehouse.id}`);
      if (response.success) {
        console.log('Bodega eliminada exitosamente');
        loadWarehouses();
      } else {
        console.error('Error al eliminar bodega:', response.message);
        alert(response.message || 'Error al eliminar la bodega');
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar la bodega';
      console.error(errorMessage);
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Bodegas</h1>
          <p className="text-gray-600 mt-1">Administra las bodegas del sistema</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Bodega
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bodegas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Building2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
            <Building2 className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Con Herramientas</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.with_tools}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Bodegas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar bodegas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Encargado</TableHead>
                  <TableHead>Herramientas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Cargando...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : warehouses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron bodegas
                    </TableCell>
                  </TableRow>
                ) : (
                  warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.name}</TableCell>
                      <TableCell>{warehouse.location || '-'}</TableCell>
                      <TableCell>{warehouse.manager || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {warehouse.tools_count || 0} herramientas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                          {warehouse.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(warehouse)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(warehouse)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(warehouse)}
                            className="text-red-600 hover:text-red-700"
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crear Nueva Bodega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la bodega"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la bodega"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección o ubicación"
              />
            </div>
            <div>
              <Label htmlFor="manager">Encargado</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nombre del encargado"
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
                Crear Bodega
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Bodega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la bodega"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la bodega"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Dirección o ubicación"
              />
            </div>
            <div>
              <Label htmlFor="edit-manager">Encargado</Label>
              <Input
                id="edit-manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="Nombre del encargado"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Activa</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Actualizar Bodega
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaBodegas;
