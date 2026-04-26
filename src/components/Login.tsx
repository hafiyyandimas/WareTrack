import { useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';

export function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    navigate({ to: '/' });
  }

  return (
    <div className="login-wrap">
      <div className="login-hero">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="sidebar-brand-mark" style={{ width: 32, height: 32, fontSize: 13 }}>IG</div>
          <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" }}>Inventaris Gudang</div>
        </div>
        <div style={{ maxWidth: 440 }}>
          <div className="xsmall mono muted" style={{ marginBottom: 12 }}>v2.4 · WMS Platform</div>
          <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 14px" }}>
            Kendali penuh atas setiap SKU, rak, dan pergerakan barang.
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Sistem manajemen inventaris untuk tim gudang modern. Pantau stok real-time, kelola inbound & outbound, dan audit dengan presisi.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
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
        <div className="xsmall muted">© 2026 Inventaris Gudang · <span className="mono">env: production</span></div>
      </div>

      <div className="login-form">
        <div style={{ maxWidth: 340, width: "100%", margin: "0 auto" }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em", margin: "0 0 6px" }}>Masuk ke akun Anda</h2>
          <p style={{ color: "var(--text-2)", fontSize: 13, margin: "0 0 28px" }}>Gunakan kredensial gudang resmi.</p>

          <div className="field" style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input className="input" defaultValue="rangga.a@gudang.id" />
          </div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label style={{ display: "flex", justifyContent: "space-between" }}>
              Password
              <a href="#" style={{ color: "var(--accent)", fontWeight: 500 }}>Lupa?</a>
            </label>
            <input className="input" type="password" defaultValue="••••••••••" />
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <label>Gudang</label>
            <select className="select">
              <option>WH-JKT-01 — Jakarta Pusat (utama)</option>
              <option>WH-BDG-02 — Bandung</option>
              <option>WH-SBY-03 — Surabaya</option>
              <option>WH-MKS-04 — Makassar</option>
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-2)", marginBottom: 20 }}>
            <input type="checkbox" defaultChecked /> Tetap masuk di perangkat ini
          </label>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={handleLogin}
          >
            Masuk
          </button>

          <div style={{ margin: "18px 0", display: "flex", alignItems: "center", gap: 10, color: "var(--text-3)", fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            ATAU
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
            <Icon name="shield" />
            Masuk dengan SSO perusahaan
          </button>

          <p className="xsmall muted" style={{ marginTop: 28, textAlign: "center" }}>
            Butuh akses? Hubungi <span className="mono">admin@gudang.id</span>
          </p>
        </div>
      </div>
    </div>
  );
}
