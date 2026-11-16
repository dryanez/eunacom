import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { identifyUser, resetAnalytics } from '../lib/analytics'

const AuthContext = createContext({})

// Bump this number any time you need to force-logout ALL users globally.
// Current bump: April 17 2026 — force re-login after onboarding fix in PublicLayout.
const SESSION_VERSION = '3'
const SESSION_KEY = 'eunacom_session_v'

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

const DEFAULT_LOCAL_ADMIN = {
    id: 'local_admin_felipe',
    email: 'dr.felipeyanez@gmail.com',
    user_metadata: { full_name: 'Dr. Felipe Yáñez (Admin Local)' },
    app_metadata: { provider: 'email' },
    created_at: '2026-04-15 03:26:36'
}

const isDevHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV
)

// Solo en localhost: ?invitado=1 muestra la app sin sesión (para revisar la vista de visitantes); ?invitado=0 la apaga
const devGuest = (() => {
    if (!isDevHost) return false
    try {
        const q = new URLSearchParams(window.location.search).get('invitado')
        if (q === '1') sessionStorage.setItem('eunacom_dev_guest', '1')
        if (q === '0') sessionStorage.removeItem('eunacom_dev_guest')
        return sessionStorage.getItem('eunacom_dev_guest') === '1'
    } catch { return false }
})()

const isLocalHost = isDevHost && !devGuest

// Hasta nov-2026 la app dejaba entrar sin sesión a quien se registraba con correo y no lo
// confirmaba (guardado como «usuario local»). Eso ya no vale en producción: sin sesión de
// Supabase no hay usuario. Si quedó uno guardado, se borra y se recuerda su correo para
// llevarlo directo a confirmar con el código.
const staleLocalEmail = (() => {
    if (isDevHost || typeof window === 'undefined') return ''
    try {
        const stored = JSON.parse(localStorage.getItem('eunacom_local_dev_user') || 'null')
        if (!stored) return ''
        localStorage.removeItem('eunacom_local_dev_user')
        const email = String(stored.email || '')
        return /@eunacom\.app$/.test(email) ? '' : email
    } catch { return '' }
})()

