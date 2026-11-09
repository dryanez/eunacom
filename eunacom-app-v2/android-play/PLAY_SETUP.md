# EUNACOM en Google Play — configuración de cobros

App: `com.eunacom.app` · cuenta Play Console «Academia EUNACOM» (Wiackowska Group SpA).

## 1. Suscripción de planes (renovación automática, solo en la app Android)
Play Console → Monetizar → Productos → **Suscripciones** → Crear suscripción
- ID del producto: `eunacom_premium` · Nombre: «EUNACOM Premium»
- 4 planes base (renovación automática), precio en CLP:

| ID del plan base | Período | Precio CLP |
|---|---|---|
| `mensual` | 1 mes (P1M) | 14.990 |
| `trimestral` | 3 meses (P3M) | 34.990 |
| `semestral` | 6 meses (P6M) | 54.990 |
| `anual` | 1 año (P1Y) | 89.990 |

Activa cada plan base. Período de gracia: 7 días (recomendado).

## 2. Libros (40 compras únicas)
Play Console → Monetizar → Productos → **Productos únicos** → Importar → `play-products.csv`.
IDs `book_<sku>` (tomo-1 → `book_tomo_1`). Si la importación falla, se crean por API.

## 3. Cuenta de servicio (para que el servidor confirme los pagos)
1. Google Cloud Console → proyecto nuevo → habilitar **Google Play Android Developer API**.
2. IAM → Cuentas de servicio → crear → Claves → JSON.
3. Play Console → Usuarios y permisos → invitar el email de la cuenta de servicio con
   «Ver datos financieros» y «Administrar pedidos y suscripciones».
4. Vercel (proyecto de eunacomapp.cl) → variable `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` = el JSON entero.

## 4. Avisos de renovación (Real-time developer notifications)
1. Google Cloud → Pub/Sub → tema `play-eunacom` → dar a `google-play-developer-notifications@system.gserviceaccount.com` el rol «Publicador de Pub/Sub».
2. Crear suscripción **push** del tema a `https://www.eunacomapp.cl/api/user-profiles?play_rtdn=<SECRETO>`.
3. Vercel → variable `PLAY_RTDN_SECRET` = ese mismo `<SECRETO>`.
4. Play Console → Monetizar → Configuración de monetización → Notificaciones → tema `projects/<proyecto>/topics/play-eunacom`.

Sin esto igual funciona: la app vuelve a sincronizar la suscripción cada vez que se abre.
