import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';
import '../styles/neumorphism.css';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className={`faq__item neu-card ${isOpen ? 'faq__item--active' : ''}`} style={{ marginBottom: '1rem' }}>
            <button className="faq__question" aria-expanded={isOpen} onClick={onClick} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', padding: '0', cursor: 'pointer' }}>
                <span className="faq__question-text" style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{question}</span>
                <span className="faq__question-icon" style={{ color: 'var(--color-primary-500)' }}>
                    {isOpen ? '−' : '+'}
                </span>
            </button>
            {isOpen && (
                <div className="faq__answer" style={{ marginTop: '1rem', color: 'var(--color-text-light)' }}>
                    {answer}
                </div>
            )}
        </div>
    );
};

const ComparisonRow = ({ feature, us, them }) => (
    <tr className="comparison-row">
        <td>{feature}</td>
        <td style={{ textAlign: 'center' }}>
            {us ? <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg> : <span className="x-icon">✕</span>}
            {typeof us === 'string' && <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--color-primary-500)', marginTop: '0.2rem' }}>{us}</div>}
        </td>
        <td style={{ textAlign: 'center', opacity: 0.5 }}>
            {them ? <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg> : <span className="x-icon">✕</span>}
            {typeof them === 'string' && <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{them}</div>}
        </td>
    </tr>
);

