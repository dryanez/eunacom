import React from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

const Login = () => {
    const navigate = useNavigate()

    return (
        <AuthModal
            isOpen={true}
            initialMode="login"
            onClose={() => navigate('/dashboard')}
        />
    )
}

export default Login

