# Rencana Implementasi: Expense & Budget Visualizer Enhanced

## Ikhtisar

Implementasi dilakukan secara bottom-up: CSS → HTML → kelas-kelas baru di JS → ekstensi kelas yang ada → integrasi di `initApp()`. Semua perubahan bersifat incremental dan tidak merusak fungsionalitas yang sudah ada.

## Tasks

- [x] 1. Update CSS — variabel modern, dark mode, dan class baru
  - [x] 1.1 Perbarui variabel CSS di `:root` pada `css/styles.css`
    - Ganti `--color-primary` ke `#6366f1`, tambah `--color-accent`, `--color-gradient-start/end`
    - Perbarui `--shadow-sm/md` dengan nilai lebih dalam, `--radius-md` ke `12px`, `--radius-lg` ke `20px`
    - Tambah variabel baru: `--color-warning`, `--color-warning-bg`, `--color-danger`, `--color-danger-bg`, `--transition-theme`
    - _Persyaratan: 1.1, 1.2, 1.3_

  - [x] 1.2 Tambah blok `body.theme-dark` dengan override variabel dark mode
    - Override `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-border`, `--color-balance-bg`, `--color-balance-text`, `--color-primary`, `--shadow-sm/md`
    - Tambah `transition: background-color var(--transition-theme), color var(--transition-theme)` pada selector `body`
    - _Persyaratan: 7.2, 7.5, 7.6_

  - [x] 1.3 Tambah class CSS baru untuk komponen baru
    - `.app-header`, `.btn--icon`, `.btn--secondary`
    - `.balance-amount.balance--warning`, `.spending-warning`
    - `.sort-controls`, `.monthly-nav`, `.month-label`, `.monthly-summary-content`
    - `.custom-category-section`, `.custom-category-controls`, `.custom-category-list`, `.custom-category-tag`
    - `.spending-limit-section`, `.spending-limit-controls`
    - _Persyaratan: 1.1, 1.3, 3.1, 4.1, 5.1, 6.1, 7.1_

- [x] 2. Update HTML — elemen baru dan perubahan label
  - [x] 2.1 Perbarui elemen yang sudah ada di `index.html`
    - Ubah `<html lang="en">` → `<html lang="id">`
    - Ubah label `Amount ($)` → `Jumlah (Rp)` pada form
    - Ubah input amount: hapus `step="0.01"`, ganti `min="0.01"` → `min="1"`, hapus `placeholder="0.00"` → `placeholder="0"`
    - Ubah teks tombol submit `Add Transaction` → `Tambah Transaksi`
    - Ubah heading section `Add Transaction` → `Tambah Transaksi`, `Transactions` → `Transaksi`
    - _Persyaratan: 2.4, 2.5_

  - [x] 2.2 Tambah elemen HTML baru ke `index.html`
    - Tambah `<header class="app-header">` dengan judul dan `<button id="theme-toggle">` sebelum `<main>`
    - Tambah `<div class="spending-limit-section">` dengan input, tombol, dan `<p id="spending-limit-warning">` di dalam `balance-section`
    - Tambah `<section class="custom-category-section">` dengan input, tombol, dan `<ul id="custom-category-list">` setelah `form-section`
    - Tambah `<div id="sort-controls" class="sort-controls">` dengan `<select id="sort-by">` dan `<button id="sort-order-btn">` di dalam `transactions-section` sebelum `<ul>`
    - Tambah `<section class="monthly-summary-section">` dengan navigasi prev/next dan `<div id="monthly-summary-content">` setelah `transactions-section`
    - _Persyaratan: 3.1, 4.1, 4.4, 5.1, 5.2, 6.1, 7.1_

