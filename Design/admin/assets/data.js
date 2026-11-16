/* HIMATKN Admin — izin, role, dan data contoh.
   Nama permission, role, tabel, dan status mengikuti backend V2 (Backend/app/seed.py & dump himatkn_v2).
   SEMUA DATA DI BAWAH ADALAH FIXTURE untuk desain; di aplikasi asli diambil dari /api/v1/admin/*. */

const PERMISSIONS = [
  ["dashboard.view", "Melihat dashboard"],
  ["news.view", "Melihat publikasi"], ["news.create", "Membuat publikasi"], ["news.update", "Memperbarui publikasi"], ["news.delete", "Menghapus publikasi"],
  ["organization.view", "Melihat struktur organisasi"], ["organization.manage", "Mengelola periode & anggota"],
  ["programs.view", "Melihat program kerja"], ["programs.manage", "Mengelola program kerja"],
  ["agendas.view", "Melihat agenda"], ["agendas.manage", "Mengelola agenda"],
  ["documents.view", "Melihat dokumen"], ["documents.manage", "Mengunggah dokumen"],
  ["settings.view", "Melihat pengaturan"], ["settings.manage", "Mengubah pengaturan"],
  ["notifications.view", "Melihat notifikasi"], ["notifications.manage", "Mengirim notifikasi"],
  ["activity_logs.view", "Melihat log aktivitas"], ["visitor_logs.view", "Melihat statistik pengunjung"],
  ["admins.view", "Melihat administrator"], ["admins.manage", "Mengelola administrator"],
  ["roles.manage", "Melihat role & permission"], ["media.manage", "Mengunggah gambar"]
];
const ALL = PERMISSIONS.map((p) => p[0]);

const ROLES = {
  superadmin: { label: "Superadmin", desc: "Akses penuh seluruh panel.", perms: ALL },
  // Sesuai role_permissions di database saat ini
  admin: { label: "Admin", desc: "Administrator operasional tanpa manajemen administrator, role, dan pengaturan.",
    perms: ["dashboard.view", "news.view", "news.create", "news.update", "news.delete", "organization.view", "organization.manage", "programs.view", "programs.manage",
      "agendas.view", "agendas.manage", "documents.view", "settings.view", "notifications.view", "activity_logs.view", "visitor_logs.view", "admins.view"] },
  // USULAN: sesuai deskripsi role "Akses terbatas untuk publikasi dan struktur organisasi".
  // Di seed saat ini editor masih mendapat izin yang sama dengan admin — perlu keputusan produk.
  editor: { label: "Editor", desc: "Akses terbatas untuk publikasi dan struktur organisasi.",
    perms: ["dashboard.view", "news.view", "news.create", "news.update", "organization.view", "organization.manage", "notifications.view", "media.manage"] }
};

const ME = {
  superadmin: { id: 1, username: "admin", role: "superadmin" },
  admin: { id: 2, username: "subahan", role: "admin" },
  editor: { id: 3, username: "minfo.editor", role: "editor" }
};

