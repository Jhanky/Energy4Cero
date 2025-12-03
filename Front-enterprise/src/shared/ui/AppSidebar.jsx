import * as React from "react"
import { Link, useLocation } from "react-router"
import { Leaf, LogOut, ChevronRight } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarRail,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/ui/collapsible"

export function AppSidebar({ menuSections, onLogout, ...props }) {
    const location = useLocation();
    const { setOpen } = useSidebar();
    const [activeSection, setActiveSection] = React.useState(null);
    const sectionTimeoutRef = React.useRef(null);

    const isPageActive = (path) => location.pathname === path;
    const hasActivePageInSection = (section) => section.paginas.some(p => isPageActive(p.path));

    // Función para cambiar de sección con un pequeño delay
    const handleSectionChange = (sectionId) => {
        // Limpiar timeout anterior si existe
        if (sectionTimeoutRef.current) {
            clearTimeout(sectionTimeoutRef.current);
        }

        // Agregar un pequeño delay para evitar cambios muy rápidos
        sectionTimeoutRef.current = setTimeout(() => {
            setActiveSection(sectionId);
        }, 150);
    };

    // Limpiar timeout al desmontar
    React.useEffect(() => {
        return () => {
            if (sectionTimeoutRef.current) {
                clearTimeout(sectionTimeoutRef.current);
            }
        };
    }, []);

    return (
        <Sidebar
            collapsible="icon"
            {...props}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => {
                setOpen(false);
                setActiveSection(null); // Cerrar submenús al salir del sidebar
            }}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    <Leaf className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">Enterprise</span>
                                    <span className="truncate text-xs">Sistema de Gestión</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuSections.map((section) => {
                                // Logic for single page section
                                if (section.paginas.length === 1) {
                                    const page = section.paginas[0];
                                    return (
                                        <SidebarMenuItem key={section.id}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isPageActive(page.path)}
                                                tooltip={section.nombre}
                                            >
                                                <Link to={page.path}>
                                                    <section.icono />
                                                    <span>{section.nombre}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                }

                                // Logic for collapsible section
                                return (
                                    <Collapsible
                                        key={section.id}
                                        asChild
                                        open={activeSection === section.id}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem
                                            onMouseEnter={() => handleSectionChange(section.id)}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton tooltip={section.nombre}>
                                                    <section.icono />
                                                    <span>{section.nombre}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {section.paginas.map((page) => (
                                                        <SidebarMenuSubItem key={page.id}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isPageActive(page.path)}
                                                            >
                                                                <Link to={page.path}>
                                                                    <span>{page.nombre}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={onLogout}
                            tooltip="Cerrar Sesión"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <LogOut />
                            <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