- [-] 3. Implementasi `CategoryManager` di `js/app.js`
  - [x] 3.1 Buat kelas `CategoryManager` dengan properti statis dan konstruktor
    - Definisikan `static DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun']`
    - Definisikan `static STORAGE_KEY = 'customCategories'`
    - Konstruktor menerima `storageManager`, inisialisasi `this.customCategories = []`
    - _Persyaratan: 3.3_

  - [x] 3.2 Implementasi metode `load()`, `getAllCategories()`, `getCustomCategories()`
    - `load()`: muat dari localStorage via `storageManager.load()`, validasi array, assign ke `this.customCategories`
    - `getAllCategories()`: kembalikan `[...DEFAULT_CATEGORIES, ...this.customCategories]`
    - `getCustomCategories()`: kembalikan salinan `this.customCategories`
    - _Persyaratan: 3.6_

  - [x] 3.3 Implementasi metode `addCategory(name)` dengan validasi lengkap
    - Validasi: nama tidak boleh kosong/whitespace, tidak boleh duplikat (case-insensitive), maksimal 50 karakter
    - Jika valid: push ke `this.customCategories`, simpan ke localStorage, kembalikan `{ success: true }`
    - Jika tidak valid: kembalikan `{ success: false, error: '...' }` sesuai pesan error di design
    - _Persyaratan: 3.1, 3.2, 3.5_

  - [ ] 3.4 Tulis property test untuk `CategoryManager.addCategory` (Properti 5)
    - **Properti 5: Validasi Nama Kategori Kustom**
    - **Memvalidasi: Persyaratan 3.5**
    - Gunakan `fast-check`: generate nama kosong, whitespace, dan duplikat — semua harus mengembalikan `{ success: false }`

  - [x] 3.5 Implementasi metode `removeCategory(name)`
    - Filter `this.customCategories` untuk menghapus nama yang cocok
    - Simpan ke localStorage setelah berhasil
    - Kembalikan `{ success: boolean, error?: string }`
    - _Persyaratan: 3.1_

  - [ ] 3.6 Tulis property test untuk round-trip kategori kustom (Properti 3)
    - **Properti 3: Round-Trip Kategori Kustom**
    - **Memvalidasi: Persyaratan 3.2, 3.6**
    - Generate array nama kategori valid, simpan dan muat kembali — hasil harus identik

- [-] 4. Implementasi `ThemeManager` di `js/app.js`
  - [x] 4.1 Buat kelas `ThemeManager` dengan properti statis dan konstruktor
    - Definisikan `static STORAGE_KEY = 'theme'` dan `static DARK_CLASS = 'theme-dark'`
    - Konstruktor menerima `storageManager`, inisialisasi `this.current = 'light'`
    - _Persyaratan: 7.4_

  - [x] 4.2 Implementasi metode `load()`, `toggle()`, `getCurrent()`
    - `load()`: muat preferensi dari localStorage, terapkan class `theme-dark` ke `document.body` jika dark, perbarui `this.current`
    - `toggle()`: flip `this.current`, tambah/hapus class `theme-dark` pada `document.body`, simpan ke localStorage
    - `getCurrent()`: kembalikan `this.current`
    - _Persyaratan: 7.2, 7.3, 7.4_

  - [ ] 4.3 Tulis property test untuk round-trip preferensi tema (Properti 11)
    - **Properti 11: Round-Trip Preferensi Tema**
    - **Memvalidasi: Persyaratan 7.3, 7.4**
    - Generate nilai `'dark'` atau `'light'`, simpan dan muat kembali — tema yang diterapkan harus identik

- [ ] 5. Checkpoint — Pastikan semua kelas baru berfungsi secara mandiri
  - Pastikan semua tes unit dan property test untuk `CategoryManager` dan `ThemeManager` lulus, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 6. Extend `TransactionManager` — tambah metode baru di `js/app.js`
  - [x] 6.1 Implementasi metode `getSortedTransactions(sortBy, order)`
    - Buat salinan array dengan `[...this.transactions]` (tidak mengubah array asli)
    - Implementasi sorting: `'date'` berdasarkan `timestamp`, `'amount'` berdasarkan `amount`, `'category'` secara alfabetis
    - Default: `sortBy = 'date'`, `order = 'desc'`
    - _Persyaratan: 5.1, 5.2, 5.4, 5.5_

  - [ ] 6.2 Tulis property test untuk pengurutan ascending/descending (Properti 7)
    - **Properti 7: Pengurutan Ascending dan Descending Adalah Kebalikan**
    - **Memvalidasi: Persyaratan 5.4**
    - Generate array transaksi acak, verifikasi `asc` adalah kebalikan dari `desc`

  - [ ] 6.3 Tulis property test untuk urutan default terbaru di atas (Properti 8)
    - **Properti 8: Urutan Default adalah Terbaru di Atas**
    - **Memvalidasi: Persyaratan 5.5**
    - Generate transaksi dengan timestamp berbeda, verifikasi elemen pertama memiliki timestamp terbesar

  - [x] 6.4 Implementasi metode `getMonthlyTransactions()`
    - Iterasi semua transaksi, ekstrak key `'YYYY-MM'` dari `timestamp`
    - Akumulasi `total` (sum amount), `count`, dan array `transactions` per key
    - Kembalikan `Map` yang diurutkan dari terbaru ke terlama
    - _Persyaratan: 4.2, 4.3_

  - [ ] 6.5 Tulis property test untuk pengelompokan bulanan (Properti 6)
    - **Properti 6: Pengelompokan Bulanan Akurat**
    - **Memvalidasi: Persyaratan 4.2, 4.3**
    - Generate transaksi dengan timestamp acak, verifikasi total dan count per bulan akurat

