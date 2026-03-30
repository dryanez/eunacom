import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Hardcoded local admin user object
const LOCAL_ADMIN_USER = {
    id: 'local-admin-001',
    email: 'dr.felipeyanez@gmail.com',
    user_metadata: { full_name: 'Admin Local' },
    _isLocalAdmin: true,
}
const LOCAL_ADMIN_KEY = 'eunacom_local_admin'

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

    useEffect(() => {
        // Check for persisted local admin session first
        if (localStorage.getItem(LOCAL_ADMIN_KEY) === 'true') {
            setUser(LOCAL_ADMIN_USER)
            setLoading(false)
            return
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!localStorage.getItem(LOCAL_ADMIN_KEY)) {
                setUser(session?.user ?? null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        // Hardcoded local admin bypass
        if (email === 'admin' || email === 'admin@admin.com') {
            localStorage.setItem(LOCAL_ADMIN_KEY, 'true')
            setUser(LOCAL_ADMIN_USER)
            return { data: { user: LOCAL_ADMIN_USER }, error: null }
        }

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
        // Clear local admin session
        localStorage.removeItem(LOCAL_ADMIN_KEY)
        setUser(null)
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const isAdmin = () => {
        return user?.email === 'dr.felipeyanez@gmail.com' || user?._isLocalAdmin === true
    }

    const value = {
        user,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        isAdmin,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