const LandingPage = () => {
    const navigate = useNavigate();
    const [openFAQ, setOpenFAQ] = useState(0);

    const toggleFAQ = (index) => {
        setOpenFAQ(openFAQ === index ? -1 : index);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <div className="landing-page-wrapper" style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <header className="header" style={{ boxShadow: 'none', background: 'transparent', padding: '2rem 0' }}>
                <div className="container">
                    <nav className="header__nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Logo */}
                        <a href="/" className="header__logo" style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--color-bg)', borderRadius: '50%', boxShadow: 'var(--shadow-light), var(--shadow-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: 'var(--color-primary-500)', fontSize: '1.2rem' }}>E</span>
                            </div>
                            <span>Eunacom<span style={{ color: 'var(--color-primary-500)' }}>.app</span></span>
                        </a>

                        <div className="header__actions">
                            <a href="/login" onClick={handleLogin} className="btn-neu">
                                Iniciar sesión
                            </a>
                        </div>
                    </nav>
                </div>
            </header>

            <main className="main">
                {/* HERO SECTION */}
                <section className="hero section" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>
                    <div className="container">
                        <div className="grid grid-2" style={{ alignItems: 'center' }}>
                            <div className="hero__content">
                                <div className="neu-card" style={{ display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: '50px', marginBottom: '2rem' }}>
                                    <span style={{ color: 'var(--color-primary-500)', fontWeight: '600' }}>🚀 Nuevo Método 2025</span>
                                </div>

                                <h1 className="hero__title" style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', color: 'var(--color-text-main)', marginBottom: '1.5rem' }}>
                                    La preparación <span style={{ color: 'var(--color-primary-500)' }}>Definitiva</span> para el Eunacom
                                </h1>

                                <p className="hero__subtitle" style={{ fontSize: '1.25rem', color: 'var(--color-text-light)', marginBottom: '3rem', maxWidth: '500px' }}>
                                    Practica con más de <b>10.000 preguntas reconstruidas</b> de exámenes reales. Deja de adivinar y empieza a asegurar tu puntaje.
                                </p>

                                <div className="hero__actions" style={{ display: 'flex', gap: '1.5rem' }}>
                                    <button className="btn-neu btn-neu-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Comenzar Gratis</button>
                                    <a href="#comparison" className="btn-neu" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Ver Diferencias</a>
                                </div>
                            </div>

                            <div className="hero__visual" style={{ position: 'relative', height: '400px' }}>
                                {/* Abstract Visuals */}
                                <div className="hero__stat-card" style={{ position: 'absolute', top: '0', right: '10%', animation: 'float 6s ease-in-out infinite' }}>
                                    <span className="hero__stat-value">10k+</span>
                                    <span className="hero__stat-label">Preguntas</span>
                                </div>
                                <div className="hero__stat-card" style={{ position: 'absolute', bottom: '10%', left: '10%', animation: 'float 8s ease-in-out infinite reverse' }}>
                                    <span className="hero__stat-value">99%</span>
                                    <span className="hero__stat-label">Tasa de Aprobación</span>
                                </div>
                                <div className="hero__stat-card" style={{ position: 'absolute', top: '40%', right: '40%', width: '180px', height: '180px', zIndex: '1', animation: 'pulse 4s ease-in-out infinite' }}>
                                    <span className="hero__stat-value" style={{ fontSize: '2.5rem' }}>Real</span>
                                    <span className="hero__stat-label">Reconstrucciones</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* COMPARISON SECTION */}
                <section className="section" id="comparison">
                    <div className="container">
                        <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                                Por qué somos <span style={{ color: 'var(--color-primary-500)' }}>mejores</span>
                            </h2>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '1.1rem', marginTop: '1rem' }}>
                                Compara tú mismo las diferencias con la competencia.
                            </p>
                        </div>

                        <div className="neu-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <table className="comparison-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40%' }}>Características</th>
                                        <th style={{ width: '30%', textAlign: 'center', fontSize: '1.2rem', color: 'var(--color-primary-500)' }}>Eunacom App</th>
                                        <th style={{ width: '30%', textAlign: 'center' }}>Mi Eunacom</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <ComparisonRow feature="Banco de Preguntas" us="10.000+" them="5.000~" />
                                    <ComparisonRow feature="Reconstrucciones Reales (2024)" us={true} them={false} />
                                    <ComparisonRow feature="Análisis de Rendimiento I.A." us={true} them="Básico" />
                                    <ComparisonRow feature="Interfaz Moderna (Soft UI)" us={true} them={false} />
                                    <ComparisonRow feature="Modo Oscuro/Claro" us={true} them={false} />
                                    <ComparisonRow feature="Garantía de Aprobación" us="100% Devolución" them="Condicional" />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section className="features section" id="features">
                    <div className="container">
                        <div className="section-header text-center" style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                                Todo lo que necesitas
                            </h2>
                        </div>

                        <div className="grid grid-2 gap-xl">
                            {[
                                { title: "Preguntas Ilimitadas", desc: "No te quedes sin material. Nuestro banco crece cada semana con nuevas reconstrucciones." },
                                { title: "Simulacros Reales", desc: "Vive la experiencia exacta del examen con el mismo límite de tiempo y dificultad." },
                                { title: "Flashcards Inteligentes", desc: "Memoriza los conceptos clave con nuestro sistema de repetición espaciada." },
                                { title: "Comunidad de Doctores", desc: "Resuelve dudas con miles de otros estudiantes preparando el mismo examen." }
                            ].map((feature, i) => (
                                <div key={i} className="neu-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-bg)', boxShadow: 'var(--shadow-inset-light), var(--shadow-inset-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary-500)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {i + 1}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-main)' }}>{feature.title}</h3>
                                    <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6' }}>{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ SECTION */}
                <section id="faq" className="faq section">
                    <div className="container">
                        <div className="section-header text-center" style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
                                Preguntas Frecuentes
                            </h2>
                        </div>
                        <div className="faq__grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <FAQItem
                                question="¿De dónde salen las 10.000 preguntas?"
                                answer="Recopilamos reconstrucciones de estudiantes que rindieron el examen en los últimos 10 años, además de crear preguntas propias basadas en la bibliografía oficial."
                                isOpen={openFAQ === 0}
                                onClick={() => toggleFAQ(0)}
                            />
                            <FAQItem
                                question="¿Es realmente mejor que Mi Eunacom?"
                                answer="Creemos que sí. Ofrecemos el doble de preguntas, una tecnología más moderna y una garantía de aprobación más transparente. Tú decides."
                                isOpen={openFAQ === 1}
                                onClick={() => toggleFAQ(1)}
                            />
                            <FAQItem
                                question="¿Puedo probarlo gratis?"
                                answer="Sí, regístrate y accede a un simulacro diagnóstico completo sin costo alguno."
                                isOpen={openFAQ === 2}
                                onClick={() => toggleFAQ(2)}
                            />
                        </div>
                    </div>
                </section>

            </main>

            <footer className="footer" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-light)' }}>
                <div className="container">
                    <div className="footer__bottom">
                        <div className="footer__copyright">
                            <span>© 2025 Eunacom App - Diseñado para Ganar.</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
