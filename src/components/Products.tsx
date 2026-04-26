import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { Badge, PageHeader, BarChart } from '../components/ui';
import { PRODUCTS, fmtIDR, fmtNum, statusForStock, type Product } from '../lib/data';

// ─── Products List ───────────────────────────────────────────────────────────

export function Products() {
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [filterCat, setFilterCat] = useState('Semua');

  const categories = ['Semua', ...Array.from(new Set(PRODUCTS.map(p => p.kategori)))];
  const items = filterCat === 'Semua' ? PRODUCTS : PRODUCTS.filter(p => p.kategori === filterCat);

  function openProduct(p: Product) {
    navigate({ to: '/products/$sku', params: { sku: p.sku } });
  }

  return (
    <>
      <PageHeader
        title="Produk"
        subtitle="12.418 SKU aktif · 4 gudang"
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
            <input placeholder="Cari nama, SKU, supplier…" />
          </div>
          <button className={"chip-filter" + (filterCat !== "Semua" ? " applied" : "")}>
            Kategori <span className="val">{filterCat}</span>
            <Icon name="chevronDown" className="ico ico-sm" />
          </button>
          <button className="chip-filter">Gudang <span className="val">WH-JKT-01</span></button>
          <button className="chip-filter">Status</button>
          <button className="chip-filter">Supplier</button>
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

        {view === "table" ? (
          <table>
            <thead>
              <tr>
                <th style={{ width: 28 }}><input type="checkbox" /></th>
                <th>SKU</th>
                <th>Produk</th>
                <th>Kategori</th>
                <th>Lokasi</th>
                <th className="num">Stok</th>
                <th className="num">Min</th>
                <th className="num">Harga</th>
                <th>Status</th>
                <th>Update</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const s = statusForStock(p.stok, p.min);
                return (
                  <tr key={p.sku} onClick={() => openProduct(p)} style={{ cursor: "pointer" }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                    <td className="mono">{p.sku}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--surface-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--border)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border) 4px, var(--border) 5px)" }} />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{p.nama}</div>
                          <div className="xsmall muted">{p.variant}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="muted">{p.kategori}</span></td>
                    <td className="mono">{p.lokasi}</td>
                    <td className="num" style={{ fontWeight: 600 }}>{fmtNum(p.stok)}</td>
                    <td className="num muted">{p.min}</td>
                    <td className="num">{fmtIDR(p.harga)}</td>
                    <td><Badge kind={s.kind}>{s.label}</Badge></td>
                    <td><span className="xsmall muted">{p.updated} lalu</span></td>
                    <td onClick={e => e.stopPropagation()}><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 14, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {items.map((p) => {
              const s = statusForStock(p.stok, p.min);
              return (
                <div key={p.sku} className="card" style={{ cursor: "pointer" }} onClick={() => openProduct(p)}>
                  <div style={{ height: 120, background: "var(--surface-2)", borderBottom: "1px solid var(--border)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 6px, var(--border) 6px, var(--border) 7px)", borderTopLeftRadius: "var(--r-lg)", borderTopRightRadius: "var(--r-lg)", position: "relative" }}>
                    <div style={{ position: "absolute", top: 8, right: 8 }}><Badge kind={s.kind}>{s.label}</Badge></div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div className="mono xsmall muted" style={{ marginBottom: 4 }}>{p.sku}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{p.nama}</div>
                    <div className="xsmall muted" style={{ marginBottom: 10 }}>{p.variant}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span className="mono" style={{ fontWeight: 600 }}>{fmtNum(p.stok)} <span className="muted xsmall">unit</span></span>
                      <span className="xsmall">{fmtIDR(p.harga)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="table-pagination">
          <div>Menampilkan <span className="mono">1–{items.length}</span> dari <span className="mono">{fmtNum(12418)}</span> produk</div>
          <div className="pager">
            <button disabled><Icon name="chevronLeft" className="ico ico-sm" /></button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>…</button>
            <button>249</button>
            <button><Icon name="chevron" className="ico ico-sm" /></button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Product Detail ──────────────────────────────────────────────────────────

interface ProductDetailProps {
  sku: string;
}

export function ProductDetail({ sku }: ProductDetailProps) {
  const navigate = useNavigate();
  const p = PRODUCTS.find(x => x.sku === sku) ?? PRODUCTS[0];
  const s = statusForStock(p.stok, p.min);
  const [tab, setTab] = useState('ringkasan');

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate({ to: '/products' })}>
          <Icon name="chevronLeft" className="ico ico-sm" /> Kembali ke produk
        </button>
      </div>

      <PageHeader
        title={p.nama}
        subtitle={<><span className="mono">{p.sku}</span> · {p.variant} · {p.kategori}</>}
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="barcode" className="ico ico-sm" /> Cetak label</button>
            <button className="btn btn-secondary btn-sm"><Icon name="edit" className="ico ico-sm" /> Edit</button>
            <button className="btn btn-primary btn-sm"><Icon name="inbound" className="ico ico-sm" /> Sesuaikan stok</button>
          </>
        }
      />

      <div className="tabs">
        {["ringkasan", "pergerakan", "lokasi", "harga", "pemasok"].map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Informasi produk</div></div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
              <div style={{ height: 200, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-md)", backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, var(--border) 8px, var(--border) 9px)", display: "grid", placeItems: "center", color: "var(--text-3)", fontFamily: "var(--ff-mono)", fontSize: 11 }}>foto produk</div>
              <dl className="kv" style={{ alignSelf: "start" }}>
                <dt>SKU</dt><dd className="mono">{p.sku}</dd>
                <dt>Nama</dt><dd>{p.nama}</dd>
                <dt>Varian</dt><dd>{p.variant}</dd>
                <dt>Kategori</dt><dd>{p.kategori}</dd>
                <dt>Supplier</dt><dd>{p.supplier}</dd>
                <dt>Barcode</dt><dd className="mono">8 992761 {p.sku.slice(-4)}0</dd>
                <dt>Dimensi</dt><dd>18 × 12 × 4 cm · 420 g</dd>
                <dt>Dibuat</dt><dd className="muted">12 Jan 2025 · oleh Rangga A.</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Pergerakan stok — 14 hari</div>
                <div className="card-sub">Masuk 340 · Keluar 216 · Neraca +124</div>
              </div>
            </div>
            <div className="card-body">
              <BarChart data={[
                { label: "13", in: 0, out: 8 }, { label: "14", in: 40, out: 12 },
                { label: "15", in: 0, out: 22 }, { label: "16", in: 0, out: 14 },
                { label: "17", in: 60, out: 18 }, { label: "18", in: 0, out: 10 },
                { label: "19", in: 0, out: 16 }, { label: "20", in: 80, out: 24 },
                { label: "21", in: 0, out: 12 }, { label: "22", in: 0, out: 20 },
                { label: "23", in: 40, out: 18 }, { label: "24", in: 0, out: 14 },
                { label: "25", in: 120, out: 22 }, { label: "26", in: 0, out: 6 },
              ]} />
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Riwayat transaksi</div></div>
            <table>
              <thead><tr><th>Tanggal</th><th>Tipe</th><th>Referensi</th><th>Oleh</th><th className="num">Qty</th><th className="num">Saldo</th></tr></thead>
              <tbody>
                {[
                  { t: "26 Apr 2026, 09:15", tipe: "Masuk",  ref: "IN-2604-0142",   by: "Siti F.",   qty: "+120", saldo: 142 },
                  { t: "25 Apr 2026, 16:32", tipe: "Keluar", ref: "OUT-2504-2010",  by: "Budi S.",   qty: "-22",  saldo: 22 },
                  { t: "24 Apr 2026, 11:04", tipe: "Opname", ref: "OPN-2404-09",    by: "Linda K.",  qty: "-1",   saldo: 44 },
                  { t: "23 Apr 2026, 10:18", tipe: "Masuk",  ref: "IN-2304-0128",   by: "Rangga A.", qty: "+40",  saldo: 45 },
                  { t: "22 Apr 2026, 14:44", tipe: "Keluar", ref: "OUT-2204-1998",  by: "Dewi W.",   qty: "-20",  saldo: 5 },
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="small">{r.t}</td>
                    <td><Badge kind={r.tipe === "Masuk" ? "ok" : r.tipe === "Keluar" ? "info" : "neutral"}>{r.tipe.toUpperCase()}</Badge></td>
                    <td className="mono">{r.ref}</td>
                    <td>{r.by}</td>
                    <td className="num" style={{ color: r.qty.startsWith("+") ? "var(--ok)" : "var(--danger)", fontWeight: 600 }}>{r.qty}</td>
                    <td className="num">{r.saldo}</td>
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
                <div style={{ fontSize: 42, fontWeight: 600, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{p.stok}</div>
                <div className="muted">unit</div>
                <div style={{ marginLeft: "auto" }}><Badge kind={s.kind}>{s.label}</Badge></div>
              </div>
              <div className="progress" style={{ marginTop: 14, marginBottom: 8 }}>
                <div className="bar" style={{ width: `${Math.min(100, (p.stok / (p.min * 3)) * 100)}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span className="muted">Min: <span className="mono">{p.min}</span></span>
                <span className="muted">Target: <span className="mono">{p.min * 3}</span></span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Distribusi per lokasi</div></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { loc: "A-02-14", wh: "WH-JKT-01", qty: 98 },
                { loc: "A-02-15", wh: "WH-JKT-01", qty: 44 },
                { loc: "B-01-03", wh: "WH-BDG-02", qty: 60 },
                { loc: "C-04-07", wh: "WH-SBY-03", qty: 32 },
              ].map(l => (
                <div key={l.loc} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div className="mono small">{l.loc}</div>
                    <div className="xsmall muted">{l.wh}</div>
                  </div>
                  <div className="mono" style={{ fontWeight: 600 }}>{l.qty}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Harga & margin</div></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Harga beli</dt><dd className="mono">{fmtIDR(Math.round(p.harga * 0.72))}</dd>
                <dt>Harga jual</dt><dd className="mono">{fmtIDR(p.harga)}</dd>
                <dt>Margin</dt><dd><span className="mono">28%</span> <span className="muted xsmall">· sehat</span></dd>
                <dt>Pajak</dt><dd>PPN 11%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
