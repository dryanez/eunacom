// Vercel Serverless Function: /api/tutor
// POST { question, options, userAnswer, correctAnswer, explanation }
// Returns { message: "..." }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question, options, userAnswer, correctAnswer, explanation } = req.body

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' })
  }

  const prompt = `Eres un tutor médico socrático para un estudiante chileno preparando el EUNACOM.
El estudiante respondió incorrectamente.

Pregunta: ${question}
Opciones: ${options ? options.join(', ') : 'N/A'}
Respuesta del estudiante: ${userAnswer}
Respuesta correcta: ${correctAnswer}
Contexto: ${explanation || ''}

Haz UNA sola pregunta guiada en español que lleve al estudiante a descubrir por qué se equivocó, sin revelar la respuesta directamente. Sé breve y claro.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${errText}`)
    }

    const data = await response.json()
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta del tutor.'
    return res.status(200).json({ message })
  } catch (err) {
    console.error('Tutor error:', err)
    return res.status(500).json({ error: 'Error generando respuesta del tutor.' })
  }
}
