// Sube al bucket PRIVADO de R2 lo que lee el lector web por temas: libros/movil/<carpeta>/<archivo>.json
//  - Tomos:               books/dist/movil/01_Tomos/**.json
//  - Perfil, Repaso, Atlas: <MOVIL_DIR>/04_…, 05_…, 06_…/**.json
//  - Red de temas:        <MOVIL_DIR>/_red/index.json y _red/t/*.json
// Uso: node --env-file=<archivo con R2_BOOKS_*> scripts/upload-lector-r2.mjs
// Claves en NFC, sin archivos ._*, comprimidos con gzip (el navegador los descomprime solo). Solo sube lo que cambió.
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import crypto from 'crypto'
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

const TOMOS_DIR = process.env.BOOKS_DIST_DIR ? path.join(process.env.BOOKS_DIST_DIR, 'movil') : '/Users/felipeyanez/Documents/Archive/Apps/eunacom-fotos/books/dist/movil'
const MOVIL_DIR = process.env.BOOKS_MOVIL_DIR || '/Volumes/SanDisk/AEE/video-work/eunacom-movil'
const { R2_BOOKS_ACCOUNT_ID: acc, R2_BOOKS_ACCESS_KEY_ID: key, R2_BOOKS_SECRET_ACCESS_KEY: secret, R2_BOOKS_BUCKET: Bucket } = process.env
if (!acc || !key || !secret || !Bucket) { console.error('Faltan variables R2_BOOKS_*'); process.exit(1) }
if (/eunacomvideos/i.test(Bucket)) { console.error('Ese bucket es público: los libros van en un bucket privado'); process.exit(1) }

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => {
  if (e.name.startsWith('.')) return []
  const p = path.join(d, e.name)
  return e.isDirectory() ? walk(p) : e.name.endsWith('.json') ? [p] : []
})
const list = []
for (const p of walk(path.join(TOMOS_DIR, '01_Tomos'))) list.push([p, path.relative(TOMOS_DIR, p)])
for (const folder of ['04_Perfil_V3_Codigo_por_Codigo', '05_Repaso_Final', '06_Atlas']) {
  for (const p of walk(path.join(MOVIL_DIR, folder))) list.push([p, path.relative(MOVIL_DIR, p)])
}
list.push([path.join(MOVIL_DIR, '_red/index.json'), '_red/index.json'])
for (const p of walk(path.join(MOVIL_DIR, '_red/t'))) list.push([p, path.relative(MOVIL_DIR, p)])

const s3 = new S3Client({ region: 'auto', endpoint: `https://${acc}.r2.cloudflarestorage.com`, credentials: { accessKeyId: key, secretAccessKey: secret }, forcePathStyle: true })
let up = 0, same = 0, bytes = 0
for (const [abs, rel] of list) {
  const Key = `libros/movil/${rel.split(path.sep).join('/')}`.normalize('NFC')
  const raw = fs.readFileSync(abs)
  JSON.parse(raw) // no subir un JSON roto
  const md5 = crypto.createHash('md5').update(raw).digest('hex')
  try {
    const h = await s3.send(new HeadObjectCommand({ Bucket, Key }))
    if (h.Metadata?.srcmd5 === md5) { same++; continue }
  } catch { /* no existe todavía */ }
  const Body = zlib.gzipSync(raw, { level: 9 })
  await s3.send(new PutObjectCommand({ Bucket, Key, Body, ContentType: 'application/json; charset=utf-8', ContentEncoding: 'gzip', CacheControl: 'private, max-age=3600', Metadata: { srcmd5: md5 } }))
  up++; bytes += Body.length
  console.log(`↑ ${Key} (${(Body.length / 1024).toFixed(0)} KB gzip)`)
}
console.log(`Listo: ${up} subidos (${(bytes / 1048576).toFixed(1)} MB), ${same} ya estaban al día, de ${list.length}.`)
