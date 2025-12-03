import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Button } from '@/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { SkeletonTable } from '../../../shared/ui';

const SuministrosTable = ({
    data,
    loading,
    activeTab,
    onEdit,
    onDelete
}) => {
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
        return new Date(dateString).toLocaleDateString('es-CO');
    };

    if (loading) {
        return <SkeletonTable columns={7} rows={5} />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
                No se encontraron registros.
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Modelo</TableHead>
                        <TableHead>Marca</TableHead>
                        {activeTab === 'paneles' && <TableHead>Potencia (W)</TableHead>}
                        {activeTab === 'inversores' && <TableHead>Potencia (kW)</TableHead>}
                        {activeTab === 'baterias' && <TableHead>Capacidad (Ah)</TableHead>}
                        <TableHead>Precio</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={item.id || item.panel_id || item.inverter_id || item.battery_id}>
                            <TableCell className="font-medium">{item.model || item.name}</TableCell>
                            <TableCell>{item.brand || '-'}</TableCell>
                            {activeTab === 'paneles' && <TableCell>{item.power_output || '-'}</TableCell>}
                            {activeTab === 'inversores' && <TableCell>{item.power_output_kw || '-'}</TableCell>}
                            {activeTab === 'baterias' && <TableCell>{item.ah_capacity || '-'}</TableCell>}
                            <TableCell>{formatPrice(item.price)}</TableCell>
                            <TableCell>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.is_active
                                        ? 'bg-primary/10 text-primary border border-primary/20'
                                        : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {formatDate(item.created_at)}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    {item.technical_sheet_path && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/storage/${item.technical_sheet_path}`, '_blank')}
                                            title="Ver ficha técnica"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} title="Editar">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(item)} title="Eliminar" className="text-destructive hover:text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default SuministrosTable;
