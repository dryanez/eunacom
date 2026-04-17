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

    useEffect(() => {
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
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                // Stamp the current version so they won't be kicked out again
                localStorage.setItem(SESSION_KEY, SESSION_VERSION)
            }
            setUser(session?.user ?? null)
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
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const isAdmin = () => {
        return user?.email === 'dr.felipeyanez@gmail.com'
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
