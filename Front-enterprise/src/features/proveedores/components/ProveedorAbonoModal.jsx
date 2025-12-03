import { X, Upload, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Textarea } from '@/ui/textarea';

const ProveedorAbonoModal = ({
  isOpen,
  onClose,
  selectedProveedor,
  abonoData,
  setAbonoData,
  onSubmit,
  formatCurrency
}) => {
  if (!selectedProveedor) return null;

  const handleSubmit = () => {
    onSubmit();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAbonoData(prev => ({ ...prev, soporteArchivo: file }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium text-foreground">{selectedProveedor.nombre}</p>
            <p className="text-sm text-muted-foreground">Deuda actual: {formatCurrency(selectedProveedor.deudaPendiente)}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="valor">Valor del Abono *</Label>
              <Input
                id="valor"
                type="number"
                value={abonoData.valor}
                onChange={(e) => setAbonoData(prev => ({ ...prev, valor: e.target.value }))}
                placeholder="0"
                max={selectedProveedor.deudaPendiente}
              />
            </div>

            <div>
              <Label htmlFor="fecha">Fecha del Pago *</Label>
              <Input
                id="fecha"
                type="date"
                value={abonoData.fecha}
                onChange={(e) => setAbonoData(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="metodoPago">Método de Pago *</Label>
              <Select
                value={abonoData.metodoPago}
                onValueChange={(value) => setAbonoData(prev => ({ ...prev, metodoPago: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="referencia">Referencia/Número</Label>
              <Input
                id="referencia"
                type="text"
                value={abonoData.referencia}
                onChange={(e) => setAbonoData(prev => ({ ...prev, referencia: e.target.value }))}
                placeholder="Número de transferencia, cheque, etc."
              />
            </div>

            <div>
              <Label>Soporte de Pago</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="soporte-abono"
                />
                <label htmlFor="soporte-abono" className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {abonoData.soporteArchivo ? abonoData.soporteArchivo.name : 'Seleccionar imagen o PDF'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Máx. 5MB</p>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={abonoData.notas}
                onChange={(e) => setAbonoData(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Notas adicionales..."
                rows={3}
              />
            </div>
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
            onClick={handleSubmit}
            className="flex-1"
          >
            Registrar Abono
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProveedorAbonoModal;
