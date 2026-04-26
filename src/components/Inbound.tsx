import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/ui'
import { fmtNum } from '../lib/data'
import { getTransaksiMasuk, getTransaksiKeluar } from '../lib/queries'

// ─── Inbound ────────────────────────────────────────────────────────────────

export function Inbound() {
  const navigate = useNavigate()

  const { data: transaksiMasuk = [], isLoading } = useQuery({
    queryKey: ['transaksi-masuk'],
    queryFn: () => getTransaksiMasuk(),
  })

  const totalQty = transaksiMasuk.reduce((a: number, t: any) => a + t.jumlah, 0)

  return (
    <>
      <PageHeader
        title="Stok Masuk"
        subtitle="Penerimaan barang dari supplier & transfer antar gudang"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="download" className="ico ico-sm" /> Ekspor</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate({ to: '/inbound/new' })}>
              <Icon name="plus" className="ico ico-sm" /> Penerimaan baru
            </button>
          </>
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat">
          <div className="stat-label">Total transaksi masuk</div>
          <div className="stat-value">{transaksiMasuk.length} <span className="stat-unit">transaksi</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total unit diterima</div>
          <div className="stat-value">{fmtNum(totalQty)} <span className="stat-unit">unit</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Sumber data</div>
          <div className="stat-value" style={{ fontSize: 14 }}>PostgreSQL ✓</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari barang, keterangan…" /></div>
          <button className="chip-filter">Periode</button>
          <button className="chip-filter" style={{ marginLeft: "auto" }}><Icon name="filter" className="ico ico-sm" /> Filter</button>
        </div>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Memuat data…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Barang</th>
                <th>SKU</th>
                <th>Oleh</th>
                <th className="num">Qty</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {transaksiMasuk.map((t: any) => (
                <tr key={t.id_transaksi}>
                  <td className="mono muted">#{t.id_transaksi}</td>
                  <td style={{ fontWeight: 500 }}>{t.barang.nama_barang}</td>
                  <td className="mono">{t.barang.sku}</td>
                  <td>{t.pengguna.nama_lengkap}</td>
                  <td className="num" style={{ fontWeight: 600, color: "var(--ok)" }}>+{t.jumlah}</td>
                  <td className="small">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="small muted">{t.keterangan ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-pagination">
          <div>{transaksiMasuk.length} transaksi masuk</div>
        </div>
      </div>
    </>
  )
}

// ─── Outbound ────────────────────────────────────────────────────────────────

export function Outbound() {
  const navigate = useNavigate()

  const { data: transaksiKeluar = [], isLoading } = useQuery({
    queryKey: ['transaksi-keluar'],
    queryFn: () => getTransaksiKeluar(),
  })

  const totalQty = transaksiKeluar.reduce((a: number, t: any) => a + t.jumlah, 0)

  return (
    <>
      <PageHeader
        title="Stok Keluar"
        subtitle="Pengeluaran barang untuk toko, marketplace, dan transfer"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="download" className="ico ico-sm" /> Ekspor</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate({ to: '/outbound/new' })}>
              <Icon name="plus" className="ico ico-sm" /> Pengeluaran baru
            </button>
          </>
        }
      />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="stat">
          <div className="stat-label">Total transaksi keluar</div>
          <div className="stat-value">{transaksiKeluar.length} <span className="stat-unit">transaksi</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total unit keluar</div>
          <div className="stat-value">{fmtNum(totalQty)} <span className="stat-unit">unit</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Sumber data</div>
          <div className="stat-value" style={{ fontSize: 14 }}>PostgreSQL ✓</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari barang, keterangan…" /></div>
          <button className="chip-filter">Periode</button>
          <button className="chip-filter" style={{ marginLeft: "auto" }}><Icon name="filter" className="ico ico-sm" /> Filter</button>
        </div>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Memuat data…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Barang</th>
                <th>SKU</th>
                <th>Oleh</th>
                <th className="num">Qty</th>
                <th>Tanggal</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {transaksiKeluar.map((t: any) => (
                <tr key={t.id_transaksi}>
                  <td className="mono muted">#{t.id_transaksi}</td>
                  <td style={{ fontWeight: 500 }}>{t.barang.nama_barang}</td>
                  <td className="mono">{t.barang.sku}</td>
                  <td>{t.pengguna.nama_lengkap}</td>
                  <td className="num" style={{ fontWeight: 600, color: "var(--danger)" }}>-{t.jumlah}</td>
                  <td className="small">{new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="small muted">{t.keterangan ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-pagination">
          <div>{transaksiKeluar.length} transaksi keluar</div>
        </div>
      </div>
    </>
  )
}

// ─── Form tetap dummy (belum ada di DB) ──────────────────────────────────────
// InboundForm dan OutboundForm dibiarkan dulu karena butuh fitur tambah transaksi

export function InboundForm() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Form Penerimaan</div>
      <div className="muted" style={{ marginBottom: 16 }}>Fitur ini akan segera tersedia</div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate({ to: '/inbound' })}>
        <Icon name="chevronLeft" className="ico ico-sm" /> Kembali
      </button>
    </div>
  )
}

export function OutboundForm() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>Form Pengeluaran</div>
      <div className="muted" style={{ marginBottom: 16 }}>Fitur ini akan segera tersedia</div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate({ to: '/outbound' })}>
        <Icon name="chevronLeft" className="ico ico-sm" /> Kembali
      </button>
    </div>
  )
}