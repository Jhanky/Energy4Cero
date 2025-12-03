import React from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw, Clock } from 'lucide-react';
import { Button } from '../../ui/button';

const Error503 = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-2">503</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Servicio no disponible</h2>
          <p className="text-gray-600 mb-8">
            El servicio no está disponible temporalmente. Estamos realizando mantenimiento o el servidor está sobrecargado.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <Button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Intentar nuevamente
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
            El servicio debería estar disponible pronto. Mientras tanto:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• Intenta acceder más tarde</li>
            <li>• Verifica el estado del servicio en nuestras redes sociales</li>
            <li>• Contacta al soporte si el problema persiste por mucho tiempo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Error503;
