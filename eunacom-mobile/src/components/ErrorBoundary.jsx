import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h1>Algo salió mal</h1>
          <p>
            Ocurrió un error inesperado. Por favor, recarga la aplicación para continuar.
          </p>
          <button onClick={this.handleReload}>
            Recargar Aplicación
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
