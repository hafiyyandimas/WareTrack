// ─── Inventory data ────────────────────────────────────────────────────────

export interface Product {
  sku: string;
  nama: string;
  kategori: string;
  variant: string;
  stok: number;
  min: number;
  lokasi: string;
  harga: number;
  supplier: string;
  updated: string;
}

export interface InboundDoc {
  ref: string;
  po: string;
  supplier: string;
  items: number;
  qty: number;
  tanggal: string;
  status: string;
  penerima: string;
}

export interface OutboundDoc {
  ref: string;
  tujuan: string;
  items: number;
  qty: number;
  tanggal: string;
  status: string;
  picker: string;
}

export interface AlertItem {
  sku: string;
  nama: string;
  stok: number;
  min: number;
  status: string;
  lastOrder: string;
  kategori: string;
}

export interface User {
  nama: string;
  email: string;
  role: string;
  lokasi: string;
  status: string;
  lastLogin: string;
  inisial: string;
}

export interface Role {
  nama: string;
  user: number;
  scope: string;
  izin: number;
}

export const PRODUCTS: Product[] = [
  { sku: "ELK-HP-0012", nama: "Smartphone Aura X3 128GB", kategori: "Elektronik", variant: "Midnight Black", stok: 142, min: 40, lokasi: "A-02-14", harga: 3750000, supplier: "PT Aura Tek Nusa", updated: "2d" },
  { sku: "ELK-HP-0013", nama: "Smartphone Aura X3 256GB", kategori: "Elektronik", variant: "Ocean Blue", stok: 28, min: 30, lokasi: "A-02-15", harga: 4250000, supplier: "PT Aura Tek Nusa", updated: "5j" },
  { sku: "ELK-AC-0203", nama: "Charger USB-C 65W", kategori: "Aksesoris", variant: "Standard", stok: 0, min: 50, lokasi: "A-04-08", harga: 189000, supplier: "CV Daya Prima", updated: "3j" },
  { sku: "ELK-AC-0204", nama: "Powerbank 10.000mAh", kategori: "Aksesoris", variant: "Graphite", stok: 412, min: 80, lokasi: "A-04-11", harga: 225000, supplier: "CV Daya Prima", updated: "1d" },
  { sku: "FSH-TS-0451", nama: "Kaos Cotton Combed 30s", kategori: "Fashion", variant: "Putih / L", stok: 96, min: 120, lokasi: "C-01-03", harga: 89000, supplier: "Konveksi Satria", updated: "1d" },
  { sku: "FSH-TS-0452", nama: "Kaos Cotton Combed 30s", kategori: "Fashion", variant: "Hitam / L", stok: 204, min: 120, lokasi: "C-01-04", harga: 89000, supplier: "Konveksi Satria", updated: "1d" },
  { sku: "FSH-CL-0088", nama: "Celana Chino Slim Fit", kategori: "Fashion", variant: "Khaki / 32", stok: 18, min: 25, lokasi: "C-02-10", harga: 245000, supplier: "Konveksi Satria", updated: "6j" },
  { sku: "ELK-AU-0077", nama: "Earbuds TWS Pro 2", kategori: "Audio", variant: "White", stok: 312, min: 60, lokasi: "A-03-05", harga: 695000, supplier: "PT Aura Tek Nusa", updated: "4j" },
  { sku: "HMA-KT-1102", nama: "Set Alat Dapur Stainless", kategori: "Home & Kitchen", variant: "7 pcs", stok: 64, min: 20, lokasi: "D-01-02", harga: 320000, supplier: "UD Mitra Dapur", updated: "2d" },
  { sku: "ELK-KB-0341", nama: "Keyboard Mekanikal TKL", kategori: "Komputer", variant: "Red Switch", stok: 7, min: 15, lokasi: "B-01-09", harga: 820000, supplier: "PT Teknologi Maju", updated: "1j" },
  { sku: "ELK-MS-0512", nama: "Mouse Wireless Ergo", kategori: "Komputer", variant: "Grey", stok: 88, min: 30, lokasi: "B-01-10", harga: 245000, supplier: "PT Teknologi Maju", updated: "1d" },
  { sku: "ELK-MN-0201", nama: "Monitor 27\" QHD 165Hz", kategori: "Komputer", variant: "Black", stok: 22, min: 10, lokasi: "B-02-01", harga: 3850000, supplier: "PT Teknologi Maju", updated: "3d" },
];

