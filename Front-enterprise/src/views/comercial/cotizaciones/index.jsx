import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Download, Search, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cotizacionesService } from '../../../services/cotizacionesService';
import { useAuth } from '../../../hooks/useAuth';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';

const Cotizaciones = () => {
  const { usuario, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);

  // Debug: Verificar estado de autenticación
  console.log('🔍 Estado de autenticación:', {
    usuario,
    isAuthenticated: isAuthenticated ? isAuthenticated() : 'No disponible',
    hasToken: !!usuario?.token,
    tokenFromLocalStorage: !!localStorage.getItem('auth_token')
  });



  // Función para cargar cotizaciones
  const fetchCotizaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si hay usuario y token
      if (!usuario) {
        throw new Error("Usuario no autenticado");
      }

      // Obtener token del localStorage como respaldo
      const token = usuario.token || localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error("No hay token de autenticación disponible");
      }

      
      

      // Primero probar con un endpoint simple
      
      try {
        const testResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://www.apitest.energy4cero.com/public/api'}/test`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const testData = await testResponse.json();
        
      } catch (testError) {
        
      }

      
      const response = await cotizacionesService.getCotizaciones({}, token);
      
      
      
      if (response && response.success) {
        setCotizaciones(response.data || []);
        
      } else {
        
        throw new Error(response?.message || "Error al cargar cotizaciones");
      }
    } catch (error) {
      
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar cotizaciones si hay usuario
    if (usuario) {
      fetchCotizaciones();
    } else {
      setLoading(false);
      setError("Usuario no autenticado");
    }
  }, [usuario]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando cotizaciones...</p>
      </div>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar las cotizaciones: {error}
          </AlertDescription>
        </Alert>
        {error.includes('autenticación') && (
          <div className="mt-4">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-red-700"
            >
              Ir al Login
            </Button>
          </div>
        )}
      </div>
    );
  }

  

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-600 mb-2">
          Gestión de Cotizaciones
        </h1>
        <p className="text-gray-600">
          Administra y genera cotizaciones para proyectos fotovoltaicos
        </p>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Lista de Cotizaciones
            </h2>
            <Button
              onClick={() => console.log('Crear nueva cotización')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-5 w-5" />
              Nueva Cotización
            </Button>
          </div>

          {cotizaciones.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron cotizaciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Proyecto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                  {cotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{cotizacion.id}
                    </td>
                      <td className="py-3 px-4 text-sm text-gray-800">
                        {cotizacion.project_name || 'Sin nombre'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {cotizacion.client?.name || 'Sin cliente'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {cotizacion.status?.name || 'Sin estado'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => console.log('Ver detalles', cotizacion.id)}
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => console.log('Editar', cotizacion.id)}
                            variant="outline"
                            size="sm"
                            className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => console.log('Descargar', cotizacion.id)}
                            variant="outline"
                            size="sm"
                            className="bg-green-50 text-green-600 hover:bg-green-100"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
        </Card>
            </div>
  );
};

export default Cotizaciones;