import { Clock, CheckCircle, XCircle } from 'lucide-react';

const FacturaStatusBadge = ({ status }) => {
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pagada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anulada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="w-3 h-3" />;
      case 'pagada':
        return <CheckCircle className="w-3 h-3" />;
      case 'anulada':
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

export default FacturaStatusBadge;
