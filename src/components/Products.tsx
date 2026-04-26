import { useState, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '../components/Icon'
import { Badge, PageHeader } from '../components/ui'
import { fmtIDR, fmtNum, statusForStock } from '../lib/data'
import {
  getBarang,
  getBarangBySku,
  getTransaksi,
  createBarang,
  updateBarang,
  deleteBarang,
  bulkCreateBarang,
} from '../lib/queries'

// ─── Types ────────────────────────────────────────────────────────────────

type BarangRow = {
  id_barang: number
  nama_barang: string
  sku: string
  kategori: string | null
  satuan: string
  kuantitas_stok: number
  batas_minimum: number
  harga: number
  created_at: Date
  updated_at: Date
}

type BarangFormData = {
  nama_barang: string
  sku: string
  kategori: string
  satuan: string
  kuantitas_stok: string
  batas_minimum: string
  harga: string
}

const EMPTY_FORM: BarangFormData = {
  nama_barang: '',
  sku: '',
  kategori: '',
  satuan: 'pcs',
  kuantitas_stok: '0',
  batas_minimum: '0',
  harga: '0',
}

// ─── CSV Utilities ────────────────────────────────────────────────────────

const CSV_HEADERS = ['sku', 'nama_barang', 'kategori', 'satuan', 'kuantitas_stok', 'batas_minimum', 'harga']

function exportToCSV(data: BarangRow[]) {
  const rows = [
    CSV_HEADERS.join(','),
    ...data.map(p =>
      [
        `"${p.sku}"`,
        `"${p.nama_barang}"`,
        `"${p.kategori ?? ''}"`,
        `"${p.satuan}"`,
        p.kuantitas_stok,
        p.batas_minimum,
        p.harga,
      ].join(',')
    ),
  ]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `produk_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.trim().split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    return Object.fromEntries(headers.map((h, i) => [h, (fields[i] ?? '').trim()]))
  })
}

function csvRowToBarang(row: Record<string, string>): {
  valid: boolean
  data?: Parameters<typeof bulkCreateBarang>[0]['data'][0]
  errors: string[]
} {
  const errors: string[] = []
  if (!row.sku) errors.push('SKU kosong')
  if (!row.nama_barang) errors.push('Nama barang kosong')
  if (!row.satuan) errors.push('Satuan kosong')
  const kuantitas_stok = parseInt(row.kuantitas_stok ?? '0', 10)
  const batas_minimum = parseInt(row.batas_minimum ?? '0', 10)
  const harga = parseInt(row.harga ?? '0', 10)
  if (isNaN(kuantitas_stok)) errors.push('Kuantitas stok tidak valid')
  if (isNaN(batas_minimum)) errors.push('Batas minimum tidak valid')
  if (isNaN(harga)) errors.push('Harga tidak valid')
  if (errors.length) return { valid: false, errors }
  return {
    valid: true,
    errors: [],
    data: {
      sku: row.sku,
      nama_barang: row.nama_barang,
      kategori: row.kategori || undefined,
      satuan: row.satuan,
      kuantitas_stok,
      batas_minimum,
      harga,
    }
  }
}

// ─── Modal: Tambah / Edit Produk ──────────────────────────────────────────

interface ProductModalProps {
  mode: 'create' | 'edit'
  initial?: BarangRow
  onClose: () => void
  onSaved: () => void
}

function ProductModal({ mode, initial, onClose, onSaved }: ProductModalProps) {
  const [form, setForm] = useState<BarangFormData>(
    initial
      ? {
          nama_barang: initial.nama_barang,
          sku: initial.sku,
          kategori: initial.kategori ?? '',
          satuan: initial.satuan,
          kuantitas_stok: String(initial.kuantitas_stok),
          batas_minimum: String(initial.batas_minimum),
          harga: String(initial.harga),
        }
      : EMPTY_FORM
  )
  const [errors, setErrors] = useState<Partial<BarangFormData>>({})
  const [serverError, setServerError] = useState('')

  const createMut = useMutation({
    mutationFn: (d: typeof form) =>
      createBarang({
        data: {
          nama_barang: d.nama_barang,
          sku: d.sku,
          kategori: d.kategori || undefined,
          satuan: d.satuan,
          kuantitas_stok: parseInt(d.kuantitas_stok, 10),
          batas_minimum: parseInt(d.batas_minimum, 10),
          harga: parseInt(d.harga, 10),
        },
      }),
    onSuccess: onSaved,
    onError: (e: any) => setServerError(e?.message ?? 'Gagal menyimpan produk'),
  })

  const updateMut = useMutation({
    mutationFn: (d: typeof form) =>
      updateBarang({
        data: {
          sku: d.sku,
          nama_barang: d.nama_barang,
          kategori: d.kategori || null,
          satuan: d.satuan,
          kuantitas_stok: parseInt(d.kuantitas_stok, 10),
          batas_minimum: parseInt(d.batas_minimum, 10),
          harga: parseInt(d.harga, 10),
        },
      }),
    onSuccess: onSaved,
    onError: (e: any) => setServerError(e?.message ?? 'Gagal memperbarui produk'),
  })

  const isBusy = createMut.isPending || updateMut.isPending

  function set(field: keyof BarangFormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: undefined }))
    setServerError('')
  }

  function validate(): boolean {
    const e: Partial<BarangFormData> = {}
    if (!form.nama_barang.trim()) e.nama_barang = 'Nama barang wajib diisi'
    if (!form.sku.trim()) e.sku = 'SKU wajib diisi'
    if (!form.satuan.trim()) e.satuan = 'Satuan wajib diisi'
    if (isNaN(parseInt(form.kuantitas_stok, 10))) e.kuantitas_stok = 'Angka tidak valid'
    if (isNaN(parseInt(form.batas_minimum, 10))) e.batas_minimum = 'Angka tidak valid'
    if (isNaN(parseInt(form.harga, 10))) e.harga = 'Angka tidak valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    if (mode === 'create') createMut.mutate(form)
    else updateMut.mutate(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 520 }}>
        <div className="modal-header">
          <div className="modal-title">{mode === 'create' ? 'Produk baru' : 'Edit produk'}</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ico ico-sm" /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {serverError && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg, #fee2e2)', color: 'var(--danger)', fontSize: 13 }}>
              {serverError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <label className="field-label">Nama Barang <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={'field-input' + (errors.nama_barang ? ' error' : '')}
                value={form.nama_barang}
                onChange={e => set('nama_barang', e.target.value)}
                placeholder="Contoh: Keyboard Mekanikal TKL"
                disabled={isBusy}
              />
              {errors.nama_barang && <div className="field-error">{errors.nama_barang}</div>}
            </div>

            <div className="field">
              <label className="field-label">SKU <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={'field-input mono' + (errors.sku ? ' error' : '')}
                value={form.sku}
                onChange={e => set('sku', e.target.value.toUpperCase())}
                placeholder="Contoh: ELK-KB-0001"
                disabled={isBusy || mode === 'edit'}
                style={mode === 'edit' ? { background: 'var(--surface-2)', color: 'var(--text-3)' } : {}}
              />
              {errors.sku && <div className="field-error">{errors.sku}</div>}
              {mode === 'edit' && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>SKU tidak dapat diubah</div>}
            </div>

            <div className="field">
              <label className="field-label">Kategori</label>
              <input
                className="field-input"
                value={form.kategori}
                onChange={e => set('kategori', e.target.value)}
                placeholder="Contoh: Elektronik"
                disabled={isBusy}
              />
            </div>

            <div className="field">
              <label className="field-label">Satuan <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={'field-input' + (errors.satuan ? ' error' : '')}
                value={form.satuan}
                onChange={e => set('satuan', e.target.value)}
                placeholder="pcs / box / kg"
                disabled={isBusy}
              />
              {errors.satuan && <div className="field-error">{errors.satuan}</div>}
            </div>

            <div className="field">
              <label className="field-label">Harga (Rp) <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input
                className={'field-input mono' + (errors.harga ? ' error' : '')}
                type="number"
                min="0"
                value={form.harga}
                onChange={e => set('harga', e.target.value)}
                disabled={isBusy}
              />
              {errors.harga && <div className="field-error">{errors.harga}</div>}
            </div>

            <div className="field">
              <label className="field-label">Stok Awal</label>
              <input
                className={'field-input mono' + (errors.kuantitas_stok ? ' error' : '')}
                type="number"
                min="0"
                value={form.kuantitas_stok}
                onChange={e => set('kuantitas_stok', e.target.value)}
                disabled={isBusy}
              />
              {errors.kuantitas_stok && <div className="field-error">{errors.kuantitas_stok}</div>}
            </div>

            <div className="field">
              <label className="field-label">Batas Minimum</label>
              <input
                className={'field-input mono' + (errors.batas_minimum ? ' error' : '')}
                type="number"
                min="0"
                value={form.batas_minimum}
                onChange={e => set('batas_minimum', e.target.value)}
                disabled={isBusy}
              />
              {errors.batas_minimum && <div className="field-error">{errors.batas_minimum}</div>}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={isBusy}>Batal</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={isBusy}>
            {isBusy ? 'Menyimpan…' : mode === 'create' ? 'Tambah produk' : 'Simpan perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Impor CSV ─────────────────────────────────────────────────────

interface ImportModalProps {
  onClose: () => void
  onImported: () => void
}

type ImportRow = {
  row: number
  data?: Parameters<typeof bulkCreateBarang>[0]['data'][0]
  errors: string[]
  valid: boolean
}

function ImportModal({ onClose, onImported }: ImportModalProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [result, setResult] = useState<{ succeeded: number; failed: number; total: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const importMut = useMutation({
    mutationFn: (validRows: Parameters<typeof bulkCreateBarang>[0]['data']) =>
      bulkCreateBarang({ data: validRows }),
    onSuccess: (res) => {
      setResult(res)
      setStep('done')
      onImported()
    },
  })

  function processFile(file: File) {
    setFileError('')
    if (!file.name.endsWith('.csv')) {
      setFileError('File harus berformat .csv')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) {
        setFileError('File CSV kosong atau format tidak dikenali')
        return
      }
      const validated: ImportRow[] = parsed.map((r, i) => {
        const res = csvRowToBarang(r)
        return { row: i + 2, data: res.data, errors: res.errors, valid: res.valid }
      })
      setRows(validated)
      setStep('preview')
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleImport() {
    const validData = rows.filter(r => r.valid && r.data).map(r => r.data!)
    if (validData.length === 0) return
    importMut.mutate(validData)
  }

  const validCount = rows.filter(r => r.valid).length
  const invalidCount = rows.filter(r => !r.valid).length

  // CSV template download
  function downloadTemplate() {
    const sample = [
      CSV_HEADERS.join(','),
      '"ELK-KB-0001","Keyboard Mekanikal TKL","Komputer","pcs","50","15","820000"',
      '"ELK-MS-0001","Mouse Wireless","Komputer","pcs","80","20","245000"',
    ].join('\n')
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_produk.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 620 }}>
        <div className="modal-header">
          <div className="modal-title">Impor Produk dari CSV</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ico ico-sm" /></button>
        </div>

        {/* Step: Upload */}
        {step === 'upload' && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--primary, #6366f1)' : 'var(--border)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '40px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? 'var(--surface-2)' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon name="upload" className="ico" style={{ width: 28, height: 28, color: 'var(--text-3)', marginBottom: 10 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Seret & lepas file CSV di sini</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>atau klik untuk pilih file</div>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>

            {fileError && (
              <div style={{ padding: '8px 12px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg, #fee2e2)', color: 'var(--danger)', fontSize: 13 }}>
                {fileError}
              </div>
            )}

            <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontSize: 13 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Format kolom yang diperlukan:</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.8 }}>
                {CSV_HEADERS.join('  ·  ')}
              </div>
              <div style={{ marginTop: 10 }}>
                <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); downloadTemplate() }}>
                  <Icon name="download" className="ico ico-sm" /> Unduh template CSV
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              • Baris pertama harus berisi nama kolom (header)<br />
              • SKU yang sudah ada akan <strong>diperbarui</strong> (upsert)<br />
              • Maksimum 500 baris per import
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--ok-bg, #dcfce7)', color: 'var(--ok)', fontSize: 13, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 22 }}>{validCount}</div>
                <div>baris valid</div>
              </div>
              {invalidCount > 0 && (
                <div style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--r-md)', background: 'var(--danger-bg, #fee2e2)', color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>{invalidCount}</div>
                  <div>baris error (akan dilewati)</div>
                </div>
              )}
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
              <table style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>SKU</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left' }}>Nama</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>Stok</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>Harga</th>
                    <th style={{ padding: '6px 10px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.row} style={{ borderTop: '1px solid var(--border)', background: r.valid ? 'transparent' : 'var(--danger-bg, #fff5f5)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-3)' }}>{r.row}</td>
                      <td style={{ padding: '6px 10px' }} className="mono">{r.data?.sku ?? '—'}</td>
                      <td style={{ padding: '6px 10px' }}>{r.data?.nama_barang ?? '—'}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{r.data?.kuantitas_stok ?? '—'}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right' }}>{r.data ? fmtIDR(r.data.harga) : '—'}</td>
                      <td style={{ padding: '6px 10px' }}>
                        {r.valid
                          ? <Badge kind="ok">OK</Badge>
                          : <span style={{ fontSize: 11, color: 'var(--danger)' }}>{r.errors.join(', ')}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && result && (
          <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--ok-bg, #dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Icon name="check" className="ico" style={{ width: 28, height: 28, color: 'var(--ok)' }} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>Import selesai!</div>
            <div style={{ color: 'var(--text-2)', fontSize: 14 }}>
              <span style={{ color: 'var(--ok)', fontWeight: 600 }}>{result.succeeded}</span> produk berhasil disimpan
              {result.failed > 0 && <>, <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{result.failed}</span> gagal</>}
            </div>
          </div>
        )}

        <div className="modal-footer">
          {step === 'upload' && (
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Batal</button>
          )}
          {step === 'preview' && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('upload')}>
                <Icon name="chevronLeft" className="ico ico-sm" /> Ganti file
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleImport}
                disabled={validCount === 0 || importMut.isPending}
              >
                {importMut.isPending ? 'Mengimpor…' : `Impor ${validCount} produk`}
              </button>
            </>
          )}
          {step === 'done' && (
            <button className="btn btn-primary btn-sm" onClick={onClose}>Selesai</button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Konfirmasi Hapus ───────────────────────────────────────────────

interface DeleteModalProps {
  product: BarangRow
  onClose: () => void
  onDeleted: () => void
}

function DeleteModal({ product, onClose, onDeleted }: DeleteModalProps) {
  const deleteMut = useMutation({
    mutationFn: () => deleteBarang({ data: product.sku }),
    onSuccess: onDeleted,
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
        <div className="modal-header">
          <div className="modal-title">Hapus produk?</div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" className="ico ico-sm" /></button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            Produk <strong>{product.nama_barang}</strong>{' '}
            (<span className="mono">{product.sku}</span>) akan dihapus permanen beserta semua data terkait.
            Tindakan ini tidak dapat dibatalkan.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={deleteMut.isPending}>Batal</button>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
            onClick={() => deleteMut.mutate()}
            disabled={deleteMut.isPending}
          >
            {deleteMut.isPending ? 'Menghapus…' : 'Ya, hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Row Context Menu ─────────────────────────────────────────────────────

interface RowMenuProps {
  product: BarangRow
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

function RowMenu({ product, onEdit, onDelete, onClose }: RowMenuProps) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={onClose} />
      <div style={{
        position: 'absolute', right: 0, top: '100%', zIndex: 50,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,.12))',
        minWidth: 160, padding: '4px 0',
      }}>
        <button
          onClick={() => { onClose(); onEdit() }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text)', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Icon name="edit" className="ico ico-sm" /> Edit produk
        </button>
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <button
          onClick={() => { onClose(); onDelete() }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 14px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--danger)', textAlign: 'left' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-bg, #fee2e2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <Icon name="trash" className="ico ico-sm" /> Hapus produk
        </button>
      </div>
    </>
  )
}

// ─── Hook: Dropdown Anchor ────────────────────────────────────────────────
function useDropdownAnchor() {
  const ref = useRef<HTMLButtonElement>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  function open() {
    if (ref.current) setRect(ref.current.getBoundingClientRect())
  }
  function close() { setRect(null) }
  function toggle() { rect ? close() : open() }

  return { ref, rect, open, close, toggle, isOpen: rect !== null }
}

// ─── Products List ────────────────────────────────────────────────────────

export function Products() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'table' | 'grid'>('table')
  const [filterCat, setFilterCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editTarget, setEditTarget] = useState<BarangRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BarangRow | null>(null)
  const [openMenuSku, setOpenMenuSku] = useState<string | null>(null)
  const catDrop    = useDropdownAnchor()
  const statusDrop = useDropdownAnchor()
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advMinHarga, setAdvMinHarga] = useState('')
  const [advMaxHarga, setAdvMaxHarga] = useState('')
  const [advMinStok, setAdvMinStok] = useState('')

  const { data: barang = [], isLoading } = useQuery({
    queryKey: ['barang'],
    queryFn: () => getBarang(),
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['barang'] })
  }, [queryClient])

  const categories = ['Semua', ...Array.from(new Set(barang.map((p: BarangRow) => p.kategori ?? 'Lainnya')))]

  const items = barang.filter((p: BarangRow) => {
    const matchCat = filterCat === 'Semua' || (filterCat === 'Lainnya' ? !p.kategori : p.kategori === filterCat)
    const q = search.toLowerCase()
    const matchSearch = !q || p.nama_barang.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    const s = statusForStock(p.kuantitas_stok, p.batas_minimum)
    const matchStatus = filterStatus === 'Semua' || s.label === filterStatus
    const minH = advMinHarga !== '' ? p.harga >= parseInt(advMinHarga) : true
    const maxH = advMaxHarga !== '' ? p.harga <= parseInt(advMaxHarga) : true
    const minS = advMinStok !== '' ? p.kuantitas_stok >= parseInt(advMinStok) : true
    return matchCat && matchSearch && matchStatus && minH && maxH && minS
  })

  return (
    <>
      <PageHeader
        title="Produk"
        subtitle={`${fmtNum(barang.length)} SKU aktif`}
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
              <Icon name="upload" className="ico ico-sm" /> Impor CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => exportToCSV(barang)}>
              <Icon name="download" className="ico ico-sm" /> Ekspor
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
              <Icon name="plus" className="ico ico-sm" /> Produk baru
            </button>
          </>
        }
      />

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-search">
            <Icon name="search" className="ico ico-sm" />
            <input
              placeholder="Cari nama, SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* ── Dropdown Kategori ── */}
<div style={{ position: 'relative' }}>
  <button
    ref={catDrop.ref}
    className={"chip-filter" + (filterCat !== 'Semua' ? ' applied' : '')}
    onClick={() => { catDrop.toggle(); statusDrop.close(); setShowAdvanced(false) }}
  >
    Kategori{filterCat !== 'Semua' && <> · <span className="val">{filterCat}</span></>}
    <Icon name="chevronDown" className="ico ico-sm" />
  </button>
  {catDrop.isOpen && catDrop.rect && (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={catDrop.close} />
      <div style={{
        position: 'fixed',
        top: catDrop.rect.bottom + 6,
        left: catDrop.rect.left,
        zIndex: 50,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,.12))',
        minWidth: 180, padding: '4px 0', maxHeight: 280, overflowY: 'auto',
      }}>
        {categories.map((c: string) => (
          <button key={c}
            onClick={() => { setFilterCat(c); catDrop.close() }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 14px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, textAlign: 'left',
              color: filterCat === c ? 'var(--primary, #6366f1)' : 'var(--text)',
              fontWeight: filterCat === c ? 600 : 400,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {c}
            {filterCat === c && <Icon name="check" className="ico ico-sm" />}
          </button>
        ))}
      </div>
    </>
  )}
</div>

          {/* ── Dropdown Status ── */}
<div style={{ position: 'relative' }}>
  <button
    ref={statusDrop.ref}
    className={"chip-filter" + (filterStatus !== 'Semua' ? ' applied' : '')}
    onClick={() => { statusDrop.toggle(); catDrop.close(); setShowAdvanced(false) }}
  >
    Status{filterStatus !== 'Semua' && <> · <span className="val">{filterStatus}</span></>}
    <Icon name="chevronDown" className="ico ico-sm" />
  </button>
  {statusDrop.isOpen && statusDrop.rect && (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 49 }} onClick={statusDrop.close} />
      <div style={{
        position: 'fixed',
        top: statusDrop.rect.bottom + 6,
        left: statusDrop.rect.left,
        zIndex: 50,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0,0,0,.12))',
        minWidth: 160, padding: '4px 0',
      }}>
        {(['Semua', 'NORMAL', 'HAMPIR MIN', 'RENDAH', 'HABIS'] as const).map(s => (
          <button key={s}
            onClick={() => { setFilterStatus(s); statusDrop.close() }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 14px', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 13, textAlign: 'left',
              color: filterStatus === s ? 'var(--primary, #6366f1)' : 'var(--text)',
              fontWeight: filterStatus === s ? 600 : 400,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            {s}
            {filterStatus === s && <Icon name="check" className="ico ico-sm" />}
          </button>
        ))}
      </div>
    </>
  )}
</div>

          {/* ── Filter Lanjutan ── */}
          <button
            className={"chip-filter" + ((advMinHarga || advMaxHarga || advMinStok) ? ' applied' : '')}
            style={{ marginLeft: 'auto' }}
            onClick={() => { setShowAdvanced(v => !v); setShowCatDrop(false); setShowStatusDrop(false) }}
          >
            <Icon name="filter" className="ico ico-sm" /> Filter lanjutan
            {(advMinHarga || advMaxHarga || advMinStok) && (
              <span style={{
                marginLeft: 4, background: 'var(--primary, #6366f1)', color: '#fff',
                borderRadius: '50%', width: 16, height: 16, fontSize: 10,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {[advMinHarga, advMaxHarga, advMinStok].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="seg">
            <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>
              <Icon name="list" className="ico ico-sm" />
            </button>
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
              <Icon name="grid" className="ico ico-sm" />
            </button>
          </div>
        </div>

        {/* ── Panel Filter Lanjutan ── */}
        {showAdvanced && (
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end',
          }}>
            <div className="field" style={{ margin: 0, minWidth: 160 }}>
              <label className="field-label">Harga minimum (Rp)</label>
              <input className="field-input mono" type="number" min="0" placeholder="0"
                value={advMinHarga} onChange={e => setAdvMinHarga(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0, minWidth: 160 }}>
              <label className="field-label">Harga maksimum (Rp)</label>
              <input className="field-input mono" type="number" min="0" placeholder="tidak terbatas"
                value={advMaxHarga} onChange={e => setAdvMaxHarga(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0, minWidth: 140 }}>
              <label className="field-label">Stok minimum</label>
              <input className="field-input mono" type="number" min="0" placeholder="0"
                value={advMinStok} onChange={e => setAdvMinStok(e.target.value)} />
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 1 }}
              onClick={() => { setAdvMinHarga(''); setAdvMaxHarga(''); setAdvMinStok('') }}>
              Reset
            </button>
          </div>
        )}

        {/* ── Konten ── */}
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Memuat data…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            {search ? `Tidak ada produk untuk "${search}"` : 'Belum ada produk'}
          </div>
        ) : view === 'table' ? (
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
              {items.map((p: BarangRow) => {
                const s = statusForStock(p.kuantitas_stok, p.batas_minimum)
                return (
                  <tr key={p.sku} onClick={() => navigate({ to: '/products/$sku', params: { sku: p.sku } })} style={{ cursor: 'pointer' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                    <td className="mono">{p.sku}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, var(--border) 4px, var(--border) 5px)', flexShrink: 0 }} />
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
                    <td onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
                      <button
                        className="icon-btn"
                        onClick={() => setOpenMenuSku(openMenuSku === p.sku ? null : p.sku)}
                      >
                        <Icon name="more" className="ico ico-sm" />
                      </button>
                      {openMenuSku === p.sku && (
                        <RowMenu
                          product={p}
                          onEdit={() => setEditTarget(p)}
                          onDelete={() => setDeleteTarget(p)}
                          onClose={() => setOpenMenuSku(null)}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {items.map((p: BarangRow) => {
              const s = statusForStock(p.kuantitas_stok, p.batas_minimum)
              return (
                <div key={p.sku} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => navigate({ to: '/products/$sku', params: { sku: p.sku } })}>
                  <div style={{ height: 120, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)', backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, var(--border) 6px, var(--border) 7px)', borderTopLeftRadius: 'var(--r-lg)', borderTopRightRadius: 'var(--r-lg)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 8, right: 8 }}><Badge kind={s.kind}>{s.label}</Badge></div>
                    <div style={{ position: 'absolute', top: 8, left: 8 }} onClick={e => e.stopPropagation()}>
                      <button
                        className="icon-btn"
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}
                        onClick={() => setOpenMenuSku(openMenuSku === p.sku ? null : p.sku)}
                      >
                        <Icon name="more" className="ico ico-sm" />
                      </button>
                      {openMenuSku === p.sku && (
                        <RowMenu
                          product={p}
                          onEdit={() => setEditTarget(p)}
                          onDelete={() => setDeleteTarget(p)}
                          onClose={() => setOpenMenuSku(null)}
                        />
                      )}
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div className="mono xsmall muted" style={{ marginBottom: 4 }}>{p.sku}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{p.nama_barang}</div>
                    <div className="xsmall muted" style={{ marginBottom: 10 }}>{p.satuan}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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

      {/* ── Modals ── */}
      {showCreate && (
        <ProductModal
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); invalidate() }}
        />
      )}
      {editTarget && (
        <ProductModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); invalidate() }}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => { setDeleteTarget(null); invalidate() }}
        />
      )}
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={invalidate}
        />
      )}
    </>
  )
}

// ─── Product Detail ───────────────────────────────────────────────────────

interface ProductDetailProps { sku: string }

export function ProductDetail({ sku }: ProductDetailProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('ringkasan')
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const { data: p, isLoading } = useQuery({
    queryKey: ['barang', sku],
    queryFn: () => getBarangBySku({ data: sku }),
  })

  const { data: transaksi = [] } = useQuery({
    queryKey: ['transaksi'],
    queryFn: () => getTransaksi(),
  })

  const riwayat = (transaksi as any[])
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
            <button className="btn btn-secondary btn-sm" onClick={() => setShowEdit(true)}>
              <Icon name="edit" className="ico ico-sm" /> Edit
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
              onClick={() => setShowDelete(true)}
            >
              <Icon name="trash" className="ico ico-sm" /> Hapus
            </button>
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

      {/* ── Modals ── */}
      {showEdit && (
        <ProductModal
          mode="edit"
          initial={p}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false)
            queryClient.invalidateQueries({ queryKey: ['barang', sku] })
            queryClient.invalidateQueries({ queryKey: ['barang'] })
          }}
        />
      )}

      {showDelete && (
        <DeleteModal
          product={p}
          onClose={() => setShowDelete(false)}
          onDeleted={() => {
            setShowDelete(false)
            navigate({ to: '/products' })
            queryClient.invalidateQueries({ queryKey: ['barang'] })
          }}
        />
      )}
    </>
  )
}