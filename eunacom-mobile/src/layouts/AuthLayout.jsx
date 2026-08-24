import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const AuthLayout = () => {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard')
        }
    }, [user, loading, navigate])

    return (
        <div className="auth-layout">
            <Outlet />
        </div>
    )
}

export default AuthLayout
