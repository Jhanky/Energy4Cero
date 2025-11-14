import React from 'react';
import { Outlet, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, DollarSign, Leaf, Users, ShoppingCart, Calculator, Wrench, HelpCircle, Shield, Settings, Truck, Building2, LogOut, Package, FileText, Receipt } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Sidebar, SidebarBody, SidebarSection, SidebarSectionItem, SidebarLink } from '../shared/ui/CustomSidebar';
import { Button } from '../ui/button';
import { useState } from 'react';

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: usuario, loading, isAuthenticated, hasPermission, logout, refreshUser } = useAuth();
  const [logoutExpanded, setLogoutExpanded] = useState(false);
  const [openSection, setOpenSection] = useState(null);

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
      id: 'tecnica',
      nombre: 'Gestión Técnica',
      icono: HelpCircle,
      color: 'gray',
      paginas: [
        { id: 'bodegas', nombre: 'Bodegas', icono: Building2, path: '/bodegas' },
        { id: 'herramientas', nombre: 'Herramientas', icono: Wrench, path: '/herramientas' },
        { id: 'materiales', nombre: 'Inventario', icono: Package, path: '/materiales' },
        { id: 'servicio', nombre: 'Servicio Técnico', icono: Wrench, path: '/servicio' },
        { id: 'mantenimiento', nombre: 'Mantenimiento', icono: Settings, path: '/mantenimiento' }
      ]
    },

  ];

  // Efecto para refrescar usuario y verificar permisos al cargar
  React.useEffect(() => {
    const refreshUserData = async () => {
      try {
        const result = await refreshUser();
      } catch (error) {
        console.error('Error al refrescar usuario:', error);
      }
    };

    if (isAuthenticated && usuario) {
      refreshUserData();
    }
  }, [isAuthenticated, usuario, refreshUser]);

  // Efecto para abrir automáticamente la sección que contiene la página activa
  React.useEffect(() => {
    const activeSection = menuSections.find(section => hasActivePageInSection(section));
    if (activeSection) {
      setOpenSection(activeSection.id);
    }
  }, [location.pathname]);

  // Función para verificar si una página está activa
  const isPageActive = (path) => {
    return location.pathname === path;
  };

  // Función para verificar si una sección tiene páginas activas
  const hasActivePageInSection = (section) => {
    return section.paginas.some(pagina => isPageActive(pagina.path));
  };

  // Función para filtrar páginas basado en permisos
  const getFilteredPages = (paginas) => {
    return paginas.filter(pagina => {
      // Mapear páginas a permisos requeridos
      const pagePermissions = {
        // Administrativa
        'usuarios': ['users.read'],
        'roles': ['roles.read'],
        'configuracion': ['settings.read'],

        // Comercial
        'clientes': ['commercial.read'],
        'suministros': ['commercial.read'],
        'cotizaciones': ['commercial.read'],

        // Proyectos
        'resumen': ['projects.read'],
        'proyectos': ['projects.read'],
        'analisis': ['projects.read'],
        'aire': ['projects.read'],
        'tareas': ['tasks.read'],

        // Contable
        'financiera': ['financial.read'],
        'facturacion': ['financial.read'],
        'proveedores': ['financial.read'],
        'centros-costos': ['financial.read'],
        'reportes-fin': ['financial.reports'],

        // Técnica
        'bodegas': ['inventory.read'],
        'herramientas': ['inventory.read'],
        'materiales': ['inventory.read'],
        'servicio': ['support.read'],
        'mantenimiento': ['support.read']
      };

      const requiredPermissions = pagePermissions[pagina.id];
      if (!requiredPermissions) return true; // Páginas sin restricciones específicas

      const hasRequiredPermission = requiredPermissions.some(permission => hasPermission(permission));

      return hasRequiredPermission;
    });
  };

  // Función para verificar si una sección tiene páginas visibles
  const hasVisiblePages = (section) => {
    return getFilteredPages(section.paginas).length > 0;
  };

  // Función para manejar el toggle de secciones (comportamiento de acordeón)
  const handleSectionToggle = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100">
      {/* Sidebar */}
      <Sidebar>
        <SidebarBody>
          {/* Logo en el sidebar */}
          <Link to="/" className="px-4 py-4 border-b border-sidebar-border flex-shrink-0 block hover:bg-sidebar-accent/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-sidebar-foreground truncate">Enterprise</h1>
                <p className="text-xs text-sidebar-foreground/70 truncate">Sistema de Gestión</p>
              </div>
            </div>
          </Link>

          {/* Navegación del Sidebar - ocupa espacio disponible */}
          <div className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-1">
              {menuSections
                .filter(section => hasVisiblePages(section))
                .map((section) => {
                  const filteredPages = getFilteredPages(section.paginas);
                  const isSectionActive = hasActivePageInSection(section);

                  // Si la sección tiene solo una página, mostrar como enlace directo
                  if (filteredPages.length === 1) {
                    const pagina = filteredPages[0];
                    return (
                      <SidebarLink
                        key={section.id}
                        link={{
                          label: section.nombre,
                          href: pagina.path,
                          icon: <section.icono className="w-4 h-4" />
                        }}
                        className="border-b border-sidebar-border pb-2 mb-2 last:border-b-0"
                      />
                    );
                  }

                  // Si tiene múltiples páginas, mostrar como sección expandible
                  return (
                    <SidebarSection
                      key={section.id}
                      title={section.nombre}
                      icon={section.icono}
                      open={openSection === section.id || isSectionActive}
                      onToggle={() => handleSectionToggle(section.id)}
                      isActive={isSectionActive}
                      className="border-b border-sidebar-border pb-2 mb-2 last:border-b-0"
                    >
                      {filteredPages.map((pagina) => (
                        <SidebarSectionItem
                          key={pagina.id}
                          link={{
                            label: pagina.nombre,
                            href: pagina.path,
                            icon: <pagina.icono className="w-4 h-4" />
                          }}
                        />
                      ))}
                    </SidebarSection>
                  );
                })}
            </div>
          </div>

          {/* Botón de cerrar sesión */}
          <div className="border-t border-sidebar-border p-4 flex-shrink-0">
            <Button
              onClick={async () => {
                await logout();
              }}
              variant="destructive"
              className="w-full justify-start px-3 py-3 h-auto"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium ml-3">
                Cerrar Sesión
              </span>
            </Button>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[99%] mx-auto px-4 sm:px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
