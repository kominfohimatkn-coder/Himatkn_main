/* HIMATKN Admin — izin, role, dan data contoh.
   Kunci izin, role, status, dan registry pengaturan mengikuti backend V2.
   SEMUA DATA DI BAWAH ADALAH FIXTURE. Nama orang dan username FIKTIF. */

/* Izin: kunci teknis → label awam (yang tampil di UI hanya labelnya) */
const PERMISSIONS = [
  ["dashboard.view", "Melihat dashboard"],
  ["news.view", "Melihat publikasi"], ["news.create", "Menulis publikasi"], ["news.update", "Mengubah publikasi"], ["news.delete", "Menghapus publikasi"],
  ["organization.view", "Melihat struktur organisasi"], ["organization.manage", "Mengelola periode, divisi, dan anggota"],
  ["programs.view", "Melihat program kerja"], ["programs.manage", "Mengelola program kerja"],
  ["agendas.view", "Melihat agenda"], ["agendas.manage", "Mengelola agenda"],
  ["documents.view", "Melihat dokumen"], ["documents.manage", "Mengunggah dokumen"],
  ["settings.view", "Melihat pengaturan situs"], ["settings.manage", "Mengubah pengaturan situs"],
  ["notifications.view", "Melihat notifikasi"], ["notifications.manage", "Mengirim notifikasi"],
  ["activity_logs.view", "Melihat log aktivitas"], ["visitor_logs.view", "Melihat statistik pengunjung"],
  ["admins.view", "Melihat administrator"], ["admins.manage", "Mengelola administrator"],
  ["roles.manage", "Melihat role"], ["media.manage", "Mengunggah gambar"]
];
const PERM_LABEL = Object.fromEntries(PERMISSIONS);
const ALL = PERMISSIONS.map((p) => p[0]);

/* Keputusan sementara (menunggu konfirmasi) — lihat README */
const ROLES = {
  superadmin: { label: "Superadmin", desc: "Akses penuh seluruh panel.", perms: ALL },
  admin: { label: "Admin", desc: "Mengelola konten dan struktur. Pengaturan situs dan administrator hanya bisa dilihat.",
    perms: ["dashboard.view", "news.view", "news.create", "news.update", "news.delete", "organization.view", "organization.manage", "programs.view", "programs.manage",
      "agendas.view", "agendas.manage", "documents.view", "settings.view", "notifications.view", "activity_logs.view", "visitor_logs.view", "admins.view", "media.manage"] },
  editor: { label: "Editor", desc: "Menulis publikasi dan mengelola struktur organisasi.",
    perms: ["dashboard.view", "news.view", "news.create", "news.update", "organization.view", "organization.manage", "media.manage"] }
};

const ME = {
  superadmin: { id: 1, username: "admin", role: "superadmin" },
  admin: { id: 2, username: "pengurus.minfo", role: "admin" },
  editor: { id: 3, username: "editor.publikasi", role: "editor" }
};

/* ---------- Nama fiktif ---------- */
const FIRST = ["Raka", "Nadia", "Bima", "Salsa", "Dimas", "Aulia", "Fajar", "Citra", "Gilang", "Intan", "Yoga", "Putri", "Reza", "Kirana", "Arya", "Laras", "Bagas", "Tiara", "Hafiz", "Melati", "Rizky", "Anisa", "Wira", "Dinda", "Yusuf", "Rania", "Satria", "Nabila", "Galih", "Zahra"];
const LAST = ["Pratama", "Lestari", "Saputra", "Wulandari", "Nugroho", "Rahmawati", "Hidayat", "Permata", "Kusuma", "Maharani", "Firmansyah", "Anggraini", "Setiawan", "Puspita", "Ramadhan", "Safitri", "Wijaya", "Handayani", "Siregar", "Utami"];
const fakeName = (i) => `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 11 + 3) % LAST.length]}`;

const DIV_NAMES = [["Pembimbing", "Dosen pembimbing himpunan"], ["Badan Pengurus Harian (BPH)", "Ketua, wakil, sekretaris, dan bendahara."], ["Divisi Internal", null], ["Divisi Eksternal", null], ["Divisi Reaksi", null], ["Divisi Minat dan Bakat", null], ["Divisi Keuangan", null], ["Divisi Minfo", null], ["Divisi Sosmas", null]];

