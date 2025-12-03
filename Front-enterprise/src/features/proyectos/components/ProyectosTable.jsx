import { FolderOpen, Edit, Trash2, Eye, Calendar, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { StatusBadge } from '../../../ui/status-badge';
import { SkeletonTable } from '../../../shared/ui';

const ProyectosTable = ({
  proyectos,
  loading,
  pagination,
  onView,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="rounded-md border transition-opacity duration-300">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Valor del Contrato</TableHead>
              <TableHead>Fechas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="transition-opacity duration-300 opacity-50">
            <SkeletonTable columns={7} rows={pagination.per_page || 15} asRows={true} />
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border transition-opacity duration-300">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proyecto</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Valor del Contrato</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {proyectos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron proyectos
              </TableCell>
            </TableRow>
          ) : (
            proyectos.map((proyecto) => (
              <TableRow key={proyecto.id} className="transition-all duration-200 hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{proyecto.name}</p>
                      <p className="text-sm text-muted-foreground">{proyecto.description}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-foreground">
                      {proyecto.client?.name || 'Sin cliente'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {proyecto.client?.email || ''}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    variant={proyecto.current_state?.slug || 'estado-desconocido'}
                    size="sm"
                  >
                    {proyecto.current_state?.name || 'Estado Desconocido'}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-foreground">
                    {proyecto.responsible_commercial || 'No asignado'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium text-foreground">
                    {formatCurrency(proyecto.contract_value)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Inicio: {formatDate(proyecto.start_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Fin: {formatDate(proyecto.end_date)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onView(proyecto)}
                      className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50/10 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(proyecto)}
                      className="p-2 text-muted-foreground hover:text-green-600 hover:bg-green-50/10 rounded-lg transition-colors"
                      title="Editar proyecto"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(proyecto)}
                      className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50/10 rounded-lg transition-colors"
                      title="Eliminar proyecto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default ProyectosTable;
