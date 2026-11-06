# Bot de Instagram «Comenta PALABRA» — guía de configuración

Reemplaza a ManyChat para @academiaeunacom. Cuando alguien comenta una de las 52 palabras (ECG, OJO, TORSION…),
el bot le manda por DM (respuesta privada al comentario) la portada del libro con el botón **«Quiero mi libro»**
y contesta bajo el comentario «¡Listo! Te lo mandé por DM 📩» (rota entre 3 frases).

Código: `api/_ig-bot.js` (montado en `api/user-profiles.js`, sin función nueva de Vercel).
Webhook: `https://www.eunacomapp.cl/api/user-profiles?action=ig_webhook`

> ⚠️ **Lo que dice Meta (leer antes):** la documentación de webhooks dice textual
> *«Advanced Access is required for `comments` and `live_comments` notifications»* y que la app tiene que estar **Live**.
> Con Standard Access (sin App Review), lo normal es que solo lleguen los comentarios de cuentas con rol en la app
> (tú y los testers). Es decir: **el bot probablemente no ve los comentarios del público hasta que la app tenga
> Advanced Access** (App Review de `instagram_business_manage_comments` y `instagram_business_manage_messages`
> + verificación del negocio). El paso 7 lo comprueba con una cuenta sin rol.

## 1. Permisos de la app «eunacomapp» (Meta for Developers)
1. Entra a <https://developers.facebook.com/apps> → **eunacomapp**.
2. Menú izquierdo → **Instagram** → **API setup with Instagram business login** (si no aparece: «Add product» → Instagram).
3. En **Permissions** deben quedar: `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`.

## 2. Token de @academiaeunacom
1. En la misma página, sección **1. Generate access tokens** → **Add account** → entra con @academiaeunacom y acepta todo.
2. Botón **Generate token** → copia el token (**no lo pegues en el chat ni en git**).
3. En el mismo cuadro, activa **Webhook subscription** para la cuenta (esto suscribe la cuenta a la app).

## 3. Variables en Vercel (proyecto «eunacom» → Settings → Environment Variables)
| Variable | Valor |
|---|---|
| `IG_ACCESS_TOKEN` | el token del paso 2 (dura 60 días; el bot lo renueva solo cada semana) |
| `IG_VERIFY_TOKEN` | inventa una frase cualquiera, p. ej. `aee-bot-2026-xyz` (la usas en el paso 4) |
| `IG_APP_SECRET` | en la página de Instagram: **Instagram app secret** → Show |
| `IG_BOT_ENABLED` | **no la pongas todavía** (apagado = solo responde la palabra de prueba `PRUEBABOT`) |

`REGALO_SECRET` ya existe. Después de guardarlas hay que publicar (redeploy), y eso lo haces tú o me das el «sí».

## 4. Webhook
1. Página de Instagram → **2. Configure webhooks**:
   - **Callback URL:** `https://www.eunacomapp.cl/api/user-profiles?action=ig_webhook`
   - **Verify token:** la misma frase de `IG_VERIFY_TOKEN`
   - **Verify and save** (solo funciona si el paso 3 ya está publicado).
2. En la lista de campos, **Subscribe** en `comments`.

## 5. Instagram (app del celular)
Configuración → **Mensajes y llamadas** → **Herramientas conectadas** → **Permitir acceso a los mensajes**: activado.

## 6. Poner la app en Live
Arriba en la app: **App mode → Live** (si ya dice Live, sáltate esto). En **App settings → Basic** pon:
- **Privacy policy URL:** `https://www.eunacomapp.cl/privacidad`
- **User data deletion** → «Data deletion instructions URL»: `https://www.eunacomapp.cl/privacidad#eliminar-datos`
- Categoría: Educación.
(La página `/privacidad` está en la misma rama que el bot: tiene que estar publicada antes de este paso.)

## 7. Prueba (la pregunta clave)
Con el bot apagado, ManyChat sigue igual y el bot solo responde **PRUEBABOT** (ManyChat no la conoce, así que nunca chocan).
1. Desde una cuenta **que no tenga ningún rol en la app** (un amigo, o una cuenta personal que no sea tester), comenta `PRUEBABOT` en cualquier reel.
2. Revisa:
   - ¿Le llegó el DM con el botón? ¿Apareció «¡Listo! Te lo mandé por DM 📩» bajo el comentario?
   - Estado del bot: `curl -H "Authorization: Bearer $REGALO_SECRET" "https://www.eunacomapp.cl/api/user-profiles?action=ig_status"` (muestra las últimas respuestas y errores).
3. Si **no pasa nada** (no aparece en `ig_status`): Meta no mandó el webhook → falta Advanced Access (ver aviso de arriba).
4. Prueba sin webhook (separa «¿llega el aviso?» de «¿se puede responder?»): en tu terminal
   ```bash
   node scripts/ig-bot-probe.mjs --env ~/Desktop/organization/office-app/.env --send
   ```
   Busca el comentario PRUEBABOT y le manda la respuesta privada directo por la API. Si esto funciona pero el webhook no llega, el único bloqueo es Advanced Access.

## 8. Cambiar de ManyChat al bot (cuando la prueba salga bien)
1. ManyChat: **detén** las automatizaciones de palabras (o todo el canal de Instagram).
2. Vercel: `IG_BOT_ENABLED=1` → redeploy.
3. Comenta una palabra real desde otra cuenta y revisa `ig_status`.
Para volver atrás: borra `IG_BOT_ENABLED` (o ponla en 0), redeploy, y reactiva ManyChat.

## Palabras nuevas
Agregar la palabra en `IG_KEYWORDS` de `api/_ig-bot.js` (y el libro en `api/_regalos.js` si es nuevo).

## Límites de Meta
- Una sola respuesta privada por comentario, dentro de 7 días. El bot guarda cada comentario en Turso (`ig_bot_replies`) y nunca responde dos veces.
- Meta documenta solo **texto** para respuestas privadas. El bot prueba primero la tarjeta con portada y botón, luego el botón solo, y si Meta rechaza ambos manda texto con el link. En `ig_status` se ve cuál usó (`format`).
- Si la persona no sigue la cuenta, el DM llega a «Solicitudes de mensajes».
