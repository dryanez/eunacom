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

export { getTurso };