const DB = {
  admins: [
    { id: 1, username: "admin", role: "superadmin", is_active: true, last_login_at: "2026-11-16T09:12:00" },
    { id: 2, username: "pengurus.minfo", role: "admin", is_active: true, last_login_at: "2026-11-15T20:41:00" },
    { id: 3, username: "editor.publikasi", role: "editor", is_active: true, last_login_at: "2026-11-14T13:05:00" },
    { id: 4, username: "sekretaris.lama", role: "editor", is_active: false, last_login_at: null }
  ],
  periods: [
    { id: 3, name: "2026/2027", start_date: "2026-12-01", end_date: "2027-11-30", is_active: false },
    { id: 1, name: "2025/2026", start_date: "2025-12-01", end_date: "2026-11-30", is_active: true },
    { id: 2, name: "2024/2025", start_date: "2024-12-01", end_date: "2025-11-30", is_active: false }
  ],
  divisions: [
    ...DIV_NAMES.map(([name, description], i) => ({ id: i + 1, period_id: 1, name, description, sort_order: i })),
    ...DIV_NAMES.map(([name, description], i) => ({ id: 101 + i, period_id: 2, name, description, sort_order: i }))
  ],
  positions: ["Ketua Himpunan", "Wakil Ketua Himpunan", "Sekretaris I", "Sekretaris II", "Bendahara I", "Bendahara II", "Kepala Divisi", "Sekretaris Divisi", "Anggota", "Dosen Pembimbing"]
    .map((name, i) => ({ id: i + 1, name, sort_order: i + 1 })),
  tags: ["Kegiatan", "Event", "Kemahasiswaan", "Eksternal", "Internal"].map((name, i) => ({ id: i + 1, name })),
  news: [
    { id: 2, title: "HIMATKN Resmi Membuka Website Baru", slug: "himatkn-resmi-membuka-website-baru", status: "published", published_at: "2026-10-10T15:43:00", updated_at: "2026-10-10T22:43:00", author: "admin", tags: [1],
      images: [{ id: 21, src: null, caption: "Tampilan beranda situs baru" }, { id: 22, src: null, caption: "" }],
      content: "HIMATKN kini punya **website resmi** sebagai pusat informasi himpunan.\n\n## Apa saja isinya\n\n- Program kerja kabinet\n- Publikasi dan dokumentasi kegiatan\n- Susunan kepengurusan\n\nKunjungi [halaman struktur](https://himatknuklir.web.id/struktur) untuk mengenal pengurus." },
    { id: 6, title: "Pelantikan anggota baru Himpunan Mahasiswa Teknokimia Nuklir", slug: "pelantikan-anggota-baru", status: "published", published_at: "2026-09-15T10:00:00", updated_at: "2026-09-15T12:00:00", author: "editor.publikasi", tags: [1, 3],
      images: [{ id: 61, src: "../assets/img/pelantikan-2.jpg", caption: "Foto bersama setelah pelantikan" }, { id: 62, src: null, caption: "Sambutan ketua himpunan" }, { id: 63, src: null, caption: "" }], content: "Contoh isi publikasi." },
    { id: 4, title: "Seminar bersama pakar teknologi", slug: "seminar-bersama-pakar-teknologi", status: "draft", published_at: null, updated_at: "2026-10-12T18:10:00", author: "admin", tags: [1, 2, 3], images: [], content: "Mahasiswa Teknokimia Nuklir mengadakan seminar bersama pakar teknologi." },
    { id: 8, title: "Catatan kolaborasi media partner bersama AKPRIND", slug: "media-partner-akprind", status: "archived", published_at: "2026-08-20T10:00:00", updated_at: "2026-10-01T09:00:00", author: "pengurus.minfo", tags: [4], images: [], content: "Contoh isi publikasi." }
  ],
  programs: [
    { id: 2, name: "Podcast HIMATKN", slug: "podcast", division_id: 8, period_id: 1, status: "ongoing", start_date: "2026-09-01", end_date: "2026-12-15", description: "Obrolan rutin soal kuliah, riset, dan karier di bidang nuklir." },
    { id: 1, name: "Mengundang pakar teknologi", slug: "pakar-teknologi", division_id: 8, period_id: 1, status: "planned", start_date: "2026-10-10", end_date: "2026-10-11", description: "Acara temu pakar." },
    { id: 3, name: "Dies Natalis Hima TKN", slug: "dies-natalis", division_id: 3, period_id: 1, status: "planned", start_date: "2026-12-06", end_date: null, description: "Perayaan ulang tahun himpunan." },
    { id: 4, name: "Media Partner bersama AKPRIND", slug: "media-partner-akprind", division_id: 4, period_id: 1, status: "completed", start_date: "2026-08-10", end_date: "2026-08-20", description: "Kolaborasi publikasi acara kampus." },
    { id: 5, name: "Turnamen futsal antarangkatan", slug: "futsal-antarangkatan", division_id: 6, period_id: 1, status: "cancelled", start_date: "2026-07-01", end_date: null, description: "Dibatalkan karena bentrok jadwal ujian." },
    { id: 6, name: "Bakti sosial desa binaan", slug: "baksos-2024", division_id: 109, period_id: 2, status: "completed", start_date: "2024-08-17", end_date: "2024-08-18", description: "Program periode lalu." }
  ],
  activity: [
    ["2026-11-16T08:19:00", "editor.publikasi", "update", "Mengubah publikasi Seminar bersama pakar teknologi"],
    ["2026-11-15T19:01:00", "pengurus.minfo", "create", "Menambahkan anggota Divisi Minfo"],
    ["2026-11-15T18:55:00", "pengurus.minfo", "update", "Mengubah program kerja Podcast HIMATKN"],
    ["2026-11-14T13:10:00", "editor.publikasi", "create", "Menambahkan gambar pada publikasi Pelantikan anggota baru"],
    ["2026-11-10T09:00:00", "admin", "update", "Mengubah pengaturan situs (Kontak)"],
    ["2026-11-02T10:40:00", "pengurus.minfo", "create", "Membuat periode 2026/2027"],
    ["2026-10-15T09:20:00", "admin", "create", "Membuat program kerja Mengundang pakar teknologi"],
    ["2026-10-12T18:10:00", "admin", "update", "Mengubah publikasi Seminar bersama pakar teknologi"],
    ["2026-10-11T22:44:00", "admin", "delete", "Menghapus publikasi Seminar bersama alumni"],
    ["2026-10-10T22:43:00", "admin", "create", "Membuat publikasi HIMATKN Resmi Membuka Website Baru"],
    ["2026-09-16T15:31:00", "admin", "create", "Menambahkan administrator pengurus.minfo"]
  ].map(([created_at, admin, kind, description], i) => ({ id: 100 - i, created_at, admin, kind, description, ip_address: "103.47.1" + (i % 9) + "." + (20 + i), device: i % 3 ? "Komputer · Chrome" : "Ponsel · Safari" })),

  /* ---------- Modul DITUNDA (kode dipertahankan) ---------- */
  agendas: [
    { id: 1, title: "Rapat koordinasi BPH", start_at: "2026-11-18T19:00:00", end_at: "2026-11-18T21:00:00", location: "Student Center Lt. 1", description: "Evaluasi program bulan November." },
    { id: 2, title: "Rekaman Podcast episode 6", start_at: "2026-11-21T15:30:00", end_at: null, location: "Studio Minfo", description: null },
    { id: 4, title: "Rapat kerja kabinet", start_at: "2026-10-04T09:00:00", end_at: "2026-10-04T15:00:00", location: "Ruang Seminar", description: null }
  ],
  documents: [
    { id: 1, title: "Proposal Dies Natalis 2026", category: "Proposal", original_filename: "proposal-dies-natalis-2026.pdf", size_bytes: 846096, uploaded_by: "pengurus.minfo", created_at: "2026-11-02T10:40:00" },
    { id: 2, title: "AD/ART HIMATKN", category: "Arsip", original_filename: "ad-art-himatkn.pdf", size_bytes: 386102, uploaded_by: "admin", created_at: "2026-07-14T14:00:00" }
  ],
  notifications: [
    { id: 2, title: "Publikasi menunggu review", message: "Draft \"Seminar bersama pakar teknologi\" siap ditinjau.", type: "info", created_at: "2026-11-16T08:20:00", read_at: null, from: "editor.publikasi" },
    { id: 1, title: "Selamat datang di panel admin V2", message: "Panel baru sudah aktif.", type: "info", created_at: "2026-11-01T09:00:00", read_at: "2026-11-02T08:00:00", from: "admin" }
  ]
};

