# Dokumen Persyaratan

## Pendahuluan

Fitur ini meningkatkan aplikasi Expense & Budget Visualizer yang sudah ada dengan tujuh peningkatan: pembaruan tampilan UI modern, penggantian mata uang ke Rupiah (Rp), penambahan kategori kustom, tampilan ringkasan bulanan, pengurutan transaksi, peringatan batas pengeluaran, dan toggle mode gelap/terang. Semua peningkatan bersifat client-side dan mempertahankan arsitektur vanilla JavaScript yang sudah ada.

## Glosarium

- **Aplikasi**: Expense & Budget Visualizer web application
- **Transaksi**: Catatan pengeluaran yang berisi nama item, jumlah, dan kategori
- **Kategori**: Klasifikasi transaksi (Food, Transport, Fun, atau kustom)
- **Kategori_Kustom**: Kategori yang dibuat oleh pengguna di luar kategori default
- **Saldo**: Total kumulatif dari semua jumlah transaksi
- **Local_Storage**: API penyimpanan persisten berbasis browser
- **Daftar_Transaksi**: Tampilan scrollable dari semua transaksi
- **Formulir_Input**: Antarmuka pengguna untuk menambahkan transaksi baru
- **Grafik**: Visualisasi pie chart yang menampilkan distribusi pengeluaran
- **Ringkasan_Bulanan**: Tampilan agregat pengeluaran yang dikelompokkan per bulan
- **Batas_Pengeluaran**: Nilai ambang batas yang ditetapkan pengguna untuk total pengeluaran
- **Tema**: Skema warna aplikasi (mode terang atau mode gelap)
- **Rupiah**: Mata uang Indonesia dengan simbol "Rp"

## Persyaratan

### Persyaratan 1: Pembaruan UI Modern

**User Story:** Sebagai pengguna, saya ingin tampilan antarmuka yang lebih modern dan menarik, sehingga pengalaman menggunakan aplikasi terasa lebih nyaman dan profesional.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menggunakan palet warna modern dengan gradien, aksen warna yang lebih hidup, dan kontras yang lebih tinggi dibandingkan desain sebelumnya
2. THE Aplikasi SHALL menerapkan tipografi yang lebih modern dengan hierarki visual yang jelas pada semua elemen teks
3. THE Aplikasi SHALL menampilkan kartu (card) dengan bayangan (shadow) yang lebih dalam dan sudut membulat yang lebih besar untuk setiap seksi
4. THE Aplikasi SHALL mempertahankan responsivitas pada lebar minimum 320px
5. THE Aplikasi SHALL mempertahankan semua standar aksesibilitas yang sudah ada (kontras warna, ukuran font minimum 14px, target sentuh minimum 44px)

### Persyaratan 2: Mata Uang Rupiah

**User Story:** Sebagai pengguna, saya ingin semua nilai uang ditampilkan dalam format Rupiah (Rp), sehingga tampilan sesuai dengan konteks penggunaan di Indonesia.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menampilkan semua nilai mata uang dengan prefiks "Rp" dan format pemisah ribuan menggunakan titik (contoh: Rp 1.500.000)
2. THE Aplikasi SHALL menampilkan Saldo dengan format Rupiah pada bagian atas antarmuka
3. FOR EACH Transaksi dalam Daftar_Transaksi, THE Aplikasi SHALL menampilkan jumlah dalam format Rupiah
4. THE Formulir_Input SHALL menampilkan label "Jumlah (Rp)" pada field input jumlah
5. THE Aplikasi SHALL menerima input jumlah sebagai bilangan bulat positif (tanpa desimal) karena Rupiah tidak menggunakan sen

### Persyaratan 3: Kategori Kustom

**User Story:** Sebagai pengguna, saya ingin membuat kategori pengeluaran sendiri, sehingga saya dapat melacak pengeluaran sesuai kebutuhan spesifik saya.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan antarmuka untuk menambahkan nama Kategori_Kustom baru
2. WHEN sebuah Kategori_Kustom dibuat, THE Aplikasi SHALL menyimpannya ke Local_Storage dalam 100ms
3. THE Formulir_Input SHALL menyertakan semua Kategori_Kustom dalam pilihan kategori bersama kategori default
4. THE Grafik SHALL menampilkan Kategori_Kustom bersama kategori default
5. IF nama Kategori_Kustom kosong atau sudah ada, THEN THE Aplikasi SHALL menampilkan pesan kesalahan validasi
6. THE Aplikasi SHALL memuat semua Kategori_Kustom dari Local_Storage saat aplikasi dimulai

