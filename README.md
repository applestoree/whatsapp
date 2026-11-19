# WhatsApp

Frontend **WhatsApp UI (mobile only)** untuk mengelola percakapan WhatsApp Business. Antarmuka dibangun menggunakan React, Vite, TypeScript, dan vite-plugin-pwa dengan pendekatan khusus perangkat mobile. Supabase digunakan sebagai backend, Meta WhatsApp Business Platform (Cloud API) sebagai layanan messaging, dan GitHub Pages sebagai hosting frontend statis.

> **Status proyek:** Dokumentasi awal. Repository saat ini baru berisi README.md; source code aplikasi, `package.json`, konfigurasi PWA, dan workflow deployment belum tersedia. Perintah dan konfigurasi di bawah merupakan panduan implementasi, bukan bukti bahwa aplikasi sudah dapat dijalankan atau telah dipublikasikan.

## Teknologi

| Teknologi | Peran |
|---|---|
| React | Frontend WhatsApp UI khusus mobile |
| Vite | Development server dan build tool |
| TypeScript | Bahasa pemrograman dan type safety |
| vite-plugin-pwa | PWA, web app manifest, dan service worker |
| Supabase | Backend: PostgreSQL, Edge Functions, dan Realtime |
| Meta WhatsApp Business Platform | API resmi untuk komunikasi WhatsApp Business |
| GitHub Pages | Hosting frontend statis |

## Frontend WhatsApp UI — Mobile Only

Aplikasi ini berfokus pada pengalaman antarmuka WhatsApp di perangkat mobile.

- **Target perangkat:** smartphone / mobile browser.
- **Layout:** mobile-first, satu kolom, dengan navigasi dan area percakapan yang dirancang untuk layar kecil.
- **Zoom:** zoom pengguna harus dinonaktifkan sepenuhnya pada UI aplikasi, termasuk pinch-to-zoom dan double-tap zoom pada perangkat mobile serta browser zoom melalui gesture/shortcut sejauh dapat dikendalikan oleh browser. Gunakan konfigurasi viewport `user-scalable=no`, `maximum-scale=1`, dan `minimum-scale=1`, serta pencegahan gesture zoom yang relevan.
- **Desktop:** bukan target desain; tidak disediakan layout desktop atau desktop-responsive khusus.
- **PWA:** dapat dipasang sebagai aplikasi web pada perangkat yang mendukung fitur PWA.

### Kebijakan Zoom

Persyaratan UI: aplikasi tidak menyediakan fitur zoom. Implementasi frontend harus berupaya mencegah:

- Pinch-to-zoom dan double-tap zoom pada browser mobile.
- Browser zoom melalui `Ctrl/Cmd +` dan `Ctrl/Cmd -`.
- Zoom melalui `Ctrl/Cmd + scroll` sejauh dapat dikendalikan oleh browser.

Viewport yang ditargetkan:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no" />
```

Pencegahan gesture harus diterapkan dengan event handling yang sesuai, tanpa mengganggu scroll normal dan interaksi kontrol. Ketentuan ini belum diimplementasikan atau diuji karena source code frontend belum tersedia.

**Batasan platform:** browser atau sistem operasi dapat mengabaikan pembatasan zoom demi aksesibilitas. Karena itu, aplikasi menargetkan pemblokiran semaksimal yang diizinkan platform, tetapi tidak dapat menjamin override terhadap pengaturan aksesibilitas/browser.

## Struktur Komponen Frontend

Struktur komponen frontend yang telah disetujui:

```text
App
├── AppShell
│   ├── Header
│   ├── AppContent
│   │   ├── ChatsPage
│   │   │   └── ChatList
│   │   │       └── ChatListItem
│   │   └── SettingsPage
│   └── BottomNavigation
│
├── ChatDetailPage (Standalone)
│   ├── ChatHeader
│   ├── MessageList
│   │   ├── MessageBubble
│   │   ├── MessageStatus
│   │   └── MessageMedia
│   └── MessageInput
│
└── Overlay
```

- `AppShell` menjadi kerangka halaman utama yang memuat `Header`, `AppContent`, dan `BottomNavigation`.
- `AppContent` menjadi area konten untuk `ChatsPage` dan `SettingsPage`.
- `ChatDetailPage` merupakan halaman standalone, berada langsung di bawah `App` dan tidak berada di dalam `AppShell`.
- `Overlay` merupakan komponen tingkat aplikasi yang berada langsung di bawah `App`.

Nama dan hierarki komponen mengikuti struktur yang disetujui. Detail implementasi internal masing-masing komponen belum ditetapkan di bagian ini.

## Gambaran Arsitektur

```text
                    Pengiriman pesan
Frontend WhatsApp UI ----------------------+
        |                                  |
        | HTTPS                            v
        v                         Meta WhatsApp Cloud API
Supabase Edge Functions <-----------------+
        ^                       Webhook pesan/status
        |
        | Database + Realtime
        v
Supabase PostgreSQL
        |
        +-------------------------------> Frontend WhatsApp UI

