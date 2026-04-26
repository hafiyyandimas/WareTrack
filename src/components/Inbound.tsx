import { useNavigate } from '@tanstack/react-router';
import { Icon } from '../components/Icon';
import { Badge, PageHeader, StatusBadge } from '../components/ui';
import { INBOUND, OUTBOUND, fmtNum } from '../lib/data';

// ─── Inbound ────────────────────────────────────────────────────────────────

export function Inbound() {
  const navigate = useNavigate();
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

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat">
          <div className="stat-label">Penerimaan bulan ini</div>
          <div className="stat-value">142 <span className="stat-unit">dokumen</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total unit diterima</div>
          <div className="stat-value">24.612 <span className="stat-unit">unit</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Menunggu verifikasi</div>
          <div className="stat-value" style={{ color: "var(--warn)" }}>8</div>
        </div>
        <div className="stat">
          <div className="stat-label">Akurasi penerimaan</div>
          <div className="stat-value">99,2%</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari referensi, PO, supplier…" /></div>
          <button className="chip-filter applied">Status <span className="val">Semua</span></button>
          <button className="chip-filter">Supplier</button>
          <button className="chip-filter">Periode <span className="val">Apr 2026</span></button>
          <button className="chip-filter" style={{ marginLeft: "auto" }}><Icon name="filter" className="ico ico-sm" /> Filter</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Referensi</th><th>PO</th><th>Supplier</th>
              <th className="num">Item</th><th className="num">Qty</th>
              <th>Tanggal</th><th>Penerima</th><th>Status</th><th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {INBOUND.map((i) => (
              <tr key={i.ref}>
                <td className="mono" style={{ fontWeight: 600 }}>{i.ref}</td>
                <td className="mono muted">{i.po}</td>
                <td>{i.supplier}</td>
                <td className="num">{i.items}</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmtNum(i.qty)}</td>
                <td className="small">{i.tanggal}</td>
                <td className="small">{i.penerima}</td>
                <td><StatusBadge status={i.status} /></td>
                <td><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-pagination">
          <div>8 dari 142 dokumen</div>
          <div className="pager">
            <button disabled><Icon name="chevronLeft" className="ico ico-sm" /></button>
            <button className="active">1</button><button>2</button><button>…</button><button>18</button>
            <button><Icon name="chevron" className="ico ico-sm" /></button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── InboundForm ─────────────────────────────────────────────────────────────

export function InboundForm() {
  const navigate = useNavigate();
  const rows = [
    { sku: "ELK-HP-0012", nama: "Smartphone Aura X3 128GB",  variant: "Midnight Black", pesan: 50,  diterima: 50,  kondisi: "baik" },
    { sku: "ELK-HP-0013", nama: "Smartphone Aura X3 256GB",  variant: "Ocean Blue",     pesan: 30,  diterima: 28,  kondisi: "2 rusak" },
    { sku: "ELK-AU-0077", nama: "Earbuds TWS Pro 2",         variant: "White",           pesan: 100, diterima: 100, kondisi: "baik" },
    { sku: "ELK-AC-0204", nama: "Powerbank 10.000mAh",       variant: "Graphite",        pesan: 60,  diterima: 62,  kondisi: "baik · +2" },
  ];
  const totalPesan = rows.reduce((a, r) => a + r.pesan, 0);
  const totalTerima = rows.reduce((a, r) => a + r.diterima, 0);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate({ to: '/inbound' })}>
          <Icon name="chevronLeft" className="ico ico-sm" /> Kembali
        </button>
      </div>
      <PageHeader
        title={<>Penerimaan baru <span className="mono muted" style={{ fontSize: 14, fontWeight: 400 }}>IN-2604-0143</span></>}
        subtitle="Isi detail penerimaan, verifikasi qty & kondisi barang"
        actions={
          <>
            <button className="btn btn-secondary btn-sm">Simpan draft</button>
            <button className="btn btn-secondary btn-sm">Tolak</button>
            <button className="btn btn-primary btn-sm"><Icon name="check" className="ico ico-sm" /> Setujui & posting</button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Detail dokumen</div></div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field">
                <label>Tipe penerimaan</label>
                <select className="select">
                  <option>Dari Purchase Order</option>
                  <option>Transfer antar gudang</option>
                  <option>Retur pelanggan</option>
                  <option>Penerimaan manual</option>
                </select>
              </div>
              <div className="field">
                <label>Nomor PO <span className="required">*</span></label>
                <div className="input-group">
                  <input className="input" defaultValue="PO-2604-092" />
                  <div className="addon"><Icon name="search" className="ico ico-sm" /></div>
                </div>
              </div>
              <div className="field"><label>Supplier</label><input className="input" readOnly defaultValue="PT Aura Tek Nusa" /></div>
              <div className="field"><label>No. Surat Jalan</label><input className="input" defaultValue="SJ/AURA/04/2026/0912" /></div>
              <div className="field"><label>Tanggal terima</label><input className="input" defaultValue="26 Apr 2026, 09:15" /></div>
              <div className="field">
                <label>Gudang tujuan</label>
                <select className="select"><option>WH-JKT-01 — Jakarta Pusat</option></select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Daftar item</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm"><Icon name="barcode" className="ico ico-sm" /> Scan</button>
                <button className="btn btn-secondary btn-sm"><Icon name="plus" className="ico ico-sm" /> Tambah manual</button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>SKU / Produk</th>
                  <th className="num">Dipesan</th>
                  <th className="num">Diterima</th>
                  <th className="num">Selisih</th>
                  <th>Kondisi</th>
                  <th>Lokasi</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const selisih = r.diterima - r.pesan;
                  return (
                    <tr key={r.sku}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{r.nama}</div>
                        <div className="xsmall muted"><span className="mono">{r.sku}</span> · {r.variant}</div>
                      </td>
                      <td className="num">{r.pesan}</td>
                      <td>
                        <input className="input" style={{ height: 28, width: 70, textAlign: "right", fontFamily: "var(--ff-mono)" }} defaultValue={r.diterima} />
                      </td>
                      <td className="num" style={{ color: selisih === 0 ? "var(--text-3)" : selisih < 0 ? "var(--danger)" : "var(--ok)", fontWeight: 600 }}>
                        {selisih > 0 ? "+" : ""}{selisih}
                      </td>
                      <td>
                        <select className="select" style={{ height: 28, fontSize: 12 }}>
                          <option>{r.kondisi}</option>
                          <option>Baik</option>
                          <option>Rusak ringan</option>
                          <option>Rusak berat</option>
                        </select>
                      </td>
                      <td><input className="input mono" style={{ height: 28, width: 96 }} defaultValue="A-02-14" /></td>
                      <td><button className="icon-btn"><Icon name="trash" className="ico ico-sm" /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Catatan & lampiran</div></div>
            <div className="card-body">
              <div className="field">
                <label>Catatan penerimaan</label>
                <textarea className="textarea" defaultValue="2 unit Smartphone Aura X3 256GB ditemukan layar retak saat unboxing, diisolasi di rak QC-02. 2 unit Powerbank melebihi pesanan (bonus dari supplier, sudah dikonfirmasi via WA)." />
              </div>
              <div style={{ marginTop: 12, padding: 20, border: "1.5px dashed var(--border-strong)", borderRadius: "var(--r-md)", textAlign: "center" }}>
                <Icon name="upload" className="ico ico-lg" />
                <div style={{ fontSize: 13, marginTop: 6 }}>Seret surat jalan, foto barang, BA serah terima di sini</div>
                <div className="xsmall muted">PDF, JPG, PNG — maks 10 MB</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Ringkasan</div></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Total SKU</dt><dd>{rows.length}</dd>
                <dt>Dipesan</dt><dd className="mono">{totalPesan}</dd>
                <dt>Diterima</dt><dd className="mono" style={{ fontSize: 16, fontWeight: 600 }}>{totalTerima}</dd>
                <dt>Selisih</dt><dd className="mono" style={{ color: "var(--ok)", fontWeight: 600 }}>{totalTerima >= totalPesan ? "+" : ""}{totalTerima - totalPesan}</dd>
                <dt>Nilai total</dt><dd className="mono">Rp 362.480.000</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Alur persetujuan</div></div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item active">
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Dibuat oleh Siti F.</div>
                  <div className="xsmall muted">Staff Inbound · 26 Apr, 09:15</div>
                </div>
                <div className="timeline-item active">
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Verifikasi qty & kondisi</div>
                  <div className="xsmall muted">Sedang berjalan — Rangga A.</div>
                </div>
                <div className="timeline-item">
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Persetujuan manajer</div>
                  <div className="xsmall muted">Dewi W. · diperlukan karena ada selisih</div>
                </div>
                <div className="timeline-item">
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>Posting ke stok</div>
                  <div className="xsmall muted">Otomatis setelah disetujui</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Outbound ────────────────────────────────────────────────────────────────

export function Outbound() {
  const navigate = useNavigate();
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

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="stat">
          <div className="stat-label">Pengeluaran bulan ini</div>
          <div className="stat-value">318 <span className="stat-unit">dokumen</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Total unit keluar</div>
          <div className="stat-value">41.220 <span className="stat-unit">unit</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Dalam picking</div>
          <div className="stat-value" style={{ color: "var(--accent)" }}>14</div>
        </div>
        <div className="stat">
          <div className="stat-label">On-time rate</div>
          <div className="stat-value">97,8%</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari referensi, tujuan…" /></div>
          <button className="chip-filter">Status</button>
          <button className="chip-filter">Tujuan</button>
          <button className="chip-filter">Periode <span className="val">Apr 2026</span></button>
        </div>
        <table>
          <thead>
            <tr><th>Referensi</th><th>Tujuan</th><th className="num">Item</th><th className="num">Qty</th><th>Tanggal</th><th>Picker</th><th>Status</th><th style={{ width: 40 }}></th></tr>
          </thead>
          <tbody>
            {OUTBOUND.map((o) => (
              <tr key={o.ref}>
                <td className="mono" style={{ fontWeight: 600 }}>{o.ref}</td>
                <td>{o.tujuan}</td>
                <td className="num">{o.items}</td>
                <td className="num" style={{ fontWeight: 600 }}>{fmtNum(o.qty)}</td>
                <td className="small">{o.tanggal}</td>
                <td className="small">{o.picker}</td>
                <td><StatusBadge status={o.status} /></td>
                <td><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="table-pagination">
          <div>7 dari 318 dokumen</div>
          <div className="pager">
            <button disabled><Icon name="chevronLeft" className="ico ico-sm" /></button>
            <button className="active">1</button><button>2</button><button>…</button><button>40</button>
            <button><Icon name="chevron" className="ico ico-sm" /></button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── OutboundForm ─────────────────────────────────────────────────────────────

export function OutboundForm() {
  const navigate = useNavigate();
  const rows = [
    { sku: "ELK-HP-0012", nama: "Smartphone Aura X3 128GB", variant: "Midnight Black", tersedia: 142, qty: 12,  lokasi: "A-02-14", status: "siap" },
    { sku: "ELK-AU-0077", nama: "Earbuds TWS Pro 2",         variant: "White",          tersedia: 312, qty: 24,  lokasi: "A-03-05", status: "siap" },
    { sku: "ELK-AC-0204", nama: "Powerbank 10.000mAh",       variant: "Graphite",       tersedia: 412, qty: 30,  lokasi: "A-04-11", status: "siap" },
    { sku: "FSH-TS-0452", nama: "Kaos Cotton Combed 30s",    variant: "Hitam / L",      tersedia: 204, qty: 48,  lokasi: "C-01-04", status: "picking" },
    { sku: "ELK-MS-0512", nama: "Mouse Wireless Ergo",       variant: "Grey",           tersedia: 88,  qty: 18,  lokasi: "B-01-10", status: "picking" },
  ];
  const totalQty = rows.reduce((a, r) => a + r.qty, 0);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate({ to: '/outbound' })}>
          <Icon name="chevronLeft" className="ico ico-sm" /> Kembali
        </button>
      </div>
      <PageHeader
        title={<>Pengeluaran baru <span className="mono muted" style={{ fontSize: 14, fontWeight: 400 }}>OUT-2604-2015</span></>}
        subtitle="Buat pick list, alokasi stok, dan serahkan ke kurir"
        actions={
          <>
            <button className="btn btn-secondary btn-sm">Simpan draft</button>
            <button className="btn btn-secondary btn-sm"><Icon name="barcode" className="ico ico-sm" /> Cetak pick list</button>
            <button className="btn btn-primary btn-sm"><Icon name="truck" className="ico ico-sm" /> Kirim</button>
          </>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Detail tujuan</div></div>
            <div className="card-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Tipe pengeluaran</label>
                <select className="select">
                  <option>Pengiriman toko/cabang</option><option>Marketplace / e-commerce</option>
                  <option>Transfer antar gudang</option><option>Retur ke supplier</option>
                </select>
              </div>
              <div className="field"><label>Tujuan</label>
                <select className="select"><option>Toko Sentral Depok — Jl. Margonda 118</option></select>
              </div>
              <div className="field"><label>No. Sales Order</label><input className="input" defaultValue="SO-2604-4471" /></div>
              <div className="field"><label>Ekspedisi</label><select className="select"><option>Ekspedisi internal · Truk B-2014</option></select></div>
              <div className="field"><label>Tanggal kirim</label><input className="input" defaultValue="26 Apr 2026, 14:00" /></div>
              <div className="field"><label>Prioritas</label>
                <select className="select"><option>Normal</option><option>Tinggi — same day</option><option>Rendah</option></select>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Pick list</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-secondary btn-sm"><Icon name="barcode" className="ico ico-sm" /> Scan</button>
                <button className="btn btn-secondary btn-sm"><Icon name="plus" className="ico ico-sm" /> Tambah</button>
              </div>
            </div>
            <table>
              <thead><tr><th>SKU / Produk</th><th>Lokasi</th><th className="num">Tersedia</th><th className="num">Ambil</th><th>Status pick</th><th style={{ width: 40 }}></th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{r.nama}</div>
                      <div className="xsmall muted"><span className="mono">{r.sku}</span> · {r.variant}</div>
                    </td>
                    <td className="mono">{r.lokasi}</td>
                    <td className="num muted">{r.tersedia}</td>
                    <td><input className="input" style={{ height: 28, width: 70, textAlign: "right", fontFamily: "var(--ff-mono)" }} defaultValue={r.qty} /></td>
                    <td>{r.status === "siap" ? <Badge kind="ok">SIAP</Badge> : <Badge kind="info">PICKING</Badge>}</td>
                    <td><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "12px 14px", background: "var(--surface-2)", borderTop: "1px solid var(--border)", fontSize: 12.5, display: "flex", justifyContent: "space-between" }}>
              <span className="muted">5 SKU · ruang truk terpakai 62%</span>
              <span className="mono" style={{ fontWeight: 600 }}>Total: {fmtNum(totalQty)} unit</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Progress picking</div></div>
            <div className="card-body">
              <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em" }}>60%</div>
              <div className="progress" style={{ marginTop: 8, marginBottom: 8 }}><div className="bar" style={{ width: "60%" }} /></div>
              <div className="xsmall muted">3 dari 5 SKU sudah diambil · estimasi selesai 13:20</div>
              <div className="divider" />
              <dl className="kv">
                <dt>Picker</dt><dd>Budi Santoso</dd>
                <dt>Mulai</dt><dd className="mono">12:44</dd>
                <dt>Durasi</dt><dd className="mono">36 mnt</dd>
              </dl>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Nilai & ongkir</div></div>
            <div className="card-body">
              <dl className="kv">
                <dt>Total item</dt><dd className="mono">{fmtNum(totalQty)} unit</dd>
                <dt>Nilai barang</dt><dd className="mono">Rp 54.480.000</dd>
                <dt>Ongkir</dt><dd className="mono">Rp 245.000</dd>
                <dt>Berat</dt><dd className="mono">42,4 kg</dd>
                <dt>Volume</dt><dd className="mono">0,18 m³</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
