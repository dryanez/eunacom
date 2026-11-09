// Writes android-play/play-products.csv: every book/pack as a one-time Play product
// (plans are a subscription, set up by hand — see android-play/PLAY_SETUP.md), for Play Console → Monetize → One-time products → Import. Prices in CLP (micros);
// Auto fill converts them for other countries. Ids must match api/_play-billing.js.
import { writeFileSync } from 'node:fs'
import { PRODUCTS } from '../api/_tienda.js'

const bookPlayId = sku => 'book_' + sku.toLowerCase().replace(/[^a-z0-9]/g, '_')
const clean = s => String(s).replace(/[;,"\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80)
const row = (id, title, desc, clp) =>
  [id, 'published', 'managed_by_android', 'false', `es-419; ${clean(title).slice(0, 55)}; ${clean(desc)}`, 'true', String(clp * 1_000_000), ''].join(',')

const rows = [
  'Product ID,Published State,Purchase Type,Auto Translate,Locale; Title; Description,Auto Fill Prices,Price,Pricing Template ID',
  ...Object.entries(PRODUCTS).map(([sku, p]) => row(bookPlayId(sku), p.name, `Libro digital EUNACOM: ${p.name}. Pago único, tuyo para siempre.`, p.price)),
]
writeFileSync(new URL('../android-play/play-products.csv', import.meta.url), rows.join('\n') + '\n')
console.log(`${rows.length - 1} products`)
