import { useNavigate, Link } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { Badge, PageHeader, BarChart } from '../components/ui';
import { ALERTS, fmtNum } from '../lib/data';

export function Dashboard() {
  const navigate = useNavigate();

  function onNav(to: string) {
    const routeMap: Record<string, string> = {
      inbound:  '/inbound',
      outbound: '/outbound',
      opname:   '/opname',
      products: '/products',
      reports:  '/reports',
      alerts:   '/alerts',
    };
    navigate({ to: routeMap[to] ?? '/' });
  }

  const barData = [
    { label: "20", in: 240, out: 180 },
    { label: "21", in: 310, out: 220 },
    { label: "22", in: 180, out: 260 },
    { label: "23", in: 420, out: 340 },
    { label: "24", in: 380, out: 410 },
    { label: "25", in: 290, out: 360 },
    { label: "26", in: 510, out: 430 },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Ringkasan operasional gudang WH-JKT-01 · 26 April 2026"
        actions={
          <>
            <button className="btn btn-secondary btn-sm">
              <Icon name="calendar" className="ico ico-sm" />
              7 hari terakhir
              <Icon name="chevronDown" className="ico ico-sm" />
            </button>
            <button className="btn btn-secondary btn-sm">
              <Icon name="download" className="ico ico-sm" />
              Ekspor
            </button>
          </>
        }
      />

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label"><Icon name="package" className="ico ico-sm" /> Total SKU aktif</div>
          <div className="stat-value">12.418 <span className="stat-unit">item</span></div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> 42 baru <span className="muted">· 7 hari</span></div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="tag" className="ico ico-sm" /> Nilai inventaris</div>
          <div className="stat-value">Rp 8,42 <span className="stat-unit">miliar</span></div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> 3.8% <span className="muted">vs pekan lalu</span></div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="alert" className="ico ico-sm" /> Stok di bawah minimum</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>28 <span className="stat-unit">SKU</span></div>
          <div className="stat-delta down"><Icon name="arrowUp" className="ico ico-sm" /> 6 <span className="muted">vs kemarin</span></div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="activity" className="ico ico-sm" /> Akurasi opname</div>
          <div className="stat-value">99,94%</div>
          <div className="stat-delta up"><Icon name="check" className="ico ico-sm" /> <span className="muted">Audit 24 Apr</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Pergerakan barang</div>
              <div className="card-sub">Stok masuk vs keluar, 7 hari</div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)" }}>
                <span style={{ width: 10, height: 10, background: "var(--accent)", borderRadius: 2 }} /> Masuk
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)" }}>
                <span style={{ width: 10, height: 10, background: "var(--text-3)", borderRadius: 2, opacity: 0.5 }} /> Keluar
              </span>
            </div>
          </div>
          <div className="card-body">
            <BarChart data={barData} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Aksi cepat</div>
              <div className="card-sub">Shortcut operasional</div>
            </div>
          </div>
          <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { icon: "inbound",   label: "Terima barang",    sub: "Buat stok masuk",  nav: "inbound" },
              { icon: "outbound",  label: "Keluarkan barang", sub: "Buat stok keluar", nav: "outbound" },
              { icon: "clipboard", label: "Mulai opname",     sub: "Audit per rak",    nav: "opname" },
              { icon: "barcode",   label: "Scan SKU",         sub: "Cari via barcode", nav: "products" },
              { icon: "plus",      label: "Tambah produk",    sub: "SKU baru",         nav: "products" },
              { icon: "chart",     label: "Laporan",          sub: "Lihat analitik",   nav: "reports" },
            ].map((a) => (
              <button key={a.label} className="quick-action" onClick={() => onNav(a.nav)}>
                <div className="quick-action-head">
                  <Icon name={a.icon} className="ico ico-sm" />
                  <span>{a.label}</span>
                </div>
                <div className="xsmall muted">{a.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Stok perlu perhatian</div>
              <div className="card-sub">8 SKU di bawah atau mendekati minimum</div>
            </div>
            <Link to="/alerts" className="btn btn-ghost btn-sm">
              Lihat semua <Icon name="arrowRight" className="ico ico-sm" />
            </Link>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU / Produk</th>
                <th className="num">Stok</th>
                <th className="num">Min</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ALERTS.slice(0, 5).map((a) => {
                const pct = Math.min(100, (a.stok / a.min) * 100);
                const kind = a.status === "habis" || a.status === "kritis" ? "danger" : "warn";
                return (
                  <tr key={a.sku}>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.nama}</div>
                      <div className="mono xsmall muted">{a.sku}</div>
                    </td>
                    <td className="num" style={{ fontWeight: 600, color: a.stok === 0 ? "var(--danger)" : undefined }}>{a.stok}</td>
                    <td className="num muted">{a.min}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
                        <Badge kind={kind}>{a.status.toUpperCase()}</Badge>
                        <div className={`progress ${kind}`} style={{ height: 3 }}>
                          <div className="bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Aktivitas terkini</div>
              <div className="card-sub">Log transaksi hari ini</div>
            </div>
          </div>
          <div className="card-body">
            <div className="timeline">
              {[
                { active: true,  time: "09:42", who: "Budi S.",    what: "Mengeluarkan 48 unit Powerbank 10.000mAh",                        ref: "OUT-2604-2014" },
                { active: true,  time: "09:15", who: "Siti F.",    what: "Menerima 120 unit Smartphone Aura X3 dari PT Aura Tek Nusa",       ref: "IN-2604-0142" },
                { active: false, time: "08:52", who: "Rangga A.",  what: "Menyetujui PO-2604-090 senilai Rp 124jt",                         ref: "PO-2604-090" },
                { active: false, time: "08:30", who: "Linda K.",   what: "Menyelesaikan opname rak A-02",                                   ref: "OPN-2604-11" },
                { active: false, time: "08:14", who: "Dewi W.",    what: "Memperbarui harga 12 SKU kategori Komputer",                      ref: "—" },
              ].map((t, i) => (
                <div key={i} className={"timeline-item" + (t.active ? " active" : "")}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 12.5 }}><strong>{t.who}</strong> — {t.what}</div>
                    <div className="mono xsmall muted" style={{ whiteSpace: "nowrap" }}>{t.time}</div>
                  </div>
                  <div className="mono xsmall muted" style={{ marginTop: 2 }}>{t.ref}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
