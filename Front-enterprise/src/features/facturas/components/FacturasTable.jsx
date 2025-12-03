import { Download, Upload, Edit, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { SkeletonTable } from '@/shared/ui';
import FacturaStatusBadge from '../ui/FacturaStatusBadge';

const FacturasTable = ({
  facturas,
  loading,
  onEdit,
  onDelete,
  onUpload,
  onDownload,
  formatCurrency,
  formatDate
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facturas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonTable columns={7} rows={10} />
        </CardContent>
      </Card>
    );
  }

  if (facturas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facturas Registradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay facturas
            </h3>
            <p className="text-muted-foreground">
              Comienza registrando tu primera factura.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas Registradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Centro de Costos</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facturas.map((factura) => (
                <TableRow key={factura.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-foreground">{factura.numeroFactura}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(factura.fechaEmision)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{factura.proveedor}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{factura.centroCosto}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-foreground">{formatCurrency(factura.valorTotal)}</div>
                    <div className="text-sm text-muted-foreground">{formatCurrency(factura.montoAntesIva)} antes IVA</div>
                  </TableCell>
                  <TableCell>
                    <FacturaStatusBadge status={factura.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">
                      {factura.fechaVencimiento ? formatDate(factura.fechaVencimiento) : 'No definida'}
                    </div>
                    {factura.estaVencida && (
                      <div className="text-sm text-destructive font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Vencida
                      </div>
                    )}
                    {factura.diasHastaVencimiento !== null && factura.diasHastaVencimiento > 0 && !factura.estaVencida && (
                      <div className="text-sm text-orange-600">
                        {factura.diasHastaVencimiento} días
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(factura)}
                        className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar factura"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {factura.archivo ? (
                        <button
                          onClick={() => onDownload(factura)}
                          className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpload(factura)}
                          className="p-2 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Subir archivo"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(factura)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Eliminar factura"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacturasTable;
