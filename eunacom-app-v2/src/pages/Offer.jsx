import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createCheckoutSession } from '../lib/api';
import { CheckCircle2, Clock, Loader2, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Offer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingMp, setLoadingMp] = useState(false);
  const [errorMp, setErrorMp] = useState(null);

  const handleMercadoPago = async () => {
    if (!user) {
      // Si no está logueado, llevarlo al registro y luego redirigir de vuelta
      navigate('/register?redirect=/oferta');
      return;
    }
    setLoadingMp(true);
    setErrorMp(null);
    try {
      const res = await createCheckoutSession(user.id, 'offer');
      if (res.init_point) {
        window.location.href = res.init_point;
      } else {
        throw new Error("No se pudo obtener el link de pago.");
      }
    } catch (err) {
      console.error(err);
      setErrorMp("Ocurrió un error al procesar el pago. Inténtalo de nuevo.");
      setLoadingMp(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '3rem 1.5rem',
      fontFamily: 'var(--font)'
    }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        
        {/* Banner Urgencia */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 700,
          marginBottom: '2rem'
        }}>
          <Clock size={20} />
          <span>¡Última semana para el EUNACOM!</span>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>
            Asegura tu puntaje en el <span style={{ color: 'var(--accent-blue)' }}>EUNACOM</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--surface-300)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Accede de inmediato a todas las reconstrucciones interactivas y nuestro banco de 7.000+ preguntas con una oferta exclusiva de último minuto.
          </p>

          <div style={{ 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1px solid rgba(255,255,255,0.1)', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <img 
              src="/reconstructions-preview.png" 
              alt="Plataforma de Reconstrucciones EUNACOM" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </div>

        {/* Pricing Card */}
        <div style={{
          background: 'var(--surface-800)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          padding: '3rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #ec4899, #3b82f6)'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, gap: '3rem' }}>
            
            {/* Features */}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star className="text-accent-amber" size={24} />
                Acceso Premium Total
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Todas las reconstrucciones de exámenes pasados',
                  'Más de 7.000 preguntas explicadas',
                  'Simulacros con tiempo real ilimitados',
                  'Clases de repaso intensivo (MedScribe)',
                  'Predicción de puntaje con IA'
                ].map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '1.05rem', color: 'var(--surface-200)' }}>
                    <CheckCircle2 color="#10b981" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Options */}
            <div style={{
              flex: 1,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textDecoration: 'line-through', color: 'var(--surface-400)', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                $14.990
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', marginBottom: '0.25rem', lineHeight: 1 }}>
                $5.000
              </div>
              <div style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2rem' }}>
                Por 1 mes de acceso (Último Repaso)
              </div>

              {/* Botón Mercado Pago */}
              <button
                onClick={handleMercadoPago}
                disabled={loadingMp}
                style={{
                  width: '100%', padding: '1.25rem', background: '#009ee3', color: 'white', border: 'none', borderRadius: '12px',
                  fontSize: '1.1rem', fontWeight: 800, cursor: loadingMp ? 'not-allowed' : 'pointer', marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  boxShadow: '0 4px 14px 0 rgba(0, 158, 227, 0.39)', transition: 'all 0.2s'
                }}>
                {loadingMp ? <><Loader2 size={20} className="spin" /> Procesando...</> : <><Zap size={20} /> Pagar con Webpay (Chile)</>}
              </button>

              {/* Botón PayPal Placeholder */}
              <div style={{ width: '100%' }}>
                <a 
                  href="AQUI_PONDREMOS_EL_LINK_DE_PAYPAL_PARA_5USD"
                  style={{
                    display: 'flex', width: '100%', padding: '1.25rem', background: '#003087', color: 'white', border: 'none', borderRadius: '12px',
                    fontSize: '1.1rem', fontWeight: 800, cursor: 'pointer', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textDecoration: 'none',
                    boxShadow: '0 4px 14px 0 rgba(0, 48, 135, 0.39)', transition: 'all 0.2s'
                  }}>
                  Pagar con PayPal (Internacional)
                </a>
                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--surface-400)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                  Para Bolivia y el resto del mundo.<br/>(Necesitamos el nuevo link de PayPal por $5 USD)
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Offer;