- [ ] 7. Update `UIManager` — tambah metode baru di `js/app.js`
  - [x] 7.1 Implementasi metode `formatRupiah(amount)`
    - Gunakan `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)`
    - _Persyaratan: 2.1_

  - [ ] 7.2 Tulis property test untuk format Rupiah (Properti 1)
    - **Properti 1: Format Rupiah Konsisten**
    - **Memvalidasi: Persyaratan 2.1, 2.3**
    - Generate integer positif, verifikasi output dimulai dengan "Rp" dan menggunakan titik sebagai pemisah ribuan

  - [x] 7.3 Perbarui `updateBalance()` untuk menggunakan `formatRupiah`
    - Ganti `${balance.toFixed(2)}` dengan `this.formatRupiah(balance)`
    - _Persyaratan: 2.2_

  - [x] 7.4 Perbarui `renderTransactionList()` untuk menggunakan `formatRupiah`
    - Ganti `${transaction.amount.toFixed(2)}` dengan `this.formatRupiah(transaction.amount)`
    - _Persyaratan: 2.3_

  - [x] 7.5 Implementasi metode `updateCategoryOptions()`
    - Kosongkan `<select id="category">` kecuali option placeholder pertama
    - Iterasi `categoryManager.getAllCategories()`, buat dan append `<option>` untuk setiap kategori
    - _Persyaratan: 3.3_

  - [x] 7.6 Implementasi metode `renderSortControls()`
    - Cache referensi ke `#sort-by` dan `#sort-order-btn`
    - Render state awal kontrol sort (nilai default `'date'` dan `'desc'`)
    - _Persyaratan: 5.1, 5.2_

  - [x] 7.7 Implementasi metode `renderMonthlySummary(monthKey)`
    - Ambil data dari `transactionManager.getMonthlyTransactions()`
    - Render label bulan di `#current-month-label` (format: "Januari 2025")
    - Render total dan jumlah transaksi di `#monthly-summary-content`
    - Tampilkan pesan "Tidak ada transaksi pada bulan ini" jika tidak ada data
    - _Persyaratan: 4.1, 4.2, 4.3, 4.5_

  - [x] 7.8 Implementasi metode `updateSpendingLimit()`
    - Bandingkan `transactionManager.calculateBalance()` dengan `spendingLimit`
    - Tambah/hapus class `balance--warning` pada `#balance-display`
    - Tampilkan/sembunyikan `#spending-limit-warning`
    - _Persyaratan: 6.2, 6.4, 6.5_

  - [ ] 7.9 Tulis property test untuk logika peringatan batas pengeluaran (Properti 9)
    - **Properti 9: Peringatan Batas Pengeluaran**
    - **Memvalidasi: Persyaratan 6.2, 6.4, 6.5**
    - Generate kombinasi saldo dan batas, verifikasi status peringatan sesuai kondisi `balance > limit`

- [ ] 8. Checkpoint — Pastikan semua metode UIManager baru berfungsi
  - Pastikan semua tes untuk metode UIManager baru lulus, tanyakan kepada pengguna jika ada pertanyaan.

