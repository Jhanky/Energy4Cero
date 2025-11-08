import { Package, Zap, BatteryCharging } from 'lucide-react';

const SuministrosTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'paneles',
      label: 'Paneles Solares',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'inversores',
      label: 'Inversores',
      icon: <Zap className="w-5 h-5" />,
    },
    {
      id: 'baterias',
      label: 'Baterías',
      icon: <BatteryCharging className="w-5 h-5" />,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200
              ${activeTab === tab.id
                ? 'bg-green-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
              }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuministrosTabs;