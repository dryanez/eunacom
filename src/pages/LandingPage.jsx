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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.1,
                background: `
                    radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, #ffffff 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, #ffffff 0%, transparent 50%)
                `,
                animation: 'pulse 8s ease-in-out infinite'
            }}></div>

            {/* Header */}
            <header style={{
                position: 'relative',
                zIndex: 10,
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <img
                        src="/logo.png"
                        alt="Eunacom-Examen"
                        style={{
                            width: '48px',
                            height: '48px',
                            filter: 'drop-shadow(0 4px 12px rgba(255,255,255,0.3))'
                        }}
                    />
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '800',
                        color: 'white',
                        letterSpacing: '0.5px'
                    }}>
                        Eunacom-Examen
                    </span>
                </div>
                <button
                    onClick={handleLogin}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.3)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.2)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    Iniciar Sesión
                </button>
            </header>

            {/* Hero Section */}
            <main style={{
                position: 'relative',
                zIndex: 5,
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '4rem 2rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '4rem'
                }}>
                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '0.5rem 1.5rem',
                        borderRadius: '50px',
                        marginBottom: '2rem',
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        <Sparkles size={20} />
                        Plataforma #1 para el EUNACOM 2026
                    </div>

                    {/* Main Headline */}
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: '900',
                        color: 'white',
                        lineHeight: '1.1',
                        marginBottom: '1.5rem',
                        textShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}>
                        Aprueba el EUNACOM<br />
                        con <span style={{
                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: 'none'
                        }}>Confianza</span>
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                        color: 'rgba(255,255,255,0.9)',
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6',
                        textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}>
                        Más de <strong>10,000 preguntas</strong> reconstruidas del examen real.
                        Sistema de gamificación que hace el estudio <strong>adictivo</strong>.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={handleGetStarted}
                            style={{
                                background: 'white',
                                color: '#667eea',
                                padding: '1.25rem 3rem',
                                borderRadius: '16px',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-4px)';
                                e.target.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
                            }}
                        >
                            <Play size={24} fill="currentColor" />
                            Comenzar Gratis
                        </button>

                        <button
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                padding: '1.25rem 3rem',
                                borderRadius: '16px',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.25)';
                                e.target.style.transform = 'translateY(-4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255,255,255,0.15)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Ver Demo
                            <ArrowRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Features Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginTop: '6rem'
                }}>
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
                        <div
                            key={i}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '24px',
                                padding: '2.5rem',
                                textAlign: 'center',
                                transition: 'all 0.3s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
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

                {/* Social Proof */}
                <div style={{
                    marginTop: '6rem',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '24px',
                    padding: '3rem',
                }}>
                    <h2 style={{
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        marginBottom: '2rem'
                    }}>
                        Únete a Miles de Estudiantes
                    </h2>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '4rem',
                        flexWrap: 'wrap'
                    }}>
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

            {/* Footer */}
            <footer style={{
                position: 'relative',
                zIndex: 5,
                textAlign: 'center',
                padding: '3rem 2rem',
                color: 'rgba(255,255,255,0.7)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                marginTop: '4rem'
            }}>
                <p>© 2026 Eunacom-Examen - La mejor plataforma para aprobar tu EUNACOM</p>
            </footer>
        </div>
    );
};

export default LandingPage;