export const INBOUND: InboundDoc[] = [
  { ref: "IN-2604-0142", po: "PO-2604-088", supplier: "PT Aura Tek Nusa", items: 4, qty: 240, tanggal: "26 Apr 2026", status: "diterima", penerima: "Rangga A." },
  { ref: "IN-2604-0141", po: "PO-2604-087", supplier: "CV Daya Prima", items: 2, qty: 500, tanggal: "26 Apr 2026", status: "diterima", penerima: "Siti F." },
  { ref: "IN-2604-0140", po: "PO-2604-085", supplier: "Konveksi Satria", items: 6, qty: 720, tanggal: "26 Apr 2026", status: "parsial", penerima: "Rangga A." },
  { ref: "IN-2504-0139", po: "PO-2504-081", supplier: "PT Teknologi Maju", items: 3, qty: 120, tanggal: "25 Apr 2026", status: "ditinjau", penerima: "Menunggu" },
  { ref: "IN-2504-0138", po: "PO-2504-079", supplier: "UD Mitra Dapur", items: 1, qty: 50, tanggal: "25 Apr 2026", status: "diterima", penerima: "Dewi W." },
  { ref: "IN-2504-0137", po: "PO-2504-076", supplier: "PT Aura Tek Nusa", items: 5, qty: 310, tanggal: "25 Apr 2026", status: "ditolak", penerima: "Rangga A." },
  { ref: "IN-2404-0136", po: "PO-2404-073", supplier: "Konveksi Satria", items: 4, qty: 420, tanggal: "24 Apr 2026", status: "diterima", penerima: "Siti F." },
  { ref: "IN-2404-0135", po: "PO-2404-072", supplier: "CV Daya Prima", items: 2, qty: 180, tanggal: "24 Apr 2026", status: "diterima", penerima: "Dewi W." },
];

export const OUTBOUND: OutboundDoc[] = [
  { ref: "OUT-2604-2014", tujuan: "Toko Sentral Depok", items: 8, qty: 145, tanggal: "26 Apr 2026", status: "dikirim", picker: "Budi S." },
  { ref: "OUT-2604-2013", tujuan: "Toko Utama Bekasi", items: 5, qty: 82, tanggal: "26 Apr 2026", status: "picking", picker: "Rangga A." },
  { ref: "OUT-2604-2012", tujuan: "Marketplace - Shopee", items: 12, qty: 212, tanggal: "26 Apr 2026", status: "dikirim", picker: "Siti F." },
  { ref: "OUT-2604-2011", tujuan: "Toko Cabang Tangerang", items: 3, qty: 48, tanggal: "26 Apr 2026", status: "menunggu", picker: "—" },
  { ref: "OUT-2504-2010", tujuan: "Marketplace - Tokopedia", items: 18, qty: 304, tanggal: "25 Apr 2026", status: "dikirim", picker: "Budi S." },
  { ref: "OUT-2504-2009", tujuan: "Toko Sentral Depok", items: 4, qty: 67, tanggal: "25 Apr 2026", status: "dibatalkan", picker: "—" },
  { ref: "OUT-2504-2008", tujuan: "Event Pop-up Kemang", items: 22, qty: 380, tanggal: "25 Apr 2026", status: "dikirim", picker: "Dewi W." },
];

