import { X, Upload, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Textarea } from '@/ui/textarea';

const FacturaModal = ({
  isOpen,
  onClose,
  isEdit = false,
  formData,
  formErrors,
  submitting,
  suppliers,
  costCenters,
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
            {isEdit ? 'Editar Factura' : 'Registrar Nueva Factura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_number">Número de Factura *</Label>
              <Input
                id="invoice_number"
                type="text"
                value={formData.invoice_number}
                onChange={(e) => onFormChange('invoice_number', e.target.value)}
                placeholder="Ej: FAC-001-2025"
                className={formErrors.invoice_number ? 'border-destructive' : ''}
              />
              {formErrors.invoice_number && (
                <p className="text-sm text-destructive">{formErrors.invoice_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => onFormChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="pagada">Pagada</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier_id">Proveedor *</Label>
              <Select
                value={formData.supplier_id}
                onValueChange={(value) => onFormChange('supplier_id', value)}
              >
                <SelectTrigger className={formErrors.supplier_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccionar proveedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.supplier_id && (
                <p className="text-sm text-destructive">{formErrors.supplier_id}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost_center_id">Centro de Costos *</Label>
              <Select
                value={formData.cost_center_id}
                onValueChange={(value) => onFormChange('cost_center_id', value)}
              >
                <SelectTrigger className={formErrors.cost_center_id ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Seleccionar centro de costos" />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map(costCenter => (
                    <SelectItem key={costCenter.id} value={costCenter.id.toString()}>
                      {costCenter.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.cost_center_id && (
                <p className="text-sm text-destructive">{formErrors.cost_center_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Tipo de Pago</Label>
              <Select
                value={formData.payment_type}
                onValueChange={(value) => onFormChange('payment_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Pago Total</SelectItem>
                  <SelectItem value="parcial">Pago Parcial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue_date">Fecha de Emisión *</Label>
              <Input
                id="issue_date"
                type="date"
                value={formData.issue_date}
                onChange={(e) => onFormChange('issue_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount_before_iva">Monto Antes de IVA *</Label>
              <Input
                id="amount_before_iva"
                type="number"
                step="0.01"
                value={formData.amount_before_iva}
                onChange={(e) => onFormChange('amount_before_iva', e.target.value)}
                placeholder="0.00"
                className={formErrors.amount_before_iva ? 'border-destructive' : ''}
              />
              {formErrors.amount_before_iva && (
                <p className="text-sm text-destructive">{formErrors.amount_before_iva}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_value">Valor Total *</Label>
              <Input
                id="total_value"
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={(e) => onFormChange('total_value', e.target.value)}
                placeholder="0.00"
                className={formErrors.total_value ? 'border-destructive' : ''}
              />
              {formErrors.total_value && (
                <p className="text-sm text-destructive">{formErrors.total_value}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Fecha de Vencimiento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => onFormChange('due_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Archivo de la Factura</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => onFormChange('file', e.target.files[0])}
                className="hidden"
                id="invoice-file"
              />
              <label htmlFor="invoice-file" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {formData.file ? formData.file.name : 'Seleccionar PDF o imagen de la factura'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Máx. 5MB (Opcional)</p>
              </label>
            </div>
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
                isEdit ? 'Actualizar Factura' : 'Registrar Factura'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FacturaModal;
