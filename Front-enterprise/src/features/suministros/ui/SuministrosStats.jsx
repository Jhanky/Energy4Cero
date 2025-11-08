import { Package, Zap, BatteryCharging } from 'lucide-react';

const SuministrosStats = ({ statistics, formatPrice }) => {
  const stats = [
    {
      id: 'panels',
      title: 'Paneles Solares',
      icon: Package,
      color: 'yellow',
      count: statistics.panels?.total || 0,
      averagePrice: statistics.panels?.averagePrice || 0
    },
    {
      id: 'inverters',
      title: 'Inversores',
      icon: Zap,
      color: 'blue',
      count: statistics.inverters?.total || 0,
      averagePrice: statistics.inverters?.averagePrice || 0
    },
    {
      id: 'batteries',
      title: 'Baterías',
      icon: BatteryCharging,
      color: 'green',
      count: statistics.batteries?.total || 0,
      averagePrice: statistics.batteries?.averagePrice || 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stat.count}</p>
                <p className="text-sm text-slate-600">{stat.title}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SuministrosStats;