export const ALERTS: AlertItem[] = [
  { sku: "ELK-AC-0203", nama: "Charger USB-C 65W", stok: 0, min: 50, status: "habis", lastOrder: "14 hari lalu", kategori: "Aksesoris" },
  { sku: "ELK-KB-0341", nama: "Keyboard Mekanikal TKL", stok: 7, min: 15, status: "kritis", lastOrder: "21 hari lalu", kategori: "Komputer" },
  { sku: "FSH-CL-0088", nama: "Celana Chino Slim Fit Khaki 32", stok: 18, min: 25, status: "kritis", lastOrder: "8 hari lalu", kategori: "Fashion" },
  { sku: "ELK-HP-0013", nama: "Smartphone Aura X3 256GB", stok: 28, min: 30, status: "rendah", lastOrder: "5 hari lalu", kategori: "Elektronik" },
  { sku: "FSH-TS-0451", nama: "Kaos Cotton Combed 30s Putih L", stok: 96, min: 120, status: "rendah", lastOrder: "3 hari lalu", kategori: "Fashion" },
  { sku: "HMA-SL-0201", nama: "Selimut Fleece King Size", stok: 4, min: 20, status: "kritis", lastOrder: "30 hari lalu", kategori: "Home & Kitchen" },
  { sku: "ELK-CM-0911", nama: "Webcam 1080p Auto Focus", stok: 11, min: 25, status: "rendah", lastOrder: "6 hari lalu", kategori: "Komputer" },
  { sku: "ELK-SP-0142", nama: "Speaker Bluetooth Outdoor", stok: 2, min: 15, status: "kritis", lastOrder: "45 hari lalu", kategori: "Audio" },
];

export const USERS: User[] = [
  { nama: "Rangga Adiputra", email: "rangga.a@gudang.id", role: "Admin Gudang", lokasi: "WH-JKT-01", status: "aktif", lastLogin: "Hari ini, 08:14", inisial: "RA" },
  { nama: "Dewi Wulandari", email: "dewi.w@gudang.id", role: "Manajer", lokasi: "WH-JKT-01", status: "aktif", lastLogin: "Hari ini, 07:52", inisial: "DW" },
  { nama: "Budi Santoso", email: "budi.s@gudang.id", role: "Staff Outbound", lokasi: "WH-JKT-01", status: "aktif", lastLogin: "Hari ini, 09:01", inisial: "BS" },
  { nama: "Siti Fatimah", email: "siti.f@gudang.id", role: "Staff Inbound", lokasi: "WH-JKT-01", status: "aktif", lastLogin: "Hari ini, 08:30", inisial: "SF" },
  { nama: "Ahmad Ridwan", email: "ahmad.r@gudang.id", role: "Staff Gudang", lokasi: "WH-BDG-02", status: "aktif", lastLogin: "Kemarin, 17:44", inisial: "AR" },
  { nama: "Linda Kusuma", email: "linda.k@gudang.id", role: "Auditor", lokasi: "HQ", status: "aktif", lastLogin: "2 hari lalu", inisial: "LK" },
  { nama: "Hendra Wijaya", email: "hendra.w@gudang.id", role: "Staff Outbound", lokasi: "WH-SBY-03", status: "non-aktif", lastLogin: "30 hari lalu", inisial: "HW" },
  { nama: "Putri Maharani", email: "putri.m@gudang.id", role: "Manajer", lokasi: "WH-SBY-03", status: "aktif", lastLogin: "Hari ini, 08:45", inisial: "PM" },
];

export const ROLES: Role[] = [
  { nama: "Super Admin", user: 1, scope: "Semua gudang", izin: 24 },
  { nama: "Admin Gudang", user: 3, scope: "Per gudang", izin: 18 },
  { nama: "Manajer", user: 3, scope: "Per gudang", izin: 14 },
  { nama: "Staff Inbound", user: 4, scope: "Per gudang", izin: 7 },
  { nama: "Staff Outbound", user: 6, scope: "Per gudang", izin: 7 },
  { nama: "Auditor", user: 2, scope: "Read-only", izin: 5 },
  { nama: "Supplier", user: 14, scope: "Portal supplier", izin: 4 },
];

// ─── Formatters ────────────────────────────────────────────────────────────

export const fmtIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");
export const fmtNum = (n: number) => n.toLocaleString("id-ID");

// ─── Stock status helper ────────────────────────────────────────────────────

export function statusForStock(stok: number, min: number): { kind: string; label: string } {
  if (stok === 0) return { kind: "danger", label: "HABIS" };
  if (stok < min) return { kind: "warn", label: "RENDAH" };
  if (stok < min * 1.2) return { kind: "warn", label: "HAMPIR MIN" };
  return { kind: "ok", label: "NORMAL" };
}
