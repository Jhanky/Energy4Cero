import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DefaultRedirect = () => {
  const navigate = useNavigate();
  const { hasPermission, hasRole, usuario } = useAuth();

  useEffect(() => {
    // Definir redirección basada en roles
    let redirectTo = '/home'; // página por defecto si tiene autenticación

    // Mostrar información de depuración
    console.log('🔧 Usuario actual:', usuario);
    console.log('🔧 Rol del usuario:', usuario?.role?.slug);
    console.log('🔧 Permisos del usuario:', usuario?.role?.permissions);

    // Verificar si las funciones hasRole y hasPermission están funcionando
    console.log('🔧 hasRole("administrador"):', hasRole('administrador'));
    console.log('🔧 hasRole("gerente"):', hasRole('gerente'));
    console.log('🔧 hasRole("comercial"):', hasRole('comercial'));
    console.log('🔧 hasRole("contador"):', hasRole('contador'));
    console.log('🔧 hasRole("ingeniero"):', hasRole('ingeniero'));
    console.log('🔧 hasRole("tecnico"):', hasRole('tecnico'));

    // Verificar roles en orden de prioridad
    if (hasRole('administrador')) {
      console.log('🔧 Redirigiendo a /home/administrativa');
      redirectTo = '/home/administrativa';
    } else if (hasRole('gerente')) {
      console.log('🔧 Redirigiendo a /home/proyectos');
      redirectTo = '/home/proyectos';
    } else if (hasRole('comercial')) {
      console.log('🔧 Redirigiendo a /home/comercial');
      redirectTo = '/home/comercial';
    } else if (hasRole('contador')) {
      console.log('🔧 Redirigiendo a /home/contable');
      redirectTo = '/home/contable';
    } else if (hasRole('ingeniero')) {
      console.log('🔧 Redirigiendo a /home/proyectos');
      redirectTo = '/home/proyectos';
    } else if (hasRole('tecnico')) {
      console.log('🔧 Redirigiendo a /home/proyectos');
      redirectTo = '/home/proyectos';
    } else if (hasPermission('users.read')) {
      console.log('🔧 Redirigiendo a /home/administrativa (por permiso users.read)');
      redirectTo = '/home/administrativa';
    } else if (hasPermission('projects.read')) {
      console.log('🔧 Redirigiendo a /home/proyectos (por permiso projects.read)');
      redirectTo = '/home/proyectos';
    } else if (hasPermission('commercial.read')) {
      console.log('🔧 Redirigiendo a /home/comercial (por permiso commercial.read)');
      redirectTo = '/home/comercial';
    } else if (hasPermission('financial.read')) {
      console.log('🔧 Redirigiendo a /home/contable (por permiso financial.read)');
      redirectTo = '/home/contable';
    } else if (hasPermission('support.read')) {
      console.log('🔧 Redirigiendo a /home/soporte (por permiso support.read)');
      redirectTo = '/home/soporte';
    } else if (hasPermission('settings.read')) {
      console.log('🔧 Redirigiendo a /home/administrativa (por permiso settings.read)');
      redirectTo = '/home/administrativa';
    }

    console.log('🔧 Redirigiendo a:', redirectTo);
    navigate(redirectTo, { replace: true });
  }, [hasPermission, hasRole, navigate, usuario]);

  return null; // No renderiza nada, solo redirige
};

export default DefaultRedirect;
