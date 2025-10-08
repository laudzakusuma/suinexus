# SuiNexus: Platform Pelacakan Rantai Pasok Berbasis Blockchain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![U2U Network](https://img.shields.io/badge/Network-U2U%20Testnet-blue)](https://u2u.xyz)
[![Built for BI-OJK Hackathon](https://img.shields.io/badge/Built%20for-BI--OJK%20Hackathon-green)](https://GANTI_DENGAN_URL_HACKATHON)

> **SuiNexus** adalah sebuah platform terdesentralisasi yang dirancang untuk meningkatkan transparansi, keterlacakan, dan efisiensi dalam manajemen rantai pasok. Dengan memanfaatkan arsitektur objek-sentris dari blockchain Sui, platform ini merepresentasikan aset fisik sebagai *Non-Fungible Tokens* (NFTs), memungkinkan pencatatan setiap langkah dalam siklus hidup produk secara *immutable* (tidak dapat diubah) dan dapat diverifikasi.

---

## Abstrak

Manajemen rantai pasok tradisional sering kali terfragmentasi, tidak efisien, dan kurang transparan, yang mengakibatkan kesulitan dalam melacak asal-usul produk, memverifikasi keaslian, dan mengidentifikasi titik kegagalan. SuiNexus mengatasi tantangan ini dengan menyediakan satu **sumber kebenaran** (*single source of truth*) yang terdistribusi dan dapat diaudit oleh semua pemangku kepentingan.

Setiap entitas dalam rantai pasok—mulai dari petani, pemroses, hingga distributor—dapat berinteraksi dengan aset digital yang merepresentasikan produk fisik. Setiap transaksi dan transformasi dicatat pada *ledger* blockchain yang aman, menciptakan jejak digital yang tidak dapat diubah dari hulu ke hilir.

---

## Fitur Utama

### Fungsionalitas Inti
- **Tokenisasi Aset**: Aset fisik, seperti hasil panen, diubah menjadi aset digital unik (NFT) di blockchain Sui, memberikan identitas digital yang tidak dapat dipalsukan.
- **Manajemen Entitas**: Pendaftaran dan pengelolaan identitas digital untuk semua pemangku kepentingan dalam rantai pasok (misalnya, petani, pabrik, distributor).
- **Pelacakan Aset Komprehensif**: Pemantauan pergerakan dan status aset secara *real-time* melalui antarmuka pengguna atau dengan memindai kode QR yang tertaut pada aset fisik.
- **Pencatatan Proses**: Kemampuan untuk mencatat setiap proses transformasi yang diterapkan pada aset—seperti pemrosesan, pengemasan, atau kontrol kualitas—dengan dukungan bukti media (foto/video).
- **Transfer dan Faktur Otomatis**: Transfer kepemilikan aset antar entitas yang disertai dengan pembuatan faktur (*invoice*) digital secara otomatis dalam bentuk NFT.
- **Analitik Rantai Pasok**: Dasbor analitik untuk memvisualisasikan data, mengidentifikasi hambatan (*bottlenecks*), dan mengukur metrik kinerja seperti waktu siklus dan efisiensi.
- **Pelacakan Geografis**: Pencatatan data lokasi berbasis GPS pada setiap tahapan penting untuk memetakan jejak geografis produk.

### Aspek Teknis
- **Integrasi Dompet Digital**: Interaksi yang aman dengan blockchain melalui integrasi dengan standar dompet Sui menggunakan `@mysten/dapp-kit`.
- **Notifikasi Real-Time**: Sistem notifikasi untuk memberitahu pengguna tentang peristiwa penting seperti transfer aset atau pembaruan status.
- **Dukungan Offline (PWA)**: Dirancang sebagai *Progressive Web App* (PWA) dengan kapabilitas *offline-first*, memanfaatkan IndexedDB untuk *caching* data dan memastikan fungsionalitas tetap berjalan saat koneksi internet tidak stabil.
- **Ekspor Data**: Fungsionalitas untuk mengekspor data analitik dan riwayat aset ke format standar seperti PDF.

---

## Arsitektur Sistem

SuiNexus mengadopsi arsitektur **monorepo** yang dikelola dengan npm/pnpm workspaces, memisahkan komponen-komponen logis ke dalam paket-paket independen.

```
suinexus/
├── packages/
│   ├── backend/          # API Service (Node.js/Express)
│   ├── frontend/         # Aplikasi Klien (React/Vite)
│   └── contracts/        # Smart Contracts (Sui Move)
└── ...
```

| Komponen | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Smart Contracts** | Sui Move | Inti dari logika bisnis terdesentralisasi. Mendefinisikan struktur data untuk Aset (`DynamicAssetNFT`), Entitas (`EntityObject`), dan Faktur (`InvoiceNFT`), serta fungsi untuk berinteraksi dengannya. |
| **Backend** | Node.js, Express | Berfungsi sebagai lapisan perantara antara klien dan blockchain Sui. Menyediakan API RESTful untuk kueri data yang kompleks dan agregasi. |
| **Frontend** | React, TypeScript, Vite | Antarmuka pengguna yang memungkinkan interaksi dengan *smart contract* melalui dompet digital dan menyajikan data rantai pasok dalam format yang mudah dipahami. |

---

## Prasyarat

- **Node.js**: Versi `18` atau lebih tinggi.
- **Manajer Paket**: `npm`, `yarn`, atau `pnpm`.
- **Sui Wallet**: Ekstensi peramban untuk interaksi dengan dApp.
- **Sui CLI**: Diperlukan untuk kompilasi dan deployment *smart contract*.

---

## Panduan Instalasi dan Menjalankan

### 1. Kloning Repositori
```bash
git clone [https://github.com/yourusername/suinexus.git](https://github.com/yourusername/suinexus.git)
cd suinexus
```

### 2. Instalasi Dependensi
Jalankan perintah berikut dari direktori root untuk menginstal semua dependensi di seluruh *workspace*.
```bash
npm install
```

### 3. Konfigurasi Lingkungan
Setiap paket (`backend` dan `frontend`) memerlukan file `.env` sendiri. Salin dari file `.env.example` yang tersedia dan sesuaikan nilainya.

- **Backend (`packages/backend/.env`)**:
    ```env
    PORT=3001
    SUI_NETWORK=devnet
    PACKAGE_ID=0x...
    MODULE_NAME=nexus
    CORS_ORIGIN=http://localhost:5173
    ```
- **Frontend (`packages/frontend/.env`)**:
    ```env
    VITE_API_BASE_URL=http://localhost:3001/api
    VITE_PACKAGE_ID=0x...
    VITE_MODULE_NAME=nexus
    VITE_SUI_NETWORK=devnet
    ```
    **Penting**: `PACKAGE_ID` harus diisi dengan ID yang didapat setelah men-deploy *smart contract*.

### 4. Deployment Smart Contract
```bash
# Arahkan ke direktori kontrak
cd packages/contracts

# Deploy ke jaringan yang diinginkan (contoh: devnet)
sui client publish --gas-budget 100000000
```
Salin **Package ID** dari hasil output dan masukkan ke dalam file `.env` backend dan frontend.

### 5. Menjalankan Aplikasi (Mode Pengembangan)
Gunakan perintah berikut dari direktori root untuk menjalankan backend dan frontend secara bersamaan.
```bash
npm run dev
```
- Backend akan berjalan di `http://localhost:3001`.
- Frontend akan berjalan di `http://localhost:5173`.

---

## Deployment Produksi

### **Backend**
Aplikasi backend dapat di-build dan dijalankan sebagai proses Node.js standar. Disarankan untuk men-deploy-nya sebagai kontainer Docker di platform seperti Railway, Render, atau layanan cloud lainnya.

### **Frontend**
Aplikasi frontend adalah aplikasi web statis. Setelah proses build, hasilnya (di dalam direktori `dist`) dapat di-deploy di platform hosting statis seperti Vercel atau Netlify.

### **Smart Contract**
Untuk men-deploy ke jaringan utama Sui, gunakan flag `--network mainnet`:
```bash
sui client publish --gas-budget 100000000 --network mainnet
```

---

## Kontribusi

Kontribusi pada proyek ini sangat dihargai. Silakan buat *fork* dari repositori ini, buat *branch* fitur baru (`git checkout -b feature/NamaFitur`), dan kirimkan *pull request* untuk ditinjau.

## Lisensi

Proyek ini dilisensikan di bawah **Lisensi MIT**.
