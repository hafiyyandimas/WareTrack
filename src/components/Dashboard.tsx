import { useNavigate, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { Badge, PageHeader, BarChart } from '../components/ui'
import { fmtNum } from '../lib/data'
import { getDashboardStats, getBarChart, getLowStock } from '../lib/queries'

function fmtIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} miliar`
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2)} juta`
  return `Rp ${n.toLocaleString('id-ID')}`
}

export function Dashboard() {
  const navigate = useNavigate()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => getDashboardStats(),
  })

  const { data: barData } = useQuery({
    queryKey: ['bar-chart'],
    queryFn: () => getBarChart(),
  })

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => getLowStock(),
  })

  function onNav(to: string) {
    const routeMap: Record<string, string> = {
      inbound: '/inbound', outbound: '/outbound', opname: '/opname',
      products: '/products', reports: '/reports', alerts: '/alerts',
    }
    navigate({ to: routeMap[to] ?? '/' })
  }

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
          <div className="stat-value">{fmtNum(stats?.totalSKU ?? 0)} <span className="stat-unit">item</span></div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> dari database</div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="tag" className="ico ico-sm" /> Nilai inventaris</div>
          <div className="stat-value">{fmtIDR(stats?.nilaiInventaris ?? 0)}</div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> total stok × harga</div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="alert" className="ico ico-sm" /> Stok di bawah minimum</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>
            {stats?.lowStockCount ?? 0} <span className="stat-unit">SKU</span>
          </div>
          <div className="stat-delta down"><Icon name="arrowUp" className="ico ico-sm" /> perlu restock</div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icon name="activity" className="ico ico-sm" /> Transaksi hari ini</div>
          <div className="stat-value">{stats?.transaksiHariIni?.length ?? 0}</div>
          <div className="stat-delta up"><Icon name="check" className="ico ico-sm" /> <span className="muted">realtime</span></div>
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
            <BarChart data={barData ?? []} />
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
              <div className="card-sub">{lowStock?.length ?? 0} SKU di bawah atau mendekati minimum</div>
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
             {(lowStock ?? []).slice(0, 5).map((a: {
              sku: string
              nama_barang: string
              kuantitas_stok: number
              batas_minimum: number
              harga: number
}) => {
  const pct = a.batas_minimum > 0 ? Math.min(100, (a.kuantitas_stok / a.batas_minimum) * 100) : 0
  const kind = a.kuantitas_stok === 0 ? "danger" : "warn"
  const label = a.kuantitas_stok === 0 ? "HABIS" : "RENDAH"
  return (
                  <tr key={a.sku}>
                    <td>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.nama_barang}</div>
                      <div className="mono xsmall muted">{a.sku}</div>
                    </td>
                    <td className="num" style={{ fontWeight: 600, color: a.kuantitas_stok === 0 ? "var(--danger)" : undefined }}>
                      {a.kuantitas_stok}
                    </td>
                    <td className="num muted">{a.batas_minimum}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 100 }}>
                        <Badge kind={kind}>{label}</Badge>
                        <div className={`progress ${kind}`} style={{ height: 3 }}>
                          <div className="bar" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
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
              {(stats?.transaksiHariIni ?? []).map((t: any, i: number) => (
                <div key={i} className={"timeline-item" + (i === 0 ? " active" : "")}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ fontSize: 12.5 }}>
                      <strong>{t.pengguna.nama_lengkap}</strong> —{' '}
                      {t.jenis_transaksi === 'masuk' ? 'Menerima' : 'Mengeluarkan'} {t.jumlah} unit {t.barang.nama_barang}
                    </div>
                    <div className="mono xsmall muted" style={{ whiteSpace: "nowrap" }}>
                      {new Date(t.tanggal).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="mono xsmall muted" style={{ marginTop: 2 }}>
                    {t.keterangan ?? '—'}
                  </div>
                </div>
              ))}
              {(stats?.transaksiHariIni ?? []).length === 0 && (
                <div className="muted" style={{ fontSize: 13, padding: '8px 0' }}>
                  Belum ada transaksi hari ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}