import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

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

const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV
)

export const AuthProvider = ({ children }) => {
    const [localDevUser, setLocalDevUser] = useState(() => {
        if (isLocalHost) return DEFAULT_LOCAL_ADMIN
        const stored = localStorage.getItem('eunacom_local_dev_user')
        return stored ? JSON.parse(stored) : null
    })

    const [user, setUser] = useState(() => {
        try {
            const storedDev = localStorage.getItem('eunacom_local_dev_user')
            if (storedDev) return JSON.parse(storedDev)
            const cached = localStorage.getItem('eunacom_cached_user')
            if (cached) return JSON.parse(cached)
            if (isLocalHost) return DEFAULT_LOCAL_ADMIN
        } catch (e) {}
        return isLocalHost ? DEFAULT_LOCAL_ADMIN : null
    })

    const [loading, setLoading] = useState(() => {
        if (isLocalHost) return false
        const hasStoredUser = !!(localStorage.getItem('eunacom_local_dev_user') || localStorage.getItem('eunacom_cached_user'))
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

    const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'register', message: '' })

    const openAuthModal = (mode = 'register', message = '') => {
        setAuthModal({ isOpen: true, mode, message })
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
            
            // If Supabase hits 429 rate limit or error in development, fallback to local dev user seamlessly!
            if (error && (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('429') || window.location.hostname === 'localhost')) {
                console.warn('Supabase signup rate limited / errored. Falling back to local dev user account:', error.message)
                return createDevTestUser(email, fullName)
            }
            
            if (data?.user && !data?.session) {
                // If email confirmation is required by Supabase, also set local user so they can immediately test onboarding
                localStorage.setItem('eunacom_local_dev_user', JSON.stringify(data.user))
                setUser(data.user)
            }

            return { data, error }
        } catch (err) {
            console.warn('SignUp exception, falling back to local dev account:', err)
            return createDevTestUser(email, fullName)
        }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signInWithGoogle = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
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
        const { error } = await supabase.auth.signOut().catch(() => ({ error: null }))
        setUser(null)
        return { error }
    }

    const toggleAdminPreview = () => {
        setAdminPreviewMode(prev => !prev)
    }

    const isRealAdmin = () => {
        if (isLocalHost) return true
        return Boolean(user?.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t')
    }

    const isAdmin = () => {
        if (adminPreviewMode) return false
        if (isLocalHost) return true
        return Boolean(user?.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t')
    }

    const value = {
        user,
        loading,
        signUp,
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
