import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { Badge, PageHeader } from '../components/ui'
import { fmtIDR, fmtNum, statusForStock } from '../lib/data'
import { getBarang, getBarangBySku, getTransaksi } from '../lib/queries'

// ─── Products List ───────────────────────────────────────────────────────────

export function Products() {
  const navigate = useNavigate()
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [filterCat, setFilterCat] = useState('Semua')

  const { data: barang = [], isLoading } = useQuery({
    queryKey: ['barang'],
    queryFn: () => getBarang(),
  })

  const categories = ['Semua', ...Array.from(new Set(barang.map(p => p.kategori ?? 'Lainnya')))]
  const items = filterCat === 'Semua' ? barang : barang.filter(p => p.kategori === filterCat)

  return (
    <>
      <PageHeader
        title="Produk"
        subtitle={`${fmtNum(barang.length)} SKU aktif`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="upload" className="ico ico-sm" /> Impor CSV</button>
            <button className="btn btn-secondary btn-sm"><Icon name="download" className="ico ico-sm" /> Ekspor</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" className="ico ico-sm" /> Produk baru</button>
          </>
        }
      />

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" className="ico ico-sm" />
            <input placeholder="Cari nama, SKU…" />
          </div>
          <button className={"chip-filter" + (filterCat !== "Semua" ? " applied" : "")}>
            Kategori <span className="val">{filterCat}</span>
            <Icon name="chevronDown" className="ico ico-sm" />
          </button>
          <button className="chip-filter">Status</button>
          <button className="chip-filter" style={{ marginLeft: "auto" }}>
            <Icon name="filter" className="ico ico-sm" /> Filter lanjutan
          </button>
          <div className="seg">
            <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}><Icon name="list" className="ico ico-sm" /></button>
            <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><Icon name="grid" className="ico ico-sm" /></button>
          </div>
        </div>

        <div style={{ padding: "6px 14px", display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{
                padding: "4px 10px", fontSize: 12, borderRadius: "var(--r-md)",
                background: filterCat === c ? "var(--text)" : "transparent",
                color: filterCat === c ? "var(--bg)" : "var(--text-2)",
                fontWeight: 500, border: "none", cursor: "pointer",
              }}>{c}</button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Memuat data…</div>
        ) : view === "table" ? (
          <table>
            <thead>
              <tr>
                <th style={{ width: 28 }}><input type="checkbox" /></th>
                <th>SKU</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th className="num">Stok</th>
                <th className="num">Min</th>
                <th className="num">Harga</th>
                <th>Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const s = statusForStock(p.kuantitas_stok, p.batas_minimum)
                return (
                  <tr key={p.sku} onClick={() => navigate({ to: '/products/$sku', params: { sku: p.sku } })} style={{ cursor: "pointer" }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                    <td className="mono">{p.sku}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--surface-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border) 4px, var(--border) 5px)" }} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nama_barang}</div>
                          <div className="xsmall muted">{p.satuan}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="muted">{p.kategori ?? '—'}</span></td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmtNum(p.kuantitas_stok)}</td>
                    <td className="num muted">{p.batas_minimum}</td>
                    <td className="num">{fmtIDR(Number(p.harga))}</td>
                    <td><Badge kind={s.kind}>{s.label}</Badge></td>
                    <td onClick={e => e.stopPropagation()}><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {items.map((p) => {
              const s = statusForStock(p.kuantitas_stok, p.batas_minimum)
              return (
                <div key={p.sku} className="card" style={{ cursor: "pointer" }} onClick={() => navigate({ to: '/products/$sku', params: { sku: p.sku } })}>
                  <div style={{ height: 120, background: "var(--surface-2)", borderBottom: "1px solid var(--border)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, var(--border) 6px, var(--border) 7px)", borderTopLeftRadius: "var(--r-lg)", borderTopRightRadius: "var(--r-lg)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, right: 8 }}><Badge kind={s.kind}>{s.label}</Badge></div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div className="mono xsmall muted" style={{ marginBottom: 4 }}>{p.sku}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{p.nama_barang}</div>
                    <div className="xsmall muted" style={{ marginBottom: 10 }}>{p.satuan}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="mono" style={{ fontWeight: 600 }}>{fmtNum(p.kuantitas_stok)} <span className="muted xsmall">unit</span></span>
                      <span className="xsmall">{fmtIDR(Number(p.harga))}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="table-pagination">
          <div>Menampilkan <span className="mono">1–{items.length}</span> dari <span className="mono">{fmtNum(barang.length)}</span> produk</div>
          <div className="pager">
            <button disabled><Icon name="chevronLeft" className="ico ico-sm" /></button>
            <button className="active">1</button>
            <button><Icon name="chevron" className="ico ico-sm" /></button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Product Detail ──────────────────────────────────────────────────────────

interface ProductDetailProps { sku: string }

export function ProductDetail({ sku }: ProductDetailProps) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('ringkasan')

  const { data: p, isLoading } = useQuery({
    queryKey: ['barang', sku],
    queryFn: () => getBarangBySku({ data: sku }),
  })

  const { data: transaksi = [] } = useQuery({
    queryKey: ['transaksi'],
    queryFn: () => getTransaksi(),
  })

  // Filter transaksi untuk SKU ini
  const riwayat = transaksi
    .filter((t: any) => t.barang.sku === sku)
    .slice(0, 5)

  if (isLoading) return <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}>Memuat…</div>
  if (!p) return <div style={{ padding: 40 }}>Produk tidak ditemukan.</div>

  const s = statusForStock(p.kuantitas_stok, p.batas_minimum)

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate({ to: '/products' })}>
          <Icon name="chevronLeft" className="ico ico-sm" /> Kembali ke produk
        </button>
      </div>

      <PageHeader
        title={p.nama_barang}
        subtitle={<><span className="mono">{p.sku}</span> · {p.satuan} · {p.kategori ?? '—'}</>}
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="barcode" className="ico ico-sm" /> Cetak label</button>
            <button className="btn btn-secondary btn-sm"><Icon name="edit" className="ico ico-sm" /> Edit</button>
            <button className="btn btn-primary btn-sm"><Icon name="inbound" className="ico ico-sm" /> Sesuaikan stok</button>
          </>
        }
      />

      <div className="tabs">
        {["ringkasan", "pergerakan", "harga"].map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Informasi produk</div></div>
            <div className="card-body">
              <dl className="kv">
                <dt>SKU</dt><dd className="mono">{p.sku}</dd>
                <dt>Nama</dt><dd>{p.nama_barang}</dd>
                <dt>Kategori</dt><dd>{p.kategori ?? '—'}</dd>
                <dt>Satuan</dt><dd>{p.satuan}</dd>
                <dt>Harga</dt><dd className="mono">{fmtIDR(p.harga)}</dd>
                <dt>Dibuat</dt><dd className="muted">{new Date(p.created_at).toLocaleDateString('id-ID')}</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Riwayat transaksi</div></div>
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Tipe</th><th>Oleh</th><th className="num">Qty</th><th>Keterangan</th></tr>
              </thead>
              <tbody>
                {riwayat.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--text-3)", padding: 20 }}>Belum ada transaksi</td></tr>
                ) : riwayat.map((t: any, i: number) => (
                  <tr key={i}>
                    <td className="small">{new Date(t.tanggal).toLocaleDateString('id-ID')}</td>
                    <td><Badge kind={t.jenis_transaksi === 'masuk' ? 'ok' : 'info'}>{t.jenis_transaksi.toUpperCase()}</Badge></td>
                    <td>{t.pengguna.nama_lengkap}</td>
                    <td className="num" style={{ color: t.jenis_transaksi === 'masuk' ? "var(--ok)" : "var(--danger)", fontWeight: 600 }}>
                      {t.jenis_transaksi === 'masuk' ? '+' : '-'}{t.jumlah}
                    </td>
                    <td className="small muted">{t.keterangan ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-body">
              <div className="stat-label"><Icon name="package" className="ico ico-sm" /> Stok saat ini</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{p.kuantitas_stok}</div>
                <div className="muted">{p.satuan}</div>
                <div style={{ marginLeft: "auto" }}><Badge kind={s.kind}>{s.label}</Badge></div>
              </div>
              <div className="progress" style={{ marginTop: 14, marginBottom: 8 }}>
                <div className="bar" style={{ width: `${Math.min(100, (p.kuantitas_stok / (p.batas_minimum * 3 || 1)) * 100)}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span className="muted">Min: <span className="mono">{p.batas_minimum}</span></span>
                <span className="muted">Target: <span className="mono">{p.batas_minimum * 3}</span></span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Harga & margin</div></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Harga beli (est.)</dt><dd className="mono">{fmtIDR(Math.round(p.harga * 0.72))}</dd>
                <dt>Harga jual</dt><dd className="mono">{fmtIDR(p.harga)}</dd>
                <dt>Margin (est.)</dt><dd><span className="mono">28%</span> <span className="muted xsmall">· estimasi</span></dd>
                <dt>Nilai stok</dt><dd className="mono">{fmtIDR(p.harga * p.kuantitas_stok)}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}