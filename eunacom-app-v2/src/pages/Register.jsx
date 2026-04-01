import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setLoading(true)
        try {
            const { error } = await signUp(email, password)
            if (error) {
                setError(error.message)
            } else {
                setSuccess(true)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="login-card__brand">
                        <img src="/logo.png" alt="Eunacom-Examen" />
                        <h2>EUNACOM-Examen</h2>
                    </div>
                    <h1>¡Registro exitoso!</h1>
                    <p className="login-card__sub">Revisa tu email para confirmar tu cuenta.</p>
                    <button className="btn-primary btn-primary--full" onClick={() => navigate('/login')} style={{ marginTop: '1.5rem' }}>
                        Ir a Iniciar Sesión
                    </button>
                </div>
            </div>
        )
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

                <form onSubmit={handleRegister}>
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
                                placeholder="Mínimo 6 caracteres"
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirmar Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                            />
                            <Lock size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--surface-400)' }} />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-primary--full" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className="login-footer">
                    ¿Ya tienes cuenta? <a href="/login">Iniciar Sesión</a>
                </div>
            </div>
        </div>
    )
}

export default Register
