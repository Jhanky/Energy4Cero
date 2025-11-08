// Componente de prueba para verificar la conexión HTTP directa
import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiBaseUrl } from '../../config/environment';

const HttpTest = () => {
  const [status, setStatus] = useState('initial'); // initial, loading, success, error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      // 1. Test de conexión al backend (sin autenticación)

      const healthResponse = await fetch(`${getApiBaseUrl()}/health`);
      const healthData = await healthResponse.json();
      

      // 2. Test de autenticación
      
      const token = localStorage.getItem('auth_token');
      console.log('🔑 Token encontrado:', !!token, token ? token.substring(0, 10) + '...' : null);

      if (!token) {
        throw new Error('No hay token de autenticación en localStorage');
      }

      // 3. Test de roles con autenticación
      
      const rolesResponse = await fetch(`${getApiBaseUrl()}/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      
      console.log('📊 Headers de respuesta:', [...rolesResponse.headers.entries()]);
      
      const rolesData = await rolesResponse.json();
      

      if (rolesResponse.status === 401) {
        throw new Error('No autenticado - Token inválido o expirado');
      }
      
      if (rolesResponse.status === 403) {
        throw new Error('No tienes permisos para acceder a roles');
      }

      if (!rolesResponse.ok) {
        throw new Error(`Error HTTP: ${rolesResponse.status} - ${JSON.stringify(rolesData)}`);
      }

      setResult(rolesData);
      setStatus('success');
    } catch (err) {
      
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6" />
        Prueba de Conexión al Backend
      </h2>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-slate-600">Probando conexión...</span>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Conexión exitosa</span>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Datos recibidos:</h3>
            <pre className="text-sm bg-green-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error en la conexión</span>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-800 mb-2">Mensaje de error:</h3>
            <p className="text-red-700">{error}</p>
            
            <div className="mt-4 space-y-2 text-sm">
              <h4 className="font-medium text-red-700">Posibles causas:</h4>
              <ul className="list-disc list-inside text-red-600 space-y-1">
                <li>Backend no está corriendo en http://127.0.0.1:8000</li>
                <li>No has iniciado sesión o el token ha expirado</li>
                <li>No tienes permisos suficientes para ver roles</li>
                <li>Problemas de red o firewall</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {status === 'initial' && (
        <div className="text-center py-8 text-slate-600">
          Iniciando pruebas de conexión...
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Instrucciones:</h3>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Asegúrate que el backend esté corriendo con: <code className="bg-blue-100 px-1 rounded">php artisan serve</code></li>
          <li>Verifica que hayas iniciado sesión como administrador</li>
          <li>Asegúrate de tener el rol de Administrador o Gerente (que tienen permiso de roles.read)</li>
          <li>Abre la consola del navegador (F12) para ver los mensajes de depuración detallados</li>
        </ul>
      </div>
    </div>
  );
};

export default HttpTest;