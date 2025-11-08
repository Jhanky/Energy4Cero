import { AlertTriangle, Database, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import dataService from '../../services/dataService';

const MockDataIndicator = () => {
  const [serviceInfo, setServiceInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info = dataService.getServiceInfo();
    setServiceInfo(info);
    
    // Solo mostrar el indicador en desarrollo y cuando se usen datos de prueba
    setIsVisible(info.isDevelopment && info.useMockData);
  }, []);

  if (!isVisible || !serviceInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Modo Datos de Prueba
            </p>
            <p className="text-xs text-yellow-700">
              Usando {serviceInfo.serviceName}
            </p>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-yellow-300">
          <div className="flex items-center gap-2 text-xs text-yellow-700">
            <Database className="w-3 h-3" />
            <span>Backend: {serviceInfo.backendUrl}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-yellow-700 mt-1">
            <Wifi className="w-3 h-3" />
            <span>Estado: Desconectado</span>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MockDataIndicator;
