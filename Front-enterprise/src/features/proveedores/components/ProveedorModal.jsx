import { X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';

const ProveedorModal = ({
  isOpen,
  onClose,
  isEdit = false,
  formData,
  formErrors,
  submitting,
  modalDepartments,
  modalCities,
  loadingModalDepartments,
  loadingModalCities,
  onFormChange,
  onSubmit
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_type">Tipo de Proveedor *</Label>
              <Select
                value={formData.supplier_type}
                onValueChange={(value) => onFormChange('supplier_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empresa">Empresa</SelectItem>
                  <SelectItem value="persona">Persona Natural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Estado</Label>
              <Select
                value={formData.is_active ? 'activo' : 'inactivo'}
                onValueChange={(value) => onFormChange('is_active', value === 'activo')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre/Razón Social *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="Nombre del proveedor"
              className={formErrors.name ? 'border-destructive' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-destructive">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nit">NIT *</Label>
              <Input
                id="nit"
                type="text"
                value={formData.nit}
                onChange={(e) => onFormChange('nit', e.target.value)}
                placeholder="900123456-7"
                className={formErrors.nit ? 'border-destructive' : ''}
              />
              {formErrors.nit && (
                <p className="text-sm text-destructive">{formErrors.nit}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => onFormChange('notes', e.target.value)}
                placeholder="Notas adicionales"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
                placeholder="+57 300 123 4567"
                className={formErrors.phone ? 'border-destructive' : ''}
              />
              {formErrors.phone && (
                <p className="text-sm text-destructive">{formErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                placeholder="contacto@proveedor.com"
                className={formErrors.email ? 'border-destructive' : ''}
              />
              {formErrors.email && (
                <p className="text-sm text-destructive">{formErrors.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección *</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => onFormChange('address', e.target.value)}
              placeholder="Dirección completa"
              className={formErrors.address ? 'border-destructive' : ''}
            />
            {formErrors.address && (
              <p className="text-sm text-destructive">{formErrors.address}</p>
            )}
          </div>

          {/* Select de departamento y ciudad eliminados temporalmente */}
          <div className="p-4 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <p className="text-sm text-muted-foreground text-center">
              Los campos de departamento y ciudad han sido eliminados temporalmente
            </p>
          </div>

          {formErrors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{formErrors.general}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Registrando...'}
                </>
              ) : (
                isEdit ? 'Actualizar Proveedor' : 'Registrar Proveedor'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProveedorModal;
