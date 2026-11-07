/**
 * Demo data seed — run with `npm run db:seed` (prisma db seed).
 * ⚠️ It wipes ALL data first. Never run it on a production database with real content.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/db/prisma.js';

/** Placeholder images (replace them from the CMS media library). */
const img = (seed, w = 1200, h = 800) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const daysFromNow = (days, hour = 8) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function resetDatabase() {
  await prisma.$executeRaw`
    TRUNCATE users, settings, categories, posts, pages, events, sections, menu_items,
             staff, gallery_items, messages, media RESTART IDENTITY CASCADE`;
}

async function seedUsers() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin12345', 12);
  const [admin] = await prisma.user.createManyAndReturn({
    data: [
      {
        name: 'Administrator',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@sekolah.sch.id',
        passwordHash,
        role: 'admin',
      },
      { name: 'Editor Berita', email: 'editor@sekolah.sch.id', passwordHash, role: 'editor' },
    ],
  });
  return admin;
}

async function seedSettings() {
  // Only override what differs from the defaults in settings.defaults.js
  await prisma.setting.createMany({
    data: [
      {
        key: 'general',
        value: {
          siteName: 'SMA Nusantara',
          tagline: 'Cerdas, Berkarakter, dan Berprestasi',
          npsn: '20100000',
          accreditation: 'A',
          foundedYear: '1985',
          principalName: 'Dr. Siti Rahmawati, M.Pd.',
        },
      },
      {
        key: 'announcement',
        value: {
          enabled: true,
          text: 'Pendaftaran Peserta Didik Baru (PPDB) tahun ajaran baru telah dibuka!',
          link: '/halaman/ppdb',
        },
      },
      {
        key: 'footer',
        value: {
          about:
            'SMA Nusantara berkomitmen mencetak generasi yang unggul dalam ilmu pengetahuan, teknologi, dan berakhlak mulia.',
          copyright: '',
        },
      },
    ],
  });
}

async function seedPosts(authorId) {
  const [berita, pengumuman, prestasi] = await prisma.category.createManyAndReturn({
    data: [
      { name: 'Berita', slug: 'berita' },
      { name: 'Pengumuman', slug: 'pengumuman' },
      { name: 'Prestasi', slug: 'prestasi' },
    ],
  });

  const paragraph =
    '<p>Kegiatan ini diikuti dengan antusias oleh seluruh warga sekolah. Kepala sekolah menyampaikan bahwa kegiatan seperti ini penting untuk membangun karakter dan kreativitas siswa.</p><p>Ke depan, sekolah akan terus mengadakan program-program positif yang mendukung pengembangan potensi peserta didik secara menyeluruh.</p>';

  const posts = [
    ['Siswa SMA Nusantara Raih Medali Emas Olimpiade Sains Nasional', prestasi.id, true],
    ['Penerimaan Peserta Didik Baru Tahun Ajaran Baru Telah Dibuka', pengumuman.id, true],
    ['Peringatan Hari Guru Nasional Berlangsung Meriah', berita.id, false],
    ['Kunjungan Industri Kelas XI ke Kawasan Teknologi', berita.id, false],
    ['Jadwal Penilaian Akhir Semester Ganjil', pengumuman.id, false],
    ['Tim Basket Putri Juara Turnamen Antar Pelajar', prestasi.id, false],
  ];

  await prisma.post.createMany({
    data: posts.map(([title, categoryId, featured], i) => ({
      title,
      slug: slugify(title),
      excerpt: `${title}. Simak informasi selengkapnya di website resmi SMA Nusantara.`,
      content: `<p><strong>${title}.</strong></p>${paragraph}`,
      coverImage: img(`post-${i}`),
      categoryId,
      authorId,
      status: 'published',
      isFeatured: featured,
      publishedAt: daysFromNow(-i * 3),
      views: Math.floor(Math.random() * 500),
    })),
  });
}

