import { Trash2, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

const ProveedorDeleteModal = ({
  isOpen,
  onClose,
  selectedProveedor,
  deleteConfirmation,
  setDeleteConfirmation,
  onConfirmDelete,
  formatCurrency
}) => {
  if (!selectedProveedor) return null;

  const handleConfirm = () => {
    onConfirmDelete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Confirmar Eliminación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">¿Eliminar proveedor?</p>
              <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground">{selectedProveedor.nombre}</p>
            <p className="text-sm text-muted-foreground">NIT: {selectedProveedor.nit}</p>
            {selectedProveedor.deudaPendiente > 0 && (
              <p className="text-sm text-orange-600 font-medium mt-1">
                ⚠️ Tiene deuda pendiente: {formatCurrency(selectedProveedor.deudaPendiente)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Para confirmar, escriba <span className="font-bold text-destructive">"Eliminar"</span>
            </Label>
            <Input
              id="confirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Escriba aquí..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={deleteConfirmation !== 'Eliminar'}
            variant="destructive"
            className="flex-1"
          >
            Eliminar Proveedor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProveedorDeleteModal;
