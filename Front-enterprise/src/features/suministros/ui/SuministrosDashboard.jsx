import { useState } from 'react';
import { Package, Zap, BatteryCharging, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { SuministrosManager } from './index';

const SuministrosDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, manager

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Suministros</h1>
          <p className="text-slate-600 mt-1">Resumen y gestión de suministros para plantas fotovoltaicas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'dashboard'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveView('manager')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeView === 'manager'
                ? 'bg-green-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Gestión
          </button>
        </div>
      </div>

      {/* Widgets de Suministros */}
      {activeView === 'dashboard' && (
        <>
          
          {/* Sección de últimas actividades */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Nuevo panel solar agregado</p>
                  <p className="text-sm text-slate-600">Panel Jinko Solar JKM415M-54HL4-B</p>
                </div>
                <span className="text-sm text-slate-500">Hace 2 horas</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Inversor actualizado</p>
                  <p className="text-sm text-slate-600">Inversor SMA Sunny Tripower 10000TL</p>
                </div>
                <span className="text-sm text-slate-500">Hace 1 día</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BatteryCharging className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Batería eliminada</p>
                  <p className="text-sm text-slate-600">Batería Tesla Powerwall 2</p>
                </div>
                <span className="text-sm text-slate-500">Hace 3 días</span>
              </div>
            </div>
          </div>
          
          {/* Sección de alertas */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">Alertas de Inventario</h3>
                <p className="text-amber-700 text-sm mt-1">
                  Tienes 3 productos con stock bajo que requieren atención.
                </p>
                <button className="mt-3 text-amber-800 text-sm font-medium hover:underline">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Gestión de Suministros */}
      {activeView === 'manager' && (
        <SuministrosManager />
      )}
    </div>
  );
};

export default SuministrosDashboard;