async function seedPages() {
  await prisma.page.createMany({
    data: [
      {
        title: 'Visi & Misi',
        slug: 'visi-misi',
        status: 'published',
        content:
          '<h2>Visi</h2><p>Terwujudnya peserta didik yang beriman, cerdas, terampil, dan berwawasan global.</p><h2>Misi</h2><ul><li>Menyelenggarakan pembelajaran yang aktif, kreatif, dan menyenangkan.</li><li>Menumbuhkan budaya literasi dan riset.</li><li>Membentuk karakter disiplin, jujur, dan peduli lingkungan.</li></ul>',
      },
      {
        title: 'Sejarah Sekolah',
        slug: 'sejarah',
        status: 'published',
        content:
          '<p>SMA Nusantara didirikan pada tahun 1985 dengan semangat memajukan pendidikan di daerah. Berawal dari 3 ruang kelas, kini sekolah telah berkembang dengan fasilitas modern dan ribuan alumni yang tersebar di berbagai bidang.</p>',
      },
      {
        title: 'PPDB',
        slug: 'ppdb',
        status: 'published',
        content:
          '<p>Informasi lengkap Penerimaan Peserta Didik Baru. Silakan hubungi panitia PPDB melalui kontak di bawah ini.</p><ol><li>Isi formulir pendaftaran</li><li>Unggah dokumen persyaratan</li><li>Ikuti tes seleksi</li><li>Pengumuman hasil</li></ol>',
      },
    ],
  });
}

async function seedEvents() {
  await prisma.event.createMany({
    data: [
      {
        title: 'Penilaian Akhir Semester',
        slug: 'penilaian-akhir-semester',
        location: 'Ruang Kelas',
        startAt: daysFromNow(10),
        endAt: daysFromNow(16, 12),
        description: '<p>Pelaksanaan PAS untuk seluruh kelas.</p>',
        coverImage: img('event-1'),
      },
      {
        title: 'Pentas Seni dan Budaya',
        slug: 'pentas-seni-dan-budaya',
        location: 'Aula Sekolah',
        startAt: daysFromNow(20, 9),
        description: '<p>Penampilan kreativitas siswa dalam seni tari, musik, dan teater.</p>',
        coverImage: img('event-2'),
      },
      {
        title: 'Rapat Komite dan Orang Tua',
        slug: 'rapat-komite-dan-orang-tua',
        location: 'Ruang Pertemuan',
        startAt: daysFromNow(5, 13),
        description: '<p>Rapat koordinasi program sekolah bersama komite dan orang tua siswa.</p>',
        coverImage: img('event-3'),
      },
    ],
  });
}

async function seedSchoolData() {
  const staff = [
    ['Dr. Siti Rahmawati, M.Pd.', 'Kepala Sekolah', null],
    ['Budi Santoso, S.Pd.', 'Wakil Kepala Kurikulum', 'Matematika'],
    ['Dewi Lestari, S.Pd.', 'Guru', 'Bahasa Indonesia'],
    ['Ahmad Fauzi, S.Si.', 'Guru', 'Fisika'],
    ['Rina Wulandari, S.Pd.', 'Guru', 'Bahasa Inggris'],
    ['Hendra Gunawan, S.Kom.', 'Guru', 'Informatika'],
    ['Maya Sari, S.Pd.', 'Guru', 'Biologi'],
    ['Agus Pratama, S.Or.', 'Guru', 'Pendidikan Jasmani'],
  ];
  await prisma.staff.createMany({
    data: staff.map(([name, position, subject], i) => ({
      name,
      position,
      subject,
      photo: img(`staff-${i}`, 400, 400),
      sortOrder: i,
    })),
  });

  const albums = ['Kegiatan', 'Fasilitas', 'Prestasi'];
  await prisma.galleryItem.createMany({
    data: Array.from({ length: 9 }, (_, i) => ({
      title: `Dokumentasi ${albums[i % 3]} ${i + 1}`,
      image: img(`gallery-${i}`),
      album: albums[i % 3],
      sortOrder: i,
    })),
  });
}

