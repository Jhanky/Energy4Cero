import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que el siguiente renderizado muestre la interfaz de repuesto.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier interfaz de repuesto.
      return (
        <div style={{ padding: '20px', border: '1px solid red', margin: '20px', backgroundColor: '#ffe0e0' }}>
          <h2>¡Algo salió mal!</h2>
          <p>La página no pudo cargarse correctamente. Por favor, intenta recargar.</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '10px 15px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;