# Banco «Por área y tema» y «Por código» (Perfil EUNACOM 2026)

Rama: `banco-por-area-y-codigo`. Pantalla: **Pruebas → Crear examen** (`/test`) tiene ahora un toggle de tres modos:

| Modo | URL | Qué hace |
|---|---|---|
| Crear examen | `/test` | El de siempre (temas, estado, cantidad). Sin cambios. |
| Por área y tema | `/test?modo=arbol` | Área › Especialidad › Tipo de situación › Tema con su código del Perfil. Al elegir un tema se practican **todas** sus preguntas (propias + nuevas) y al enviar se ven claves y explicaciones. |
| Por código | `/test?modo=codigo` | Buscar un código o prefijo (`1.01.1.018`, `1.01.2`, `7.01`) o un nombre de tema, y practicar todo lo que cuelga de él. |

El modo elegido se guarda en `localStorage` (`eunacom_banco_mode`). Filtro de fuente en ambos modos: *Todas / Banco EUNACOM App / Nuevas 2026*.

## Datos

- Todo vive en la tabla `eunacom_questions` de Turso (`eunacom-db`). Columnas nuevas (las agrega el script de import, `ALTER TABLE … ADD COLUMN`, no modifica filas existentes):
  - `fuente` — `NULL` = banco propio («propio»); `'rs2026'` = banco importado de eunacom.regionalsantiago.cl (generado por IA por el competidor). **Nunca se mezclan sin etiqueta.**
  - `fuente_ref` — referencia de origen (`<código>#<num>` para rs2026, `questionDB.json` para las sincronizadas).
- Preguntas rs2026: id `rs2026-<id original>`, `eunacom_code` = código del tema, `specialty` = especialidad del competidor, `modulo` = área, `tags` = `rs2026, <tipo>`.
- Árbol estático: `src/data/perfilTree.json` (7 áreas, 21 especialidades, 1.559 temas), generado por `scripts/perfil/build_perfil_tree.mjs` desde el codemap oficial `Apps/eunacom-fotos/books/data/v3_codemap.json` (+ 3 códigos que trae el dump y el codemap no, marcados `extra`). Los conteos vienen de `/api/questions?tree=1`.
- Preguntas propias **sin código** → nodo «Sin código del Perfil» dentro de su especialidad (o «Sin especialidad asignada» en el área cuando la etiqueta es ambigua: *Medicina Interna*, *Especialidades*, *Pediatría y Ginecología*). Preguntas propias con un código que **no existe en el Perfil 2026** (p. ej. `1.02.1.000`) se cuelgan por prefijo de su especialidad/tipo como «Código no vigente».

## API (sin funciones nuevas en Vercel: todo en `api/questions.js` → `api/_banco.js`)

```
GET /api/questions?tree=1                                 → { counts: { "1.01.1.018": { propio, rs2026 } … }, sinCodigo: { "Ginecología": {…} }, totals, fuenteDisponible }
GET /api/questions?code=1.01.1.018[&fuente=propio|rs2026]  → { data, total, truncated }   (código exacto)
GET /api/questions?code_prefix=1.01.2[&fuente=…&limit=300] → idem; si total > limit, muestra al azar (máx. 500)
GET /api/questions?sin_codigo=1&specialty=Ginecología      → propias sin código de esa especialidad
```

Si la columna `fuente` todavía no existe (producción antes del import), el endpoint responde igual tratando todo como «propio» y `fuenteDisponible: false`; la UI lo avisa. Por eso **se puede desplegar el código antes de correr el import**.

## Import en producción (no se ha corrido; pedir OK antes)

Requisitos: el dump en `~/Documents/Archive/eunacom-regionalsantiago/data/eunacom_regionalsantiago_dump.json` (1.551 temas / 40.269 preguntas) y acceso a Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` en `.env.local`, o la CLI `~/.turso/turso` con la sesión de dryanez).

```bash
cd eunacom-app-v2
node scripts/perfil/import_rs2026.mjs --dry-run            # muestra conteos actuales y qué haría, sin escribir
node scripts/perfil/import_rs2026.mjs                      # ALTER (si falta) + INSERT OR IGNORE de las 40.269 (lotes de 300)
node scripts/perfil/import_rs2026.mjs --verify             # compara conteo por código contra el JSON (0 diferencias = OK)
```

- Es **idempotente**: `INSERT OR IGNORE` por id; correrlo dos veces no duplica (verificado en local: segunda corrida inserta 0).
- Opcional `--sync-questiondb`: inserta en Turso las preguntas de `public/data/questionDB.json` que faltan por id (hoy Turso tiene 6.099 y el JSON 7.002: faltan 903, todas con código). Solo inserta las que no existen; no modifica filas. Recomendado para que el modo nuevo vea el banco propio completo.
- Por la CLI de Turso, los 40 k inserts tardan unos minutos (134 lotes); por `@libsql/client` es más rápido.
- Después del import, el conteo `tree=1` se cachea 30 min en el CDN de Vercel (`s-maxage=1800`).

## Local

```bash
node scripts/perfil/import_rs2026.mjs --local --sync-questiondb   # siembra scratch/banco-dev.db (SQLite, ignorada por git)
npm run dev                                                       # /api/questions?tree|code|… se sirven desde esa SQLite
```

Sin credenciales de Turso, el resto de `/api` sigue proxeado a producción **solo para lecturas**: `vite.config.js` ahora ignora `POST/PATCH` a `/api/tests` y `/api/progress` en ese caso, para que una sesión local no escriba exámenes en producción.

## Pendientes / notas

- Las 8.787 preguntas de las *pruebas* de Mis Clases (`public/data/pruebas/*.json`) no están en Turso ni tienen id estable; no entran en estos modos (5.442 traen `codigo_eunacom`, se podrían importar con el mismo script en una segunda etapa).
- Revisar errores: `/review` y `reviewUserId` ya hacen `JOIN eunacom_questions`, así que las falladas rs2026 aparecen; la vista `ReviewErrors` carga `questionDB.json` y no las mostrará hasta que lea del API.
- Límite Plan Gratuito (20 preguntas) se respeta: se recortan las preguntas al saldo disponible.

## Estado en producción (2026-11-08)

Import ya corrido contra Turso `eunacom-db` por la CLI (`turso db shell`):

| fuente | total | con código | sin código |
|---|---|---|---|
| propio | 7.002 | 6.664 | 332 |
| rs2026 | 40.269 | 40.269 | 0 |

- `--verify`: 1.551 códigos, 0 con conteo distinto.
- Las 332 propias sin código no tienen código en ningún lado (ni Turso ni `questionDB.json`); se ven en «Sin código del Perfil» dentro de su especialidad (125 «Pediatría y Ginecología», 72 «Especialidades», 29 Ginecología, 22 Cirugía…). Codificarlas es trabajo editorial, no de datos.
- Las rutas antiguas `?eunacom_code=` / `?specialty=` filtran `fuente IS NULL` desde el PR dryanez/eunacom#1, así Mis Clases y el calendario no mezclan rs2026.
