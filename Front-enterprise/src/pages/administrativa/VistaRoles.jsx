import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Shield, AlertTriangle, Filter, Users, Key, UserCheck, UserX } from 'lucide-react';
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

function VistaRoles() {
  // Componente para skeleton loading de filas de tabla
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    is_active: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissions: [],
    is_active: true
  });
  const [availablePermissions, setAvailablePermissions] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
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

  // Cargar roles con paginación
  const loadRoles = useCallback(async (page = 1, perPage, searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        per_page: perPage || pagination.per_page,
        ...filters
      };

      console.log('🔍 Cargando roles con params:', params);

      const response = await api.get('/roles', { params });

      console.log('📡 Respuesta de roles:', response);

      // Verificar que la respuesta tenga la estructura esperada
      let rolesData = [];
      let statsData = {};
      let paginationData = {};

      if (response.data && response.data.data) {
        // Estructura esperada: {success: true, data: {roles: [...], pagination: {...}, stats: {...}}, message: '...'}
        rolesData = response.data.data.roles || [];
        statsData = response.data.data.stats || {};
        paginationData = response.data.data.pagination || {};
      } else if (response.data && response.data.roles) {
        // Estructura alternativa: {roles: [...], pagination: {...}, stats: {...}}
        rolesData = response.data.roles || [];
        statsData = response.data.stats || {};
        paginationData = response.data.pagination || {};
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response.data);
        setRoles([]);
        setStats({});
        setPagination({});
        return;
      }

      console.log('📊 Datos procesados:', {
        roles: rolesData.length,
        stats: statsData,
        pagination: paginationData
      });

      setRoles(rolesData);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ Error loading roles:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      setRoles([]);
      setStats({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Cargar permisos disponibles
  const loadPermissions = async () => {
    try {
      console.log('🔐 Cargando permisos disponibles...');
      const response = await api.get('/roles/permissions');
      console.log('📡 Respuesta de permisos:', response);

      let permissionsData = {};
      let modulesData = [];
      let flatPermissionsData = {};

      // Verificar diferentes estructuras de respuesta posibles
      if (response.data && response.data.data) {
        // Estructura esperada: {success: true, data: {permissions: {...}, modules: [...], flat_permissions: {...}}}
        ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data.data);
      } else if (response.data && response.data.permissions) {
        // Estructura alternativa: {permissions: {...}, modules: [...], flat_permissions: {...}}
        ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data);
      } else if (response.data && typeof response.data === 'object' && 'flat_permissions' in response.data) {
        // Estructura directa: {flat_permissions: {...}, modules: [...], permissions: {...}}
        ({ permissions: permissionsData, modules: modulesData, flat_permissions: flatPermissionsData } = response.data);
      } else {
        console.error('❌ Estructura de respuesta inesperada:', response.data);
        setAvailablePermissions({});
        return;
      }

      console.log('✅ Permisos cargados:', {
        permissionsCount: Object.keys(permissionsData || {}).length,
        modules: modulesData || [],
        flatPermissionsCount: Object.keys(flatPermissionsData || {}).length
      });

      setAvailablePermissions(permissionsData || {});
    } catch (error) {
      console.error('❌ Error loading permissions:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setAvailablePermissions({});
    }
  };

  // Efecto para debounce de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Efecto para cargar roles cuando cambie la búsqueda debounced o filtros
  useEffect(() => {
    loadRoles(1, undefined, debouncedSearchTerm);
  }, [debouncedSearchTerm, filters, loadRoles]);

  // Efecto para cargar permisos al montar el componente
  useEffect(() => {
    loadPermissions();
  }, []);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      permissions: [],
      is_active: true
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissions: role.permissions || [],
      is_active: role.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo de eliminación
  const openDeleteDialog = (role) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  // Crear rol
  const handleCreate = async () => {
    try {
      await api.post('/roles', formData);
      console.log('Rol creado exitosamente');
      setIsCreateDialogOpen(false);
      loadRoles(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error creating role:', error);
    }
  };

  // Actualizar rol
  const handleUpdate = async () => {
    try {
      await api.put(`/roles/${selectedRole.role_id}`, formData);
      console.log('Rol actualizado exitosamente');
      setIsEditDialogOpen(false);
      loadRoles(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  // Eliminar rol
  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      await api.delete(`/roles/${roleToDelete.role_id}`);
      console.log('Rol eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setRoleToDelete(null);
      loadRoles(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Cambiar estado del rol
  const handleToggleStatus = async (role) => {
    try {
      await api.patch(`/roles/${role.role_id}/toggle-status`);
      console.log(`Rol ${role.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadRoles(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error toggling role status:', error);
    }
  };

  // Generar slug automáticamente
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    });
  };

  // Manejar cambios en permisos
  const handlePermissionChange = (permission) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];

    setFormData({ ...formData, permissions: newPermissions });
  };

  // Obtener etiqueta de permiso
  const getPermissionLabel = (permission) => {
    const labels = {
      // Usuarios
      'users.create': 'Crear usuarios',
      'users.read': 'Ver usuarios',
      'users.update': 'Editar usuarios',
      'users.delete': 'Eliminar usuarios',
      'users.manage_roles': 'Gestionar roles de usuarios',

      // Roles
      'roles.create': 'Crear roles',
      'roles.read': 'Ver roles',
      'roles.update': 'Editar roles',
      'roles.delete': 'Eliminar roles',

      // Clientes
      'clients.create': 'Crear clientes',
      'clients.read': 'Ver clientes',
      'clients.update': 'Editar clientes',
      'clients.delete': 'Eliminar clientes',
      'clients.export': 'Exportar clientes',

      // Cotizaciones
      'quotations.create': 'Crear cotizaciones',
      'quotations.read': 'Ver cotizaciones',
      'quotations.update': 'Editar cotizaciones',
      'quotations.delete': 'Eliminar cotizaciones',
      'quotations.approve': 'Aprobar cotizaciones',
      'quotations.export': 'Exportar cotizaciones',

      // Proyectos
      'projects.create': 'Crear proyectos',
      'projects.read': 'Ver proyectos',
      'projects.update': 'Editar proyectos',
      'projects.delete': 'Eliminar proyectos',

      // Inventario
      'inventory.create': 'Crear elementos de inventario',
      'inventory.read': 'Ver inventario',
      'inventory.update': 'Editar inventario',
      'inventory.delete': 'Eliminar elementos de inventario',

      // Soporte
      'support.create': 'Crear tickets de soporte',
      'support.read': 'Ver soporte',
      'support.update': 'Editar soporte',
      'support.delete': 'Eliminar soporte',

      // Financiero
      'financial.read': 'Ver finanzas',
      'financial.update': 'Editar finanzas',
      'financial.reports': 'Reportes financieros',

      // Comercial
      'commercial.read': 'Ver comercial',
      'commercial.update': 'Editar comercial',
      'commercial.reports': 'Reportes comerciales',

      // Configuración
      'settings.read': 'Ver configuración',
      'settings.update': 'Editar configuración',

      // Reportes
      'reports.create': 'Crear reportes',
      'reports.read': 'Ver reportes',
      'reports.update': 'Editar reportes',
      'reports.delete': 'Eliminar reportes',

      // Baterías
      'batteries.create': 'Crear baterías',
      'batteries.read': 'Ver baterías',
      'batteries.update': 'Editar baterías',
      'batteries.delete': 'Eliminar baterías'
    };
    return labels[permission] || permission;
  };

  // Obtener permisos agrupados por módulo
  const getGroupedPermissions = () => {
    const grouped = {};
    Object.entries(availablePermissions).forEach(([module, permissions]) => {
      if (permissions && Array.isArray(permissions)) {
        if (!grouped[module]) grouped[module] = [];
        permissions.forEach((permission) => {
          if (permission && typeof permission === 'object' && permission.key) {
            grouped[module].push({
              key: permission.key,
              label: permission.label || getPermissionLabel(permission.key)
            });
          }
        });
      }
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Roles</h1>
          <p className="text-muted-foreground mt-1">Administra los roles y permisos del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Rol
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permisos Totales</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...new Set(roles.flatMap(r => r.permissions || []))].length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'}`} />
                <Input
                  placeholder="Buscar roles..."
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
            <Select value={filters.is_active || "none"} onValueChange={(value) => setFilters({ ...filters, is_active: value === "none" ? "" : value })}>
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
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {loading ? (
                  Array.from({ length: pagination.per_page || 15 }, (_, index) => (
                    <SkeletonRow key={`skeleton-${index}`} />
                  ))
                ) : roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No se encontraron roles
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.role_id} className="transition-all duration-200 hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{role.name}</p>
                            <p className="text-sm text-muted-foreground">@{role.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{role.description || 'Sin descripción'}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).slice(0, 3).map((permission, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {getPermissionLabel(permission)}
                            </Badge>
                          ))}
                          {role.permissions && role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{role.users_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={role.is_active ? 'default' : 'secondary'}>
                          {role.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                            title="Editar rol"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(role)}
                            title="Cambiar estado"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(role)}
                            title="Eliminar rol"
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
          {!loading && roles.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {pagination.from}-{pagination.to} de {pagination.total} roles
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm">Elementos por página:</Label>
                  <Select
                    value={pagination.per_page.toString()}
                    onValueChange={(value) => {
                      const newPerPage = parseInt(value);
                      setPagination(prev => ({ ...prev, per_page: newPerPage }));
                      loadRoles(1, newPerPage, debouncedSearchTerm);
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
                        onClick={() => pagination.current_page > 1 && loadRoles(pagination.current_page - 1, undefined, debouncedSearchTerm)}
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
                            onClick={() => loadRoles(pageNum, undefined, debouncedSearchTerm)}
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
                        onClick={() => pagination.current_page < pagination.last_page && loadRoles(pagination.current_page + 1, undefined, debouncedSearchTerm)}
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
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Rol *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Administrador"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ej: administrador"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del rol..."
                rows={3}
              />
            </div>

            {/* Permisos */}
            <div>
              <Label>Permisos</Label>
              <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {(() => {
                  const groupedPerms = getGroupedPermissions();
                  const entries = Object.entries(groupedPerms);

                  if (entries.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay permisos disponibles</p>
                        <p className="text-sm mt-1">Verifica la conexión con el servidor</p>
                      </div>
                    );
                  }

                  return entries.map(([module, permissions]) => (
                    <div key={module} className="space-y-2">
                      <h4 className="font-medium text-sm text-foreground capitalize">{module}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {permissions.map((permission) => {
                          // Asegurar que permission.key sea un string válido
                          const permissionKey = typeof permission.key === 'string' ? permission.key : String(permission.key || '');
                          const permissionLabel = typeof permission.label === 'string' ? permission.label : String(permission.label || permissionKey);

                          return (
                            <div key={permissionKey} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`create-${permissionKey}`}
                                checked={formData.permissions.includes(permissionKey)}
                                onChange={() => handlePermissionChange(permissionKey)}
                                className="rounded border-input"
                              />
                              <Label htmlFor={`create-${permissionKey}`} className="text-sm">
                                {permissionLabel}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Rol activo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre del Rol *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Administrador"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug *</Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ej: administrador"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del rol..."
                rows={3}
              />
            </div>

            {/* Permisos */}
            <div>
              <Label>Permisos</Label>
              <div className="mt-2 space-y-4 max-h-60 overflow-y-auto border rounded-lg p-4">
                {(() => {
                  const groupedPerms = getGroupedPermissions();
                  const entries = Object.entries(groupedPerms);

                  if (entries.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <p>No hay permisos disponibles</p>
                        <p className="text-sm mt-1">Verifica la conexión con el servidor</p>
                      </div>
                    );
                  }

                  return entries.map(([module, permissions]) => (
                    <div key={module} className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-900 capitalize">{module}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                        {permissions.map((permission) => {
                          // Asegurar que permission.key sea un string válido
                          const permissionKey = typeof permission.key === 'string' ? permission.key : String(permission.key || '');
                          const permissionLabel = typeof permission.label === 'string' ? permission.label : String(permission.label || permissionKey);

                          return (
                            <div key={permissionKey} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-${permissionKey}`}
                                checked={formData.permissions.includes(permissionKey)}
                                onChange={() => handlePermissionChange(permissionKey)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`edit-${permissionKey}`} className="text-sm">
                                {permissionLabel}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Rol activo</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Actualizar Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Eliminar Rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ¿Estás seguro de que quieres eliminar el rol <strong>{roleToDelete?.name}</strong>?
                Esta acción no se puede deshacer.
              </AlertDescription>
            </Alert>

            {roleToDelete?.users_count > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Este rol tiene {roleToDelete.users_count} usuario(s) asignado(s).
                  Los usuarios perderán este rol.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Eliminar Rol
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VistaRoles;
