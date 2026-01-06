import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import '../styles/dashboard.css'

const DashboardLayout = () => {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            navigate('/login')
            return
        }
        fetchProfile()
    }, [user, authLoading, navigate])

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('level, xp, avatar_id, display_name')
                .eq('user_id', user.id)
                .single()

            if (!error && data) {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return null // Or a loading spinner

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <DashboardHeader profile={profile} />
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
