# WhatsApp

Aplikasi web WhatsApp Business untuk mengelola percakapan pelanggan melalui **Meta WhatsApp Business Platform (Cloud API)**. Frontend dibangun menggunakan React, Vite, TypeScript, dan vite-plugin-pwa. Supabase digunakan sebagai backend, sedangkan GitHub Pages menjadi hosting untuk frontend statis.

> **Status:** Dokumentasi awal proyek. Fitur dan integrasi akan diimplementasikan bertahap; README ini tidak menyatakan bahwa seluruh fitur sudah tersedia.

## Teknologi

| Teknologi | Peran |
|---|---|
| React | Antarmuka pengguna |
| Vite | Development server dan build tool |
| TypeScript | Bahasa pemrograman dan type safety |
| vite-plugin-pwa | PWA, web app manifest, dan service worker |
| Supabase | Backend: PostgreSQL, Edge Functions, dan Realtime |
| Meta WhatsApp Business Platform | API resmi untuk komunikasi WhatsApp Business |
| GitHub Pages | Hosting frontend statis |

## Gambaran Arsitektur

```text
Pengguna
   |
   v
React + Vite + TypeScript
(PWA - GitHub Pages)
   |
   | HTTPS
   v
Supabase
   |-- PostgreSQL
   |-- Edge Functions
   |-- Realtime
   |
   | HTTPS / Webhook
   v
Meta WhatsApp Business Platform
(WhatsApp Cloud API)
```

### Tanggung jawab setiap bagian

- **Frontend:** menampilkan antarmuka aplikasi dan berkomunikasi dengan Supabase.
- **Supabase Database:** menyimpan data aplikasi seperti percakapan, pesan, kontak, dan status pesan sesuai skema yang nantinya ditetapkan.
- **Supabase Edge Functions:** menjadi lapisan server untuk proses yang membutuhkan kredensial rahasia, integrasi WhatsApp Cloud API, serta penerimaan dan validasi webhook Meta.
- **Supabase Realtime:** menyampaikan perubahan data ke frontend secara real-time.
- **Meta WhatsApp Cloud API:** menangani pengiriman dan penerimaan pesan WhatsApp Business.
- **GitHub Pages:** menyajikan hasil build frontend. GitHub Pages bukan tempat menjalankan API server atau webhook.

**Keamanan:** jangan menyimpan Meta access token, Supabase service-role key, atau kredensial rahasia lainnya di kode frontend maupun variabel environment berawalan `VITE_`. Simpan rahasia backend melalui Supabase Edge Function Secrets.

## Ruang Lingkup Fitur

Ruang lingkup awal aplikasi mencakup:

- Daftar percakapan dengan pencarian.
- Filter percakapan: All dan Unread.
- Tampilan kronologi pesan.
- Dukungan konten pesan teks dan media.
- Jenis media: Image, Video, Audio, dan Document.
- Informasi status pesan.
- Kontak: View, Search, dan pengelolaan manual Add/Edit.
- Pengelolaan data dengan tampilan List dan Detail serta aksi Create, Edit, dan Delete sesuai kebutuhan modul.
- Informasi akun WhatsApp Business.

Ketersediaan aksi dan jenis pesan tetap mengikuti dukungan serta izin Meta WhatsApp Business Platform.

## Persyaratan

Sebelum menjalankan proyek, siapkan:

- Node.js versi LTS.
- npm.
- Akun dan project Supabase.
- Akun Meta Developer dan konfigurasi WhatsApp Business Platform untuk integrasi API.

## Menjalankan Secara Lokal

1. Clone repository:

   ```bash
   git clone https://github.com/applestoree/whatsapp.git
   cd whatsapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Buat file environment lokal `.env.local` berdasarkan konfigurasi project:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   Ganti nilai contoh dengan URL dan anon/publishable key dari project Supabase. Nilai dengan prefix `VITE_` akan tersedia di bundle browser; jangan masukkan secret key atau Meta access token ke sini.

4. Jalankan development server:

   ```bash
   npm run dev
   ```

5. Buat production build:

   ```bash
   npm run build
   ```

6. Preview hasil build:

   ```bash
   npm run preview
   ```

> Perintah di atas merupakan alur standar proyek Vite. Pastikan script yang digunakan tersedia pada `package.json` proyek.

## Konfigurasi Supabase

Frontend menggunakan Supabase client untuk mengakses layanan yang diizinkan. Proses yang membutuhkan akses istimewa atau kredensial Meta harus dilakukan di sisi server melalui Supabase Edge Functions.

Konfigurasi backend yang perlu disiapkan saat implementasi:

1. Supabase project dan skema database.
2. Supabase Edge Functions untuk endpoint aplikasi dan integrasi WhatsApp Cloud API.
3. Webhook endpoint yang dapat diakses Meta melalui HTTPS.
4. Verifikasi webhook dan validasi signature sesuai panduan Meta.
5. Supabase Realtime untuk perubahan data yang perlu ditampilkan langsung.
6. Secrets untuk token dan kredensial backend.

Jangan menghubungkan webhook Meta langsung ke GitHub Pages karena GitHub Pages hanya menyediakan hosting statis.

## Deployment ke GitHub Pages

Repository: [applestoree/whatsapp](https://github.com/applestoree/whatsapp)

Target URL GitHub Pages:

**https://applestoree.github.io/whatsapp/**

Karena aplikasi dipublikasikan di subpath repository `/whatsapp/`, konfigurasi Vite perlu menggunakan base path berikut:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
    }),
  ],
  base: '/whatsapp/',
})
```

Sesuaikan konfigurasi plugin dengan kebutuhan aplikasi ketika konfigurasi Vite dibuat.

### Langkah publikasi

1. Push source code ke branch `main`.
2. Tambahkan GitHub Actions workflow untuk install dependencies, menjalankan build, dan mengunggah folder `dist` ke GitHub Pages.
3. Buka repository **Settings → Pages**.
4. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
5. Jalankan workflow dan periksa hasil deployment pada tab **Actions**.

Jika menggunakan React Router dengan browser history, siapkan strategi fallback untuk route selain root karena GitHub Pages merupakan static hosting dan tidak menyediakan rewrite server-side secara default.

GitHub Pages menggunakan HTTPS, yang diperlukan untuk fitur PWA seperti service worker. Supabase tetap harus di-host dan dikonfigurasi secara terpisah.

## Referensi Resmi

- [Meta — WhatsApp Business Platform Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview)
- [Meta — WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite — Deploying a Static Site / GitHub Pages](https://vite.dev/guide/static-deploy#github-pages)
- [GitHub Docs — Deploying to GitHub Pages](https://docs.github.com/en/pages)

## Lisensi

Lisensi proyek belum ditentukan.
