import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccesoDenegado = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Acceso Restringido</h1>
        
        <p className="text-slate-600 mb-6">
          Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
        </p>
        
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm text-slate-500">
            Si crees que debes tener acceso a esta funcionalidad, contacta a tu administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccesoDenegado;