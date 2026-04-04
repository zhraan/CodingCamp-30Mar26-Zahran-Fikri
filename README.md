# Expense & Budget Visualizer

Aplikasi web mobile-friendly untuk melacak pengeluaran harian. Menampilkan total saldo, riwayat transaksi, dan grafik distribusi pengeluaran per kategori — semua tersimpan di browser tanpa backend.

**Demo:** [GitHub Pages](https://zhraan.github.io/CodingCamp-30Mar26-Zahran-Fikri/)

---

## Fitur

**Wajib (MVP)**![1775273669367](image/README/1775273669367.png)![1775273675764](image/README/1775273675764.png)

- Form input transaksi — nama item, jumlah (Rp), kategori
- Daftar transaksi scrollable dengan tombol hapus
- Total saldo otomatis diperbarui
- Pie chart distribusi pengeluaran per kategori (Chart.js)

**Opsional (semua 5 diimplementasikan)**

- Kategori kustom — tambah/hapus langsung dari dropdown kategori
- Ringkasan bulanan — navigasi antar bulan dengan total & jumlah transaksi
- Pengurutan transaksi — berdasarkan tanggal, jumlah, atau kategori (asc/desc)
- Peringatan batas pengeluaran — highlight merah saat saldo melebihi batas
- Toggle dark/light mode — preferensi tersimpan di localStorage

---

## Cara Menjalankan

Tidak perlu instalasi. Cukup buka `index.html` di browser, atau akses via GitHub Pages.

```
index.html   ← buka langsung di browser
```

---

## Struktur Project

```
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

---

## Stack Teknologi

- HTML5, CSS3 (CSS Custom Properties)
- Vanilla JavaScript ES6+ (class-based)
- [Chart.js](https://www.chartjs.org/) — pie chart
- `Intl.NumberFormat('id-ID')` — format Rupiah
- localStorage API — semua data tersimpan client-side

---

## CodingCamp

**Batch:** 30 Maret 2026

**Peserta:** Zahran Fikri

**Repo:** `CodingCamp-30Mar26-Zahran-Fikri`
