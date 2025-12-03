import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AccesoDenegado = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center border border-border">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">Acceso Restringido</h1>

        <p className="text-muted-foreground mb-6">
          Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
        </p>

        <div className="bg-muted rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            Si crees que debes tener acceso a esta funcionalidad, contacta a tu administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccesoDenegado;