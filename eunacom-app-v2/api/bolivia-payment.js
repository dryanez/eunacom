import { createClient } from '@supabase/supabase-js';

// Inicializa Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// DLocal / Payme Configuration (Para cuando tengas cuenta)
// const DLOCAL_API_KEY = process.env.DLOCAL_API_KEY;
// const DLOCAL_SECRET = process.env.DLOCAL_SECRET;

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing userId or planId' });
    }

    // 1. OBTENER INFORMACIÓN DEL PLAN
    const planes = {
      '1m': { price_clp: 14990, price_bob: 115 }, // Aproximado, ajustar a voluntad
      '3m': { price_clp: 34990, price_bob: 270 },
      '6m': { price_clp: 54990, price_bob: 420 },
      '1y': { price_clp: 89990, price_bob: 690 },
    };

    const plan = planes[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid planId' });
    }

    // 2. CREAR PAGO EN DLOCAL / PAYME (CÓDIGO COMENTADO PARA FUTURO)
    /*
    const dlocalResponse = await fetch('https://sandbox.dlocal.com/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DLOCAL_API_KEY}`,
        // Añadir firma si dLocal lo requiere
      },
      body: JSON.stringify({
        amount: plan.price_bob,
        currency: "BOB",
        country: "BO",
        payment_method_id: "VPay", // O el id correspondiente a QR Simple en dLocal
        payer: {
          // Idealmente sacar el email del usuario de Supabase
          email: "user@example.com",
          document: "123456" // Cédula o NIT si es necesario
        },
        order_id: `order_${userId}_${Date.now()}`,
        description: `Plan ${planId} Eunacom`,
        // Importante: Aquí debes poner la URL a la que dLocal mandará el Webhook
        notification_url: "https://tudominio.com/api/webhooks/bolivia-payment" 
      })
    });
    
    const dlocalData = await dlocalResponse.json();
    const qrImage = dlocalData.qr_code_base64; // Dependiendo de la API real
    */

    // 3. RESPUESTA SIMULADA HASTA TENER LA API KEY
    const simulatedQrImage = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Simulacion_Pago_Simple_Bolivia";

    return res.status(200).json({ 
      success: true, 
      qr_code_image: simulatedQrImage,
      message: "Pago QR generado (Simulado)"
    });

  } catch (error) {
    console.error('Error generating Bolivia QR:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
