import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, DollarSign, Leaf, Users, ShoppingCart, Calculator, Wrench, HelpCircle, ChevronDown, ChevronRight, Shield, Settings, Target, FileText, TrendingUp, Receipt, Book, Package, Bell, Menu, X, User, Truck, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, loading, isAuthenticated, hasPermission, logout } = useAuth();

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuAbierto && !event.target.closest('.menu-section')) {
        setMenuAbierto(null);
      }
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && !event.target.closest('.notifications-menu')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuAbierto, userMenuOpen, notificationsOpen]);

  // Redirigir al login si no está autenticado
  // (esto se evalúa en cada renderizado, pero solo causa efecto si el estado cambió)
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-slate-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando contenido...</p>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      id: 'administrativa',
      nombre: 'Gestión Administrativa',
      icono: Users,
      color: 'blue',
      paginas: [
        { id: 'usuarios', nombre: 'Gestión de Usuarios', icono: Users, path: '/usuarios' },
        { id: 'roles', nombre: 'Roles y Permisos', icono: Shield, path: '/roles' },
        { id: 'configuracion', nombre: 'Configuración', icono: Settings, path: '/configuracion' }
      ]
    },
    {
      id: 'comercial',
      nombre: 'Gestión Comercial',
      icono: ShoppingCart,    
      color: 'green',
      paginas: [
        { id: 'clientes', nombre: 'Gestión de Clientes', icono: Users, path: '/clientes' },
        { id: 'suministros', nombre: 'Suministros', icono: Package, path: '/suministros' },
        { id: 'cotizaciones', nombre: 'Cotizaciones', icono: FileText, path: '/cotizaciones' }
      ]
    },
    {
      id: 'proyectos',
      nombre: 'Gestión de Proyectos',
      icono: FolderKanban,
      color: 'orange',
      paginas: [
        { id: 'resumen', nombre: 'Resumen Ejecutivo', icono: LayoutDashboard, path: '/resumen' },
        { id: 'proyectos', nombre: 'Proyectos', icono: FolderKanban, path: '/proyectos' },
        { id: 'analisis', nombre: 'Análisis', icono: BarChart3, path: '/analisis' },
        { id: 'aire', nombre: 'Seguimiento Air-e', icono: Leaf, path: '/aire' },
        { id: 'tareas', nombre: 'Tareas', icono: FolderKanban, path: '/tareas' }
      ]
    },
    {
      id: 'contable',
      nombre: 'Gestión Contable',
      icono: Calculator,
      color: 'purple',
      paginas: [
        { id: 'financiera', nombre: 'Indicadores Financieros', icono: DollarSign, path: '/financiera' },
        { id: 'facturacion', nombre: 'Facturas', icono: Receipt, path: '/facturas' },
        { id: 'proveedores', nombre: 'Proveedores', icono: Truck, path: '/proveedores' },
        { id: 'centros-costos', nombre: 'Centros de Costos', icono: Building2, path: '/centros-costos' },
        { id: 'reportes-fin', nombre: 'Reportes Financieros', icono: BarChart3, path: '/reportes-fin' }
      ]
    },
    {
      id: 'soporte',
      nombre: 'Soporte',
      icono: HelpCircle,
      color: 'gray',
      paginas: [
        { id: 'servicio', nombre: 'Servicio Técnico', icono: Wrench, path: '/servicio' },
        { id: 'mantenimiento', nombre: 'Mantenimiento', icono: Settings, path: '/mantenimiento' }
      ]
    }
  ];

  // Función para verificar si una página está activa
  const isPageActive = (path) => {
    return location.pathname === path;
  };

  // Función para verificar si una sección tiene páginas activas
  const hasActivePage = (section) => {
    return section.paginas.some(pagina => isPageActive(pagina.path));
  };

  // Función para filtrar páginas basado en permisos
  const getFilteredPages = (paginas) => {
    return paginas.filter(pagina => {
      // Mapear páginas a permisos
      const pagePermissions = {
        'tareas': ['tasks.read'],
        'usuarios': ['users.read'],
        'roles': ['roles.read'],
        'configuracion': ['settings.read'],
        'clientes': ['commercial.read'],
        'suministros': ['commercial.read'],
        'cotizaciones': ['commercial.read'],
        'financiera': ['financial.read'],
        'proveedores': ['financial.read'],
        'centros-costos': ['financial.read'],
        'reportes-fin': ['financial.reports'],
        'servicio': ['support.read'],
        'mantenimiento': ['support.read'],
        'tickets': ['support.read']
      };

      const requiredPermissions = pagePermissions[pagina.id];
      if (!requiredPermissions) return true; // Páginas sin restricciones

      return requiredPermissions.some(permission => hasPermission(permission));
    });
  };

  // Función para verificar si una sección tiene páginas visibles
  const hasVisiblePages = (section) => {
    return getFilteredPages(section.paginas).length > 0;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100">
      {/* Header Superior */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[99%] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo y Título */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/home')}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Enterprise</h1>
                <p className="text-xs text-slate-600">Sistema de Gestión</p>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuSections.filter(section => hasVisiblePages(section)).map((section) => {
                const Icono = section.icono;
                const isOpen = menuAbierto === section.id;
                const sectionHasActivePage = hasActivePage(section);
                
                return (
                  <div key={section.id} className="relative menu-section">
                    <button
                      onClick={() => setMenuAbierto(isOpen ? null : section.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                        sectionHasActivePage
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <Icono className="w-4 h-4" />
                      <span>{section.nombre}</span>
                      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    
                    {isOpen && (
                      <div className="absolute top-full left-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-64 mt-1">
                        {getFilteredPages(section.paginas).map((pagina) => {
                          const PaginaIcono = pagina.icono;
                          const isActive = isPageActive(pagina.path);
                          return (
                            <button
                              key={pagina.id}
                              onClick={() => {
                                navigate(pagina.path);
                                setMenuAbierto(null);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                                isActive
                                  ? 'text-blue-600 bg-blue-50'
                                  : 'text-slate-600'
                              }`}
                            >
                              <PaginaIcono className="w-4 h-4" />
                              <span className="text-sm font-medium">{pagina.nombre}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Controles Derecha */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              <div className="relative notifications-menu">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute top-full right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-80 mt-2">
                    <div className="p-4 border-b border-slate-200">
                      <h3 className="font-semibold text-slate-900">Notificaciones</h3>
                    </div>
                    <div className="p-4">
                      <div className="text-center text-slate-500 py-8">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm">No hay notificaciones nuevas</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Menú de Usuario */}
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">{usuario?.name || 'Usuario'}</p>
                    <p className="text-xs text-slate-600">{usuario?.role?.name || 'Sin rol'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute top-full right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 w-48 mt-2">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate('/perfil');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Mi Perfil</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/configuracion');
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Configuración</span>
                      </button>
                      <hr className="my-2 border-slate-200" />
                      <button
                        onClick={async () => {
                          await logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Menú Móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white">
            <div className="max-w-[99%] mx-auto px-4 sm:px-6 py-4">
              <div className="space-y-2">
                {menuSections.filter(section => hasVisiblePages(section)).map((section) => (
                  <div key={section.id} className="border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700">
                      <section.icono className="w-4 h-4" />
                      <span>{section.nombre}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      {getFilteredPages(section.paginas).map((pagina) => {
                        const PaginaIcono = pagina.icono;
                        const isActive = isPageActive(pagina.path);
                        return (
                          <button
                            key={pagina.id}
                            onClick={() => {
                              navigate(pagina.path);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors ${
                              isActive
                                ? 'bg-green-100 text-green-700'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <PaginaIcono className="w-4 h-4" />
                            <span>{pagina.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-[99%] mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-[99%] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>© 2025 Energy 4.0</p>
            <p>Atlántico, Magdalena y La Guajira</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
