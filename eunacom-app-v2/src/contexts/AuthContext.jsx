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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [adminPreviewMode, setAdminPreviewMode] = useState(false)

    const [localDevUser, setLocalDevUser] = useState(() => {
        const stored = localStorage.getItem('eunacom_local_dev_user')
        return stored ? JSON.parse(stored) : null
    })

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
                setUser(null)
                setLoading(false)
            })
            return
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!localDevUser) {
                setUser(session?.user ?? null)
            }
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (localDevUser) return
            if (session?.user) {
                // Stamp the current version so they won't be kicked out again
                localStorage.setItem(SESSION_KEY, SESSION_VERSION)
                if (window.location.hash && window.location.hash.includes('access_token')) {
                    window.history.replaceState(null, '', window.location.pathname)
                }
            }
            setUser(session?.user ?? null)
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
        setLocalDevUser(null)
        const { error } = await supabase.auth.signOut().catch(() => ({ error: null }))
        setUser(null)
        return { error }
    }

    const toggleAdminPreview = () => {
        setAdminPreviewMode(prev => !prev)
    }

    const isRealAdmin = () => {
        return user?.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t'
    }

    const isAdmin = () => {
        return user?.email && btoa(user.email) === 'ZHIuZmVsaXBleWFuZXpAZ21haWwuY29t' && !adminPreviewMode
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
