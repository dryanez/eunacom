// Destino de los scripts de Libros Gordos:
//   --local → SQLite de desarrollo (scripts/libro-gordo/local-db.mjs)
//   si hay TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (env o .env.local) → Turso por @libsql/client
//   si no → la CLI de Turso (~/.turso/turso db shell eunacom-db), con la sesión de dryanez
import { createClient } from '@libsql/client'
import { execFileSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { LOCAL_DB_URL } from './local-db.mjs'

const TURSO_CLI = process.env.TURSO_CLI || path.join(os.homedir(), '.turso', 'turso')
const TURSO_DB = process.env.TURSO_DB_NAME || 'eunacom-db'

function loadEnvFiles() {
  for (const f of ['.env.local', '.env']) {
    const p = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..', f)
    if (!fs.existsSync(p)) continue
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
  }
}

export const sqlString = v => v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`

// Reemplaza los ? por literales (solo para la vía CLI)
function inline(sql, args = []) {
  let i = 0
  return sql.replace(/\?/g, () => sqlString(args[i++]))
}

export function openDb(argv = process.argv) {
  if (argv.includes('--local')) {
    const c = createClient({ url: LOCAL_DB_URL })
    return { label: LOCAL_DB_URL, execute: q => c.execute(q), batch: stmts => c.batch(stmts, 'write') }
  }
  loadEnvFiles()
  const url = process.env.TURSO_DATABASE_URL || process.env.VITE_TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN
  if (url && authToken) {
    const c = createClient({ url, authToken })
    return { label: url, execute: q => c.execute(q), batch: stmts => c.batch(stmts, 'write') }
  }
  // CLI de Turso: la salida es una tabla de texto, así que las lecturas piden las columnas (q.cols)
  // y las devolvemos como un solo JSON con json_group_array
  const run = sql => execFileSync(TURSO_CLI, ['db', 'shell', TURSO_DB], { input: sql, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return {
    label: `turso CLI → ${TURSO_DB}`,
    async execute(q) {
      const sql = typeof q === 'string' ? q : inline(q.sql, q.args)
      if (!q.cols) { run(sql + ';\n'); return { rows: [] } }
      const obj = q.cols.map(c => `'${c}', ${c}`).join(', ')
      const out = run(`SELECT json_group_array(json_object(${obj})) AS j FROM (${sql});\n`)
      const start = out.indexOf('[')
      return { rows: start === -1 ? [] : JSON.parse(out.slice(start).trim()) }
    },
    async batch(stmts) {
      const body = stmts.map(q => (typeof q === 'string' ? q : inline(q.sql, q.args)) + ';').join('\n')
      run(`BEGIN;\n${body}\nCOMMIT;\n`)
    },
  }
}