- [ ] 9. Update `initApp()` — integrasi semua manager baru dan event handlers
  - [x] 9.1 Inisialisasi `CategoryManager` dan `ThemeManager` di awal `initApp()`
    - Buat instance `StorageManager` terpisah untuk `'customCategories'`, `'spendingLimit'`, dan `'theme'`
    - Inisialisasi `categoryManager.load()` dan `themeManager.load()`
    - Muat `spendingLimit` dari localStorage
    - _Persyaratan: 3.6, 6.6, 7.4_

  - [x] 9.2 Perbarui konstruktor `UIManager` untuk menerima `categoryManager` dan referensi `spendingLimit`
    - Tambah parameter `categoryManager` ke konstruktor `UIManager`
    - Cache referensi DOM baru: `#theme-toggle`, `#spending-limit-input`, `#set-limit-btn`, `#spending-limit-warning`, `#new-category-input`, `#add-category-btn`, `#custom-category-list`, `#sort-by`, `#sort-order-btn`, `#prev-month-btn`, `#next-month-btn`, `#current-month-label`, `#monthly-summary-content`
    - _Persyaratan: 3.1, 4.1, 5.1, 6.1, 7.1_

  - [x] 9.3 Panggil render awal untuk semua komponen baru
    - Panggil `uiManager.updateCategoryOptions()` setelah `categoryManager.load()`
    - Panggil `uiManager.renderSortControls()`
    - Panggil `uiManager.renderMonthlySummary(currentMonthKey)` dengan bulan saat ini
    - Panggil `uiManager.updateSpendingLimit()` setelah memuat `spendingLimit`
    - _Persyaratan: 3.3, 4.1, 5.1, 6.6_

  - [x] 9.4 Tambah event handler untuk toggle tema
    - `#theme-toggle` click → `themeManager.toggle()`, perbarui ikon toggle
    - _Persyaratan: 7.1, 7.2, 7.3_

  - [x] 9.5 Tambah event handler untuk kategori kustom
    - `#add-category-btn` click → `categoryManager.addCategory(...)`, panggil `uiManager.updateCategoryOptions()` dan render ulang daftar kategori kustom di `#custom-category-list`
    - Event delegation pada `#custom-category-list` untuk tombol hapus → `categoryManager.removeCategory(...)`, perbarui UI
    - _Persyaratan: 3.1, 3.2, 3.5_

  - [x] 9.6 Tambah event handler untuk batas pengeluaran
    - `#set-limit-btn` click → validasi input, simpan ke localStorage, panggil `uiManager.updateSpendingLimit()`
    - _Persyaratan: 6.1, 6.2, 6.3_

  - [x] 9.7 Tambah event handler untuk kontrol pengurutan
    - `#sort-by` change → perbarui `currentSortBy`, panggil `uiManager.renderTransactionList()` dengan data terurut
    - `#sort-order-btn` click → toggle `currentSortOrder`, perbarui ikon, panggil `uiManager.renderTransactionList()`
    - Perbarui `renderTransactionList()` untuk menggunakan `getSortedTransactions(currentSortBy, currentSortOrder)`
    - _Persyaratan: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.8 Tambah event handler untuk navigasi ringkasan bulanan
    - `#prev-month-btn` click → dekrement `currentMonthKey`, panggil `uiManager.renderMonthlySummary(currentMonthKey)`
    - `#next-month-btn` click → inkremen `currentMonthKey`, panggil `uiManager.renderMonthlySummary(currentMonthKey)`
    - _Persyaratan: 4.4_

  - [x] 9.9 Perbarui handler form submit dan delete untuk memanggil metode baru
    - Setelah `addTransaction` berhasil: tambah panggilan `uiManager.updateSpendingLimit()` dan `uiManager.renderMonthlySummary(currentMonthKey)`
    - Setelah `deleteTransaction` berhasil: tambah panggilan `uiManager.updateSpendingLimit()` dan `uiManager.renderMonthlySummary(currentMonthKey)`
    - _Persyaratan: 6.2, 4.2_

  - [ ] 9.10 Tulis property test untuk round-trip batas pengeluaran (Properti 10)
    - **Properti 10: Round-Trip Batas Pengeluaran**
    - **Memvalidasi: Persyaratan 6.3, 6.6**
    - Generate nilai batas pengeluaran valid, simpan dan muat kembali — nilai harus identik

- [ ] 10. Checkpoint akhir — Verifikasi integrasi menyeluruh
  - Pastikan semua tes lulus dan semua fitur terintegrasi dengan benar, tanyakan kepada pengguna jika ada pertanyaan.

## Catatan

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan persyaratan spesifik untuk keterlacakan
- Property test menggunakan framework `fast-check` dengan minimum 100 iterasi
- Unit test menggunakan framework `Jest`
- Implementasi dilakukan secara bottom-up sesuai urutan yang disarankan