Frontend di-host sebagai static site melalui GitHub Pages.
```

### Tanggung jawab setiap bagian

- **Frontend WhatsApp UI (mobile only):** menampilkan antarmuka percakapan untuk perangkat mobile dan berkomunikasi dengan Supabase.
- **Supabase Database:** menyimpan data aplikasi seperti percakapan, pesan, kontak, dan status pesan sesuai skema yang nantinya ditetapkan.
- **Supabase Edge Functions:** menjadi lapisan server untuk proses yang membutuhkan kredensial rahasia, mengirim permintaan ke WhatsApp Cloud API, serta menerima dan memvalidasi webhook Meta.
- **Meta WhatsApp Cloud API:** menerima permintaan pengiriman dari Edge Functions dan mengirim webhook berisi pesan masuk atau pembaruan status ke endpoint webhook Supabase.
- **Supabase Realtime:** menyampaikan perubahan data yang telah disimpan di database ke frontend secara real-time.
- **Meta WhatsApp Cloud API:** menangani pengiriman dan penerimaan pesan WhatsApp Business.
- **GitHub Pages:** menyajikan hasil build frontend. GitHub Pages bukan tempat menjalankan API server atau webhook.

**Keamanan:** jangan menyimpan Meta access token, Supabase service-role key, atau kredensial rahasia lainnya di kode frontend maupun variabel environment berawalan `VITE_`. Simpan rahasia backend melalui Supabase Edge Function Secrets.

## Ruang Lingkup Fitur

Ruang lingkup fitur yang disetujui (Requirement V7) dikelompokkan sebagai berikut:

### Conversation

- Menampilkan daftar percakapan.
- Search percakapan.
- Filter All dan Unread.
- Menampilkan kronologi pesan.

### Message

- Mendukung pesan Text.
- Mendukung media Image, Video, Audio, dan Document.
- Menampilkan informasi status pesan.

### Contact

- View dan Search kontak.
- Add dan Edit kontak secara manual.

### Data Management

- Tampilan List dan Detail.
- Aksi Create, Edit, dan Delete sesuai modul serta sumber data yang ditetapkan.

### Account

- Menampilkan informasi akun WhatsApp Business.

Ketersediaan aksi dan jenis pesan tetap mengikuti dukungan, izin, dan kebijakan Meta WhatsApp Business Platform. Daftar ini mendokumentasikan ruang lingkup yang disetujui, bukan menyatakan bahwa fitur telah diimplementasikan.

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

> **Status:** langkah ini belum dapat dijalankan pada repository saat ini karena `package.json` dan source code belum tersedia. Perintah tersebut merupakan alur standar yang akan digunakan setelah aplikasi diinisialisasi.

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

URL di atas adalah **target URL**, bukan konfirmasi bahwa website sudah dipublikasikan. Repository saat ini belum memiliki source code atau workflow deployment.

Karena target aplikasi berada di subpath repository `/whatsapp/`, konfigurasi Vite saat implementasi perlu menggunakan base path berikut:

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

Sesuaikan konfigurasi plugin dengan kebutuhan aplikasi ketika konfigurasi Vite dibuat. Konfigurasi ini hanya contoh dan belum ada di repository.

### Langkah publikasi

1. Implementasikan aplikasi dan pastikan `npm run build` menghasilkan folder `dist`.
2. Tambahkan GitHub Actions workflow untuk install dependencies, menjalankan build, dan mengunggah folder `dist` sebagai artifact GitHub Pages.
3. Buka repository **Settings → Pages**.
4. Pada **Build and deployment → Source**, pilih **GitHub Actions**.
5. Jalankan workflow dan periksa hasil deployment pada tab **Actions**.

Workflow belum tersedia pada repository saat ini.

### PWA dan routing pada subpath

- Pastikan Vite `base` menggunakan `/whatsapp/`.
- Konfigurasikan manifest PWA dengan `start_url` dan `scope` yang sesuai dengan subpath aplikasi.
- Pastikan asset manifest, icon, dan service worker menggunakan path yang benar.
- Tentukan strategi caching service worker dan uji pembaruan versi aplikasi.
- Jika menggunakan React Router dengan browser history, siapkan fallback route yang kompatibel dengan GitHub Pages. Alternatifnya, gunakan routing berbasis hash agar navigasi tidak memerlukan rewrite server-side.
- Uji direct navigation, refresh halaman pada nested route, instalasi PWA, dan pembaruan service worker setelah deployment.

GitHub Pages menggunakan HTTPS, yang diperlukan untuk fitur PWA seperti service worker. Supabase tetap harus di-host dan dikonfigurasi secara terpisah.

## Referensi Resmi

- [Meta — WhatsApp Business Platform Overview](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview)
- [Meta — WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite — Deploying a Static Site / GitHub Pages](https://vite.dev/guide/static-deploy#github-pages)
- [GitHub Docs — Deploying to GitHub Pages](https://docs.github.com/en/pages)

## Lisensi

Lisensi proyek belum ditentukan.