async function seedMenus() {
  const header = (label, url, sortOrder, parentId = null) => ({
    location: 'header',
    label,
    url,
    sortOrder,
    parentId,
  });
  await prisma.menuItem.create({ data: header('Beranda', '/', 0) });
  const profil = await prisma.menuItem.create({ data: header('Profil', '#', 1) });
  await prisma.menuItem.createMany({
    data: [
      header('Visi & Misi', '/halaman/visi-misi', 0, profil.id),
      header('Sejarah', '/halaman/sejarah', 1, profil.id),
      header('Guru & Staf', '/guru', 2, profil.id),
      header('Berita', '/berita', 2),
      header('Agenda', '/agenda', 3),
      header('Galeri', '/galeri', 4),
      header('Kontak', '/kontak', 5),
      { location: 'footer', label: 'PPDB', url: '/halaman/ppdb', sortOrder: 0 },
      { location: 'footer', label: 'Berita', url: '/berita', sortOrder: 1 },
      { location: 'footer', label: 'Agenda', url: '/agenda', sortOrder: 2 },
      { location: 'footer', label: 'Kontak', url: '/kontak', sortOrder: 3 },
    ],
  });
}

/** Home page sections (page builder). Content keys must match the frontend section registry. */
async function seedSections() {
  const sections = [
    [
      'hero',
      'Hero Banner',
      {
        badge: 'Terakreditasi A',
        title: 'Membangun Generasi Unggul dan Berkarakter',
        subtitle:
          'Sekolah dengan kurikulum modern, guru berpengalaman, dan lingkungan belajar yang nyaman.',
        image: img('hero', 1600, 900),
        overlayOpacity: 55,
        primaryLabel: 'Daftar Sekarang',
        primaryUrl: '/halaman/ppdb',
        secondaryLabel: 'Profil Sekolah',
        secondaryUrl: '/halaman/visi-misi',
      },
      { variant: 'centered', paddingY: 'xl' },
    ],
    [
      'stats',
      'Statistik',
      {
        items: [
          { value: '1.200+', label: 'Siswa Aktif', icon: 'Users' },
          { value: '85', label: 'Guru & Staf', icon: 'GraduationCap' },
          { value: '150+', label: 'Prestasi', icon: 'Trophy' },
          { value: '1985', label: 'Tahun Berdiri', icon: 'School' },
        ],
      },
      { background: 'primary', paddingY: 'md' },
    ],
    [
      'principal',
      'Sambutan Kepala Sekolah',
      {
        eyebrow: 'Sambutan',
        title: 'Selamat Datang di SMA Nusantara',
        name: 'Dr. Siti Rahmawati, M.Pd.',
        role: 'Kepala Sekolah',
        photo: img('principal', 600, 700),
        message:
          '<p>Puji syukur kami panjatkan atas hadirnya website resmi sekolah ini sebagai sarana informasi dan komunikasi bagi seluruh warga sekolah dan masyarakat.</p><p>Kami berkomitmen memberikan layanan pendidikan terbaik untuk mewujudkan generasi yang cerdas dan berakhlak mulia.</p>',
      },
      {},
    ],
    [
      'programs',
      'Program Unggulan',
      {
        eyebrow: 'Program',
        title: 'Program Unggulan Kami',
        subtitle: 'Beragam program untuk mengembangkan potensi akademik dan non-akademik siswa.',
        columns: 3,
        items: [
          {
            icon: 'FlaskConical',
            title: 'Kelas Sains',
            description: 'Pembinaan olimpiade dan riset ilmiah remaja.',
          },
          {
            icon: 'Laptop',
            title: 'Digital Learning',
            description: 'Pembelajaran berbasis teknologi dan coding.',
          },
          {
            icon: 'Languages',
            title: 'Bilingual Class',
            description: 'Penguatan bahasa Inggris dalam pembelajaran.',
          },
          {
            icon: 'BookOpen',
            title: 'Tahfidz & Literasi',
            description: 'Pembiasaan membaca dan hafalan setiap hari.',
          },
          {
            icon: 'Palette',
            title: 'Seni & Budaya',
            description: 'Ekstrakurikuler tari, musik, dan teater.',
          },
          {
            icon: 'Dumbbell',
            title: 'Olahraga',
            description: 'Basket, futsal, voli, dan pencak silat.',
          },
        ],
      },
      { background: 'surface' },
    ],
    [
      'news',
      'Berita Terbaru',
      { eyebrow: 'Kabar Sekolah', title: 'Berita Terbaru', limit: 3, showViewAll: true },
      {},
    ],
    [
      'events',
      'Agenda',
      { eyebrow: 'Agenda', title: 'Agenda Mendatang', limit: 3 },
      { background: 'surface' },
    ],
    [
      'achievements',
      'Prestasi',
      {
        eyebrow: 'Prestasi',
        title: 'Prestasi Siswa',
        items: [
          { title: 'Medali Emas OSN Fisika', year: '2026', level: 'Nasional' },
          { title: 'Juara 1 Lomba Debat Bahasa Inggris', year: '2026', level: 'Provinsi' },
          { title: 'Juara Umum Pencak Silat', year: '2025', level: 'Kabupaten' },
        ],
      },
      {},
    ],
    [
      'staff',
      'Guru & Staf',
      { eyebrow: 'Tim Pengajar', title: 'Guru & Tenaga Kependidikan', limit: 4 },
      {},
    ],
    [
      'gallery',
      'Galeri',
      { eyebrow: 'Galeri', title: 'Dokumentasi Kegiatan', limit: 6 },
      { background: 'surface' },
    ],
    [
      'testimonials',
      'Testimoni',
      {
        eyebrow: 'Testimoni',
        title: 'Kata Alumni & Orang Tua',
        items: [
          {
            name: 'Andi Wijaya',
            role: 'Alumni 2020, Universitas Indonesia',
            quote: 'Guru-guru di sini sangat peduli dan membantu saya meraih kampus impian.',
          },
          {
            name: 'Ibu Ratna',
            role: 'Orang Tua Siswa',
            quote: 'Lingkungan sekolah yang aman dan program karakter yang sangat baik.',
          },
          {
            name: 'Sari Putri',
            role: 'Alumni 2022, ITB',
            quote: 'Kegiatan ekstrakurikulernya membentuk saya menjadi pribadi yang percaya diri.',
          },
        ],
      },
      {},
    ],
    [
      'faq',
      'FAQ',
      {
        eyebrow: 'FAQ',
        title: 'Pertanyaan yang Sering Diajukan',
        items: [
          {
            question: 'Kapan pendaftaran siswa baru dibuka?',
            answer: 'Pendaftaran dibuka setiap bulan Januari hingga Juni.',
          },
          {
            question: 'Apakah tersedia beasiswa?',
            answer: 'Ya, tersedia beasiswa prestasi dan beasiswa bagi siswa kurang mampu.',
          },
          {
            question: 'Apa saja ekstrakurikuler yang tersedia?',
            answer: 'Pramuka, PMR, robotik, basket, futsal, paduan suara, tari, dan lainnya.',
          },
        ],
      },
      { background: 'surface', width: 'narrow' },
    ],
    [
      'cta',
      'Ajakan PPDB',
      {
        title: 'Bergabunglah Bersama Kami',
        subtitle: 'Pendaftaran peserta didik baru telah dibuka. Kuota terbatas!',
        buttonLabel: 'Daftar Sekarang',
        buttonUrl: '/halaman/ppdb',
      },
      { background: 'secondary', paddingY: 'lg' },
    ],
    [
      'contact',
      'Kontak',
      { eyebrow: 'Kontak', title: 'Hubungi Kami', showForm: true, showMap: true },
      {},
    ],
  ];

  await prisma.section.createMany({
    data: sections.map(([type, label, content, style], sortOrder) => ({
      type,
      label,
      content,
      style,
      sortOrder,
    })),
  });
}

async function main() {
  await resetDatabase();
  const admin = await seedUsers();
  await seedSettings();
  await seedPosts(admin.id);
  await seedPages();
  await seedEvents();
  await seedSchoolData();
  await seedMenus();
  await seedSections();
  // eslint-disable-next-line no-console
  console.log('🌱 Demo data seeded. Login: admin@sekolah.sch.id / admin12345');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
