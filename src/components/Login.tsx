import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { loginUser, registerUser } from '../lib/queries'

type Tab = 'login' | 'daftar'

interface FormState {
  username: string
  password: string
  confirmPassword: string
}

interface FieldError {
  username?: string
  password?: string
  confirmPassword?: string
}

function validateLogin(f: FormState): FieldError {
  const e: FieldError = {}
  if (!f.username.trim()) e.username = 'Username wajib diisi.'
  if (!f.password)        e.password = 'Password wajib diisi.'
  return e
}

function validateDaftar(f: FormState): FieldError {
  const e: FieldError = {}
  if (!f.username.trim())       e.username = 'Username wajib diisi.'
  else if (f.username.length < 3) e.username = 'Username minimal 3 karakter.'
  if (!f.password)              e.password = 'Password wajib diisi.'
  else if (f.password.length < 6) e.password = 'Password minimal 6 karakter.'
  if (f.password !== f.confirmPassword) e.confirmPassword = 'Konfirmasi password tidak cocok.'
  return e
}

function hasError(e: FieldError) { return Object.keys(e).length > 0 }

export function Login() {
  const navigate = useNavigate()
  const [tab, setTab]             = useState<Tab>('login')
  const [form, setForm]           = useState<FormState>({ username: '', password: '', confirmPassword: '' })
  const [errors, setErrors]       = useState<FieldError>({})
  const [serverErr, setServerErr] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  function setField(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n })
    if (serverErr)   setServerErr(null)
  }

  function switchTab(t: Tab) {
    setTab(t)
    setForm({ username: '', password: '', confirmPassword: '' })
    setErrors({})
    setServerErr(null)
  }

  async function handleLogin() {
    const e = validateLogin(form)
    if (hasError(e)) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await loginUser({ data: { username: form.username, password: form.password } })
      if (!res.ok) { setServerErr(res.error ?? 'Login gagal.'); return }
      sessionStorage.setItem('auth_user', JSON.stringify(res.user))
      navigate({ to: '/' })
    } catch {
      setServerErr('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDaftar() {
    const e = validateDaftar(form)
    if (hasError(e)) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await registerUser({ data: { username: form.username, password: form.password } })
      if (!res.ok) { setServerErr(res.error ?? 'Pendaftaran gagal.'); return }
      sessionStorage.setItem('auth_user', JSON.stringify(res.user))
      navigate({ to: '/' })
    } catch {
      setServerErr('Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleDaftar()
  }

  return (
    <div className="login-wrap">
      {/* Hero */}
      <div className="login-hero">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="sidebar-brand-mark" style={{ width: 32, height: 32, fontSize: 13 }}>IG</div>
          <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}>Inventaris Gudang</div>
        </div>
        <div style={{ maxWidth: 440 }}>
          <div className="xsmall mono muted" style={{ marginBottom: 12 }}>v2.4 · WMS Platform</div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15, margin: '0 0 14px' }}>
            Kendali penuh atas setiap SKU, rak, dan pergerakan barang.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Sistem manajemen inventaris untuk tim gudang modern. Pantau stok real-time,
            kelola inbound & outbound, dan audit dengan presisi.
          </p>
          <div style={{ display: 'flex', gap: 28, marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
            <div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>4</div>
              <div className="xsmall muted">Gudang aktif</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>12.4K</div>
              <div className="xsmall muted">SKU terdaftar</div>
            </div>
            <div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 600 }}>99.97%</div>
              <div className="xsmall muted">Akurasi stok</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px' }}>
          <div className="xsmall muted" style={{ marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
            Akses berdasarkan role
          </div>
          {[
            { role: 'Super Admin',    akses: '24/24' },
            { role: 'Admin Gudang',   akses: '18/24' },
            { role: 'Manajer',        akses: '14/24' },
            { role: 'Staff Inbound',  akses: '7/24'  },
            { role: 'Staff Outbound', akses: '7/24'  },
            { role: 'Auditor',        akses: '5/24'  },
          ].map(r => (
            <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span>{r.role}</span>
              <span className="mono" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.akses}</span>
            </div>
          ))}
          <div className="xsmall" style={{ color: 'rgba(255,255,255,0.35)', marginTop: 8 }}>
            Akun baru otomatis mendapat role <span className="mono">Staff Inbound</span>
          </div>
        </div>
        <div className="xsmall muted">© 2026 Inventaris Gudang · <span className="mono">env: production</span></div>
      </div>

      {/* Form */}
      <div className="login-form">
        <div style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: 3, marginBottom: 28, gap: 3 }}>
            {(['login', 'daftar'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  flex: 1, padding: '7px 0', border: 'none',
                  borderRadius: 'calc(var(--r-md) - 1px)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 140ms',
                  background: tab === t ? 'var(--surface)' : 'transparent',
                  color:      tab === t ? 'var(--text)'    : 'var(--text-2)',
                  boxShadow:  tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          {/* Heading */}
          {tab === 'login' ? (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Masuk ke akun Anda</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: '0 0 24px' }}>Gunakan kredensial gudang resmi.</p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 6px' }}>Buat akun baru</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: '0 0 24px' }}>
                Akun baru mendapat akses <span className="mono" style={{ fontSize: 12 }}>Staff Inbound</span>. Hubungi admin untuk perubahan role.
              </p>
            </>
          )}

          {/* Error banner */}
          {serverErr && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b',
              borderRadius: 'var(--r-md)', padding: '9px 12px', fontSize: 13,
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ fontSize: 15 }}>⚠</span> {serverErr}
            </div>
          )}

          {/* Fields */}
          <div onKeyDown={handleKey}>
            <div className="field" style={{ marginBottom: 14 }}>
              <label>Username <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className={`input${errors.username ? ' error' : ''}`}
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={e => setField('username', e.target.value)}
                autoComplete="username"
                autoFocus
              />
              {errors.username && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.username}</span>}
            </div>

            <div className="field" style={{ marginBottom: tab === 'daftar' ? 14 : 20 }}>
              <label>Password <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className={`input${errors.password ? ' error' : ''}`}
                type="password"
                placeholder={tab === 'daftar' ? 'Minimal 6 karakter' : 'Masukkan password'}
                value={form.password}
                onChange={e => setField('password', e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              {errors.password && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.password}</span>}
            </div>

            {tab === 'daftar' && (
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Konfirmasi Password <span style={{ color: 'var(--accent)' }}>*</span></label>
                <input
                  className={`input${errors.confirmPassword ? ' error' : ''}`}
                  type="password"
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={e => setField('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span style={{ fontSize: 12, color: '#ef4444', marginTop: 4, display: 'block' }}>{errors.confirmPassword}</span>}
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={tab === 'login' ? handleLogin : handleDaftar}
            disabled={loading}
          >
            {loading
              ? (tab === 'login' ? 'Memverifikasi...' : 'Membuat akun...')
              : (tab === 'login' ? 'Masuk' : 'Buat Akun')}
          </button>

          <p className="xsmall muted" style={{ marginTop: 24, textAlign: 'center' }}>
            {tab === 'login'
              ? <>Butuh akun? <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => switchTab('daftar')}>Daftar di sini</button></>
              : <>Sudah punya akun? <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => switchTab('login')}>Masuk</button></>
            }
          </p>
          <p className="xsmall muted" style={{ marginTop: 12, textAlign: 'center' }}>
            Butuh akses admin? Hubungi <span className="mono">admin@gudang.id</span>
          </p>
        </div>
      </div>
    </div>
  )
}