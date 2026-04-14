import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { signIn, signInWithGoogle } = useAuth()
    const navigate = useNavigate()

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
             const { error } = await signIn(email, password)
             if (error) {
                 if (error.message.includes('Invalid login credentials')) {
                    setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.')
                 } else {
                     setError(error.message)
                 }
             } else {
                navigate('/dashboard')
             }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
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
                
                <h1>Bienvenido de vuelta</h1>
                <p className="login-card__sub">Inicia sesión para continuar practicando</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleEmailLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                            />
                            <Mail size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                             <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-primary--full" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-divider">o continúa con</div>

                <button onClick={handleGoogleLogin} className="btn-google" disabled={loading}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 18, height: 18 }} />
                    Continuar con Google
                </button>

                <div className="login-footer">
                    ¿No tienes cuenta? <a href="/register">Regístrate</a>
                </div>
            </div>
        </div>
    )
}

export default Login
