import React from 'react';
import { Outlet, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BarChart3, DollarSign, Leaf, Users, ShoppingCart, Calculator, Wrench, HelpCircle, Settings, Truck, Building2, LogOut, Package, FileText, Receipt, Shield, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SidebarProvider, SidebarInset } from "@/ui/sidebar";
import { AppSidebar } from "../shared/ui/AppSidebar";
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
        { id: 'roles', nombre: 'Gestión de Roles', icono: Shield, path: '/roles' },
        { id: 'permisos', nombre: 'Gestión de Permisos', icono: Key, path: '/permisos' },
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
        { id: 'aire', nombre: 'Seguimiento Air-e', icono: Leaf, path: '/aire' }
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
    }
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
        'permisos': ['roles.read'],
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

  const filteredSections = menuSections
    .filter(section => hasVisiblePages(section))
    .map(section => ({
      ...section,
      paginas: getFilteredPages(section.paginas)
    }));

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar menuSections={filteredSections} onLogout={logout} />
      <SidebarInset>

        <div className="flex-1 flex flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
