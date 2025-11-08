import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const SessionExpired = ({ onRefresh }) => {
  useEffect(() => {
    // Auto-refresh después de 3 segundos
    const timer = setTimeout(() => {
      onRefresh();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onRefresh]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4 mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Sesión Expirada</h1>
          <p className="text-slate-600 mb-6">
            Su sesión ha expirado por seguridad. Será redirigido automáticamente al login.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Redirigiendo...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpired;
