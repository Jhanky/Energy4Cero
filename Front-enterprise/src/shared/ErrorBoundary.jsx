import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que el siguiente renderizado muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error
    console.error('ErrorBoundary capturó un error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de error personalizada
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            {/* Icono de error */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">¡Ups!</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Algo salió mal</h2>
              <p className="text-gray-600 mb-8">
                Ha ocurrido un error inesperado en la aplicación. Hemos sido notificados y estamos trabajando para solucionarlo.
              </p>
            </div>

            {/* Acciones */}
            <div className="space-y-4">
              <Button onClick={this.handleRetry} className="w-full flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Intentar nuevamente
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link to="/" className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  Ir al inicio
                </Link>
              </Button>
            </div>

            {/* Información técnica (solo en desarrollo) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <details className="text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Detalles técnicos (desarrollo)
                  </summary>
                  <div className="bg-gray-100 p-4 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <p className="font-semibold mb-2">Error:</p>
                    <p className="mb-4">{this.state.error.toString()}</p>
                    <p className="font-semibold mb-2">Stack:</p>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </details>
              </div>
            )}

            {/* Información adicional */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Si el problema persiste:
              </p>
              <ul className="text-sm text-gray-500 text-left space-y-1">
                <li>• Recarga la página</li>
                <li>• Limpia la caché de tu navegador</li>
                <li>• Contacta al soporte técnico</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
