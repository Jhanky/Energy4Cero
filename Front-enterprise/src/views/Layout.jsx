import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, DollarSign, Leaf, Users, ShoppingCart, Calculator, Wrench, HelpCircle, ChevronDown, ChevronRight, Shield, Settings, Target, FileText, TrendingUp, Receipt, Book, Package, Bell, Menu, X, User, Truck, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, loading, isAuthenticated, hasPermission, logout } = useAuth();

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeSection && !event.target.closest('.menu-section')) {
        setActiveSection(null);
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
  }, [activeSection, userMenuOpen, notificationsOpen]);

  // Redirigir al login si no está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  const menuSections = [
    {
      id: 'administrativa',
      nombre: 'Administración',
      icono: Users,
      color: 'blue',
      paginas: [
        { id: 'usuarios', nombre: 'Usuarios', icono: Users, path: '/usuarios' },
        { id: 'roles', nombre: 'Roles', icono: Shield, path: '/roles' },
        { id: 'configuracion', nombre: 'Configuración', icono: Settings, path: '/configuracion' }
      ]
    },
    {
      id: 'comercial',
      nombre: 'Comercial',
      icono: ShoppingCart,    
      color: 'emerald',
      paginas: [
        { id: 'clientes', nombre: 'Clientes', icono: Users, path: '/clientes' },
        { id: 'suministros', nombre: 'Suministros', icono: Package, path: '/suministros' },
        { id: 'cotizaciones', nombre: 'Cotizaciones', icono: FileText, path: '/cotizaciones' }
      ]
    },
    {
      id: 'proyectos',
      nombre: 'Proyectos',
      icono: FolderKanban,
      color: 'amber',
      paginas: [
        { id: 'resumen', nombre: 'Resumen', icono: LayoutDashboard, path: '/resumen' },
        { id: 'proyectos', nombre: 'Proyectos', icono: FolderKanban, path: '/proyectos' },
        { id: 'analisis', nombre: 'Análisis', icono: BarChart3, path: '/analisis' },
        { id: 'aire', nombre: 'Air-e', icono: Leaf, path: '/aire' },
        { id: 'tareas', nombre: 'Tareas', icono: FolderKanban, path: '/tareas' }
      ]
    },
    {
      id: 'contable',
      nombre: 'Finanzas',
      icono: Calculator,
      color: 'purple',
      paginas: [
        { id: 'financiera', nombre: 'Finanzas', icono: DollarSign, path: '/financiera' },
        { id: 'facturacion', nombre: 'Facturas', icono: Receipt, path: '/facturas' },
        { id: 'proveedores', nombre: 'Proveedores', icono: Truck, path: '/proveedores' },
        { id: 'centros-costos', nombre: 'Centros de Costos', icono: Building2, path: '/centros-costos' }
      ]
    },
    {
      id: 'soporte',
      nombre: 'Soporte',
      icono: HelpCircle,
      color: 'rose',
      paginas: [
        { id: 'servicio', nombre: 'Servicio', icono: Wrench, path: '/servicio' },
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar para desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:shadow-none lg:w-20`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200">
            <div 
              className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center cursor-pointer"
              onClick={() => {
                navigate('/home');
                setSidebarOpen(false);
              }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <h1 className="text-lg font-bold text-slate-900">Energy 4.0</h1>
              <p className="text-xs text-slate-600">Sistema de Gestión</p>
            </div>
          </div>

          {/* Menú principal */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {menuSections.filter(section => hasVisiblePages(section)).map((section) => {
              const Icono = section.icono;
              const isOpen = activeSection === section.id;
              const sectionHasActivePage = hasActivePage(section);
              
              return (
                <div key={section.id} className="menu-section mb-1">
                  <button
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setActiveSection(isOpen ? null : section.id);
                      } else {
                        setSidebarOpen(!sidebarOpen);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-lg group ${
                      sectionHasActivePage
                        ? 'bg-green-100 text-green-700'
                        : 'text-slate-600 hover:text-green-700 hover:bg-green-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      sectionHasActivePage
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-green-500 group-hover:text-white'
                    }`}>
                      <Icono className="w-4 h-4" />
                    </div>
                    <span className={`${sidebarOpen ? 'block' : 'hidden lg:block'}`}>{section.nombre}</span>
                    {window.innerWidth >= 1024 && (
                      <ChevronDown className={`ml-auto transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      } ${sidebarOpen ? 'block' : 'hidden lg:block'}`} />
                    )}
                  </button>
                  
                  {(isOpen || (window.innerWidth >= 1024 && sidebarOpen)) && (
                    <div className={`ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
                      isOpen || sidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {getFilteredPages(section.paginas).map((pagina) => {
                        const PaginaIcono = pagina.icono;
                        const isActive = isPageActive(pagina.path);
                        return (
                          <button
                            key={pagina.id}
                            onClick={() => {
                              navigate(pagina.path);
                              if (window.innerWidth < 1024) {
                                setSidebarOpen(false);
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                              isActive
                                ? 'text-green-600 bg-green-50'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <PaginaIcono className="w-4 h-4 ml-2" />
                            <span>{pagina.nombre}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Controles del sidebar */}
          <div className="p-4 border-t border-slate-200">
            <div className={`space-y-2 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
                <span>Notificaciones</span>
              </button>
              
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{usuario?.name || 'Usuario'}</p>
                    <p className="text-xs text-slate-600 truncate">{usuario?.role?.name || 'Sin rol'}</p>
                  </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:ml-20">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="hidden lg:block">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-600">Bienvenido de vuelta, {usuario?.name || 'Usuario'}</p>
              </div>
            </div>
            
            {/* Controles derecha */}
            <div className="flex items-center gap-3">
              {/* Notificaciones */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
              
              {/* Menú de usuario para desktop */}
              <div className="relative hidden lg:block user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">{usuario?.name || 'Usuario'}</p>
                    <p className="text-xs text-slate-600">{usuario?.role?.name || 'Sin rol'}</p>
                  </div>
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-140px)]">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-full mx-auto px-4 lg:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-slate-600">
              <p>© 2025 Energy 4.0 - Sistema de Gestión</p>
              <p className="mt-2 sm:mt-0">Atlántico, Magdalena y La Guajira</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