/* Anggota fiktif: periode 2025/2026 (57 orang, struktur sama dengan data asli) + sebagian BPH periode lalu */
DB.members = (() => {
  const plan = [[2, [1, 2, 3, 4, 5, 6]], [3, [7, 8, 9, 9, 9, 9, 9, 9]], [4, [7, 8, 9, 9, 9, 9, 9]], [5, [7, 8, 9, 9, 9, 9, 9]], [6, [7, 8, 9, 9, 9, 9, 9]], [7, [7, 8, 9, 9, 9]], [8, [7, 8, 9, 9, 9, 9, 9]], [9, [7, 8, 9, 9, 9, 9, 9, 9, 9]]];
  const out = [{ id: 1, period_id: 1, division_id: 1, position_id: 10, name: "Dr. Arif Santoso", photo_url: null, sort_order: 0 }];
  let n = 1;
  plan.forEach(([div, positions]) => positions.forEach((pos, i) => out.push({ id: ++n, period_id: 1, division_id: div, position_id: pos, name: fakeName(n), photo_url: n === 2 ? "../assets/img/pelantikan-2.jpg" : null, sort_order: i })));
  [1, 2, 3, 5].forEach((pos, i) => out.push({ id: ++n, period_id: 2, division_id: 102, position_id: pos, name: fakeName(n + 40), photo_url: null, sort_order: i }));
  return out;
})();

