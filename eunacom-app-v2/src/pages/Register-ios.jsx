import React from 'react'
import Register from './Register'

const PRIVACY_URL = 'https://eunacom-examen.com/privacy'
const TERMS_URL = 'https://eunacom-examen.com/terms'

const RegisterIOS = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', width: '100%' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Register />
            </div>
            
            {/* iOS Required Legal Footer */}
            <div style={{
                padding: '1.5rem',
                textAlign: 'center',
                background: 'var(--surface-800)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingBottom: 'max(1.5rem, calc(1rem + var(--sab, 0px)))'
            }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--surface-400)', marginBottom: '0.5rem' }}>
                    Al registrarte, aceptas nuestros términos y políticas.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" style={{ 
                        color: 'var(--surface-300)', textDecoration: 'underline', fontSize: '0.75rem', minHeight: '44px', display: 'flex', alignItems: 'center' 
                    }}>
                        Términos y Condiciones
                    </a>
                    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" style={{ 
                        color: 'var(--surface-300)', textDecoration: 'underline', fontSize: '0.75rem', minHeight: '44px', display: 'flex', alignItems: 'center' 
                    }}>
                        Política de Privacidad
                    </a>
                </div>
            </div>
        </div>
    )
}

export default RegisterIOS