const DB = {
  admins: [
    { id: 1, username: "admin", role: "superadmin", is_active: true, last_login_at: "2026-11-16T09:12:00" },
    { id: 2, username: "subahan", role: "admin", is_active: true, last_login_at: "2026-11-15T20:41:00" },
    { id: 3, username: "minfo.editor", role: "editor", is_active: true, last_login_at: "2026-11-14T13:05:00" },
    { id: 4, username: "sekretaris", role: "editor", is_active: false, last_login_at: null }
  ],
  periods: [
    { id: 1, name: "2025/2026", start_date: "2025-01-01", end_date: "2026-12-31", is_active: true },
    { id: 0, name: "2024/2025", start_date: "2024-01-01", end_date: "2024-12-31", is_active: false }
  ],
  divisions: [
    [1, "Pembimbing", "Dosen pembimbing himpunan"], [2, "Badan Pengurus Harian (BPH)", "Badan Pengurus Harian HIMATKN"],
    [3, "Divisi Internal"], [4, "Divisi Eksternal"], [5, "Divisi Reaksi"], [6, "Divisi Minat dan Bakat"],
    [7, "Divisi Keuangan"], [8, "Divisi Minfo"], [9, "Divisi Sosmas"]
  ].map(([id, name, description = null], i) => ({ id, period_id: 1, name, description, sort_order: i })),
  positions: ["Ketua Himpunan", "Wakil Ketua Himpunan", "Sekretaris I", "Sekretaris II", "Bendahara I", "Bendahara II", "Kepala Divisi", "Sekretaris Divisi", "Anggota", "Dosen Pembimbing"]
    .map((name, i) => ({ id: i + 1, name, sort_order: i + 1 })),
  members: [
    [2, 1, "Hans Marvin Bonie Passus Sembiring"], [2, 2, "Muhammad Qhodarudin"], [2, 3, "Karina Mahsa Aline"], [2, 4, "Adya Lingga Maharani Subroto"], [2, 5, "Karina Ramadhani Syaputri"], [2, 6, "Tirsa Oktavina Br Perangin-Angin"],
    [3, 7, "Muhammad Arvyanto Fakhri R."], [3, 8, "Desirangin Dedahan Maulia"], [3, 9, "Sindi Aulia Safitri"], [3, 9, "Daris Dzakir"], [3, 9, "Maura Layisha Ramadhani"], [3, 9, "Muhammad Lutfi Al Fattah"], [3, 9, "Refail Depri Naldi Ginting"], [3, 9, "Sesilia Celine Renata"],
    [4, 7, "Muhammad Satya Muafa"], [4, 8, "Kesya Bintang Butarbutar"], [4, 9, "Reni Agustina Kurnia Sari"], [4, 9, "Aulia Devin Fuzika"], [4, 9, "Galih Pratama Putra"], [4, 9, "Clarissa Cleo Karundeng"], [4, 9, "Ayu Ghani Utami"],
    [5, 7, "Dea Armina Lubis"], [5, 8, "I'Anatul Ihsaniyah"], [5, 9, "Ajeng Fanessa"], [5, 9, "Fazra Athiyyah"], [5, 9, "Salsabila Azzahra Putri"], [5, 9, "Allan Sofyan"], [5, 9, "Muhammad Alif Dhafa"],
    [6, 7, "Ikmal Hafiz Rasyidin Husein"], [6, 8, "Sylvana Hasriani"], [6, 9, "Desborn Panogi Aloysius Damanik"], [6, 9, "Yonathan Wiro Kristo Siahaan"], [6, 9, "Dzaki Aulia Pratama"], [6, 9, "Abraham Watubere"], [6, 9, "Raissa Vania Ramadhani"],
    [7, 7, "Syahrul Akbar Hidayatullah"], [7, 8, "Ichika Aura Nirwanda"], [7, 9, "Nikita Salsabila"], [7, 9, "Farros Alwan Kawakibi"], [7, 9, "Qanita Ahlatul Qurani"],
    [8, 7, "Risya Meida Kuntara"], [8, 8, "Amelia Putri Sadrina"], [8, 9, "Yusuf Putra Adi Nugraha"], [8, 9, "Subahan Okta Ramadhan"], [8, 9, "Bima Gead Yudandi"], [8, 9, "Wafiq Lutifiah Khansa"], [8, 9, "Itca Oktavia"],
    [9, 7, "Ezra Najjda Putri R."], [9, 8, "Hanifa Nur Aziza"], [9, 9, "Aaliyah Norista Adzkira Ivory"], [9, 9, "Vernon Joshua Rutherford S."], [9, 9, "Nidia Arvia Eka Fidela"], [9, 9, "Safira"], [9, 9, "Furqon Al Hafizh"], [9, 9, "Addisha Berliona"], [9, 9, "Nur Aulia Amantika"],
    [1, 10, "Lutfi Aditya Hasnowo, Ph.D."]
  ].map(([division_id, position_id, name], i) => ({ id: i + 1, period_id: 1, division_id, position_id, name, photo_url: null, sort_order: i })),
  tags: ["Kegiatan", "event", "kemahasiswaan", "eksternal", "internal"].map((name, i) => ({ id: i + 1, name })),
  news: [
    { id: 2, title: "HIMATKN Resmi Membuka Website Baru", slug: "himatkn-resmi-membuka-website-baru", status: "published", published_at: "2026-10-10T15:43:00", updated_at: "2026-10-10T22:43:00", author: "admin", tags: [1], images: 2, featured_image: null,
      content: "HIMATKN kini mempunyai website sendiri sebagai pusat informasi resmi himpunan." },
    { id: 6, title: "Pelantikan anggota baru Himpunan Mahasiswa Teknokimia Nuklir", slug: "pelantikan-anggota-baru", status: "published", published_at: "2026-09-15T10:00:00", updated_at: "2026-09-15T12:00:00", author: "minfo.editor", tags: [1, 3], images: 4, featured_image: null, content: "Contoh isi publikasi." },
    { id: 7, title: "Himatknuklir setelah pelantikan anggota baru", slug: "setelah-pelantikan", status: "published", published_at: "2026-09-12T10:00:00", updated_at: "2026-09-12T10:00:00", author: "minfo.editor", tags: [1], images: 1, featured_image: "../assets/img/pelantikan-2.jpg", content: "Contoh isi publikasi." },
    { id: 4, title: "Seminar bersama pakar teknologi dunia", slug: "seminar-bersama-alumni-teknokimia-nuklir", status: "draft", published_at: null, updated_at: "2026-10-12T18:10:00", author: "admin", tags: [1, 2, 3], images: 0, featured_image: null, content: "Mahasiswa Teknokimia Nuklir mengadakan seminar." },
    { id: 8, title: "Catatan kolaborasi media partner bersama AKPRIND", slug: "media-partner-akprind", status: "archived", published_at: "2026-08-20T10:00:00", updated_at: "2026-10-01T09:00:00", author: "subahan", tags: [4], images: 0, featured_image: null, content: "Contoh isi publikasi." }
  ],
  // Nilai status program: verifikasi enum di backend (default DB: 'planned')
  programs: [
    { id: 2, name: "Podcast HIMATKN", slug: "podcast", division_id: 8, period_id: 1, status: "ongoing", start_date: "2026-09-01", end_date: "2026-12-15", description: "Obrolan rutin soal kuliah, riset, dan karier di bidang nuklir." },
    { id: 1, name: "Mengundang pakar-pakar teknologi", slug: "pakar-teknologi", division_id: 8, period_id: 1, status: "planned", start_date: "2026-10-10", end_date: "2026-10-11", description: "Acara meet and greet bersama pakar." },
    { id: 3, name: "Dies Natalis Hima TKN", slug: "dies-natalis", division_id: 3, period_id: 1, status: "planned", start_date: "2026-12-06", end_date: null, description: "Perayaan ulang tahun himpunan." },
    { id: 4, name: "Media Partner bersama AKPRIND", slug: "media-partner-akprind", division_id: 4, period_id: 1, status: "completed", start_date: "2026-08-10", end_date: "2026-08-20", description: "Kolaborasi publikasi acara kampus." }
  ],
  agendas: [
    { id: 1, title: "Rapat koordinasi BPH", start_at: "2026-11-18T19:00:00", end_at: "2026-11-18T21:00:00", location: "Student Center Lt. 1", description: "Evaluasi program bulan November." },
    { id: 2, title: "Rekaman Podcast episode 6", start_at: "2026-11-21T15:30:00", end_at: null, location: "Studio Minfo", description: null },
    { id: 3, title: "Dies Natalis Hima TKN", start_at: "2026-12-06T08:00:00", end_at: "2026-12-06T16:00:00", location: "Aula Poltek Nuklir", description: "Acara puncak ulang tahun himpunan." },
    { id: 4, title: "Rapat kerja Kabinet Nexus", start_at: "2026-10-04T09:00:00", end_at: "2026-10-04T15:00:00", location: "Ruang Seminar", description: null }
  ],
  documents: [
    { id: 1, title: "Proposal Dies Natalis 2026", category: "Proposal", original_filename: "proposal-dies-natalis-2026.pdf", size_bytes: 846096, uploaded_by: "subahan", created_at: "2026-11-02T10:40:00" },
    { id: 2, title: "LPJ Media Partner AKPRIND", category: "LPJ", original_filename: "lpj-akprind.pdf", size_bytes: 1246096, uploaded_by: "admin", created_at: "2026-09-01T08:12:00" },
    { id: 3, title: "AD/ART HIMATKN", category: "Arsip", original_filename: "ad-art-himatkn.pdf", size_bytes: 386102, uploaded_by: "admin", created_at: "2026-07-14T14:00:00" }
  ],
  notifications: [
    { id: 4, title: "Publikasi menunggu review", message: "Draft \"Seminar bersama pakar teknologi dunia\" siap ditinjau sebelum terbit.", type: "info", created_at: "2026-11-16T08:20:00", read_at: null, from: "minfo.editor" },
    { id: 3, title: "Data pengurus diperbarui", message: "Divisi Minfo menambahkan 2 anggota baru.", type: "success", created_at: "2026-11-15T19:02:00", read_at: null, from: "subahan" },
    { id: 2, title: "Batas ukuran unggahan", message: "Ingat: gambar & dokumen maksimal 4 MB per file.", type: "warning", created_at: "2026-11-10T09:00:00", read_at: "2026-11-10T10:00:00", from: "admin" },
    { id: 1, title: "Selamat datang di panel admin V2", message: "Panel baru sudah aktif. Laporkan kendala ke Divisi Minfo.", type: "info", created_at: "2026-11-01T09:00:00", read_at: "2026-11-02T08:00:00", from: "admin" }
  ],
  activity: [
    ["2026-11-16T08:19:00", "minfo.editor", "news.update", "news", 4, "Memperbarui publikasi Seminar bersama pakar teknologi dunia"],
    ["2026-11-15T19:01:00", "subahan", "member.create", "member", 58, "Menambahkan anggota Divisi Minfo"],
    ["2026-11-15T18:55:00", "subahan", "program.update", "program", 2, "Memperbarui program kerja Podcast HIMATKN"],
    ["2026-11-14T13:10:00", "minfo.editor", "news.image.create", "news_image", 6, "Menambahkan gambar pada publikasi Pelantikan anggota baru"],
    ["2026-11-10T09:00:00", "admin", "notification.create", "notification", 2, "Mengirim notifikasi Batas ukuran unggahan"],
    ["2026-11-02T10:40:00", "subahan", "document.create", "document", 1, "Mengunggah dokumen Proposal Dies Natalis 2026"],
    ["2026-10-15T09:20:00", "admin", "program.create", "program", 1, "Membuat program kerja Mengundang pakar-pakar teknologi"],
    ["2026-10-12T18:10:00", "admin", "news.update", "news", 4, "Memperbarui publikasi Seminar bersama pakar teknologi dunia"],
    ["2026-10-11T22:44:00", "admin", "news.delete", "news", 3, "Menghapus publikasi Seminar bersama alumni teknokimia nuklir"],
    ["2026-10-10T22:43:00", "admin", "news.create", "news", 2, "Membuat publikasi HIMATKN Resmi Membuka Website Baru"],
    ["2026-09-16T15:31:00", "admin", "admin.create", "admin", 2, "Menambahkan administrator subahan"]
  ].map(([created_at, admin, action, entity_type, entity_id, description], i) => ({ id: 100 - i, created_at, admin, action, entity_type, entity_id, description, ip_address: "103.47.1" + (i % 9) + ".2" + i, user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/155.0" })),
  // USULAN kunci pengaturan — disamakan dengan pengaturan V1 (site_config). Verifikasi dengan backend.
  settings: [
    { group: "Kontak", key: "contact_email", label: "Email resmi", type: "email", value: "himatknuklir@gmail.com", hint: "Ditampilkan di footer dan halaman kontak." },
    { group: "Kontak", key: "instagram_handle", label: "Instagram", type: "string", value: "himatknuklir", prefix: "@", hint: "Tanpa tanda @." },
    { group: "Kontak", key: "secretariat_address", label: "Alamat sekretariat", type: "text", value: "Student Center Poltek Nuklir Lt. 1, Jl. Babarsari, Yogyakarta 55281" },
    { group: "Tautan", key: "bank_soal_url", label: "Link Bank Soal", type: "url", value: "https://drive.google.com/drive/folders/…", hint: "Menu \"Bank Soal\" di navigasi situs membuka tautan ini (folder Google Drive)." },
    { group: "Tautan", key: "maps_url", label: "Link Google Maps", type: "url", value: "https://maps.google.com/?q=Politeknik+Teknologi+Nuklir+Indonesia" },
    { group: "Identitas", key: "cabinet_name", label: "Nama kabinet", type: "string", value: "Kabinet Nexus" },
    { group: "Identitas", key: "hero_tagline", label: "Tagline hero", type: "string", value: "Beyond Chemistry Into Energy" },
    { group: "Identitas", key: "maintenance_mode", label: "Mode perawatan", type: "bool", value: false, hint: "Saat aktif, pengunjung melihat halaman pemberitahuan perawatan." }
  ].map((s) => ({ ...s, updated_by: "admin", updated_at: "2026-11-01T09:00:00" }))
};

/* Log pengunjung contoh (14 hari terakhir) */
DB.visits = (() => {
  const pages = ["/", "/struktur", "/program-kerja", "/berita", "/berita/himatkn-resmi-membuka-website-baru", "/program-kerja/podcast"];
  const out = []; let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let d = 13; d >= 0; d--) {
    const n = Math.round(30 + rnd() * 70 + (d < 4 ? 40 : 0));
    for (let i = 0; i < n; i++) {
      const t = new Date(2026, 10, 16 - d, Math.floor(rnd() * 24), Math.floor(rnd() * 60));
      out.push({ page: pages[Math.floor(Math.pow(rnd(), 1.8) * pages.length)], visitor_hash: (Math.floor(rnd() * 400)).toString(16).padStart(8, "a") + "…", visited_at: t.toISOString(), user_agent: rnd() > .4 ? "Mobile Safari" : "Chrome Desktop" });
    }
  }
  return out.reverse();
})();