/* Log pengunjung mentah (tanpa agregat di backend) */
DB.visits = (() => {
  const pages = ["/", "/struktur", "/program-kerja", "/publikasi", "/publikasi/himatkn-resmi-membuka-website-baru", "/publikasi/pelantikan-anggota-baru"];
  const uas = ["Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1", "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36", "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 Version/18.1 Safari/605.1.15"];
  const out = []; let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 1092; i++) {
    const t = new Date(2026, 10, 16, 15, 50) - i * 1000 * 60 * (6 + Math.floor(rnd() * 20));
    out.push({ page: pages[Math.floor(Math.pow(rnd(), 1.8) * pages.length)], visitor_hash: Math.floor(rnd() * 1e12).toString(16), visited_at: new Date(t).toISOString(), user_agent: uas[Math.floor(rnd() * uas.length)] });
  }
  return out;
})();

/* Pengaturan situs: registry sesuai Backend/app/services/site_settings.py
   [key, group, type, label, default, max_length, allowed_hosts] */
const SETTING_GROUPS = [
  ["brand", "Identitas", "Nama dan teks yang muncul di header serta footer.", "index.html"],
  ["links", "Tautan", "Tautan keluar dari situs.", "index.html"],
  ["contact", "Kontak", "Informasi dan bagian Kontak di beranda.", "index.html#kepengurusan"],
  ["hero", "Hero beranda", "Bagian paling atas beranda.", "index.html"],
  ["about", "Tentang", "Bagian Tentang Kami di beranda.", "index.html#tentang"],
  ["program", "Program kerja", "Bagian Program Kerja di beranda.", "index.html#program-kerja"],
  ["news", "Publikasi", "Bagian Publikasi di beranda.", "index.html#publikasi"],
  ["structure", "Struktur", "Bagian Kepengurusan di beranda.", "index.html#kepengurusan"]
];
const T = 300, D = 1000;
DB.settings = [
  ["brand_name", "brand", "text", "Nama brand", "HIMA TEKNOKIMIA NUKLIR", T],
  ["brand_subtitle", "brand", "text", "Subjudul brand", "POLITEKNIK TEKNOLOGI NUKLIR", T],
  ["footer_copyright", "brand", "text", "Teks hak cipta footer", "", T],
  ["footer_institution", "brand", "text", "Nama institusi footer", "", T],
  ["bank_soal_url", "links", "url", "URL Bank Soal", "", 2048, ["drive.google.com"]],
  ["instagram_url", "links", "url", "URL Instagram", "", 2048, ["instagram.com", "www.instagram.com"]],
  ["instagram_label", "links", "text", "Label Instagram", "", T],
  ["contact_email", "contact", "email", "Email kontak", "", 254],
  ["secretariat_address", "contact", "multiline", "Alamat sekretariat", "", 500],
  ["maps_url", "contact", "url", "URL peta (buka di Google Maps)", "", 2048, ["maps.app.goo.gl", "www.google.com", "google.com", "maps.google.com"]],
  ["maps_embed_url", "contact", "url", "URL embed Google Maps", "", 2048, ["www.google.com"]],
  ["contact_eyebrow", "contact", "text", "Label kecil Kontak", "Kontak", T],
  ["contact_title", "contact", "text", "Judul Kontak", "Hubungi Kami", T],
  ["contact_description", "contact", "text", "Deskripsi Kontak", "Sampaikan pertanyaan atau kolaborasi melalui kanal resmi.", D],
  ["contact_button_label", "contact", "text", "Label tombol Kontak", "Kirim Email", T],
  ["hero_eyebrow", "hero", "text", "Label kecil hero", "HIMATKN", T],
  ["hero_title", "hero", "text", "Judul hero", "Himpunan Mahasiswa", T],
  ["hero_emphasis", "hero", "text", "Kata penekanan hero", "Teknokimia Nuklir", T],
  ["hero_description", "hero", "text", "Deskripsi hero", "Wadah mahasiswa Teknokimia Nuklir untuk belajar, berkarya, dan berkontribusi.", D],
  ["hero_primary_label", "hero", "text", "Label tombol utama hero", "Lihat Program Kerja", T],
  ["hero_secondary_label", "hero", "text", "Label tombol kedua hero", "Kenali Kami", T],
  ["about_eyebrow", "about", "text", "Label kecil Tentang", "", T],
  ["about_title", "about", "text", "Judul Tentang", "Ruang Tumbuh Mahasiswa", T],
  ["about_description", "about", "text", "Deskripsi Tentang", "Himpunan mahasiswa yang menjadi ruang belajar, berkarya, dan berkolaborasi.", D],
  ["about_item_1_tag", "about", "text", "Tag poin Tentang 1", "Komunitas", T], ["about_item_1_title", "about", "text", "Judul poin Tentang 1", "Komunitas", T], ["about_item_1_description", "about", "text", "Deskripsi poin Tentang 1", "Tempat bertemu dan bertukar gagasan antaranggota.", D],
  ["about_item_2_tag", "about", "text", "Tag poin Tentang 2", "Karya", T], ["about_item_2_title", "about", "text", "Judul poin Tentang 2", "Karya", T], ["about_item_2_description", "about", "text", "Deskripsi poin Tentang 2", "Wadah mengembangkan karya dan kompetensi.", D],
  ["about_item_3_tag", "about", "text", "Tag poin Tentang 3", "Kolaborasi", T], ["about_item_3_title", "about", "text", "Judul poin Tentang 3", "Kolaborasi", T], ["about_item_3_description", "about", "text", "Deskripsi poin Tentang 3", "Ruang bekerja sama dengan berbagai pihak.", D],
  ["program_eyebrow", "program", "text", "Label kecil Program", "Program", T],
  ["program_title", "program", "text", "Judul Program", "Program Kerja", T],
  ["program_empty_text", "program", "text", "Teks kosong Program", "Belum ada program kerja.", T],
  ["news_eyebrow", "news", "text", "Label kecil Publikasi", "Publikasi", T],
  ["news_title", "news", "text", "Judul Publikasi", "Kabar Terbaru", T],
  ["news_empty_text", "news", "text", "Teks kosong Publikasi", "Belum ada publikasi.", T],
  ["news_more_label", "news", "text", "Label tautan semua Publikasi", "Lihat semua", T],
  ["structure_eyebrow", "structure", "text", "Label kecil Kepengurusan", "Organisasi", T],
  ["structure_title", "structure", "text", "Judul Kepengurusan", "Susunan Kepengurusan", T],
  ["structure_description", "structure", "text", "Deskripsi Kepengurusan", "Kenali struktur dan anggota kepengurusan.", D],
  ["structure_note", "structure", "text", "Catatan Kepengurusan", "", D],
  ["structure_button_label", "structure", "text", "Label tombol Kepengurusan", "Selengkapnya", T]
].map(([key, group, type, label, def, max_length, allowed_hosts = []]) => ({ key, group, type, label, default: def, max_length, allowed_hosts, value: def, updated_by: null, updated_at: null }));

