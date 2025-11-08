import { LogOut, User, Building2, Clock, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const UserHeader = () => {
  const { usuario, logout } = useAuth();

  if (!usuario) return null;

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro que desea cerrar sesión?')) {
      await logout();
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Información del usuario */}
      <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 shadow-sm border border-slate-200">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {getInitials(usuario.name)}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{usuario.name}</p>
          <p className="text-xs text-slate-600">{usuario.role?.name || 'Sin rol'}</p>
        </div>
      </div>

      {/* Información adicional */}
      <div className="hidden md:flex items-center gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4" />
          <span>{usuario.position || 'Sin cargo'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-4 h-4" />
          <span>{usuario.role?.slug || 'sin-rol'}</span>
        </div>
      </div>

      {/* Botón de cerrar sesión */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
        title="Cerrar sesión"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default UserHeader;
