import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Switch } from '@/ui/switch';

const RolModal = ({
    isOpen,
    onClose,
    mode,
    formData,
    onFormChange,
    availablePermissions,
    onSubmit,
    isSubmitting,
    handleNameChange,
    handlePermissionChange,
    getGroupedPermissions
}) => {
    const handleInputChange = (field, value) => {
        onFormChange({ [field]: value });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'}
                    </DialogTitle>
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
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                placeholder="Ej: administrador"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
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
                                                const permissionKey = typeof permission.key === 'string' ? permission.key : String(permission.key || '');
                                                const permissionLabel = typeof permission.label === 'string' ? permission.label : String(permission.label || permissionKey);

                                                return (
                                                    <div key={permissionKey} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`${mode}-${permissionKey}`}
                                                            checked={formData.permissions.includes(permissionKey)}
                                                            onChange={() => handlePermissionChange(permissionKey)}
                                                            className="rounded border-input"
                                                        />
                                                        <Label htmlFor={`${mode}-${permissionKey}`} className="text-sm">
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
                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        />
                        <Label htmlFor="is_active">Rol activo</Label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={onSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : (mode === 'create' ? 'Crear Rol' : 'Actualizar Rol')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default RolModal;
