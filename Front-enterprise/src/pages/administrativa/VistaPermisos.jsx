import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Shield, AlertTriangle, Filter, Key, UserCheck, UserX } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../ui/pagination';
import { Skeleton } from '../../ui/skeleton';
import api from '../../services/api';

function VistaPermisos() {
  // Componente para skeleton loading de filas de tabla
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    module: '',
    is_active: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [permissionToDelete, setPermissionToDelete] = useState(null);
  const [formData, setFormData] = useState({
    module: '',
    action: '',
    key: '',
    label: '',
    description: '',
    is_active: true
  });
  const [availableModules, setAvailableModules] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    modules: []
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

  // Cargar permisos con paginación
  const loadPermissions = useCallback(async (page = 1, perPage, searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        per_page: perPage || pagination.per_page,
        ...filters
      };

      console.log('🔐 Cargando permisos con params:', params);

      const response = await api.get('/permissions', { params });

      console.log('📡 Respuesta de permisos:', response);

      // Verificar que la respuesta tenga la estructura esperada
      let permissionsData = [];
      let statsData = {};
      let paginationData = {};

      if (response.data && response.data.data) {
        permissionsData = response.data.data.permissions || [];
        statsData = response.data.data.stats || {};
        paginationData = response.data.data.pagination || {};
      } else if (response.data && response.data.permissions) {
        permissionsData = response.data.permissions || [];
        statsData = response.data.stats || {};
        paginationData = response.data.pagination || {};
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response.data);
        setPermissions([]);
        setStats({});
        setPagination({});
        return;
      }

      console.log('📊 Datos procesados:', {
        permissions: permissionsData.length,
        stats: statsData,
        pagination: paginationData
      });

      setPermissions(permissionsData);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ Error loading permissions:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setPermissions([]);
      setStats({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Cargar módulos disponibles
  const loadModules = async () => {
    try {
      console.log('🔧 Cargando módulos disponibles...');
      const response = await api.get('/permissions/modules');
      console.log('📡 Respuesta de módulos:', response);

      let modulesData = [];

      // Verificar diferentes estructuras de respuesta posibles
      if (response.data && response.data.data && response.data.data.modules) {
        // Estructura esperada: {success: true, data: {modules: [...]}}
        modulesData = response.data.data.modules;
      } else if (response.data && Array.isArray(response.data)) {
        // Estructura directa: [...]
        modulesData = response.data;
      } else if (response.data && response.data.modules && Array.isArray(response.data.modules)) {
        // Estructura alternativa: {modules: [...]}
        modulesData = response.data.modules;
      } else {
        console.warn('⚠️ Estructura de respuesta inesperada para módulos:', response.data);
        // Fallback: usar módulos por defecto del config
        modulesData = [
          'users', 'roles', 'clients', 'quotations', 'projects',
          'inventory', 'support', 'financial', 'commercial',
          'settings', 'reports', 'batteries'
        ];
        console.log('🔄 Usando módulos por defecto:', modulesData);
      }

      console.log('✅ Módulos cargados:', modulesData);
      setAvailableModules(modulesData);
    } catch (error) {
      console.error('❌ Error loading modules:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      // Fallback: usar módulos por defecto en caso de error
      const defaultModules = [
        'users', 'roles', 'clients', 'quotations', 'projects',
        'inventory', 'support', 'financial', 'commercial',
        'settings', 'reports', 'batteries'
      ];
      console.log('🔄 Usando módulos por defecto debido a error:', defaultModules);
      setAvailableModules(defaultModules);
    }
  };

  // Generar clave automáticamente
  const generateKey = async () => {
    if (!formData.module || !formData.action) return;

    try {
      const response = await api.get('/permissions/generate-key', {
        params: {
          module: formData.module,
          action: formData.action
        }
      });

      if (response.data && response.data.data) {
        const { key, label } = response.data.data;
        setFormData(prev => ({
          ...prev,
          key,
          label
        }));
      }
    } catch (error) {
      console.error('Error generating key:', error);
    }
  };

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para cargar permisos cuando cambie la búsqueda debounced o filtros
  useEffect(() => {
    loadPermissions(1, undefined, debouncedSearchTerm);
  }, [debouncedSearchTerm, filters, loadPermissions]);

  // Efecto para cargar módulos al montar el componente
  useEffect(() => {
    loadModules();
  }, []);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      module: '',
      action: '',
      key: '',
      label: '',
      description: '',
      is_active: true
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (permission) => {
    setSelectedPermission(permission);
    setFormData({
      module: permission.module,
      action: permission.action,
      key: permission.key,
      label: permission.label,
      description: permission.description || '',
      is_active: permission.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo de eliminación
  const openDeleteDialog = (permission) => {
    setPermissionToDelete(permission);
    setIsDeleteDialogOpen(true);
  };

  // Crear permiso
  const handleCreate = async () => {
    try {
      await api.post('/permissions', formData);
      console.log('Permiso creado exitosamente');
      setIsCreateDialogOpen(false);
      loadPermissions(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error creating permission:', error);
    }
  };

  // Actualizar permiso
  const handleUpdate = async () => {
    try {
      await api.put(`/permissions/${selectedPermission.id}`, formData);
      console.log('Permiso actualizado exitosamente');
      setIsEditDialogOpen(false);
      loadPermissions(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error updating permission:', error);
    }
  };

  // Eliminar permiso
  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      await api.delete(`/permissions/${permissionToDelete.id}`);
      console.log('Permiso eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setPermissionToDelete(null);
      loadPermissions(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error deleting permission:', error);
    }
  };

  // Cambiar estado del permiso
  const handleToggleStatus = async (permission) => {
    try {
      await api.patch(`/permissions/${permission.id}/toggle-status`);
      console.log(`Permiso ${permission.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadPermissions(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error toggling permission status:', error);
    }
  };

  // Manejar cambios en módulo o acción para generar clave
  const handleModuleActionChange = () => {
    if (formData.module && formData.action) {
      generateKey();
    }
  };

  useEffect(() => {
    handleModuleActionChange();
  }, [formData.module, formData.action]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
          <p className="text-gray-600 mt-1">Administra los permisos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Permiso
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permisos</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.modules?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar permisos..."
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
            <Select value={filters.module || "none"} onValueChange={(value) => setFilters({...filters, module: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los módulos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos los módulos</SelectItem>
                {availableModules.map((module) => (
                  <SelectItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.is_active || "none"} onValueChange={(value) => setFilters({...filters, is_active: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos los estados</SelectItem>
                <SelectItem value="true">Activos</SelectItem>
                <SelectItem value="false">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          <div className="rounded-md border transition-opacity duration-300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permiso</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Clave</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  Array.from({ length: pagination.per_page || 15 }, (_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron permisos
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                            <Key className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{permission.label}</p>
                            {permission.description && (
                              <p className="text-sm text-slate-600">{permission.description}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {permission.module}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {permission.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {permission.key}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={permission.is_active ? 'default' : 'secondary'}>
                          {permission.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(permission)}
                            title="Editar permiso"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(permission)}
                            title="Cambiar estado"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(permission)}
                            title="Eliminar permiso"
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

          {/* Paginación */}
          {!loading && permissions.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {pagination.from}-{pagination.to} de {pagination.total} permisos
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm">Elementos por página:</Label>
                  <Select
                    value={pagination.per_page.toString()}
                    onValueChange={(value) => {
                      const newPerPage = parseInt(value);
                      setPagination(prev => ({ ...prev, per_page: newPerPage }));
                      loadPermissions(1, newPerPage, debouncedSearchTerm);
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
                        onClick={() => pagination.current_page > 1 && loadPermissions(pagination.current_page - 1, undefined, debouncedSearchTerm)}
                        className={pagination.current_page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

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
                            onClick={() => loadPermissions(pageNum, undefined, debouncedSearchTerm)}
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
                        onClick={() => pagination.current_page < pagination.last_page && loadPermissions(pagination.current_page + 1, undefined, debouncedSearchTerm)}
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
            <DialogTitle>Crear Nuevo Permiso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module">Módulo *</Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="action">Acción *</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Crear</SelectItem>
                    <SelectItem value="read">Ver</SelectItem>
                    <SelectItem value="update">Editar</SelectItem>
                    <SelectItem value="delete">Eliminar</SelectItem>
                    <SelectItem value="export">Exportar</SelectItem>
                    <SelectItem value="import">Importar</SelectItem>
                    <SelectItem value="manage_roles">Gestionar Roles</SelectItem>
                    <SelectItem value="approve">Aprobar</SelectItem>
                    <SelectItem value="reports">Reportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="key">Clave *</Label>
              <Input
                id="key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="Ej: users.create"
              />
            </div>
            <div>
              <Label htmlFor="label">Etiqueta *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ej: Crear usuarios"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del permiso..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Permiso activo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Permiso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Permiso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-module">Módulo *</Label>
                <Select value={formData.module} onValueChange={(value) => setFormData({ ...formData, module: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-action">Acción *</Label>
                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Crear</SelectItem>
                    <SelectItem value="read">Ver</SelectItem>
                    <SelectItem value="update">Editar</SelectItem>
                    <SelectItem value="delete">Eliminar</SelectItem>
                    <SelectItem value="export">Exportar</SelectItem>
                    <SelectItem value="import">Importar</SelectItem>
                    <SelectItem value="manage_roles">Gestionar Roles</SelectItem>
                    <SelectItem value="approve">Aprobar</SelectItem>
                    <SelectItem value="reports">Reportes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-key">Clave *</Label>
              <Input
                id="edit-key"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                placeholder="Ej: users.create"
              />
            </div>
            <div>
              <Label htmlFor="edit-label">Etiqueta *</Label>
              <Input
                id="edit-label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ej: Crear usuarios"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del permiso..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Permiso activo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Actualizar Permiso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Permiso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ¿Estás seguro de que quieres eliminar el permiso <strong>{permissionToDelete?.label}</strong>?
                Esta acción no se puede deshacer.
              </AlertDescription>
            </Alert>

            {permissionToDelete && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Clave:</strong> <code>{permissionToDelete.key}</code>
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Módulo:</strong> {permissionToDelete.module}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Acción:</strong> {permissionToDelete.action}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar Permiso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaPermisos;
