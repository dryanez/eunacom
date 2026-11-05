// Base SQLite local para probar Libros Gordos online en `npm run dev` sin credenciales de Turso.
import os from 'os'
import path from 'path'

export const LOCAL_DB_URL = `file:${path.join(os.tmpdir(), 'eunacom-libro-gordo-dev.db')}`
