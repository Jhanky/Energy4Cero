import React from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Users,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const RoleStats = ({ stats = {}, formatPrice }) => {
  // Tarjetas de estadísticas
  const statCards = [
    {
      title: "Total Roles",
      value: stats.total_roles || 0,
      icon: Shield,
      color: "blue",
      description: "Roles en el sistema"
    },
    {
      title: "Roles Activos",
      value: stats.active_roles || 0,
      icon: Check,
      color: "green",
      description: "Roles actualmente activos"
    },
    {
      title: "Roles Inactivos",
      value: stats.inactive_roles || 0,
      icon: X,
      color: "red",
      description: "Roles desactivados"
    },
    {
      title: "Usuarios Asignados",
      value: Object.values(stats.users_by_role || {}).reduce((sum, count) => sum + count, 0),
      icon: Users,
      color: "purple",
      description: "Total de usuarios con roles"
    }
  ];

  // Obtener clases de color para cada tarjeta
  const getColorClasses = (color) => {
    const classes = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        border: "border-blue-200"
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        border: "border-green-200"
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        border: "border-red-200"
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        border: "border-purple-200"
      },
      yellow: {
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        border: "border-yellow-200"
      }
    };
    
    return classes[color] || classes.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        const colors = getColorClasses(card.color);
        
        return (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.description}</p>
              </div>
              <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${colors.text}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoleStats;