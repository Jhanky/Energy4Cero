import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { proyectosEjemplo, estados } from './data/proyectos';
import Layout from './layouts/Layout';
import ProtectedRoute from './widgets/auth/ProtectedRoute';
import DefaultRedirect from './widgets/DefaultRedirect';
import LoginPage from './widgets/login-form/LoginPage';
import { VistaResumen, VistaProyectos, VistaAnalisis, VistaAire } from './pages/proyectos';
import VistaFinanciera from './features/contable/VistaFinanciera';
import { VistaProveedores, VistaCentrosCostos, VistaFacturas } from './pages/contable';
import VistaServicioTecnico from './features/soporte/ui/VistaServicioTecnico';
import VistaUsuarios from './pages/administrativa/VistaUsuarios';
import VistaRoles from './features/administrativa/VistaRoles';
import VistaConfiguracion from './pages/administrativa/VistaConfiguracion';
import VistaClientes from './pages/comercial/VistaClientes';
import VistaCotizaciones from './pages/comercial/VistaCotizaciones';
import VistaDocumentos from './features/administrativa/VistaDocumentos';
import SuministrosView from './pages/comercial/SuministrosView';
import DetalleCotizacion from './features/comercial/cotizaciones/DetalleCotizacion';
import VistaBodegas from './pages/inventario/VistaBodegas';
import VistaHerramientas from './pages/inventario/VistaHerramientas';
import VistaMateriales from './pages/inventario/VistaMateriales';
import VistaMantenimiento from './pages/soporte/VistaMantenimiento';
import ChatIA from './pages/asistente/ChatIA';
import ComingSoon from './widgets/ComingSoon';
import { AuthProvider } from './contexts/AuthContext';

// Páginas de inicio por rol
import HomeAdministrativa from './pages/administrativa/HomeAdministrativa';
import HomeComercial from './pages/comercial/HomeComercial';
import HomeProyectos from './pages/proyectos/HomeProyectos';
import HomeContable from './pages/contable/HomeContable';
import HomeSoporte from './features/soporte/ui/HomeSoporte';
// import ListaTickets from './views/soporte/ui/ListaTickets'; // TODO: Componente no encontrado, pendiente de implementar


// Página de tareas
import VistaTareas from './pages/tareas/VistaTareas';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Ruta de login - disponible cuando no se está autenticado */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* RUTAS PROTEGIDAS CON AUTENTICACIÓN */}
        <Route path="/" element={<Layout />}>
          {/* Redirección por defecto basada en permisos del usuario */}
          <Route 
            index 
            element={
              <ProtectedRoute>
                <DefaultRedirect />
              </ProtectedRoute>
            } 
          />
          
          {/* Páginas de inicio por rol */}
          <Route 
            path="home" 
            element={
              <ProtectedRoute>
                <DefaultRedirect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="home/administrativa" 
            element={
              <ProtectedRoute permission="users.read">
                <HomeAdministrativa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="home/comercial" 
            element={
              <ProtectedRoute permission="commercial.read">
                <HomeComercial />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="home/proyectos" 
            element={
              <ProtectedRoute permission="projects.read">
                <HomeProyectos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="home/contable" 
            element={
              <ProtectedRoute permission="financial.read">
                <HomeContable />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="home/soporte" 
            element={
              <ProtectedRoute permission="support.read">
                <HomeSoporte />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== GESTIÓN DE TAREAS ========== */}
          <Route 
            path="tareas" 
            element={
              <ProtectedRoute permission="tasks.read">
                <VistaTareas />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== GESTIÓN DE PROYECTOS ========== */}
          <Route 
            path="resumen" 
            element={
              <ProtectedRoute>
                <VistaResumen estados={estados} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="proyectos" 
            element={
              <ProtectedRoute permission="projects.read">
                <VistaProyectos estados={estados} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="analisis" 
            element={
              <ProtectedRoute permission="projects.read">
                <VistaAnalisis estados={estados} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="aire" 
            element={
              <ProtectedRoute permission="projects.read">
                <VistaAire estados={estados} />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== GESTIÓN ADMINISTRATIVA ========== */}
          <Route 
            path="usuarios" 
            element={
              <ProtectedRoute permission="users.read">
                <VistaUsuarios />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="roles" 
            element={
              <ProtectedRoute permission="roles.read">
                <VistaRoles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="documentacion" 
            element={
              <ProtectedRoute permission="settings.read">
                <VistaDocumentos />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="configuracion" 
            element={
              <ProtectedRoute permission="settings.read">
                <VistaConfiguracion />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="reportes-admin" 
            element={
              <ProtectedRoute permission="reports.read">
                <ComingSoon pageName="Reportes Administrativos" />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== GESTIÓN COMERCIAL ========== */}
          <Route 
            path="clientes" 
            element={
              <ProtectedRoute permission="commercial.read">
                <VistaClientes />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="suministros" 
            element={
              <ProtectedRoute permission="commercial.read">
                <SuministrosView />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="cotizaciones" 
            element={
              <ProtectedRoute permission="commercial.read">
                <VistaCotizaciones />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="cotizaciones/:id" 
            element={
              <ProtectedRoute permission="commercial.read">
                <DetalleCotizacion />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== GESTIÓN CONTABLE ========== */}
          <Route 
            path="financiera" 
            element={
              <ProtectedRoute permission="financial.read">
                <VistaFinanciera estados={estados} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="facturacion" 
            element={
              <ProtectedRoute permission="financial.read">
                <ComingSoon pageName="Facturación" />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="proveedores" 
            element={
              <ProtectedRoute permission="financial.read">
                <VistaProveedores />
              </ProtectedRoute>
            } 
          />
          <Route
            path="centros-costos"
            element={
              <ProtectedRoute permission="financial.read">
                <VistaCentrosCostos />
              </ProtectedRoute>
            }
          />
          <Route
            path="facturas"
            element={
              <ProtectedRoute permission="financial.read">
                <VistaFacturas />
              </ProtectedRoute>
            }
          />
          <Route
            path="reportes-fin"
            element={
              <ProtectedRoute permission="financial.reports">
                <ComingSoon pageName="Reportes Financieros" />
              </ProtectedRoute>
            }
          />
          
          {/* ========== INVENTARIO ========== */}
          <Route
            path="bodegas"
            element={
              <ProtectedRoute permission="inventory.read">
                <VistaBodegas />
              </ProtectedRoute>
            }
          />
          <Route
            path="herramientas"
            element={
              <ProtectedRoute permission="inventory.read">
                <VistaHerramientas />
              </ProtectedRoute>
            }
          />
          <Route
            path="materiales"
            element={
              <ProtectedRoute permission="inventory.read">
                <VistaMateriales />
              </ProtectedRoute>
            }
          />

          {/* ========== GESTIÓN TÉCNICA ========== */}
          <Route
            path="servicio"
            element={
              <ProtectedRoute permission="support.read">
                <VistaServicioTecnico />
              </ProtectedRoute>
            }
          />
          <Route
            path="mantenimiento"
            element={
              <ProtectedRoute permission="support.read">
                <VistaMantenimiento />
              </ProtectedRoute>
            }
          />
          <Route
            path="tickets"
            element={
              <ProtectedRoute permission="support.read">
                <ComingSoon pageName="Lista de Tickets" />
              </ProtectedRoute>
            }
          />

          {/* ========== ASISTENTE IA ========== */}
          <Route
            path="chat-ia"
            element={
              <ProtectedRoute>
                <ChatIA />
              </ProtectedRoute>
            }
          />

          {/* Ruta no encontrada - redirigir basado en permisos */}
          <Route 
            path="*" 
            element={
              <ProtectedRoute>
                <DefaultRedirect />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
