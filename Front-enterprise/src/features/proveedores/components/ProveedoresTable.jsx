import { Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { SkeletonTable } from '@/shared/ui';
import ProveedorStatusBadge from '../ui/ProveedorStatusBadge';

const ProveedoresTable = ({
  proveedores,
  loading,
  onEdit,
  onDelete,
  formatCurrency
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <SkeletonTable columns={6} rows={10} />
        </CardContent>
      </Card>
    );
  }

  if (proveedores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-muted-foreground/20 rounded"></div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay proveedores
            </h3>
            <p className="text-muted-foreground">
              Comienza registrando tu primer proveedor.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedores Registrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((proveedor) => (
                <TableRow key={proveedor.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-foreground">{proveedor.nombre}</div>
                      <div className="text-sm text-muted-foreground">NIT: {proveedor.nit}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                      {proveedor.categoria}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{proveedor.contacto}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {proveedor.telefono}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {proveedor.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {proveedor.departamento}
                    </div>
                    <div className="text-sm text-muted-foreground">{proveedor.ciudad}</div>
                  </TableCell>
                  <TableCell>
                    <ProveedorStatusBadge status={proveedor.estado} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(proveedor)}
                        className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar proveedor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(proveedor)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Eliminar proveedor"
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

export default ProveedoresTable;
