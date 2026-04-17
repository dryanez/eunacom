import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { signInWithGoogle } = useAuth()

    const handleGoogleRegister = async () => {
        setError(null)
        setLoading(true)
        try {
            const { error } = await signInWithGoogle()
            if (error) setError(error.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-card__brand">
                    <img src="/logo.png" alt="Eunacom-Examen" />
                    <h2>EUNACOM-Examen</h2>
                </div>

                <h1>Crear Cuenta</h1>
                <p className="login-card__sub">Regístrate para comenzar a practicar</p>

                {error && <div className="login-error">{error}</div>}

                <button onClick={handleGoogleRegister} className="btn-google btn-google--large" disabled={loading}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />
                    {loading ? 'Redirigiendo...' : 'Registrarse con Google'}
                </button>

                <div className="login-footer">
                    ¿Ya tienes cuenta? <a href="/login">Iniciar Sesión</a>
                </div>
            </div>
        </div>
    )
}

export default Register
