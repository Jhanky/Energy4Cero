import { CheckCircle, XCircle } from 'lucide-react';

const ProveedorStatusBadge = ({ status }) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="w-3 h-3" />;
      case 'inactivo':
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(status)}`}>
      {getEstadoIcon(status)}
      <span className="capitalize">{status}</span>
    </div>
  );
};

export default ProveedorStatusBadge;
