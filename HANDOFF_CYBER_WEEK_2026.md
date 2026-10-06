# Handoff — Cyber Week 2026 (50% off + email campaign)

> Written 2026-10-06 by a cloud Claude Code session that could not finish because it had no access to
> Vercel, Resend, Gmail, PayPal or the local machine. **Continue this on the local computer.**
> Branch with all the work: **`claude/festive-franklin-5fli7o`** (this repo, `dryanez/eunacom`).
> Nothing is live yet and **no email has been sent to customers**.

---

## 1. What the owner asked for

1. Add the new questions from the 21 AEE books (90 per book) to the online bank at eunacomapp.cl.
2. **50% off every plan for Cyber Week**, shown everywhere in the app (landing, pop-up, checkout) and charged
   correctly by **Webpay/MercadoPago and PayPal**, inside the app.
3. A **pop-up** with the promo, also for users already logged in (dashboard / inside the app).
4. An admin **on/off switch**, and the promo should come back **automatically every Cyber week in Chile**.
5. A nice email (with the logo) to **everyone who signed up but never paid**: 50% off, new questions,
   reconstructions, 21 books, new learning platform next week, regular vs promo prices.
   Send with **Resend** (owner's choice). **Owner wants to see results before the mass send.**
6. Test everything end to end before sending.

---

## 2. Status at a glance

| Item | State |
|---|---|
| Code for everything above | ✅ Done on `claude/festive-franklin-5fli7o`, builds clean |
| Vercel **preview** of the branch | ✅ Deployed, tested against the real Turso DB: `https://eunacom-git-claude-festive-franklin-5fli7o-dryanezs-projects.vercel.app` (note: `index.html` redirects `*.vercel.app` to the real domain in browsers; API calls with curl work) |
| Merge to `main` (= production deploy) | ❌ **Not done** — cloud session was not allowed to push to `main` |
| Resend sending | ❌ **Blocked: domain `eunacomapp.cl` is not verified in Resend** (403 on every send). `eunacom.app` (old default sender in `api/admin-users.js`) is not verified either. **The existing drip emails (welcome, discount_30/40/50, streak…) have almost certainly been failing too.** |
| PayPal at 50% in-app | ❌ Needs `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (and ideally `PAYPAL_WEBHOOK_ID`) in Vercel. Owner says the keys are in the local **famed / base44** folder. Until set, the PayPal button falls back to the old fixed-price PayPal links (full price). |
| Recipients | ✅ **657** users (signed up, never paid). 744 accounts total, 79 paid (excluded), 0 expired plans. |

---

## 3. Do this next (in order)

### Step 1 — Verify the sending domain in Resend (blocks the email)
1. resend.com → the account whose API key is in Vercel as `RESEND_API_KEY` → **Domains → Add domain → `eunacomapp.cl`**.
2. DNS for eunacomapp.cl is on **Vercel DNS** (`ns1/ns2.vercel-dns.com`). Add Resend's records in
   Vercel → Domains → eunacomapp.cl → DNS Records (typically: TXT `resend._domainkey`, MX + TXT on `send`, optional DMARC TXT `_dmarc`).
   Can also be done with the CLI: `vercel dns add eunacomapp.cl <name> <TYPE> <value>`.
3. Wait for "Verified" in Resend.
4. Optional: set `RESEND_SENDER_EMAIL=equipo@eunacomapp.cl` in Vercel so `api/admin-users.js` stops defaulting to `equipo@eunacom.app`.

Check DNS from anywhere: `curl -s "https://dns.google/resolve?name=resend._domainkey.eunacomapp.cl&type=TXT"`

### Step 2 — PayPal keys (for PayPal at 50%)
1. Get the **Live** REST app Client ID + Secret (owner: "in the famed base44 folder on this computer").
   ⚠️ Confirm those keys belong to the **same PayPal account that receives EUNACOM payments**; otherwise money goes elsewhere.
   If no app exists: developer.paypal.com → Apps & Credentials → Live → Create App.
2. In that PayPal app, add a **webhook** → URL `https://www.eunacomapp.cl/api/paypal-export`, events
   `PAYMENT.CAPTURE.COMPLETED`, `CHECKOUT.ORDER.COMPLETED`, `PAYMENT.SALE.COMPLETED`. Copy its Webhook ID.
   (Check what URL the existing PayPal webhook points to first — `api/admin-users.js` also forwards PayPal webhooks to the same handler.)
3. Vercel env (Production + Preview): `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`
   (`vercel env add PAYPAL_CLIENT_ID production` etc.). Never commit them.
4. **Confirm the USD prices** in `api/user-profiles.js` → `PAYPAL_USD = { '1m': 16, '3m': 37, '6m': 58, '1y': 95 }`.
   These were *guessed* from `matchPlanByAmount()` thresholds; replace with the real prices of the existing PayPal links.

### Step 3 — Merge and deploy
```bash
git checkout main && git pull
git merge --ff-only origin/claude/festive-franklin-5fli7o   # main was at d0e63c9, branch fast-forwards
git push origin main                                         # Vercel deploys production
```
(or open the PR: https://github.com/dryanez/eunacom/compare/main...claude/festive-franklin-5fli7o and merge)

After deploy, smoke test production:
```bash
B=https://www.eunacomapp.cl
curl -s "$B/api/admin-users?action=settings"                      # promo row absent = auto mode (fine)
curl -s -X POST $B/api/user-profiles -H 'Content-Type: application/json' \
  -d '{"action":"checkout","userId":"probe-test-user","planId":"6m"}'   # → init_point; pref must be 27495 CLP
curl -s -X POST $B/api/user-profiles -H 'Content-Type: application/json' \
  -d '{"action":"paypal_order","userId":"probe-test-user","planId":"1m"}' # → approve_url once PayPal keys are set
```
Verify the MP preference amount (token is in `api/user-profiles.js`):
`curl -s -H "Authorization: Bearer $MP_TOKEN" https://api.mercadopago.com/checkout/preferences/<pref_id>` → `unit_price: 27495`.

### Step 4 — Test email, then the mass send (owner approves first)
Campaign endpoint (server side, uses Vercel's Turso + Resend env):
```bash
B=https://www.eunacomapp.cl/api/email-marketing-cron
A='adminEmail=dr.felipeyanez%40gmail.com'
curl -s "$B?action=cyber_week&mode=preview&$A" | jq '.pending'                    # expect ~657
curl -s "$B?action=cyber_week&mode=test&testEmail=dr.felipeyanez@gmail.com&$A"     # → { id }
curl -s "$B?action=cyber_week&mode=test&testEmail=eunacomapp@gmail.com&$A"
curl -s "$B?action=cyber_week&mode=status&id=<resend id>&$A"                       # last_event: delivered
# owner checks inbox (logo, prices, link) → then:
curl -s "$B?action=cyber_week&mode=send&confirm=<exact pending count>&$A"        # batches of 100, logged
```
- `confirm` must equal the current pending count, or it refuses (409) — protects against accidental sends.
- Every recipient is logged in `email_campaign_logs` (`campaign_type='cyber_week_2026'`), so re-running `send` only emails people not yet sent (safe to retry after a partial failure).
- Owner asked whether to drop **creativetestp@gmail.com** (looks like a test account) — ask before sending.
- Alternative sender (Gmail, ~450/day limit): `npm run campaign:cyber:preview|test|send` in `eunacom-app-v2/` with
  `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `GMAIL_USER`, `GMAIL_APP_PASSWORD` (Google app password) — see `scripts/campaigns/cyber-week-2026.mjs`.

---

## 4. How it works (what changed on the branch)

All paths relative to `eunacom-app-v2/`.

### Promo (single source of truth)
- **`api/_promo.js`** — rules used by both server and client (`src/config/promo.js` re-exports it).
  Setting lives in Turso `app_settings` row **`promo`** (JSON): `{ mode: 'auto'|'on'|'off', percent: 50, name: 'Cyber Week', start?, end? }`.
  - `auto` (default when no row): active **Mon 00:00 → Sun 23:59 Chile time** of the week of the **first Monday of June (CyberDay)** and **first Monday of October (CyberMonday)**. Explicit `start`/`end` override (e.g. Black Friday).
  - `on`: active until switched off (or until `end`). `off`: never.
  - 2026: CyberDay was Jun 1–3, CyberMonday Oct 5–7 (CCS). Current window: **Oct 5 00:00 → Oct 11 23:59 (UTC-3)**.
  - Chile offsets hardcoded: June UTC-4, October UTC-3.
- **Admin switch**: `src/components/AdminPromoToggle.jsx`, shown in Admin → Usuarios under the Freemium switch
  (Automático / Encendido / Apagado + %). Saves via existing `updateAppSetting(adminEmail, 'promo', json)`.
- `src/contexts/SubscriptionContext.jsx` exposes `promo` (resolved), `promoSetting`, `setPromoSetting`; falls back to auto if settings fail to load.

### Prices / UI
- `src/pages/LandingPage.jsx` — plan cards show struck regular price + promo price + "CYBER WEEK −50%".
- `src/components/PaymentModal.jsx` — discount = max(emailed coupon, live promo); banner "🔥 Cyber Week: 50% DCTO hasta el …"; selected plan derived from id so prices update when the promo loads; PayPal buttons call in-app order.
- `src/components/CyberWeekPopup.jsx` (mounted in `src/App.jsx`) — non-premium visitors **and logged-in unpaid users**, once per session per promo window, hidden on `/admin`, `/test-runner`, `/simulation`, `/studio`, `/deck`, `/script-progress`, and while a checkout from the email link is pending. CTA → checkout (logged in) or register.

### Checkout
- **Webpay/MercadoPago** (`api/user-profiles.js`, action `checkout`): server applies `getActivePromo(db)` itself. A URL coupon `?discount=30|40|50` is only honored if `email_campaign_logs` has `discount_<n>` for that user (before: anyone could get 50% forever with `?discount=50`).
- **PayPal in-app** (`api/user-profiles.js`): `paypal_order` creates a PayPal Orders v2 order (USD, promo applied, `custom_id = userId|planId`, return `…/dashboard?paypal=return`); `paypal_capture` captures, checks the order belongs to the user, activates premium **once per order** (table `paypal_inapp_orders`). Client captures on return in `SubscriptionContext`, then goes to `?payment=success`. If PayPal API isn't configured → 503 → button falls back to the old fixed-price links.
- **PayPal webhook hardening** (`api/_paypal-export.js`): before, with no `PAYPAL_WEBHOOK_ID`/keys, **any forged POST activated premium**. Now unverified events are stored in `paypal_transactions` but **never activate**; `CHECKOUT.ORDER.APPROVED` no longer activates before capture. ⚠️ Until PayPal keys are set, buyers using the old PayPal links must be activated by hand (Admin → PayPal tab / premium selector).

### Email link flow
- Email CTA → `https://www.eunacomapp.cl/oferta?discount=50&utm_…`. `src/pages/Offer.jsx`: logged out → opens login modal ("Inicia sesión para activar tu descuento") and sets `sessionStorage.eunacom_open_checkout`; after login `SubscriptionContext` opens checkout. Checkout modal now renders only when a user exists (no more modal blocking the login page).

### Email
- Template: `scripts/campaigns/cyber_week_2026.html` (logo `https://www.eunacomapp.cl/logo.png`, Cyber Week 50%, deadline "domingo 11 de octubre, 23:59 h", prices $14.990→$7.495, $34.990→$17.495, $54.990→$27.495, $89.990→$44.995, +10.600 preguntas incl. 903 nuevas, 16 reconstrucciones 2013–2025 / 2.901 preguntas, 21 libros, nueva plataforma la próxima semana, +650 videos). Placeholders `{{nombre}}`, `{{unsubscribe_url}}`.
- Server copy for Resend: `api/_cyber-week-email.js`. Regenerate it whenever the HTML changes (run in `eunacom-app-v2/`):
  ```bash
  node -e "const fs=require('fs');const h=fs.readFileSync('scripts/campaigns/cyber_week_2026.html','utf8');const subj=\"🔥 Cyber Week: 50% DCTO en EUNACOM App (+10.600 preguntas y 16 reconstrucciones)\";fs.writeFileSync('api/_cyber-week-email.js','// Cyber Week 2026 email (source: scripts/campaigns/cyber_week_2026.html). Placeholders: {{nombre}}, {{unsubscribe_url}}\nexport const CYBER_WEEK_SUBJECT = '+JSON.stringify(subj)+'\nexport const CYBER_WEEK_HTML = '+JSON.stringify(h)+'\n')"
  ```
- Endpoint: `api/email-marketing-cron.js` → `action=cyber_week` (preview/test/send/status). From `EUNACOM App <RESEND_SENDER_EMAIL || equipo@eunacomapp.cl>`, reply-to and unsubscribe mailto `eunacomapp@gmail.com`, `List-Unsubscribe` header.
- Recipient rule: valid email, `is_premium <> 1`, `premium_until IS NULL` (never paid), not `screenshot-mock`/`dev_test`, not the owner's addresses, not already logged for `cyber_week_2026`, deduped by email.

### Question bank
- `public/data/questionDB.json`: **+903** questions from `eunacom--publishing-hub/books/dist/ENSAYO_90Q_*.json`, via `eunacom--publishing-hub/books/scripts/export_to_app_bank.py <path to public/data>`.
  Skipped: 692 already online (questionDB / pruebas / reconstrucciones, normalized stem match), 290 template filler, 5 with missing/invalid answer (e.g. Hematología Q46). Tagged `Libro AEE 2026, <block>, <topic>`, mapped to existing `topic`/`category`, stable uuid5 ids. Options shuffled where the explanation doesn't cite a letter (still B-heavy: B 334 / A 167 / C 167 / D 118 / E 117).
- Totals used in marketing: online before 9,733 unique (incl. reconstructions) → **~10,636** now. Reconstructions: 16 exams, 2,901 questions (index.json).

---

## 5. Tested on the Vercel preview / local build

| Test | Result |
|---|---|
| Campaign preview count on real DB | ✅ 657 |
| MercadoPago preference, 6m, no client discount sent | ✅ `27495 CLP`, title "… (50% DCTO)" |
| PayPal in-app order | ⚠️ 503 "PayPal API not configured" (expected until keys) |
| Pop-up, logged-in unpaid user on /dashboard | ✅ shows, CTA opens checkout with $27.495 |
| Pop-up shown once per session | ✅ |
| Email link logged out → login modal → after login checkout opens at 50% | ✅ |
| Promo schedule unit checks (Oct 2026 on/off edges, Jun 2026, Jun/Oct 2027, on/off/custom) | ✅ |
| Test email via Resend | ❌ 403 domain not verified |
| `vite build` | ✅ (lint errors present are pre-existing patterns: empty catch, unused `e`, duplicate `flex`) |

Local UI testing trick: `npx vite preview --host 0.0.0.0`, open via the machine IP (not localhost, which auto-logs in as admin),
set `localStorage.eunacom_local_dev_user` to a fake user and mock `/api/**` with Playwright. Build needs
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (public values, in `.env` locally or the live bundle).

---

## 6. Security issues found (not all fixed)

1. **Admin API auth is just `adminEmail=dr.felipeyanez@gmail.com` in the query/body** (`api/admin-users.js`, `api/email-marketing-cron.js`). Anyone can list all users (emails, WhatsApp, universities) and send campaigns from our Resend. **Fix next:** verify the Supabase JWT server-side (send `Authorization: Bearer <access_token>` from `apiFetch`, check with Supabase `auth.getUser(token)` and the admin email). Not fixed yet — owner was asked.
2. **MercadoPago access token hardcoded** in `api/user-profiles.js` in a **public** repo → rotate in MercadoPago, move to `MP_ACCESS_TOKEN` env only.
3. `CRON_SECRET` falls back to `'eunacom-cron-secret'` if unset → set a real `CRON_SECRET` in Vercel.
4. PayPal webhook forgery — **fixed** on the branch (see §4).
5. `?discount=` coupon abuse — **fixed** on the branch.
6. `public/logo-c3-full.png` spells the brand "eunaconapp" (typo in the image).

---

## 7. Open questions for the owner

- Real **USD prices** of the PayPal plans (currently guessed 16/37/58/95).
- Remove `creativetestp@gmail.com` from the send?
- Fix admin auth (§6.1) now?
- Discount drips (`discount_30/40` cron) keep running during Cyber Week — pause them? (They'd offer a smaller coupon than the 50% promo.)
- The ~290 template-filler book questions (Cirugía 34, Salud Pública 22, Otorrino 14, …) were **not** uploaded — rewrite them later?

---

## 8. Related repos / files

- Books + question source: `dryanez/eunacom--publishing-hub` (branch `claude/festive-franklin-5fli7o`):
  `books/dist/ENSAYO_90Q_*.json`, `books/scripts/export_to_app_bank.py`,
  `marketing/cyber-monday-2026/` (email HTML + screenshots of every tested flow).
- App: this repo, `eunacom-app-v2/`. Vercel project `dryanezs-projects/eunacom` (production) — a second project `eunacom-k6l9` also builds every push.
- Secrets live only in Vercel env: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `RESEND_API_KEY`, (to add) `PAYPAL_*`, `RESEND_SENDER_EMAIL`, `CRON_SECRET`, `MP_ACCESS_TOKEN`. `vercel env pull` gives a local `.env` for scripts.