### Persyaratan 4: Tampilan Ringkasan Bulanan

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pengeluaran per bulan, sehingga saya dapat memantau tren pengeluaran dari waktu ke waktu.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan antarmuka Ringkasan_Bulanan yang dapat diakses dari tampilan utama
2. THE Aplikasi SHALL mengelompokkan Transaksi berdasarkan bulan dan tahun dari tanggal pembuatan
3. FOR EACH bulan, THE Aplikasi SHALL menampilkan total pengeluaran dan jumlah transaksi
4. THE Aplikasi SHALL menyediakan navigasi untuk berpindah antar bulan yang berbeda
5. WHEN tidak ada Transaksi pada bulan tertentu, THE Aplikasi SHALL menampilkan pesan "Tidak ada transaksi pada bulan ini"

### Persyaratan 5: Pengurutan Transaksi

**User Story:** Sebagai pengguna, saya ingin mengurutkan transaksi, sehingga saya dapat menemukan entri tertentu dengan lebih mudah.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan kontrol untuk mengurutkan Transaksi berdasarkan jumlah
2. THE Aplikasi SHALL menyediakan kontrol untuk mengurutkan Transaksi berdasarkan Kategori
3. WHEN kontrol pengurutan diaktifkan, THE Daftar_Transaksi SHALL diurutkan ulang dalam 100ms
4. THE Aplikasi SHALL mendukung urutan menaik (ascending) dan menurun (descending)
5. WHEN tidak ada kontrol pengurutan yang aktif, THE Daftar_Transaksi SHALL ditampilkan dalam urutan penambahan (terbaru di atas)

### Persyaratan 6: Peringatan Batas Pengeluaran

**User Story:** Sebagai pengguna, saya ingin mendapat peringatan ketika pengeluaran melebihi batas yang saya tetapkan, sehingga saya dapat mengendalikan anggaran saya.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan antarmuka untuk menetapkan nilai Batas_Pengeluaran
2. WHEN Saldo melebihi Batas_Pengeluaran, THE Aplikasi SHALL menampilkan peringatan visual yang jelas
3. THE Aplikasi SHALL menyimpan Batas_Pengeluaran ke Local_Storage
4. WHEN Saldo melebihi Batas_Pengeluaran, THE Aplikasi SHALL menyorot tampilan Saldo dengan warna peringatan
5. WHEN Saldo kembali di bawah Batas_Pengeluaran, THE Aplikasi SHALL menghapus tampilan peringatan
6. WHEN aplikasi dimuat, THE Aplikasi SHALL memuat Batas_Pengeluaran dari Local_Storage dan mengevaluasi kondisi peringatan

### Persyaratan 7: Toggle Mode Gelap/Terang

**User Story:** Sebagai pengguna, saya ingin beralih antara mode gelap dan terang, sehingga saya dapat menggunakan aplikasi dengan nyaman dalam kondisi pencahayaan yang berbeda.

#### Kriteria Penerimaan

1. THE Aplikasi SHALL menyediakan kontrol toggle tema yang terlihat jelas di antarmuka
2. WHEN toggle diaktifkan, THE Aplikasi SHALL beralih antara skema warna gelap dan terang dalam 150ms
3. THE Aplikasi SHALL menyimpan preferensi tema ke Local_Storage
4. WHEN aplikasi dimuat, THE Aplikasi SHALL menerapkan preferensi tema yang tersimpan
5. WHERE mode gelap aktif, THE Aplikasi SHALL memastikan kontras warna tetap memenuhi standar keterbacaan (rasio kontras minimum 4.5:1 untuk teks normal)
6. WHERE mode terang aktif, THE Aplikasi SHALL menggunakan skema warna terang sebagai tampilan default

## Persyaratan Opsional

### Persyaratan Opsional A: Kategori Kustom

*(Sudah dijabarkan sebagai Persyaratan 3 di atas)*

### Persyaratan Opsional B: Ringkasan Bulanan

*(Sudah dijabarkan sebagai Persyaratan 4 di atas)*

### Persyaratan Opsional C: Pengurutan Transaksi

*(Sudah dijabarkan sebagai Persyaratan 5 di atas)*

### Persyaratan Opsional D: Peringatan Batas Pengeluaran

*(Sudah dijabarkan sebagai Persyaratan 6 di atas)*

### Persyaratan Opsional E: Toggle Mode Gelap/Terang

*(Sudah dijabarkan sebagai Persyaratan 7 di atas)*
