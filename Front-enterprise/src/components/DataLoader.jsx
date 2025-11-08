import React from 'react';
import { Loader2, Database, Wifi, Clock, CheckCircle } from 'lucide-react';

const DataLoader = ({ 
  loading = false, 
  error = null, 
  retryFunction = null, 
  children, 
  title = "Cargando datos",
  subtitle = "Por favor espere mientras cargamos la información",
  size = "normal", // 'small', 'normal', 'large'
  type = "spinner" // 'spinner', 'bars', 'dots', 'pulse'
}) => {
  const sizeClasses = {
    small: { icon: "w-6 h-6", text: "text-sm", gap: "gap-2" },
    normal: { icon: "w-8 h-8", text: "text-base", gap: "gap-3" },
    large: { icon: "w-12 h-12", text: "text-lg", gap: "gap-4" }
  };

  const currentSize = sizeClasses[size];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Wifi className={`w-8 h-8 text-red-600`} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Error al cargar datos</h3>
        <p className="text-slate-600 mb-4 max-w-md">
          {error.message || "Ocurrió un error al cargar la información"}
        </p>
        {retryFunction && (
          <button
            onClick={retryFunction}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <div className={`flex items-center justify-center ${currentSize.gap} mb-4`}>
          {type === 'spinner' && (
            <div className={`${currentSize.icon} animate-spin text-green-600`}>
              <Loader2 className="w-full h-full" />
            </div>
          )}
          {type === 'bars' && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-6 bg-green-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-6 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-6 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
          {type === 'dots' && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          )}
          {type === 'pulse' && (
            <div className={`${currentSize.icon} rounded-full bg-green-100 flex items-center justify-center`}>
              <Database className={`text-green-600 ${currentSize.icon.replace('animate-spin', '')}`} />
            </div>
          )}
        </div>
        <h3 className={`font-medium text-slate-900 ${currentSize.text}`}>
          {title}
        </h3>
        <p className={`text-slate-600 mt-1 ${currentSize.text.replace('text-base', 'text-sm')}`}>
          {subtitle}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataLoader;