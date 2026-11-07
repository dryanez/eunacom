// SQLite local para probar el banco «Por área y tema» / «Por código» en `npm run dev` sin credenciales de Turso.
// Se siembra con: node scripts/perfil/import_rs2026.mjs --local --sync-questiondb
import path from 'path'
import { fileURLToPath } from 'url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
export const LOCAL_DB_PATH = path.join(repoRoot, 'scratch', 'banco-dev.db') // scratch/ está en .gitignore
export const LOCAL_DB_URL = `file:${LOCAL_DB_PATH}`
