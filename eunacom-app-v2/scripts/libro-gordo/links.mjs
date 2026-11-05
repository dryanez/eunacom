// Enlaces de acceso a los Libros Gordos online (uno por comprador de la Academia Examen EUNACOM).
//
//   node scripts/libro-gordo/links.mjs create <libro|gran> [--email x@y.cl] [--note "pedido 123"]
//   node scripts/libro-gordo/links.mjs list [--all]           (por defecto solo vigentes)
//   node scripts/libro-gordo/links.mjs revoke <token>
//   node scripts/libro-gordo/links.mjs restore <token>
//   node scripts/libro-gordo/links.mjs release <token>        (libera el enlace para que otra cuenta lo reclame)
//   node scripts/libro-gordo/links.mjs books                  (claves de libro válidas)
// Agrega --local para la base de desarrollo. --base https://… cambia el dominio del enlace impreso.
import crypto from 'crypto'
import { LIBROS_GORDOS, GRAN_LIBRO, isBookKey, bookName, ensureLibroGordoTables } from '../../api/_libro-gordo.js'
import { openDb } from './db.mjs'

const argv = process.argv.slice(2)
const flag = name => { const i = argv.indexOf(name); return i > -1 ? argv[i + 1] : null }
const [cmd, arg] = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--email', '--note', '--base'].includes(argv[i - 1])))
const BASE = flag('--base') || (argv.includes('--local') ? 'http://localhost:5173' : 'https://www.eunacomapp.cl')
const COLS = ['token', 'book', 'buyer_email', 'note', 'created_at', 'revoked_at', 'claimed_user_id', 'claimed_at', 'last_used_at']

const url = token => `${BASE}/libro-gordo/${token}`

async function main() {
  if (cmd === 'books' || !cmd) {
    console.log(`${GRAN_LIBRO.padEnd(18)} Gran Libro Gordo (los 21)`)
    for (const b of LIBROS_GORDOS) console.log(`${b.key.padEnd(18)} ${b.name}`)
    if (!cmd) console.log('\nUso: create <libro> [--email] [--note] | list [--all] | revoke <token> | restore <token> | release <token>')
    return
  }
  const db = openDb(process.argv)
  await ensureLibroGordoTables(db)

  if (cmd === 'create') {
    if (!isBookKey(arg)) throw new Error(`Libro desconocido "${arg}". Usa: node scripts/libro-gordo/links.mjs books`)
    const token = crypto.randomBytes(12).toString('base64url')
    await db.execute({
      sql: 'INSERT INTO libro_gordo_links (token, book, buyer_email, note) VALUES (?, ?, ?, ?)',
      args: [token, arg, flag('--email'), flag('--note')]
    })
    console.log(`${bookName(arg)}${flag('--email') ? ` → ${flag('--email')}` : ''}\n${url(token)}`)
    return
  }

  if (cmd === 'list') {
    const r = await db.execute({
      sql: `SELECT ${COLS.join(', ')} FROM libro_gordo_links ${argv.includes('--all') ? '' : 'WHERE revoked_at IS NULL'} ORDER BY created_at DESC`,
      cols: COLS
    })
    if (!r.rows.length) return console.log('(sin enlaces)')
    for (const l of r.rows) {
      const state = l.revoked_at ? `REVOCADO ${l.revoked_at}` : l.claimed_user_id ? `usado por ${l.claimed_user_id}` : 'sin usar'
      console.log(`${l.token}  ${bookName(l.book).padEnd(22)} ${(l.buyer_email || '-').padEnd(28)} ${state}${l.note ? `  (${l.note})` : ''}`)
    }
    return
  }

  if (['revoke', 'restore', 'release'].includes(cmd)) {
    if (!arg) throw new Error('Falta el token')
    const found = await db.execute({ sql: 'SELECT token FROM libro_gordo_links WHERE token = ?', args: [arg], cols: ['token'] })
    if (!found.rows.length) throw new Error(`No existe el enlace ${arg}`)
    const sql = {
      revoke: `UPDATE libro_gordo_links SET revoked_at = datetime('now') WHERE token = ?`,
      restore: 'UPDATE libro_gordo_links SET revoked_at = NULL WHERE token = ?',
      release: 'UPDATE libro_gordo_links SET claimed_user_id = NULL, claimed_at = NULL WHERE token = ?',
    }[cmd]
    await db.execute({ sql, args: [arg] })
    console.log({ revoke: 'Revocado', restore: 'Reactivado', release: 'Liberado' }[cmd] + `: ${url(arg)}`)
    return
  }

  throw new Error(`Comando desconocido: ${cmd}`)
}

main().catch(e => { console.error(e.message); process.exit(1) })
