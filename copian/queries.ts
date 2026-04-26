import { prisma } from '../db'
import { createServerFn } from '@tanstack/react-start'


// ─── Types ─────────────────────────────────────────────────────────────────

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

// ─── Barang ────────────────────────────────────────────────────────────────

export const getBarang = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await prisma.barang.findMany({ orderBy: { id_barang: 'asc' } })
  return rows.map((r): BarangRow => ({ ...r, harga: Number(r.harga) }))
})

export const getLowStock = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await prisma.barang.findMany({
    where: { kuantitas_stok: { lte: prisma.barang.fields.batas_minimum } },
    orderBy: { kuantitas_stok: 'asc' }
  })
  return rows.map((r): BarangRow => ({ ...r, harga: Number(r.harga) }))
})

export const getBarangBySku = createServerFn({ method: 'GET' })
  .handler(async ({ data }: { data: string }) => {
    const row = await prisma.barang.findUnique({ where: { sku: data } })
    if (!row) return null
    return { ...row, harga: Number(row.harga) } as BarangRow
  })

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(async () => {
  const [totalSKU, barangAll, lowStockCount, transaksiHariIni] = await Promise.all([
    prisma.barang.count(),
    prisma.barang.findMany({ select: { kuantitas_stok: true, harga: true, batas_minimum: true } }),
    prisma.barang.count({
      where: { kuantitas_stok: { lte: prisma.barang.fields.batas_minimum } }
    }),
    prisma.transaksi.findMany({
      where: { tanggal: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      include: { barang: true, pengguna: true },
      orderBy: { tanggal: 'desc' },
      take: 5
    })
  ])

  const nilaiInventaris = barangAll.reduce(
    (sum: number, b: { harga: bigint | number; kuantitas_stok: number }) =>
      sum + Number(b.harga) * b.kuantitas_stok, 0
  )

  return {
    totalSKU,
    nilaiInventaris,
    lowStockCount,
    transaksiHariIni: transaksiHariIni.map(t => ({
      ...t,
      barang: { ...t.barang, harga: Number(t.barang.harga) }
    }))
  }
})

// ─── Bar Chart ─────────────────────────────────────────────────────────────

export const getBarChart = createServerFn({ method: 'GET' }).handler(async () => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return d
  })

  const results = await Promise.all(
    days.map(async (day) => {
      const next = new Date(day)
      next.setDate(next.getDate() + 1)

      const [masuk, keluar] = await Promise.all([
        prisma.transaksi.aggregate({
          where: { jenis_transaksi: 'masuk', tanggal: { gte: day, lt: next } },
          _sum: { jumlah: true }
        }),
        prisma.transaksi.aggregate({
          where: { jenis_transaksi: 'keluar', tanggal: { gte: day, lt: next } },
          _sum: { jumlah: true }
        })
      ])

      return {
        label: String(day.getDate()),
        in: masuk._sum.jumlah ?? 0,
        out: keluar._sum.jumlah ?? 0,
      }
    })
  )

  return results
})

// ─── Transaksi ─────────────────────────────────────────────────────────────

export const getTransaksi = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await prisma.transaksi.findMany({
    include: { barang: true, pengguna: true },
    orderBy: { tanggal: 'desc' }
  })
  return rows.map(t => ({
    ...t,
    barang: { ...t.barang, harga: Number(t.barang.harga) }
  }))
})

export const getTransaksiMasuk = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await prisma.transaksi.findMany({
    where: { jenis_transaksi: 'masuk' },
    include: { barang: true, pengguna: true },
    orderBy: { tanggal: 'desc' }
  })
  return rows.map(t => ({
    ...t,
    barang: { ...t.barang, harga: Number(t.barang.harga) }
  }))
})

export const getTransaksiKeluar = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await prisma.transaksi.findMany({
    where: { jenis_transaksi: 'keluar' },
    include: { barang: true, pengguna: true },
    orderBy: { tanggal: 'desc' }
  })
  return rows.map(t => ({
    ...t,
    barang: { ...t.barang, harga: Number(t.barang.harga) }
  }))
})

// ─── Pengguna ──────────────────────────────────────────────────────────────

export const getPengguna = createServerFn({ method: 'GET' }).handler(async () => {
  return await prisma.pengguna.findMany({ orderBy: { id_pengguna: 'asc' } })
})

export const loginUser = createServerFn({ method: 'GET' })
  .handler(async ({ data }: { data: { email: string; password: string } }) => {
    return await prisma.pengguna.findFirst({
      where: { email: data.email, password_hash: data.password }
    })
  })