import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogIn, ArrowLeft } from 'lucide-react';
import { Button } from '../../ui/button';

const Error401 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icono de error */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-2">401</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No autorizado</h2>
          <p className="text-gray-600 mb-8">
            Debes iniciar sesión para acceder a esta página o recurso.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link to="/login" className="flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              Iniciar sesión
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
            Si ya tienes una cuenta:
          </p>
          <ul className="text-sm text-gray-500 text-left space-y-1">
            <li>• Verifica que tus credenciales sean correctas</li>
            <li>• Asegúrate de que tu cuenta esté activa</li>
            <li>• Contacta al administrador si tienes problemas de acceso</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Error401;
