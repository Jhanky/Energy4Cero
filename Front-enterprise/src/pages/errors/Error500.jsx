import React from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';

const Error500 = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-2">500</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Error interno del servidor</h2>
          <p className="text-gray-600 mb-8">
            Ha ocurrido un error inesperado en el servidor. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Recargar página
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link to="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Si el problema persiste, intenta lo siguiente:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• Limpia la caché de tu navegador</li>
            <li>• Intenta acceder desde otro dispositivo</li>
            <li>• Contacta al soporte técnico si es necesario</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Error500;
