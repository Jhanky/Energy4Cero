import React from 'react';
import { Edit, Shield, Trash2, Users } from 'lucide-react';
import { Button } from '@/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Badge } from '@/ui/badge';
import { Skeleton } from '@/ui/skeleton';

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

const RolTable = ({
    roles,
    loading,
    pagination,
    onEdit,
    onToggleStatus,
    onDelete,
    getPermissionLabel
}) => {
    return (
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
                                            onClick={() => onEdit(role)}
                                            title="Editar rol"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleStatus(role)}
                                            title="Cambiar estado"
                                        >
                                            <Shield className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(role)}
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
    );
};

export default RolTable;
