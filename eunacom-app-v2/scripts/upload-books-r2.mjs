// Sube los PDF de la biblioteca al bucket PRIVADO de R2 (clave libros/<ruta en books/dist>), los que lee el lector en producción.
// Uso: node --env-file=.env.books scripts/upload-books-r2.mjs [BOOKS_DIST_DIR]
// .env.books necesita: R2_BOOKS_ACCOUNT_ID, R2_BOOKS_ACCESS_KEY_ID, R2_BOOKS_SECRET_ACCESS_KEY, R2_BOOKS_BUCKET (ej. aee-libros)
// Solo sube lo que cambió (compara tamaño y fecha). Nunca usar un bucket público.
import fs from 'fs'
import path from 'path'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { TOMOS, EXTRAS, RECONS } from '../api/_tienda.js'
import { REGALOS } from '../api/_regalos.js'

const DIST = process.argv[2] || process.env.BOOKS_DIST_DIR || '/Users/felipeyanez/Documents/Archive/Apps/eunacom-fotos/books/dist'
const { R2_BOOKS_ACCOUNT_ID: acc, R2_BOOKS_ACCESS_KEY_ID: key, R2_BOOKS_SECRET_ACCESS_KEY: secret, R2_BOOKS_BUCKET: Bucket } = process.env
if (!acc || !key || !secret || !Bucket) { console.error('Faltan variables R2_BOOKS_* (ver comentario arriba)'); process.exit(1) }
if (/eunacomvideos/i.test(Bucket)) { console.error('Ese bucket es público: los libros van en un bucket privado'); process.exit(1) }

const s3 = new S3Client({ region: 'auto', endpoint: `https://${acc}.r2.cloudflarestorage.com`, credentials: { accessKeyId: key, secretAccessKey: secret }, forcePathStyle: true })
const files = [...new Set([...TOMOS, ...EXTRAS, ...RECONS].flatMap(x => x.files ? x.files.map(f => f.file) : x.file ? [x.file] : []))]
// Modo celular de los manuales (books/scripts/build_movil.cjs → dist/movil/01_Tomos/…json)
files.push(...TOMOS.map(t => `movil/${t.file.replace(/\.pdf$/, '.json')}`))
// Libros gratis de /regalo (incluye las guías de los reels en 08_Regalos/)
files.push(...Object.values(REGALOS).map(r => r.file).filter(f => !files.includes(f)))
// SOLO=<texto>: sube solo las rutas que lo contengan (ej. SOLO=movil/)
if (process.env.SOLO) files.splice(0, files.length, ...files.filter(f => f.includes(process.env.SOLO)))
let up = 0, same = 0, missing = 0
for (const f of files) {
  const abs = path.join(DIST, f)
  if (!fs.existsSync(abs)) { console.log('falta en disco:', f); missing++; continue }
  const st = fs.statSync(abs)
  const Key = `libros/${f}`
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key }))
    if (h.ContentLength === st.size && h.LastModified >= st.mtime) { same++; continue }
  } catch { /* no existe todavía */ }
  await s3.send(new PutObjectCommand({ Bucket, Key, Body: fs.readFileSync(abs), ContentType: f.endsWith('.json') ? 'application/json' : 'application/pdf', CacheControl: 'private, max-age=3600' }))
  up++
  console.log(`↑ ${f} (${(st.size / 1048576).toFixed(1)} MB)`)
}
console.log(`Listo: ${up} subidos, ${same} ya estaban al día, ${missing} faltan en disco (de ${files.length}).`)
