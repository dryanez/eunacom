import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle, Sparkles, Trophy, Target, Zap, ArrowRight } from 'lucide-react';
import '../styles/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/signup');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="landing-container">
            <div className="landing-bg-animation"></div>

            <header className="landing-header">
                <div className="landing-logo-container">
                    <img
                        src="/logo.png"
                        alt="Eunacom-Examen"
                        className="landing-logo"
                    />
                    <span className="landing-logo-text">
                        Eunacom-Examen
                    </span>
                </div>
                <button
                    onClick={handleLogin}
                    className="landing-login-btn"
                >
                    Iniciar Sesión
                </button>
            </header>

            <main className="landing-main">
                <div className="landing-hero">
                    <div className="landing-badge">
                        <Sparkles size={20} />
                        Plataforma #1 para el EUNACOM 2026
                    </div>

                    <h1 className="landing-title">
                        Aprueba el EUNACOM<br />
                        con <span>Confianza</span>
                    </h1>

                    <p className="landing-subtitle">
                        Más de <strong>10,000 preguntas</strong> reconstruidas del examen real.
                        Sistema de gamificación que hace el estudio <strong>adictivo</strong>.
                    </p>

                    <div className="landing-buttons">
                        <button
                            onClick={handleGetStarted}
                            className="landing-btn-primary"
                        >
                            <Play size={24} fill="currentColor" />
                            Comenzar Gratis
                        </button>

                        <button className="landing-btn-secondary">
                            Ver Demo
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                <div className="landing-features">
                    {[
                        {
                            icon: <Target size={40} />,
                            title: '10,000+ Preguntas',
                            desc: 'Banco completo con preguntas reconstruidas de exámenes reales EUNACOM'
                        },
                        {
                            icon: <Trophy size={40} />,
                            title: 'Sistema de Niveles',
                            desc: 'Gana XP, sube de nivel y compite con otros estudiantes'
                        },
                        {
                            icon: <Zap size={40} />,
                            title: 'Análisis IA',
                            desc: 'Identifica tus debilidades y recibe estudio personalizado'
                        },
                        {
                            icon: <CheckCircle size={40} />,
                            title: '99% Aprobación',
                            desc: 'Tasa de aprobación comprobada de nuestros usuarios'
                        }
                    ].map((feature, i) => (
                        <div key={i} className="feature-card">
                            <div style={{
                                color: '#FFD700',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                justifyContent: 'center'
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                marginBottom: '1rem'
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.6',
                                fontSize: '1rem'
                            }}>
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="social-proof">
                    <h2 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '2rem'
                    }}>
                        Únete a Miles de Estudiantes
                    </h2>
                    <div className="social-stats-container">
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#FFD700' }}>5,000+</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>Estudiantes Activos</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#FFD700' }}>10,000+</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>Preguntas</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', fontWeight: '900', color: '#FFD700' }}>99%</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem' }}>Tasa de Aprobación</div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="landing-footer">
                <p style={{ fontSize: '1rem', margin: 0 }}>
                    © 2026 Eunacom-Examen - La mejor plataforma para aprobar tu EUNACOM
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
