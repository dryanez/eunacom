import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createClient } from '@libsql/client'
import fs from 'fs'
import path from 'path'

// Dev middleware: serve /api/clases locally using Turso
function clasesApiPlugin() {
  let db
  return {
    name: 'clases-api',
    configureServer(server) {
      // Load .env vars into process.env for server-side use
      const env = loadEnv('development', process.cwd(), '')
      Object.assign(process.env, env)

      // ── Cloudflare R2 Video Streaming Redirect (Local Dev) ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/video')) return next()
        const url = new URL(req.url, 'http://localhost')
        const subsystem = url.searchParams.get('subsystem')
        const lessonNumber = url.searchParams.get('lessonNumber')
        
        if (!subsystem || !lessonNumber) {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'Missing parameters' }))
        }

        try {
          // Dynamic import of S3 SDK
          const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
          const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner')
          
          const videoIndex = JSON.parse(fs.readFileSync(path.resolve('./src/lib/videoIndex.json'), 'utf8'))
          const subsystemIndex = videoIndex[subsystem]
          const r2Key = subsystemIndex ? subsystemIndex[String(lessonNumber)] : null
          
          if (!r2Key) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Video not mapped' }))
          }

          const accountId = process.env.VITE_R2_ACCOUNT_ID
          const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID
          const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY
          const bucketName = process.env.VITE_R2_BUCKET || 'eunacomvideos'

          if (!accountId || !accessKeyId || !secretAccessKey) {
            res.statusCode = 500
            return res.end(JSON.stringify({ error: 'Missing R2 environment variables' }))
          }

          const s3 = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
            forcePathStyle: true,
          })

          const command = new GetObjectCommand({ Bucket: bucketName, Key: r2Key })
          const signedUrl = await getSignedUrl(s3, command, { expiresIn: 14400 })

          // Redirect the <video src> to the Cloudflare URL instantly
          res.writeHead(302, { Location: signedUrl })
          res.end()

        } catch (err) {
          console.error('R2 URL Error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // ── Progress API ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/progress')) return next()
        if (!db) {
          db = createClient({
            url: process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
            authToken: process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
          })
        }
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')
        try {
          if (req.method === 'GET') {
            const userId = url.searchParams.get('userId')
            if (!userId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId required' })) }
            const result = await db.execute({ sql: 'SELECT * FROM user_progress WHERE user_id = ?', args: [userId] })
            return res.end(JSON.stringify({ data: result.rows }))
          }
          if (req.method === 'POST') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { userId, questionId, isCorrect, isOmitted } = body
            if (!userId || !questionId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId and questionId required' })) }
            await db.execute({
              sql: `INSERT INTO user_progress (id, user_id, question_id, is_correct, is_omitted, answered_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(user_id, question_id) DO UPDATE SET
                    is_correct = excluded.is_correct,
                    is_omitted = excluded.is_omitted,
                    answered_at = datetime('now')`,
              args: [userId + '_' + questionId, userId, questionId, isCorrect ? 1 : 0, isOmitted ? 1 : 0]
            })
            return res.end(JSON.stringify({ ok: true }))
          }
          if (req.method === 'PATCH') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { userId, questionId, isFlagged } = body
            if (!userId || !questionId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId and questionId required' })) }
            await db.execute({
              sql: `UPDATE user_progress SET is_flagged = ? WHERE user_id = ? AND question_id = ?`,
              args: [isFlagged ? 1 : 0, userId, questionId]
            })
            return res.end(JSON.stringify({ ok: true }))
          }
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (err) {
          console.error('progress-api error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // ── Tests API ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/tests')) return next()
        if (!db) {
          db = createClient({
            url: process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
            authToken: process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
          })
        }
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')
        try {
          if (req.method === 'GET') {
            const { userId, id } = Object.fromEntries(url.searchParams)
            if (id) {
              const result = await db.execute({ sql: 'SELECT * FROM tests WHERE id = ?', args: [id] })
              return res.end(JSON.stringify({ data: result.rows[0] || null }))
            }
            if (!userId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId required' })) }
            const result = await db.execute({
              sql: 'SELECT * FROM tests WHERE user_id = ? ORDER BY created_at DESC',
              args: [userId]
            })
            return res.end(JSON.stringify({ data: result.rows }))
          }
          if (req.method === 'POST') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { id, userId, mode, timeLimitSeconds, totalQuestions, questions } = body
            await db.execute({
              sql: `INSERT INTO tests (id, user_id, mode, time_limit_seconds, total_questions, questions, status, current_question_index, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, 'in_progress', 0, datetime('now'))`,
              args: [id, userId, mode, timeLimitSeconds || null, totalQuestions, JSON.stringify(questions)]
            })
            return res.end(JSON.stringify({ ok: true, id }))
          }
          if (req.method === 'PATCH') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { id, answers, currentIndex, status, score } = body
            if (status === 'completed') {
              await db.execute({
                sql: `UPDATE tests SET answers = ?, current_question_index = ?, status = 'completed', score = ?, completed_at = datetime('now') WHERE id = ?`,
                args: [JSON.stringify(answers || {}), currentIndex ?? 0, score ?? 0, id]
              })
            } else {
              await db.execute({
                sql: 'UPDATE tests SET answers = ?, current_question_index = ? WHERE id = ?',
                args: [JSON.stringify(answers || {}), currentIndex ?? 0, id]
              })
            }
            return res.end(JSON.stringify({ ok: true }))
          }
          if (req.method === 'DELETE') {
            const id = url.searchParams.get('id')
            await db.execute({ sql: 'DELETE FROM tests WHERE id = ?', args: [id] })
            return res.end(JSON.stringify({ ok: true }))
          }
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (err) {
          console.error('tests-api error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // ── Perfil EUNACOM API ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/perfil')) return next()
        if (!db) {
          db = createClient({
            url: process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
            authToken: process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
          })
        }
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')
        try {
          const search = url.searchParams.get('q')
          const area = url.searchParams.get('area')
          const specialty = url.searchParams.get('specialty')
          const seccion = url.searchParams.get('seccion')
          const codes = url.searchParams.get('codes')

          let sql = 'SELECT * FROM perfil_items WHERE 1=1'
          const args = []
          if (codes) {
            const codeList = codes.split(',').map(c => c.trim())
            sql += ` AND codigo IN (${codeList.map(() => '?').join(',')})`
            args.push(...codeList)
          }
          if (area) { sql += ' AND area = ?'; args.push(area) }
          if (specialty) { sql += ' AND specialty = ?'; args.push(specialty) }
          if (seccion) { sql += ' AND seccion = ?'; args.push(seccion) }
          if (search) { sql += ' AND (situacion LIKE ? OR codigo LIKE ?)'; args.push(`%${search}%`, `%${search}%`) }
          sql += ' ORDER BY codigo'

          const result = await db.execute({ sql, args })
          return res.end(JSON.stringify({ data: result.rows }))
        } catch (err) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // ── Clase Progress API ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/clase-progress')) return next()
        if (!db) {
          db = createClient({
            url: process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
            authToken: process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
          })
        }
        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')
        try {
          if (req.method === 'GET') {
            const userId = url.searchParams.get('userId')
            if (!userId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId required' })) }
            const result = await db.execute({ sql: 'SELECT * FROM clase_progress WHERE user_id = ?', args: [userId] })
            return res.end(JSON.stringify({ data: result.rows }))
          }
          if (req.method === 'POST') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { userId, claseId, readClase, readPuntos, quizCompleted, quizScore, quizCorrect, quizTotal, quizAnswers } = body
            if (!userId || !claseId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId and claseId required' })) }
            // Migrate: add video_watched column if missing
            try { await db.execute('ALTER TABLE clase_progress ADD COLUMN video_watched INTEGER DEFAULT 0') } catch {}

            const { videoWatched } = body
            await db.execute({
              sql: `INSERT INTO clase_progress (id, user_id, clase_id, read_clase, read_puntos, quiz_completed, quiz_score, quiz_correct, quiz_total, quiz_answers, video_watched, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                    ON CONFLICT(user_id, clase_id) DO UPDATE SET
                    read_clase = COALESCE(excluded.read_clase, read_clase),
                    read_puntos = COALESCE(excluded.read_puntos, read_puntos),
                    quiz_completed = COALESCE(excluded.quiz_completed, quiz_completed),
                    quiz_score = COALESCE(excluded.quiz_score, quiz_score),
                    quiz_correct = COALESCE(excluded.quiz_correct, quiz_correct),
                    quiz_total = COALESCE(excluded.quiz_total, quiz_total),
                    quiz_answers = COALESCE(excluded.quiz_answers, quiz_answers),
                    video_watched = COALESCE(excluded.video_watched, video_watched),
                    updated_at = datetime('now')`,
              args: [userId + '_' + claseId, userId, claseId, readClase ?? null, readPuntos ?? null, quizCompleted ?? null, quizScore ?? null, quizCorrect ?? null, quizTotal ?? null, quizAnswers ? JSON.stringify(quizAnswers) : null, videoWatched ?? null]
            })
            return res.end(JSON.stringify({ ok: true }))
          }
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (err) {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })

      // ── Clases API ──
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/clases')) return next()

        if (!db) {
          db = createClient({
            url: process.env.VITE_TURSO_DATABASE_URL || process.env.TURSO_DATABASE_URL,
            authToken: process.env.VITE_TURSO_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
          })
        }

        res.setHeader('Content-Type', 'application/json')
        const url = new URL(req.url, 'http://localhost')

        try {
          if (req.method === 'GET') {
            const userId = url.searchParams.get('userId')
            const id = url.searchParams.get('id')

            // Single class detail (normalize Unicode for macOS NFC/NFD compat)
            if (id) {
              let result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id] })
              if (!result.rows.length) {
                result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id.normalize('NFD')] })
              }
              if (!result.rows.length) {
                result = await db.execute({ sql: 'SELECT * FROM clases WHERE id = ?', args: [id.normalize('NFC')] })
              }
              return res.end(JSON.stringify({ data: result.rows[0] || null }))
            }

            if (!userId) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId required' })) }

            // List mode: return ALL classes (shared catalog for all users)
            const result = await db.execute({
              sql: 'SELECT id, user_id, topic, specialty, subsystem, lesson_number, slides_file, video_dir, saved_at FROM clases ORDER BY specialty, subsystem, lesson_number',
              args: []
            })
            return res.end(JSON.stringify({ data: result.rows }))
          }

          if (req.method === 'POST') {
            const body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(JSON.parse(d))) })
            const { id, userId, topic, summary, keyPoints, quiz, specialty, subsystem, lessonNumber, slidesFile, videoDir } = body
            if (!userId || !topic) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'userId and topic required' })) }
            await db.execute({
              sql: `INSERT INTO clases (id, user_id, topic, summary, key_points, quiz, specialty, subsystem, lesson_number, slides_file, video_dir, saved_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET
                    topic=excluded.topic, summary=excluded.summary, key_points=excluded.key_points, quiz=excluded.quiz,
                    specialty=excluded.specialty, subsystem=excluded.subsystem, lesson_number=excluded.lesson_number,
                    slides_file=excluded.slides_file, video_dir=excluded.video_dir`,
              args: [id || crypto.randomUUID(), userId, topic, summary || '', JSON.stringify(keyPoints || []), JSON.stringify(quiz || []),
                     specialty || 'General', subsystem || 'General', lessonNumber || 1, slidesFile || null, videoDir || null]
            })
            return res.end(JSON.stringify({ ok: true, id }))
          }

          if (req.method === 'DELETE') {
            const id = url.searchParams.get('id')
            if (!id) { res.statusCode = 400; return res.end(JSON.stringify({ error: 'id required' })) }
            await db.execute({ sql: 'DELETE FROM clases WHERE id = ?', args: [id] })
            return res.end(JSON.stringify({ ok: true }))
          }

          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (err) {
          console.error('clases-api error:', err)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: err.message }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), clasesApiPlugin()],
  build: {
    // Increase chunk size limit — questionDB.json is ~1.6MB
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('questionDB')) return 'question-db'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    }
  },
  server: {
    // Proxy AI tutor calls to local AI server in dev
    // /api/progress and /api/tests are handled by Vite middleware (clasesApiPlugin)
    proxy: {
      '/api/tutor': 'http://localhost:5001',
    }
  }
})
