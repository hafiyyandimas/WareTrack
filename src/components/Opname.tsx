import { Icon } from '../components/Icon';
import { Badge, PageHeader, LineChart, DonutChart, Sparkline } from '../components/ui';
import { ALERTS, fmtIDR, fmtNum } from '../lib/data';

// ─── Opname ──────────────────────────────────────────────────────────────────

export function Opname() {
  const rows = [
    { sku: "ELK-HP-0012", nama: "Smartphone Aura X3 128GB", lokasi: "A-02-14", sistem: 142, fisik: 142,  selisih: 0 },
    { sku: "ELK-HP-0013", nama: "Smartphone Aura X3 256GB", lokasi: "A-02-15", sistem: 28,  fisik: 27,   selisih: -1 },
    { sku: "ELK-AC-0203", nama: "Charger USB-C 65W",        lokasi: "A-04-08", sistem: 0,   fisik: 2,    selisih: 2 },
    { sku: "ELK-AC-0204", nama: "Powerbank 10.000mAh",      lokasi: "A-04-11", sistem: 412, fisik: 410,  selisih: -2 },
    { sku: "ELK-AU-0077", nama: "Earbuds TWS Pro 2",        lokasi: "A-03-05", sistem: 312, fisik: null, selisih: null },
    { sku: "ELK-KB-0341", nama: "Keyboard Mekanikal TKL",   lokasi: "B-01-09", sistem: 7,   fisik: null, selisih: null },
  ];
  const dicek = rows.filter(r => r.fisik !== null).length;

  return (
    <>
      <PageHeader
        title="Stock Opname"
        subtitle="OPN-2604-12 · Rak A-02 s/d A-04 · Dimulai 08:30 oleh Linda K."
        actions={
          <>
            <button className="btn btn-secondary btn-sm">Jeda</button>
            <button className="btn btn-secondary btn-sm"><Icon name="download" className="ico ico-sm" /> Cetak lembar hitung</button>
            <button className="btn btn-primary btn-sm"><Icon name="check" className="ico ico-sm" /> Selesaikan & posting</button>
          </>
        }
      />

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Progress</div>
          <div className="stat-value">{dicek}/{rows.length} <span className="stat-unit">SKU</span></div>
          <div className="progress" style={{ marginTop: 8 }}><div className="bar" style={{ width: `${(dicek / rows.length) * 100}%` }} /></div>
        </div>
        <div className="stat">
          <div className="stat-label">Sesuai</div>
          <div className="stat-value" style={{ color: "var(--ok)" }}>{rows.filter(r => r.selisih === 0).length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Selisih</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>{rows.filter(r => r.selisih !== 0 && r.selisih !== null).length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Nilai selisih</div>
          <div className="stat-value">−Rp 4,2jt</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Scan SKU atau cari…" /></div>
          <button className="chip-filter applied">Area <span className="val">A-02 s/d A-04</span></button>
          <button className="chip-filter">Status <span className="val">Belum dihitung</span></button>
          <button className="btn btn-secondary btn-sm" style={{ marginLeft: "auto" }}><Icon name="barcode" className="ico ico-sm" /> Mode scan</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>SKU / Produk</th><th>Lokasi</th>
              <th className="num">Qty sistem</th>
              <th className="num">Qty fisik</th>
              <th className="num">Selisih</th>
              <th>Keterangan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const done = r.fisik !== null;
              return (
                <tr key={r.sku} className={r.selisih !== 0 && r.selisih !== null ? "selected" : ""}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.nama}</div>
                    <div className="mono xsmall muted">{r.sku}</div>
                  </td>
                  <td className="mono">{r.lokasi}</td>
                  <td className="num">{r.sistem}</td>
                  <td>
                    <input className="input" style={{ height: 28, width: 80, textAlign: "right", fontFamily: "var(--ff-mono)" }}
                      defaultValue={r.fisik !== null ? r.fisik : ""} placeholder="—" />
                  </td>
                  <td className="num" style={{ fontWeight: 600, color: r.selisih === null ? "var(--text-3)" : r.selisih === 0 ? "var(--ok)" : "var(--danger)" }}>
                    {r.selisih === null ? "—" : (r.selisih > 0 ? "+" : "") + r.selisih}
                  </td>
                  <td>
                    {r.selisih !== 0 && r.selisih !== null
                      ? <input className="input" style={{ height: 28 }} placeholder="Alasan selisih…" />
                      : <span className="muted">—</span>}
                  </td>
                  <td>
                    {!done ? <Badge kind="neutral">MENUNGGU</Badge>
                      : r.selisih === 0 ? <Badge kind="ok">OK</Badge>
                      : <Badge kind="warn">SELISIH</Badge>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export function Alerts() {
  return (
    <>
      <PageHeader
        title="Alert Stok Minimum"
        subtitle="SKU yang perlu direstock segera"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="settings" className="ico ico-sm" /> Aturan alert</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" className="ico ico-sm" /> Buat PO dari terpilih</button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <div className="card" style={{ borderColor: "color-mix(in oklab, var(--danger) 40%, var(--border))" }}>
          <div className="card-body">
            <div className="stat-label" style={{ color: "var(--danger)" }}><Icon name="alert" className="ico ico-sm" /> Habis total</div>
            <div className="stat-value" style={{ color: "var(--danger)" }}>3</div>
            <div className="xsmall muted">Potensi lost sale: Rp 2,1jt/hari</div>
          </div>
        </div>
        <div className="card" style={{ borderColor: "color-mix(in oklab, var(--danger) 25%, var(--border))" }}>
          <div className="card-body">
            <div className="stat-label" style={{ color: "var(--danger)" }}><Icon name="alert" className="ico ico-sm" /> Kritis</div>
            <div className="stat-value">9</div>
            <div className="xsmall muted">Stok &lt; 50% dari minimum</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="stat-label" style={{ color: "var(--warn)" }}><Icon name="alert" className="ico ico-sm" /> Rendah</div>
            <div className="stat-value">16</div>
            <div className="xsmall muted">Stok di bawah minimum</div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari produk…" /></div>
          <button className="chip-filter applied">Status <span className="val">Semua</span></button>
          <button className="chip-filter">Kategori</button>
          <button className="chip-filter">Supplier</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" /></th>
              <th>SKU / Produk</th>
              <th>Kategori</th>
              <th className="num">Stok</th>
              <th className="num">Min</th>
              <th>Level</th>
              <th>Status</th>
              <th>Pesanan terakhir</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {ALERTS.map(a => {
              const pct = Math.min(100, (a.stok / a.min) * 100);
              const kind = a.status === "habis" || a.status === "kritis" ? "danger" : "warn";
              return (
                <tr key={a.sku}>
                  <td><input type="checkbox" defaultChecked={a.status !== "rendah"} /></td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.nama}</div>
                    <div className="mono xsmall muted">{a.sku}</div>
                  </td>
                  <td className="muted">{a.kategori}</td>
                  <td className="num" style={{ fontWeight: 600, color: a.stok === 0 ? "var(--danger)" : undefined }}>{a.stok}</td>
                  <td className="num muted">{a.min}</td>
                  <td style={{ minWidth: 120 }}>
                    <div className={`progress ${kind}`} style={{ height: 5 }}><div className="bar" style={{ width: `${pct}%` }} /></div>
                    <div className="xsmall muted mono" style={{ marginTop: 3 }}>{Math.round(pct)}%</div>
                  </td>
                  <td><Badge kind={kind}>{a.status.toUpperCase()}</Badge></td>
                  <td className="small muted">{a.lastOrder}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-secondary btn-sm">Buat PO</button>
                      <button className="btn btn-ghost btn-sm"><Icon name="eye" className="ico ico-sm" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function Reports() {
  return (
    <>
      <PageHeader
        title="Laporan & Analitik"
        subtitle="Periode 1 — 26 April 2026"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="calendar" className="ico ico-sm" /> April 2026 <Icon name="chevronDown" className="ico ico-sm" /></button>
            <button className="btn btn-secondary btn-sm"><Icon name="sliders" className="ico ico-sm" /> Filter</button>
            <button className="btn btn-secondary btn-sm"><Icon name="download" className="ico ico-sm" /> Ekspor PDF</button>
          </>
        }
      />

      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Perputaran (turnover)</div>
          <div className="stat-value">4,8<span className="stat-unit">×</span></div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> 0,6× vs Maret</div>
        </div>
        <div className="stat">
          <div className="stat-label">Days on hand</div>
          <div className="stat-value">18 <span className="stat-unit">hari</span></div>
          <div className="stat-delta down"><Icon name="arrowDown" className="ico ico-sm" /> 3 hari lebih cepat</div>
        </div>
        <div className="stat">
          <div className="stat-label">Dead stock</div>
          <div className="stat-value">Rp 128jt</div>
          <div className="stat-delta up"><Icon name="arrowUp" className="ico ico-sm" /> <span className="muted">212 SKU tanpa pergerakan</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Shrinkage</div>
          <div className="stat-value">0,08%</div>
          <div className="stat-delta up"><Icon name="check" className="ico ico-sm" /> <span className="muted">Di bawah target 0,2%</span></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        <div className="card">
          <div className="card-header">
            <div><div className="card-title">Tren stok & pergerakan</div><div className="card-sub">Nilai inventaris vs volume transaksi</div></div>
            <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 2, background: "var(--accent)" }} /> Nilai inventaris</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 2, background: "var(--warn)" }} /> Volume</span>
            </div>
          </div>
          <div className="card-body">
            <LineChart series={[
              { color: "var(--accent)", values: [62, 68, 74, 71, 78, 82, 84, 80, 82, 86, 88, 84] },
              { color: "var(--warn)",   values: [40, 52, 48, 62, 70, 58, 72, 68, 76, 82, 78, 86] },
            ]} />
          </div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Komposisi inventaris</div></div>
          <div className="card-body" style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <DonutChart data={[
              { v: 4820, c: "oklch(0.42 0.09 240)" },
              { v: 3120, c: "oklch(0.55 0.11 150)" },
              { v: 2140, c: "oklch(0.68 0.14 70)" },
              { v: 1240, c: "oklch(0.48 0.14 295)" },
              { v: 1098, c: "var(--text-3)" },
            ]} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { nama: "Elektronik",    v: 4820, c: "oklch(0.42 0.09 240)" },
                { nama: "Fashion",       v: 3120, c: "oklch(0.55 0.11 150)" },
                { nama: "Komputer",      v: 2140, c: "oklch(0.68 0.14 70)" },
                { nama: "Aksesoris",     v: 1240, c: "oklch(0.48 0.14 295)" },
                { nama: "Lainnya",       v: 1098, c: "var(--text-3)" },
              ].map(k => (
                <div key={k.nama} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: k.c }} />
                  <span style={{ flex: 1 }}>{k.nama}</span>
                  <span className="mono">{fmtNum(k.v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Top 10 produk — berdasarkan nilai keluar</div><div className="card-sub">April 2026</div></div>
          <div className="seg"><button className="active">Nilai</button><button>Volume</button><button>Margin</button></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 30 }}>#</th><th>Produk</th><th>Kategori</th>
              <th className="num">Qty keluar</th><th className="num">Nilai</th>
              <th className="num">Stok saat ini</th>
              <th style={{ width: 120 }}>Tren 30 hari</th>
            </tr>
          </thead>
          <tbody>
            {[
              { n: "Smartphone Aura X3 128GB",   k: "Elektronik",    q: 412, v: 1546000000, s: 142, spark: [12, 18, 22, 20, 26, 30, 32] },
              { n: "Earbuds TWS Pro 2",           k: "Audio",         q: 608, v: 422760000,  s: 312, spark: [18, 22, 20, 28, 34, 38, 44] },
              { n: "Powerbank 10.000mAh",         k: "Aksesoris",     q: 980, v: 220500000,  s: 412, spark: [30, 32, 40, 42, 48, 52, 58] },
              { n: "Monitor 27\" QHD 165Hz",      k: "Komputer",      q: 48,  v: 184800000,  s: 22,  spark: [4, 5, 6, 4, 8, 7, 8] },
              { n: "Mouse Wireless Ergo",         k: "Komputer",      q: 344, v: 84280000,   s: 88,  spark: [18, 20, 22, 24, 30, 36, 42] },
              { n: "Kaos Cotton Combed 30s",      k: "Fashion",       q: 720, v: 64080000,   s: 300, spark: [22, 28, 34, 30, 40, 48, 52] },
              { n: "Set Alat Dapur Stainless",    k: "Home & Kitchen", q: 184, v: 58880000,  s: 64,  spark: [8, 10, 12, 11, 14, 16, 18] },
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono muted">{String(i + 1).padStart(2, "0")}</td>
                <td style={{ fontWeight: 500 }}>{r.n}</td>
                <td className="muted">{r.k}</td>
                <td className="num">{fmtNum(r.q)}</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmtIDR(r.v)}</td>
                <td className="num">{r.s}</td>
                <td><Sparkline values={r.spark} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
