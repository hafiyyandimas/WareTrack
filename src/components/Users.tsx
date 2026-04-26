import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Badge, PageHeader } from '../components/ui';
import { USERS, ROLES } from '../lib/data';

export function Users() {
  const [tab, setTab] = useState('pengguna');

  return (
    <>
      <PageHeader
        title="Manajemen User & Role"
        subtitle="24 pengguna aktif · 7 role · 4 gudang"
        actions={
          <>
            <button className="btn btn-secondary btn-sm"><Icon name="shield" className="ico ico-sm" /> Audit log</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" className="ico ico-sm" /> Undang pengguna</button>
          </>
        }
      />

      <div className="tabs">
        <button className={"tab" + (tab === "pengguna" ? " active" : "")} onClick={() => setTab("pengguna")}>
          Pengguna <span className="muted mono xsmall">24</span>
        </button>
        <button className={"tab" + (tab === "role" ? " active" : "")} onClick={() => setTab("role")}>
          Role & Izin <span className="muted mono xsmall">7</span>
        </button>
        <button className={"tab" + (tab === "undangan" ? " active" : "")} onClick={() => setTab("undangan")}>
          Undangan tertunda <span className="muted mono xsmall">3</span>
        </button>
      </div>

      {tab === "pengguna" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 14 }}>
          <div className="table-wrap">
            <div className="table-toolbar">
              <div className="table-search"><Icon name="search" className="ico ico-sm" /><input placeholder="Cari nama atau email…" /></div>
              <button className="chip-filter">Role</button>
              <button className="chip-filter">Lokasi</button>
              <button className="chip-filter">Status</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Pengguna</th><th>Role</th><th>Lokasi</th>
                  <th>Status</th><th>Login terakhir</th><th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {USERS.map(u => (
                  <tr key={u.email}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar">{u.inisial}</div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{u.nama}</div>
                          <div className="xsmall muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge kind={u.role === "Admin Gudang" || u.role === "Manajer" ? "info" : "neutral"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="mono small">{u.lokasi}</td>
                    <td>
                      {u.status === "aktif"
                        ? <Badge kind="ok">AKTIF</Badge>
                        : <Badge kind="neutral">NON-AKTIF</Badge>}
                    </td>
                    <td className="small muted">{u.lastLogin}</td>
                    <td><button className="icon-btn"><Icon name="more" className="ico ico-sm" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card" style={{ alignSelf: "start" }}>
            <div className="card-header"><div className="card-title">Rangga Adiputra</div></div>
            <div className="card-body">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div className="avatar lg">RA</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Rangga Adiputra</div>
                  <div className="xsmall muted">rangga.a@gudang.id</div>
                </div>
              </div>
              <dl className="kv">
                <dt>Role</dt><dd>Admin Gudang</dd>
                <dt>Gudang</dt><dd className="mono">WH-JKT-01</dd>
                <dt>Nomor HP</dt><dd className="mono">+62 812-3344-5566</dd>
                <dt>NIP</dt><dd className="mono">24.001.1102</dd>
                <dt>2FA</dt><dd><Badge kind="ok">AKTIF</Badge></dd>
                <dt>Bergabung</dt><dd>12 Jan 2024</dd>
              </dl>
              <div className="divider" />
              <div className="xsmall" style={{ textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-3)", marginBottom: 8, fontWeight: 500 }}>Izin yang dimiliki</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {["products.view", "products.edit", "inbound.approve", "outbound.create", "opname.run", "reports.view", "users.invite", "+11"].map(p => (
                  <span key={p} className="mono xsmall" style={{ padding: "3px 7px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)" }}>{p}</span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="edit" className="ico ico-sm" /> Edit</button>
                <button className="btn btn-danger btn-sm"><Icon name="x" className="ico ico-sm" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "role" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Role</th><th>Cakupan</th><th className="num">Pengguna</th><th className="num">Izin aktif</th><th>Level akses</th><th style={{ width: 120 }}></th></tr>
            </thead>
            <tbody>
              {ROLES.map(r => (
                <tr key={r.nama}>
                  <td style={{ fontWeight: 500 }}>{r.nama}</td>
                  <td className="muted">{r.scope}</td>
                  <td className="num">{r.user}</td>
                  <td className="num mono">{r.izin} / 24</td>
                  <td style={{ minWidth: 140 }}>
                    <div className="progress"><div className="bar" style={{ width: `${(r.izin / 24) * 100}%` }} /></div>
                  </td>
                  <td><button className="btn btn-ghost btn-sm">Konfigurasi <Icon name="chevron" className="ico ico-sm" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "undangan" && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Email</th><th>Role</th><th>Diundang oleh</th><th>Kedaluwarsa</th><th style={{ width: 140 }}></th></tr>
            </thead>
            <tbody>
              {[
                { e: "ari.nugraha@gudang.id", r: "Staff Outbound", by: "Dewi W.",   exp: "2 hari lagi" },
                { e: "maya.p@gudang.id",       r: "Auditor",        by: "Rangga A.", exp: "5 hari lagi" },
                { e: "dino.s@gudang.id",       r: "Staff Inbound",  by: "Dewi W.",   exp: "6 hari lagi" },
              ].map(u => (
                <tr key={u.e}>
                  <td className="mono small">{u.e}</td>
                  <td><Badge kind="neutral">{u.r}</Badge></td>
                  <td>{u.by}</td>
                  <td className="small muted">{u.exp}</td>
                  <td><button className="btn btn-secondary btn-sm">Kirim ulang</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
