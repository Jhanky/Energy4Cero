import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/button';

const Error403 = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-foreground mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Acceso prohibido</h2>
          <p className="text-gray-600 mb-8">
            No tienes permisos suficientes para acceder a esta página o recurso.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Ir al inicio
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Si crees que deberías tener acceso a esta página:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• Verifica que has iniciado sesión correctamente</li>
            <li>• Contacta a tu administrador para solicitar permisos</li>
            <li>• Asegúrate de que tu cuenta esté activa</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Error403;
