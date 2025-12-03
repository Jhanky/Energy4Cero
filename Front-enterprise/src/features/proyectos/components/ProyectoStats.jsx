import { Loader2, FolderOpen, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../../ui/card';

const ProyectoStats = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Proyectos',
      value: loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.total,
      icon: FolderOpen,
      color: 'blue'
    },
    {
      title: 'En Progreso',
      value: loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.in_progress,
      icon: Clock,
      color: 'yellow'
    },
    {
      title: 'Completados',
      value: loading ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.completed,
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Valor Total',
      value: loading ? <Loader2 className="w-6 h-6 animate-spin" /> : formatCurrency(stats.total_value),
      icon: DollarSign,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProyectoStats;
