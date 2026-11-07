# School CMS — Backend API

REST API untuk **School CMS**, sistem manajemen konten (CMS) open-source untuk website sekolah.
Dibangun dengan **Express 5**, **PostgreSQL**, dan **Prisma ORM**.

> Frontend (website publik + panel admin): [`school-cms-fe`](https://github.com/dnngw/school-cms-fe)

## ✨ Fitur

- **Page builder** — tambah, hapus, duplikat, sembunyikan, dan urutkan section di beranda maupun halaman lain (17 tipe section: hero, statistik, sambutan kepala sekolah, program unggulan, berita, agenda, guru, galeri, testimoni, prestasi, FAQ, CTA/PPDB, kontak, mitra, video, teks bebas).
- **Kontrol tampilan** — style per section (background, warna teks, padding, lebar, varian layout) dan tema global (14 warna, font heading/body, ukuran font, radius, gaya tombol, header sticky, lebar kontainer).
- **Konten** — berita + kategori, halaman statis, agenda/acara, guru & staf, galeri + album, menu header/footer (dengan sub-menu).
- **Pengaturan situs** — identitas sekolah, kontak, media sosial, SEO, bar pengumuman, footer.
- **Pesan kontak** dari pengunjung (rate limit + honeypot anti-spam).
- **Media library** — upload gambar/PDF.
- **Autentikasi JWT** dengan role `admin` dan `editor`.

## 🧱 Tech stack

| Kebutuhan   | Library                                                           |
| ----------- | ----------------------------------------------------------------- |
| HTTP server | Express 5 (async error handling bawaan)                           |
| Database    | PostgreSQL + Prisma 7 (schema, migration, seed, type-safe client) |
| Validasi    | Zod                                                               |
| Auth        | jsonwebtoken + bcryptjs                                           |
| Keamanan    | helmet, cors, express-rate-limit, sanitize-html                   |
| Upload      | multer                                                            |
| Logging     | pino                                                              |
| Test        | node:test + supertest                                             |

## 🚀 Menjalankan secara lokal

Prasyarat: **Node.js ≥ 22.18** dan **PostgreSQL** (atau Docker).

```bash
# 1. Install dependency
npm install

# 2. Siapkan environment
cp .env.example .env          # lalu sesuaikan DATABASE_URL & JWT_SECRET

# 3. Buat database (atau: docker compose up -d db)
createdb school_cms

# 4. Migrasi + data contoh
npm run db:migrate            # terapkan semua migrasi (prisma migrate deploy)
npm run db:seed               # ⚠️ menghapus semua data lama

# 5. Jalankan
npm run dev                   # http://localhost:4000
```

Akun demo hasil seed:

| Role   | Email                   | Password     |
| ------ | ----------------------- | ------------ |
| admin  | `admin@sekolah.sch.id`  | `admin12345` |
| editor | `editor@sekolah.sch.id` | `admin12345` |

> Ganti password segera setelah login, atau set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` sebelum menjalankan seed.

## 📜 Scripts

| Script                                    | Keterangan                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`                             | Jalankan server dengan auto-reload (`node --watch`)                                 |
| `npm start`                               | Jalankan mode production                                                            |
| `npm run db:migrate`                      | Terapkan migrasi yang belum jalan (`prisma migrate deploy`) — aman untuk production |
| `npm run db:migrate:dev -- --name <nama>` | Buat migrasi baru dari perubahan `schema.prisma` lalu terapkan (development)        |
| `npm run db:status`                       | Lihat status migrasi                                                                |
| `npm run db:seed`                         | Isi data contoh (⚠️ menghapus semua data)                                           |
| `npm run db:reset`                        | Hapus database, migrasi ulang, lalu seed                                            |
| `npm run db:studio`                       | Buka Prisma Studio (GUI untuk melihat/mengubah data)                                |
| `npm run db:generate`                     | Generate ulang Prisma Client (otomatis saat `npm install`)                          |
| `npm test`                                | Jalankan test                                                                       |
| `npm run lint` / `format`                 | ESLint / Prettier                                                                   |

## 🗄️ Database & migrasi (Prisma)

Struktur database didefinisikan di **`prisma/schema.prisma`**. Model memakai camelCase di JavaScript
dan dipetakan ke tabel/kolom snake_case di PostgreSQL dengan `@map` / `@@map`.

Alur mengubah struktur database:

```bash
# 1. Edit prisma/schema.prisma, misalnya tambah kolom:  nip String? @db.VarChar(30)
# 2. Buat + jalankan migrasi (file SQL baru muncul di prisma/migrations/)
npm run db:migrate:dev -- --name add_nip_to_staff
# 3. Commit schema.prisma DAN folder migrasi baru
```

- Jangan mengedit file migrasi yang sudah di-commit — selalu buat migrasi baru.
- Di server production cukup jalankan `npm run db:migrate`.
- Prisma Client di-generate ke `src/generated/prisma` (tidak di-commit). Node ≥ 22.18 menjalankan file
  TypeScript hasil generate secara langsung, jadi kode aplikasi tetap JavaScript biasa.

## 🗂️ Struktur folder

```
prisma/
├── schema.prisma          # ⭐ Definisi semua tabel, relasi, enum
├── migrations/            # File SQL migrasi (dibuat oleh Prisma)
└── seed.js                # Data contoh
prisma.config.js           # Konfigurasi Prisma CLI
src/
├── app.js                 # Membuat Express app (dipisah dari server agar mudah dites)
├── server.js              # Entry point: listen port + graceful shutdown
├── config/                # env (divalidasi Zod) & logger
├── db/prisma.js           # Prisma Client (satu instance untuk seluruh app)
├── generated/prisma/      # Hasil `prisma generate` (diabaikan git)
├── middlewares/           # auth, validate, upload, rate-limit, error-handler
├── modules/               # Satu folder per fitur
│   └── posts/
│       ├── posts.routes.js      # Definisi endpoint + middleware
│       ├── posts.controller.js  # Layer HTTP: baca req, kirim res
│       ├── posts.service.js     # Business logic + query database
│       └── posts.schema.js      # Skema validasi Zod
├── routes/index.js        # Menggabungkan semua router
└── utils/                 # Helper (ApiError, pagination, slug, sanitize, ...)
```

**Alur request:** `routes → middleware (auth/validate) → controller → service → database`.
Controller tidak boleh berisi query, service tidak boleh menyentuh `req`/`res`.

## 🔌 Ringkasan API

Base URL: `/api/v1`. Respons sukses: `{ data, meta? }`. Respons error: `{ error: { code, message, details? } }`.

| Prefix      | Akses          | Keterangan                                                                                                           |
| ----------- | -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/auth`     | publik / token | `POST /login`, `GET /me`, `PATCH /me`, `PUT /me/password`                                                            |
| `/public/*` | publik         | `settings`, `menus`, `sections`, `posts`, `categories`, `pages/:slug`, `events`, `staff`, `gallery`, `POST messages` |
| `/admin/*`  | token          | CRUD semua resource + `dashboard`, `media`, `users` (admin), `settings/:key` (admin)                                 |

Contoh:

```bash
curl -X POST localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@sekolah.sch.id","password":"admin12345"}'

curl localhost:4000/api/v1/admin/dashboard -H "Authorization: Bearer <token>"
```

### Menambah tipe section baru

1. Tambahkan nama tipe di `src/modules/sections/sections.constants.js`.
2. Daftarkan renderer + field editor-nya di frontend (`src/features/sections/registry.js`).

## 🐳 Docker

```bash
docker compose up -d   # PostgreSQL + API di http://localhost:4000
docker compose exec api npx prisma db seed   # opsional: data contoh
```


## 📄 Lisensi

[MIT](./LICENSE)
