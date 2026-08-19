import React from 'react'
import AuthModal from './AuthModal'

const LoginGateModal = ({ onClose, message = 'Inicia sesión para acceder al material de estudio.', initialMode = 'register' }) => {
  return (
    <AuthModal
      isOpen={true}
      onClose={onClose}
      initialMode={initialMode}
      message={message}
    />
  )
}

export default LoginGateModal