/* Nilai yang sudah diubah dari default (contoh) */
Object.entries({
  footer_copyright: "© 2026 HIMATKN", footer_institution: "Politeknik Teknologi Nuklir Indonesia, BRIN",
  bank_soal_url: "https://drive.google.com/drive/folders/contoh-bank-soal", instagram_url: "https://www.instagram.com/himatknuklir", instagram_label: "@himatknuklir",
  contact_email: "himatknuklir@gmail.com", secretariat_address: "Student Center Poltek Nuklir Lt. 1\nJl. Babarsari, Yogyakarta 55281",
  maps_url: "https://maps.app.goo.gl/contohPeta", hero_eyebrow: "Kabinet Nexus", hero_description: "Kabinet Nexus - Beyond Chemistry Into Energy",
  about_eyebrow: "Tentang Kami", about_title: "Bukan organisasi formalitas. Ruang untuk benar-benar paham apa yang kami pelajari.",
  about_item_1_tag: "Akademik", about_item_1_title: "Belajar bersama, bukan sendiri-sendiri", about_item_1_description: "Membantu mahasiswa Teknokimia Nuklir melewati kesulitan mata kuliah inti melalui kerja sama yang solid.",
  about_item_2_tag: "Riset", about_item_2_title: "Dari rasa ingin tahu ke publikasi", about_item_3_tag: "Komunitas", about_item_3_title: "Satu ikatan yang saling kenal",
  structure_note: "Struktur diperbarui tiap pergantian periode kepengurusan."
}).forEach(([k, v]) => Object.assign(DB.settings.find((s) => s.key === k), { value: v, updated_by: "admin", updated_at: "2026-11-10T09:00:00" }));
DB.unknown_keys = ["instagram_handle", "cabinet_name"];
