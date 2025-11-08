import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccesoDenegado from './AccesoDenegado';

/**
 * Componente para proteger rutas basado en roles y permisos
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componente a renderizar si tiene permisos
 * @param {string|string[]} props.role - Rol(es) requerido(s) para acceder
 * @param {string|string[]} props.permission - Permiso(s) requerido(s) para acceder
 * @param {string} props.redirectTo - Ruta de redirección si no tiene permisos (default: '/login')
 * @param {React.ReactNode} props.fallback - Componente alternativo si no tiene permisos
 * @returns {React.ReactNode} Componente protegido o mensaje de acceso denegado
 */
const ProtectedRoute = ({ 
  children, 
  role, 
  permission, 
  redirectTo = '/login',
  fallback = null 
}) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Verificar autenticación
      if (!isAuthenticated()) {
        setChecking(false);
        return;
      }

      // Si se requiere rol o permiso específico, verificar contra los datos del usuario
      if (role || permission) {
        // Verificar si el usuario está autenticado y tiene datos
        if (!user) {
          // Intentar actualizar la información del usuario
          const refreshResult = await refreshUser();
          if (refreshResult.success) {
            const updatedUser = refreshResult.user;
            // Verificar rol si se especifica
            if (role) {
              const requiredRoles = Array.isArray(role) ? role : [role];
              const hasRole = requiredRoles.includes(updatedUser.role?.slug) || requiredRoles.includes(updatedUser.role?.name);
              setHasAccess(hasRole);
            }

            // Verificar permiso si se especifica
            if (permission) {
              const requiredPermissions = Array.isArray(permission) ? permission : [permission];
              // Verificar si el usuario tiene al menos uno de los permisos requeridos
              const hasPermissionCheck = requiredPermissions.some(perm => 
                updatedUser.role?.permissions?.includes(perm)
              );
              setHasAccess(hasPermissionCheck);
            }
          } else {
            setHasAccess(false);
          }
        } else {
          // Verificar rol si se especifica
          if (role) {
            const requiredRoles = Array.isArray(role) ? role : [role];
            const hasRole = requiredRoles.includes(user.role?.slug) || requiredRoles.includes(user.role?.name);
            setHasAccess(hasRole);
          }

          // Verificar permiso si se especifica
          if (permission) {
            const requiredPermissions = Array.isArray(permission) ? permission : [permission];
            // Verificar si el usuario tiene al menos uno de los permisos requeridos
            const hasPermissionCheck = requiredPermissions.some(perm => 
              user.role?.permissions?.includes(perm)
            );
            setHasAccess(hasPermissionCheck);
          }
        }
      } else {
        // Si no se requiere rol o permiso específico, solo verificar autenticación
        setHasAccess(true);
      }

      setChecking(false);
    };

    checkAccess();
  }, [user, isAuthenticated, role, permission, refreshUser]);

  // Mientras se verifica la información
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Verificar autenticación
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si no tiene acceso, mostrar el fallback
  if (!hasAccess) {
    return fallback || <AccesoDenegado />;
  }

  return children;
};

export default ProtectedRoute;