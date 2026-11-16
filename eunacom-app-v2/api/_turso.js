// Shared Turso client for Vercel API routes (server-side only)
import { createClient } from '@libsql/client';

let client = null

function getTurso() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })
  }
  return client
}

// Run schema setup (CREATE TABLE IF NOT EXISTS / ALTER TABLE ADD COLUMN / CREATE INDEX)
// at most once per function instance instead of on every request. Each of those
// statements is a round trip to the database, so repeating them per request wastes CPU.
// If the setup throws, the key is cleared so the next request tries again.
const onceRuns = new Map()

function ensureOnce(key, fn) {
  if (!onceRuns.has(key)) {
    onceRuns.set(key, Promise.resolve().then(fn).catch((err) => {
      onceRuns.delete(key)
      throw err
    }))
  }
  return onceRuns.get(key)
}

export { getTurso, ensureOnce };
