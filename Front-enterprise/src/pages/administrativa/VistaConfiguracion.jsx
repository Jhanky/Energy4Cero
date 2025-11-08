import { useState } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Globe, 
  Shield, 
  Database, 
  Palette, 
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Notification } from '../../shared/ui';

const VistaConfiguracion = () => {
  // Estados para las configuraciones
  const [configuracion, setConfiguracion] = useState({
    // Apariencia
    tema: 'claro', // 'claro', 'oscuro', 'sistema'
    colorPrimario: 'green',
    densidad: 'normal', // 'compacto', 'normal', 'espacioso'
    
    // Notificaciones
    notificacionesPush: true,
    notificacionesEmail: true,
    sonidoNotificaciones: true,
    autoCierreNotificaciones: 5000,
    
    // Privacidad y Seguridad
    mostrarContraseñas: false,
    sesionAutomatica: false,
    tiempoSesion: 30, // minutos
    
    // Idioma y Región
    idioma: 'es',
    zonaHoraria: 'America/Bogota',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    
    // Datos y Almacenamiento
    cacheLocal: true,
    sincronizacionAutomatica: true,
    compresionDatos: true,
    
    // Accesibilidad
    altoContraste: false,
    tamanioFuente: 'normal', // 'pequeno', 'normal', 'grande'
    animaciones: true,
    tooltips: true
  });

  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Funciones para notificaciones
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Función para actualizar configuración
  const updateConfig = (key, value) => {
    setConfiguracion(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Función para guardar configuración
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('success', 'Configuración guardada exitosamente');
    } catch (error) {
      showNotification('error', 'Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  // Función para restaurar configuración por defecto
  const handleReset = () => {
    setConfiguracion({
      tema: 'claro',
      colorPrimario: 'green',
      densidad: 'normal',
      notificacionesPush: true,
      notificacionesEmail: true,
      sonidoNotificaciones: true,
      autoCierreNotificaciones: 5000,
      mostrarContraseñas: false,
      sesionAutomatica: false,
      tiempoSesion: 30,
      idioma: 'es',
      zonaHoraria: 'America/Bogota',
      formatoFecha: 'DD/MM/YYYY',
      formatoHora: '24h',
      cacheLocal: true,
      sincronizacionAutomatica: true,
      compresionDatos: true,
      altoContraste: false,
      tamanioFuente: 'normal',
      animaciones: true,
      tooltips: true
    });
    showNotification('info', 'Configuración restaurada a valores por defecto');
  };

  const coloresPrimarios = [
    { value: 'green', label: 'Verde', color: 'bg-green-500' },
    { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
    { value: 'purple', label: 'Morado', color: 'bg-purple-500' },
    { value: 'red', label: 'Rojo', color: 'bg-red-500' },
    { value: 'orange', label: 'Naranja', color: 'bg-orange-500' },
    { value: 'teal', label: 'Verde Azulado', color: 'bg-teal-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
          <p className="text-slate-600 mt-1">Personaliza la experiencia de la aplicación</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Restaurar
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apariencia */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Apariencia</h3>
              <p className="text-sm text-slate-600">Personaliza el aspecto visual</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Tema */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Tema</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'claro', label: 'Claro', icon: Sun },
                  { value: 'oscuro', label: 'Oscuro', icon: Moon },
                  { value: 'sistema', label: 'Sistema', icon: Monitor }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => updateConfig('tema', value)}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      configuracion.tema === value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Primario */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">Color Primario</label>
              <div className="grid grid-cols-6 gap-2">
                {coloresPrimarios.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => updateConfig('colorPrimario', value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      configuracion.colorPrimario === value
                        ? 'border-slate-900 scale-110'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    title={label}
                  >
                    <div className={`w-full h-full rounded-lg ${color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Densidad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Densidad de Interfaz</label>
              <select
                value={configuracion.densidad}
                onChange={(e) => updateConfig('densidad', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="compacto">Compacto</option>
                <option value="normal">Normal</option>
                <option value="espacioso">Espacioso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Notificaciones</h3>
              <p className="text-sm text-slate-600">Configura las alertas y notificaciones</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Notificaciones Push */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Notificaciones Push</label>
                <p className="text-xs text-slate-500">Recibir notificaciones en tiempo real</p>
              </div>
              <button
                onClick={() => updateConfig('notificacionesPush', !configuracion.notificacionesPush)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.notificacionesPush ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.notificacionesPush ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Notificaciones Email */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Notificaciones por Email</label>
                <p className="text-xs text-slate-500">Enviar alertas importantes por correo</p>
              </div>
              <button
                onClick={() => updateConfig('notificacionesEmail', !configuracion.notificacionesEmail)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.notificacionesEmail ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.notificacionesEmail ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sonido de Notificaciones */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Sonido de Notificaciones</label>
                <p className="text-xs text-slate-500">Reproducir sonido al recibir notificaciones</p>
              </div>
              <button
                onClick={() => updateConfig('sonidoNotificaciones', !configuracion.sonidoNotificaciones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.sonidoNotificaciones ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.sonidoNotificaciones ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto-cierre de Notificaciones */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Auto-cierre de Notificaciones (ms)
              </label>
              <input
                type="number"
                value={configuracion.autoCierreNotificaciones}
                onChange={(e) => updateConfig('autoCierreNotificaciones', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="1000"
                max="10000"
                step="1000"
              />
            </div>
          </div>
        </div>

        {/* Privacidad y Seguridad */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Privacidad y Seguridad</h3>
              <p className="text-sm text-slate-600">Configura la seguridad de tu cuenta</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Mostrar Contraseñas */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Mostrar Contraseñas</label>
                <p className="text-xs text-slate-500">Mostrar contraseñas en campos de texto</p>
              </div>
              <button
                onClick={() => updateConfig('mostrarContraseñas', !configuracion.mostrarContraseñas)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.mostrarContraseñas ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.mostrarContraseñas ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sesión Automática */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Sesión Automática</label>
                <p className="text-xs text-slate-500">Mantener sesión iniciada</p>
              </div>
              <button
                onClick={() => updateConfig('sesionAutomatica', !configuracion.sesionAutomatica)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.sesionAutomatica ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.sesionAutomatica ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tiempo de Sesión */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tiempo de Sesión (minutos)
              </label>
              <input
                type="number"
                value={configuracion.tiempoSesion}
                onChange={(e) => updateConfig('tiempoSesion', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="5"
                max="480"
                step="5"
              />
            </div>
          </div>
        </div>

        {/* Idioma y Región */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Idioma y Región</h3>
              <p className="text-sm text-slate-600">Configura el idioma y formato regional</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Idioma</label>
              <select
                value={configuracion.idioma}
                onChange={(e) => updateConfig('idioma', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </div>

            {/* Zona Horaria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Zona Horaria</label>
              <select
                value={configuracion.zonaHoraria}
                onChange={(e) => updateConfig('zonaHoraria', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>

            {/* Formato de Fecha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Fecha</label>
              <select
                value={configuracion.formatoFecha}
                onChange={(e) => updateConfig('formatoFecha', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Formato de Hora */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Formato de Hora</label>
              <select
                value={configuracion.formatoHora}
                onChange={(e) => updateConfig('formatoHora', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="24h">24 horas</option>
                <option value="12h">12 horas (AM/PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Datos y Almacenamiento */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Datos y Almacenamiento</h3>
              <p className="text-sm text-slate-600">Gestiona el almacenamiento local</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Cache Local */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Cache Local</label>
                <p className="text-xs text-slate-500">Almacenar datos temporalmente</p>
              </div>
              <button
                onClick={() => updateConfig('cacheLocal', !configuracion.cacheLocal)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.cacheLocal ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.cacheLocal ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Sincronización Automática */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Sincronización Automática</label>
                <p className="text-xs text-slate-500">Sincronizar datos en segundo plano</p>
              </div>
              <button
                onClick={() => updateConfig('sincronizacionAutomatica', !configuracion.sincronizacionAutomatica)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.sincronizacionAutomatica ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.sincronizacionAutomatica ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Compresión de Datos */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Compresión de Datos</label>
                <p className="text-xs text-slate-500">Comprimir datos para ahorrar espacio</p>
              </div>
              <button
                onClick={() => updateConfig('compresionDatos', !configuracion.compresionDatos)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.compresionDatos ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.compresionDatos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Accesibilidad */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Accesibilidad</h3>
              <p className="text-sm text-slate-600">Mejora la accesibilidad de la aplicación</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Alto Contraste */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Alto Contraste</label>
                <p className="text-xs text-slate-500">Mejorar el contraste de colores</p>
              </div>
              <button
                onClick={() => updateConfig('altoContraste', !configuracion.altoContraste)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.altoContraste ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.altoContraste ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tamaño de Fuente */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tamaño de Fuente</label>
              <select
                value={configuracion.tamanioFuente}
                onChange={(e) => updateConfig('tamanioFuente', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="pequeno">Pequeño</option>
                <option value="normal">Normal</option>
                <option value="grande">Grande</option>
              </select>
            </div>

            {/* Animaciones */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Animaciones</label>
                <p className="text-xs text-slate-500">Mostrar animaciones y transiciones</p>
              </div>
              <button
                onClick={() => updateConfig('animaciones', !configuracion.animaciones)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.animaciones ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.animaciones ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Tooltips */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700">Tooltips</label>
                <p className="text-xs text-slate-500">Mostrar información adicional al pasar el mouse</p>
              </div>
              <button
                onClick={() => updateConfig('tooltips', !configuracion.tooltips)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  configuracion.tooltips ? 'bg-green-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    configuracion.tooltips ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación Toast */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
};

export default VistaConfiguracion;
