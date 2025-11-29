import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Eye, Users, AlertTriangle, Filter } from 'lucide-react';
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

function VistaUsuarios() {
  // Componente para skeleton loading de filas de tabla
  const SkeletonRow = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role_id: '',
    is_active: ''
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_id: '',
    phone: '',
    position: '',
    is_active: true
  });
  const [options, setOptions] = useState({
    roles: []
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    administrators: 0,
    managers: 0,
    technicians: 0,
    others: 0
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

  // Cargar usuarios con paginación
  const loadUsers = useCallback(async (page = 1, perPage, searchTerm = '') => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        page,
        per_page: perPage || pagination.per_page,
        ...filters
      };

      console.log('🔍 Intentando cargar usuarios con params:', params);
      console.log('🔑 Token actual:', localStorage.getItem('auth_token'));

      const response = await api.get('/users', { params });

      console.log('📡 Respuesta completa:', response);
      console.log('📊 Datos de respuesta:', response.data);

      // Verificar que la respuesta tenga la estructura esperada
      let usersData = [];
      let statsData = {};
      let paginationData = {};

      if (response.data && response.data.data) {
        // Estructura esperada: {success: true, data: {users: [...], pagination: {...}, stats: {...}}, message: '...'}
        console.log('✅ Estructura esperada encontrada');
        usersData = response.data.data.users || [];
        statsData = response.data.data.stats || {};
        paginationData = response.data.data.pagination || {};
      } else if (response.data && response.data.users) {
        // Estructura alternativa: {users: [...], pagination: {...}, stats: {...}}
        console.log('✅ Estructura alternativa encontrada (datos directos)');
        usersData = response.data.users || [];
        statsData = response.data.stats || {};
        paginationData = response.data.pagination || {};
      } else {
        console.error('❌ Respuesta inesperada del servidor:', response.data);
        // En caso de respuesta inesperada, limpiar los datos
        setUsers([]);
        setStats({});
        setPagination({});
        return;
      }

      console.log('📊 Datos procesados:', {
        users: usersData.length,
        stats: statsData,
        pagination: paginationData
      });

      setUsers(usersData);
      setStats(statsData);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status
      });
      // En caso de error, limpiar los datos para evitar crashes
      setUsers([]);
      setStats({});
      setPagination({});
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.per_page]);

  // Cargar opciones
  const loadOptions = async () => {
    try {
      const response = await api.get('/users/options');
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

  // Efecto para cargar usuarios cuando cambie la búsqueda debounced o filtros
  useEffect(() => {
    loadUsers(1, undefined, debouncedSearchTerm); // Reset to page 1 when search/filters change
  }, [debouncedSearchTerm, filters, loadUsers]);

  // Efecto para cargar opciones al montar el componente
  useEffect(() => {
    loadOptions();
  }, []);

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
      phone: '',
      position: '',
      is_active: true
    });
  };

  // Abrir diálogo de creación
  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role_id: user.role_id,
      phone: user.phone || '',
      position: user.position || '',
      is_active: user.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Crear usuario
  const handleCreate = async () => {
    try {
      await api.post('/users', formData);
      console.log('Usuario creado exitosamente');
      setIsCreateDialogOpen(false);
      loadUsers(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Actualizar usuario
  const handleUpdate = async () => {
    try {
      await api.put(`/users/${selectedUser.id}`, formData);
      console.log('Usuario actualizado exitosamente');
      setIsEditDialogOpen(false);
      loadUsers(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Cambiar estado
  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      console.log(`Usuario ${user.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadUsers(1, undefined, debouncedSearchTerm);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };





  // Obtener nombre del rol
  const getRoleName = (roleId) => {
    const role = options.roles?.find(r => r.role_id === roleId);
    return role ? role.name : 'Sin rol';
  };

  // Obtener color del rol
  const getRoleColor = (roleId) => {
    const role = options.roles?.find(r => r.role_id === roleId);
    if (!role) return 'gray';

    const colors = {
      'administrador': 'red',
      'gerente': 'blue',
      'contador': 'purple',
      'ingeniero': 'green',
      'tecnico': 'orange'
    };

    return colors[role.slug] || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra los usuarios del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.administrators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.technicians}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otros</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.others}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${loading && searchTerm ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
                <Input
                  placeholder="Buscar usuarios..."
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
            <Select value={filters.role_id || "none"} onValueChange={(value) => setFilters({...filters, role_id: value === "none" ? "" : value})}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos los roles</SelectItem>
                {options.roles?.map((role) => (
                  <SelectItem key={role.role_id} value={role.role_id}>
                    {role.name}
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Cargo</TableHead>
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="transition-all duration-200 hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`bg-${getRoleColor(user.role_id)}-100 text-${getRoleColor(user.role_id)}-800 border-${getRoleColor(user.role_id)}-200`}>
                          {getRoleName(user.role_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.position || 'Sin cargo'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            title="Cambiar estado"
                          >
                            <Eye className="w-4 h-4" />
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
          {!loading && users.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
              <div className="text-sm text-gray-600">
                Mostrando {pagination.from}-{pagination.to} de {pagination.total} usuarios
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="page-size" className="text-sm">Elementos por página:</Label>
                  <Select
                    value={pagination.per_page.toString()}
                    onValueChange={(value) => {
                      const newPerPage = parseInt(value);
                      setPagination(prev => ({ ...prev, per_page: newPerPage }));
                      loadUsers(1, newPerPage, debouncedSearchTerm);
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
                        onClick={() => pagination.current_page > 1 && loadUsers(pagination.current_page - 1, undefined, debouncedSearchTerm)}
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
                        onClick={() => loadUsers(pageNum, undefined, debouncedSearchTerm)}
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
                        onClick={() => pagination.current_page < pagination.last_page && loadUsers(pagination.current_page + 1, undefined, debouncedSearchTerm)}
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
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="password_confirmation">Confirmar Contraseña</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role_id">Rol *</Label>
                <Select value={formData.role_id} onValueChange={(value) => setFormData({...formData, role_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.roles?.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Cargo en la empresa"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Usuario activo</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>
                Crear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Nombre Completo *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-password">Contraseña (dejar vacío para mantener)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <Label htmlFor="edit-password_confirmation">Confirmar Contraseña</Label>
                <Input
                  id="edit-password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-role_id">Rol *</Label>
                <Select value={formData.role_id} onValueChange={(value) => setFormData({...formData, role_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.roles?.map((role) => (
                      <SelectItem key={role.role_id} value={role.role_id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-phone">Teléfono</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-position">Cargo</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Cargo en la empresa"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-is_active">Usuario activo</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdate}>
                Actualizar Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

export default VistaUsuarios;
