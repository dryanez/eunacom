import React from 'react'
import { useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal'

const Register = () => {
    const navigate = useNavigate()

    return (
        <AuthModal
            isOpen={true}
            initialMode="register"
            onClose={() => navigate('/dashboard')}
        />
    )
}

export default Register

