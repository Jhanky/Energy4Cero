import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';

const ProyectoModal = ({
    isOpen,
    onClose,
    mode,
    formData,
    onFormChange,
    clientes = [],
    onSubmit,
    isSubmitting
}) => {
    const handleInputChange = (field, value) => {
        onFormChange({ [field]: value });
    };

    const estadoOptions = [
        { value: '1', label: 'Preparación Solicitud' },
        { value: '2', label: 'Solicitud Presentada' },
        { value: '3', label: 'Revisión Completitud' },
        { value: '4', label: 'Revisión Técnica' },
        { value: '5', label: 'Concepto Viabilidad' },
        { value: '6', label: 'Instalación Proceso' },
        { value: '7', label: 'Inspección Pendiente' },
        { value: '8', label: 'Inspección Realizada' },
        { value: '9', label: 'Observaciones Inspección' },
        { value: '10', label: 'Aprobación Final' },
        { value: '11', label: 'Conectado Operando' },
        { value: '12', label: 'Suspendido' },
        { value: '13', label: 'Cancelado' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Crear Nuevo Proyecto' : 'Editar Proyecto'}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Información Básica</h3>
                        <div>
                            <Label htmlFor="name">Nombre del Proyecto *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Nombre del proyecto"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Descripción del proyecto"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Cliente y Estado */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="client_id">Cliente *</Label>
                            <Select
                                value={formData.client_id}
                                onValueChange={(value) => handleInputChange('client_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {clientes.map((cliente) => (
                                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                                            {cliente.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="project_state_id">Estado del Proyecto</Label>
                            <Select
                                value={formData.project_state_id?.toString()}
                                onValueChange={(value) => handleInputChange('project_state_id', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    {estadoOptions.map((estado) => (
                                        <SelectItem key={estado.value} value={estado.value}>
                                            {estado.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Información Financiera */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Información Financiera</h3>
                        <div>
                            <Label htmlFor="contract_value">Valor del Contrato (COP)</Label>
                            <Input
                                id="contract_value"
                                type="number"
                                value={formData.contract_value}
                                onChange={(e) => handleInputChange('contract_value', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Fechas</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="start_date">Fecha de Inicio</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="end_date">Fecha de Finalización</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Ubicación</h3>
                        <div>
                            <Label htmlFor="location">Dirección del Proyecto</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                placeholder="Dirección del proyecto"
                            />
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-foreground">Notas Adicionales</h3>
                        <div>
                            <Label htmlFor="notes">Notas</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Notas adicionales del proyecto"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Proyecto' : 'Actualizar Proyecto')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProyectoModal;
