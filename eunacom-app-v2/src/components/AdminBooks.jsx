import React, { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { fetchBookPurchases, grantBooks, markBookCreditUsed } from '../lib/api'
import { PACKS, TOMOS, RECONS, PRODUCTS, UPGRADE_CREDIT_DAYS, fmtClp } from '../config/tienda'

const inputStyle = { padding: '0.45rem 0.6rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'var(--surface-600)', color: 'var(--surface-50)', fontSize: '0.8rem' }

// Admin → Libros: registrar compras por transferencia/PayPal y ver el crédito de upgrade (7 días)
export default function AdminBooks({ adminEmail }) {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState([])
  const [form, setForm] = useState({ email: '', sku: 'biblioteca', method: 'transferencia', amount: '', note: '' })
  const [msg, setMsg] = useState('')

  const load = () => fetchBookPurchases(adminEmail).then(r => setRows(r.purchases || [])).catch(e => setMsg(e.message))
  useEffect(() => { if (open) load() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async e => {
    e.preventDefault()
    setMsg('')
    try {
      await grantBooks(adminEmail, { email: form.email, skus: [form.sku], method: form.method, amount: form.amount, note: form.note })
      setMsg(`✅ ${PRODUCTS[form.sku].name} registrado para ${form.email}`)
      setForm(f => ({ ...f, email: '', amount: '', note: '' }))
      load()
    } catch (err) {
      setMsg(`❌ ${err.message}`)
    }
  }

  const applyCredit = async userId => {
    await markBookCreditUsed(adminEmail, userId, 'admin')
    load()
  }

  return (
    <div style={{ background: 'var(--surface-700)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--surface-50)', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}>
        <BookOpen size={18} color="#fbbf24" /> Libros: compras y crédito de upgrade {open ? '▾' : '▸'}
      </button>
      {open && (
        <div style={{ marginTop: '0.9rem' }}>
          <form onSubmit={submit} style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input required type="email" placeholder="correo del usuario" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, minWidth: 200 }} />
            <select value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={inputStyle}>
              <optgroup label="Packs">{PACKS.map(p => <option key={p.sku} value={p.sku}>{p.name} ({fmtClp(p.price)})</option>)}</optgroup>
              <optgroup label="Tomos">{TOMOS.map(p => <option key={p.sku} value={p.sku}>Tomo {p.n} · {p.name}</option>)}</optgroup>
              <optgroup label="Reconstrucciones">{RECONS.map(p => <option key={p.sku} value={p.sku}>{p.name}</option>)}</optgroup>
            </select>
            <select value={form.method} onChange={e => setForm({ ...form, method: e.target.value })} style={inputStyle}>
              <option value="transferencia">Transferencia</option>
              <option value="paypal">PayPal</option>
              <option value="webpay">Webpay (manual)</option>
              <option value="regalo">Regalo (sin crédito)</option>
            </select>
            <input type="number" placeholder={`monto (def. ${fmtClp(PRODUCTS[form.sku].price)})`} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={{ ...inputStyle, width: 150 }} />
            <input placeholder="nota / n° comprobante" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} style={{ ...inputStyle, minWidth: 160 }} />
            <button type="submit" style={{ ...inputStyle, background: 'var(--accent-blue, #3b82f6)', border: 'none', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Registrar compra</button>
          </form>
          {msg && <div style={{ fontSize: '0.78rem', marginTop: '0.5rem', color: 'var(--surface-200)' }}>{msg}</div>}
          <p style={{ fontSize: '0.72rem', color: 'var(--surface-400)', margin: '0.6rem 0' }}>
            Crédito abierto = compra de los últimos {UPGRADE_CREDIT_DAYS} días que aún no se descontó. Webpay/PayPal de la app lo descuentan solos;
            si el plan se paga por transferencia, cobra la diferencia y marca «usar crédito».
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', color: 'var(--surface-200)' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--surface-400)' }}>
                  <th style={{ padding: '0.3rem' }}>Fecha</th><th>Usuario</th><th>Producto</th><th>Monto</th><th>Método</th><th>Plan</th><th>Crédito</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.3rem' }}>{String(r.created_at).slice(0, 16)}</td>
                    <td>{r.email || r.user_id}</td>
                    <td>{PRODUCTS[r.sku]?.name || r.sku}</td>
                    <td>{fmtClp(r.amount || 0)}</td>
                    <td>{r.method}</td>
                    <td>{r.is_premium ? `${r.plan_months} m` : '—'}</td>
                    <td>
                      {r.credit_open
                        ? <button onClick={() => applyCredit(r.user_id)} style={{ ...inputStyle, padding: '0.15rem 0.45rem', cursor: 'pointer', color: '#34d399' }}>abierto · usar crédito</button>
                        : r.credited_at ? `usado (${r.credited_ref || ''})` : '—'}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={7} style={{ padding: '0.6rem 0.3rem', color: 'var(--surface-400)' }}>Sin compras de libros todavía.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