export const AuthProvider = ({ children }) => {
    const [localDevUser, setLocalDevUser] = useState(() => {
        if (devGuest) return (() => { try { return JSON.parse(localStorage.getItem('eunacom_local_dev_user') || 'null') } catch { return null } })()
        if (isLocalHost) return DEFAULT_LOCAL_ADMIN
        return null // producción: solo vale la sesión de Supabase
    })

    const [user, setUser] = useState(() => {
        if (devGuest) return (() => { try { return JSON.parse(localStorage.getItem('eunacom_local_dev_user') || 'null') } catch { return null } })()
        try {
            const storedDev = isDevHost ? localStorage.getItem('eunacom_local_dev_user') : null
            if (storedDev) return JSON.parse(storedDev)
            const cached = localStorage.getItem('eunacom_cached_user')
            if (cached) return JSON.parse(cached)
            if (isLocalHost) return DEFAULT_LOCAL_ADMIN
        } catch (e) {}
        return isLocalHost ? DEFAULT_LOCAL_ADMIN : null
    })

    const [loading, setLoading] = useState(() => {
        if (isLocalHost) return false
        const hasStoredUser = !!localStorage.getItem('eunacom_cached_user')
        return !hasStoredUser
    })
    const [adminPreviewMode, setAdminPreviewMode] = useState(false)

    useEffect(() => {
        if (localDevUser) {
            setUser(localDevUser)
            setLoading(false)
            return
        }

        // Force-logout if session version has changed (e.g. to trigger onboarding re-check)
        const storedVersion = localStorage.getItem(SESSION_KEY)
        if (storedVersion !== SESSION_VERSION) {
            supabase.auth.signOut().finally(() => {
                localStorage.setItem(SESSION_KEY, SESSION_VERSION)
                localStorage.removeItem('eunacom_cached_user')
                setUser(null)
                setLoading(false)
            })
            return
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!localDevUser) {
                const activeUser = session?.user ?? (isLocalHost ? DEFAULT_LOCAL_ADMIN : null)
                if (activeUser) {
                    try {
                        localStorage.setItem('eunacom_cached_user', JSON.stringify(activeUser))
                    } catch (e) {}
                } else if (!isLocalHost) {
                    localStorage.removeItem('eunacom_cached_user')
                }
                setUser(activeUser)
            }
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (localDevUser) return
            if (session?.user) {
                // Stamp the current version so they won't be kicked out again
                localStorage.setItem(SESSION_KEY, SESSION_VERSION)
                try {
                    localStorage.setItem('eunacom_cached_user', JSON.stringify(session.user))
                } catch (e) {}
                if (window.location.hash && window.location.hash.includes('access_token')) {
                    window.history.replaceState(null, '', window.location.pathname)
                }
            } else {
                if (!isLocalHost) {
                    localStorage.removeItem('eunacom_cached_user')
                }
            }
            const activeUser = session?.user ?? (isLocalHost ? DEFAULT_LOCAL_ADMIN : null)
            setUser(activeUser)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [localDevUser])

    // Tie PostHog events to the Supabase user id (no email/name) so the funnel follows one person.
    useEffect(() => {
        if (user?.id && !isLocalHost) identifyUser(user)
    }, [user?.id])

    // Quien venía usando la app sin confirmar su correo: abrir el login con su correo puesto
    const [authModal, setAuthModal] = useState(() => staleLocalEmail && !localStorage.getItem('eunacom_cached_user')
        ? { isOpen: true, mode: 'login', message: 'Confirma tu correo para seguir donde quedaste: inicia sesión y te enviamos un código.', email: staleLocalEmail }
        : { isOpen: false, mode: 'register', message: '', email: '' })

    // email: deja el correo escrito (p. ej. quien compró libros sin cuenta)
    const openAuthModal = (mode = 'register', message = '', email = '') => {
        setAuthModal({ isOpen: true, mode, message, email })
    }

    const closeAuthModal = () => {
        setAuthModal(prev => ({ ...prev, isOpen: false }))
    }

    const createDevTestUser = (customEmail = null, fullName = 'Nuevo Médico') => {
        const randomId = 'dev_' + Math.random().toString(36).substring(2, 9)
        const email = customEmail || `nuevo_medico_${Date.now()}@eunacom.app`
        const mockUser = {
            id: randomId,
            email,
            user_metadata: { full_name: fullName },
            app_metadata: { provider: 'email' },
            created_at: new Date().toISOString()
        }
        localStorage.setItem('eunacom_local_dev_user', JSON.stringify(mockUser))
        sessionStorage.removeItem(`onboarding_checked_${randomId}`)
        setLocalDevUser(mockUser)
        setUser(mockUser)
        return { data: { user: mockUser, session: { user: mockUser } }, error: null }
    }

    const signUp = async (email, password, fullName = '') => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            })
            
            // Solo en localhost: si Supabase falla, seguir con un usuario de prueba local
            if (error && isDevHost) {
                console.warn('Supabase signup errored on localhost. Falling back to local dev user account:', error.message)
                return createDevTestUser(email, fullName)
            }
            if (error) return { data, error }

            // Sin sesión = Supabase pide confirmar el correo. No se entra a la app todavía:
            // quien llama muestra el paso del código (verifySignupCode).
            // Un correo que ya tiene cuenta confirmada vuelve como usuario sin identidades.
            const alreadyRegistered = !!data?.user && !data?.session && Array.isArray(data.user.identities) && data.user.identities.length === 0
            return { data, error: null, needsCode: !!data?.user && !data?.session && !alreadyRegistered, alreadyRegistered }
        } catch (err) {
            if (isDevHost) {
                console.warn('SignUp exception on localhost, falling back to local dev account:', err)
                return createDevTestUser(email, fullName)
            }
            return { data: null, error: err }
        }
    }

    // Código del correo de confirmación → sesión real (la recoge onAuthStateChange)
    const verifySignupCode = async (email, code) => {
        const { data, error } = await supabase.auth.verifyOtp({ email, token: String(code).trim(), type: 'signup' })
        return { data, error }
    }

    // Reenvía el correo de confirmación (Supabase permite uno cada 60 s por persona)
    const resendSignupCode = async (email) => {
        const { data, error } = await supabase.auth.resend({ type: 'signup', email })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signInWithGoogle = async () => {
        // Páginas que piden login y deben volver a sí mismas (p. ej. /libro-gordo/<token>)
        let returnPath = '/dashboard'
        try {
            const stored = sessionStorage.getItem('eunacom_auth_return')
            if (stored && stored.startsWith('/')) returnPath = stored
            sessionStorage.removeItem('eunacom_auth_return')
        } catch (e) {}
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}${returnPath}`,
                queryParams: {
                    prompt: 'select_account'
                }
            }
        })
        return { data, error }
    }

    const signOut = async () => {
        localStorage.removeItem('eunacom_local_dev_user')
        localStorage.removeItem('eunacom_cached_user')
        if (user?.id) {
            localStorage.removeItem(`eunacom_cached_is_premium_${user.id}`)
        }
        setLocalDevUser(null)
        resetAnalytics()
        const { error } = await supabase.auth.signOut().catch(() => ({ error: null }))
        setUser(null)
        return { error }
    }

    const toggleAdminPreview = () => {
        setAdminPreviewMode(prev => !prev)
    }

    const isRealAdmin = () => {
        if (isLocalHost) return true
        const normalized = (user?.email || '').trim().toLowerCase()
        return Boolean(normalized && (normalized === 'dr.felipeyanez@gmail.com' || btoa(normalized) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t'))
    }

    const isAdmin = () => {
        if (adminPreviewMode) return false
        if (isLocalHost) return true
        const normalized = (user?.email || '').trim().toLowerCase()
        return Boolean(normalized && (normalized === 'dr.felipeyanez@gmail.com' || btoa(normalized) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t'))
    }

    const value = {
        user,
        loading,
        signUp,
        verifySignupCode,
        resendSignupCode,
        signIn,
        signInWithGoogle,
        signOut,
        isAdmin,
        isRealAdmin,
        adminPreviewMode,
        toggleAdminPreview,
        authModal,
        openAuthModal,
        closeAuthModal,
        createDevTestUser,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
