/* HIMATKN — data + render state.
   Atur state lewat URL, contoh: index.html?proker=empty&news=loading&map=error
   proker / news / struktur / soal = filled | empty | loading | error
   map = ok | error · menu = open · header = scrolled · panel = off */

const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

const DATA = {
  proker: [
    { id: "podcast", title: "Podcast", status: "berjalan", org: "HIMATKN", period: "Nexus 2026", desc: LOREM },
    { id: "media-partner-akprind", title: "Media Partner bersama AKPRIND", status: "selesai", org: "HIMATKN", period: "Nexus 2026", desc: LOREM },
    { id: "dies-natalis", title: "Dies Natalis Hima TKN", status: "terencana", org: "HIMATKN", period: "Nexus 2026", desc: LOREM }
  ],
  news: [
    { id: "pelantikan-anggota-baru", title: "Pelantikan anggota baru Himpunan Mahasiswa Teknokimia Nuklir", date: "2026-09-15", img: "assets/img/pelantikan.jpg", desc: LOREM + " Ut enim ad minim veniam, quis nostrud exercitation." },
    { id: "setelah-pelantikan", title: "Himatknuklir setelah pelantikan anggota baru", date: "2026-09-12", img: "assets/img/pelantikan-2.jpg", desc: LOREM }
  ],
  divisions: [
    { id: "bph", short: "BPH", name: "Badan Pengurus Harian", kind: "Pimpinan", desc: "Ketua, Wakil, Sekretaris, dan Bendahara penggerak arah organisasi.",
      members: [
        { role: "Ketua Himpunan", name: "Hans Marvin Bonie Passus Sembiring", tier: "lead" },
        { role: "Wakil Ketua Himpunan", name: "Muhammad Qhodarudin", tier: "vice" },
        { role: "Sekretaris I", name: "Karina Mahsa Aline" },
        { role: "Sekretaris II", name: "Adya Lingga Maharani Subroto" },
        { role: "Bendahara I", name: "Karina Ramadhani Syaputri" },
        { role: "Bendahara II", name: "Tirsa Oktavina Br Perangin-Angin" }
      ] },
    { id: "internal-eksternal", name: "Internal & Eksternal", kind: "Divisi", desc: "Mengelola keharmonisan pengurus dan relasi ke luar himpunan.", members: [] },
    { id: "reaksi", name: "Reaksi", kind: "Divisi", desc: "Menangani isu akademik, pengawalan kebijakan, dan literasi ilmiah.", members: [] },
    { id: "minat-bakat", name: "Minat dan Bakat", kind: "Divisi", desc: "Mewadahi potensi seni, olahraga, dan kreativitas anggota.", members: [] },
    { id: "keuangan", name: "Keuangan", kind: "Divisi", desc: "Bertanggung jawab atas stabilitas dana dan usaha mandiri himpunan.", members: [] },
    { id: "minfo-sosmas", name: "Minfo & Sosmas", kind: "Divisi", desc: "Mengerjakan media informasi digital serta program pengabdian masyarakat.", members: [] },
    { id: "hubungan-alumni", name: "Hubungan Alumni", kind: "Divisi", desc: "Menghubungkan anggota aktif dengan jaringan alumni.", members: [] }
  ],
  // CONTOH — ganti dengan daftar mata kuliah & file asli
  soal: [
    { id: "kimia-dasar", name: "Kimia Dasar", sem: 1, files: ["UTS 2025", "UAS 2025", "UAS 2024"] },
    { id: "fisika-dasar", name: "Fisika Dasar", sem: 1, files: ["UTS 2025", "UAS 2025"] },
    { id: "kalkulus", name: "Kalkulus", sem: 1, files: ["UTS 2025", "UAS 2024"] },
    { id: "kimia-analitik", name: "Kimia Analitik", sem: 3, files: ["UTS 2025", "UAS 2025"] },
    { id: "fisika-nuklir", name: "Fisika Nuklir Dasar", sem: 3, files: ["UTS 2025"] },
    { id: "proteksi-radiasi", name: "Proteksi Radiasi", sem: 5, files: ["UTS 2025", "UAS 2024"] }
  ]
};

const PERIOD = "2025/2026";
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const STATUS = { berjalan: "Berjalan", selesai: "Selesai", terencana: "Terencana" };
const params = new URLSearchParams(location.search);
const mode = (k) => params.get(k) || "filled";
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const $ = (s) => document.querySelector(s);

/* ---------- Ikon ---------- */
const ICON = {
  calendar: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  doc: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></svg>',
  people: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16 14.6c2.6.2 4.3 2 4.8 4.9"/></svg>',
  search: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  alert: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/></svg>',
  avatar: '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#E2E2E2"/><circle cx="50" cy="38" r="19" fill="#474747"/><path d="M14 100c2-24 17-37 36-37s34 13 36 37z" fill="#474747"/></svg>'
};

/* ---------- Komponen state ---------- */
const stateBox = ({ icon, label, title, text, action }) => `<div class="state-box" role="status">
  <div class="state-box__icon">${ICON[icon]}</div><p class="label">${label}</p><h3>${title}</h3><p>${text}</p>${action || ""}</div>`;
const errorBox = (what) => `<div class="state-box state-box--error" role="alert">
  <div class="state-box__icon">${ICON.alert}</div><p class="label">Gagal memuat</p><h3>${what} tidak dapat ditampilkan</h3>
  <p>Terjadi gangguan saat mengambil data. Periksa koneksi internet, lalu coba lagi.</p>
  <button class="btn btn--outline" type="button" onclick="location.reload()">Coba lagi</button></div>`;

/* ---------- Program kerja ---------- */
const prokerItem = (p) => `<li class="proker__item">
  <span class="badge badge--${p.status}">${STATUS[p.status]}</span>
  <div><h3>${esc(p.title)}</h3><p>${esc(p.desc.slice(0, 118))}…</p></div>
  <div class="proker__meta">${esc(p.org)}<br>${esc(p.period)}</div>
  <a class="read-more proker__more" href="artikel.html?type=proker&id=${p.id}">Baca Selengkapnya →</a></li>`;
const prokerSkel = (n) => Array.from({ length: n }, () => `<li class="proker__item" aria-hidden="true">
  <span class="skel" style="width:96px;height:26px"></span>
  <div><div class="skel" style="width:40%;height:18px;margin-top:8px"></div><div class="skel" style="width:90%;height:12px;margin-top:14px"></div><div class="skel" style="width:70%;height:12px;margin-top:8px"></div></div>
  <div class="proker__meta"><div class="skel" style="width:70px;height:12px;margin-left:auto"></div></div></li>`).join("");

function renderProker(el, limit, filter = "semua") {
  if (!el) return;
  const m = mode("proker");
  el.setAttribute("aria-busy", m === "loading");
  if (m === "loading") return (el.innerHTML = `<ul class="proker">${prokerSkel(3)}</ul>`);
  if (m === "error") return (el.innerHTML = errorBox("Program kerja"));
  const all = m === "empty" ? [] : DATA.proker;
  const items = all.filter((p) => filter === "semua" || p.status === filter).slice(0, limit || 99);
  if (!all.length) return (el.innerHTML = stateBox({ icon: "calendar", label: "Program kerja", title: "Belum ada program kerja",
    text: "Program kerja Kabinet Nexus akan tampil di sini setelah disahkan dalam rapat kerja." }));
  if (!items.length) return (el.innerHTML = stateBox({ icon: "search", label: "Filter", title: `Tidak ada program berstatus “${STATUS[filter]}”`,
    text: "Coba pilih status lain untuk melihat program kerja yang tersedia.", action: `<button class="btn btn--outline" type="button" data-reset-filter>Tampilkan semua</button>` }));
  el.innerHTML = `<ul class="proker">${items.map(prokerItem).join("")}</ul>`;
}

/* ---------- Publikasi ---------- */
const pubItem = (n) => `<li class="pub">
  <a class="ph" data-label="Foto" href="artikel.html?type=berita&id=${n.id}" tabindex="-1" aria-hidden="true"><img src="${n.img}" alt=""></a>
  <div><h3><a href="artikel.html?type=berita&id=${n.id}">${esc(n.title)}</a></h3><p>${esc(n.desc.slice(0, 150))}…</p>
  <div class="pub__foot"><span>${fmt(n.date)}</span><a class="read-more" href="artikel.html?type=berita&id=${n.id}">Baca Selengkapnya →</a></div></div></li>`;
const pubSkel = (n) => Array.from({ length: n }, () => `<li class="pub" aria-hidden="true"><div class="skel" style="aspect-ratio:3/2;max-width:180px"></div>
  <div><div class="skel" style="width:60%;height:18px"></div><div class="skel" style="width:95%;height:12px;margin-top:14px"></div><div class="skel" style="width:75%;height:12px;margin-top:8px"></div><div class="skel" style="width:80px;height:10px;margin-top:18px"></div></div></li>`).join("");

function renderNews(el, limit) {
  if (!el) return;
  const m = mode("news");
  el.setAttribute("aria-busy", m === "loading");
  if (m === "loading") return (el.innerHTML = `<ul class="pubs">${pubSkel(2)}</ul>`);
  if (m === "error") return (el.innerHTML = errorBox("Publikasi"));
  if (m === "empty") { document.querySelectorAll("[data-hide-when-empty]").forEach((x) => (x.hidden = true));
    return (el.innerHTML = stateBox({ icon: "doc", label: "Publikasi", title: "Belum ada publikasi",
      text: "Dokumentasi dan kabar kegiatan HIMATKN akan diunggah di sini. Sementara itu, ikuti Instagram @himatknuklir.",
      action: `<a class="btn btn--outline" href="https://instagram.com/himatknuklir" target="_blank" rel="noopener">Buka Instagram</a>` })); }
  let list = [...DATA.news].sort((a, b) => b.date.localeCompare(a.date));
  if (!limit) list = [...list, ...list.map((n) => ({ ...n }))]; // halaman daftar: contoh lebih banyak
  el.innerHTML = `<ul class="pubs">${list.slice(0, limit || 99).map(pubItem).join("")}</ul>`;
}

/* ---------- Kepengurusan (beranda) ---------- */
function renderDivisions(el) {
  if (!el) return;
  const m = mode("struktur");
  if (m === "loading") return (el.innerHTML = `<div class="divisions" aria-hidden="true">${Array.from({ length: 6 }, () => `<div class="division"><div class="skel" style="width:50px;height:10px"></div><div class="skel" style="width:55%;height:16px;margin-top:16px"></div><div class="skel" style="width:85%;height:11px;margin-top:12px"></div></div>`).join("")}</div>`);
  if (m === "error") return (el.innerHTML = errorBox("Struktur kepengurusan"));
  if (m === "empty") return (el.innerHTML = stateBox({ icon: "people", label: "Kepengurusan", title: "Struktur periode baru sedang disusun",
    text: "Susunan pengurus akan diumumkan setelah pelantikan kabinet." }));
  el.innerHTML = `<div class="divisions">${DATA.divisions.map((d) => `<div class="division"><p class="label">${d.kind}</p><h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p></div>`).join("")}
    ${DATA.divisions.length % 2 ? `<a class="division division--link" href="struktur.html?view=semua"><p class="label">Struktur</p><h3>Lihat seluruh pengurus</h3><p>Nama dan jabatan tiap divisi periode ${PERIOD}.</p></a>` : ""}</div>`;
  const stats = $(".struct-stats strong"); if (stats) stats.textContent = DATA.divisions.length;
}

/* ---------- Halaman struktur ---------- */
const personCard = (p) => `<article class="person">
  <div class="avatar">${p.photo ? `<img src="${p.photo}" alt="">` : ICON.avatar}</div>
  <span class="role${p.tier === "lead" ? " role--lead" : p.tier === "vice" ? " role--vice" : ""}">${esc(p.role)}</span>
  <h3 class="person__name">${esc(p.name)}</h3><p class="person__period">${PERIOD}</p></article>`;
const link = (t) => `<div class="tree__link" aria-hidden="true"><span>${t}</span></div>`;
function divisionTree(d) {
  if (!d.members.length) return stateBox({ icon: "people", label: d.name, title: "Data pengurus belum tersedia",
    text: "Nama pengurus divisi ini belum diunggah. Hubungi Divisi Minfo jika ada data yang perlu ditambahkan." });
  const lead = d.members.filter((m) => m.tier === "lead"), vice = d.members.filter((m) => m.tier === "vice"), rest = d.members.filter((m) => !m.tier);
  return `<div class="tree">
    ${lead.length ? `<div class="tree__row">${lead.map(personCard).join("")}</div>` : ""}
    ${vice.length ? link("Koordinasi") + `<div class="tree__row">${vice.map(personCard).join("")}</div>` : ""}
    ${rest.length ? link(lead.length ? "Pelaksana" : "Anggota") + `<div class="tree__row">${rest.map(personCard).join("")}</div>` : ""}</div>`;
}
const treeSkel = () => `<div class="tree" aria-hidden="true"><div class="tree__row">${'<div class="person"><div class="avatar skel"></div><div class="skel" style="width:60%;height:16px;margin:0 auto"></div><div class="skel" style="width:80%;height:14px;margin:12px auto 0"></div></div>'.repeat(3)}</div></div>`;

function renderStruktur() {
  const root = $("#struktur-root"); if (!root) return;
  const m = mode("struktur");
  const segBtns = document.querySelectorAll("#struktur-seg button");
  const picker = $("#struktur-picker"), select = $("#div-select"), count = $("#div-count");
  let view = params.get("view") === "semua" ? "semua" : "divisi";
  let cur = DATA.divisions.find((d) => d.id === params.get("div")) || DATA.divisions[0];
  select.innerHTML = DATA.divisions.map((d) => `<option value="${d.id}" ${d.id === cur.id ? "selected" : ""}>${esc(d.name)}${d.short ? ` (${d.short})` : ""}</option>`).join("");

  const draw = () => {
    segBtns.forEach((b) => b.setAttribute("aria-selected", b.dataset.view === view));
    picker.hidden = view !== "divisi";
    count.textContent = m === "filled" ? `${cur.members.length} personil` : "—";
    if (m === "loading") return (root.innerHTML = `<div class="skel" style="width:280px;height:26px;margin:56px auto 0"></div>${treeSkel()}`);
    if (m === "error") return (root.innerHTML = `<div style="margin-top:48px">${errorBox("Struktur kepengurusan")}</div>`);
    if (m === "empty") return (root.innerHTML = `<div style="margin-top:48px">${stateBox({ icon: "people", label: "Kepengurusan", title: "Struktur periode baru sedang disusun", text: "Susunan pengurus akan tampil setelah pelantikan kabinet." })}</div>`);
    if (view === "divisi") root.innerHTML = `<h2 class="div-title">${esc(cur.name)}${cur.short ? ` (${cur.short})` : ""}</h2>${divisionTree(cur)}`;
    else root.innerHTML = `<div class="all-divs">${DATA.divisions.map((d) => `<section><h2 class="div-title">${esc(d.name)}</h2><div style="margin-top:32px">${d.members.length ? divisionTree(d) : stateBox({ icon: "people", label: d.name, title: "Data pengurus belum tersedia", text: "Nama pengurus divisi ini belum diunggah." })}</div></section>`).join("")}</div>`;
  };
  segBtns.forEach((b) => b.addEventListener("click", () => { view = b.dataset.view; draw(); }));
  select.addEventListener("change", () => { cur = DATA.divisions.find((d) => d.id === select.value); draw(); });
  draw();
}

/* ---------- Halaman kegiatan ---------- */
function renderKegiatan() {
  const el = $("#kegiatan-list"); if (!el) return;
  const seg = document.querySelectorAll("#kegiatan-seg button");
  let filter = params.get("filter") || "semua";
  const counts = { semua: DATA.proker.length };
  DATA.proker.forEach((p) => (counts[p.status] = (counts[p.status] || 0) + 1));
  seg.forEach((b) => { const c = mode("proker") === "filled" ? counts[b.dataset.filter] || 0 : 0; b.insertAdjacentHTML("beforeend", `<span class="count">${c}</span>`); });
  const draw = () => { seg.forEach((b) => b.setAttribute("aria-selected", b.dataset.filter === filter)); renderProker(el, 0, filter); };
  seg.forEach((b) => b.addEventListener("click", () => { filter = b.dataset.filter; draw(); }));
  el.addEventListener("click", (e) => { if (e.target.closest("[data-reset-filter]")) { filter = "semua"; draw(); } });
  draw();
}

/* ---------- Bank soal ---------- */
function renderSoal() {
  const el = $("#soal-list"); if (!el) return;
  const q = $("#soal-q"), sem = $("#soal-sem");
  const m = mode("soal");
  if (params.get("q")) q.value = params.get("q");
  const draw = () => {
    if (m === "loading") return (el.innerHTML = `<div class="soal-grid" aria-hidden="true">${'<div class="soal"><div class="skel" style="width:60%;height:16px"></div><div class="skel" style="width:30%;height:11px"></div><div class="skel" style="width:100%;height:50px;margin-top:8px"></div></div>'.repeat(6)}</div>`);
    if (m === "error") return (el.innerHTML = `<div style="margin-top:32px">${errorBox("Bank soal")}</div>`);
    if (m === "empty") return (el.innerHTML = `<div style="margin-top:32px">${stateBox({ icon: "doc", label: "Bank soal", title: "Bank soal belum tersedia",
      text: "Divisi Reaksi sedang mengumpulkan arsip soal ujian. Punya soal tahun lalu? Kirimkan ke himatknuklir@gmail.com.",
      action: `<a class="btn btn--outline" href="mailto:himatknuklir@gmail.com">Kirim soal</a>` })}</div>`);
    const term = q.value.trim().toLowerCase(), s = sem.value;
    const items = DATA.soal.filter((c) => (!term || c.name.toLowerCase().includes(term)) && (s === "all" || String(c.sem) === s));
    el.innerHTML = items.length
      ? `<div class="soal-grid">${items.map((c) => `<article class="soal"><h3>${esc(c.name)}</h3><p class="meta">Semester ${c.sem} · ${c.files.length} berkas</p>
          <ul class="soal__files">${c.files.map((f) => `<li><a href="#" download>${f} (PDF)</a></li>`).join("")}</ul></article>`).join("")}</div>`
      : `<div style="margin-top:32px">${stateBox({ icon: "search", label: "Pencarian", title: `Tidak ada hasil untuk “${esc(q.value || "filter ini")}”`,
          text: "Periksa ejaan nama mata kuliah, atau pilih semester lain.", action: `<button class="btn btn--outline" type="button" id="soal-reset">Reset pencarian</button>` })}</div>`;
    $("#soal-reset")?.addEventListener("click", () => { q.value = ""; sem.value = "all"; draw(); });
  };
  q.addEventListener("input", draw); sem.addEventListener("change", draw);
  draw();
}

/* ---------- Artikel ---------- */
function renderArtikel() {
  const el = $("#artikel"); if (!el) return;
  const type = params.get("type") === "proker" ? "proker" : "berita";
  const item = (type === "proker" ? DATA.proker : DATA.news).find((x) => x.id === params.get("id")) || (params.has("id") ? null : DATA.news[0]);
  const back = type === "proker" ? ["kegiatan.html", "Kegiatan"] : ["publikasi.html", "Publikasi"];
  document.querySelectorAll(".nav a, .mobile-nav a").forEach((a) => { a.removeAttribute("aria-current"); if (a.getAttribute("href") === back[0]) a.setAttribute("aria-current", "page"); });
  if (!item) { el.innerHTML = stateBox({ icon: "search", label: "404", title: "Konten tidak ditemukan", text: "Tulisan ini mungkin sudah dihapus atau tautannya salah.", action: `<a class="btn btn--outline" href="${back[0]}">Kembali ke ${back[1]}</a>` }); return; }
  document.title = `${item.title} · HIMATKN`;
  el.innerHTML = `<p class="crumb"><a href="index.html">Beranda</a> / <a href="${back[0]}">${back[1]}</a></p>
    <h1>${esc(item.title)}</h1>
    <div class="article__meta">${type === "proker" ? `<span class="badge badge--${item.status}">${STATUS[item.status]}</span><span>${item.org} · ${item.period}</span>` : `<span>${fmt(item.date)}</span><span>Divisi Minfo</span>`}</div>
    <div class="ph article__cover" data-label="Foto">${item.img ? `<img src="${item.img}" alt="">` : ""}</div>
    <div class="article__body"><p>${LOREM} Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>
    <div class="article__nav"><a class="read-more" href="${back[0]}">← Kembali ke ${back[1]}</a><a class="read-more" href="https://instagram.com/himatknuklir" target="_blank" rel="noopener">Dokumentasi di Instagram →</a></div>`;
}

/* ---------- Header, menu, peta, gambar ---------- */
function initChrome() {
  const header = $(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8 || params.get("header") === "scrolled");
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  const btn = $(".menu-btn");
  const set = (open) => { document.body.classList.toggle("menu-open", open); btn?.setAttribute("aria-expanded", open); btn?.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu"); };
  btn?.addEventListener("click", () => set(!document.body.classList.contains("menu-open")));
  document.querySelectorAll(".mobile-nav a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  if (params.get("menu") === "open") set(true);

  const map = $(".map");
  if (map) {
    if (params.get("map") === "error") map.classList.add("is-error");
    else { const t = setTimeout(() => map.classList.add("is-error"), 9000); map.querySelector("iframe")?.addEventListener("load", () => clearTimeout(t)); }
  }
  document.addEventListener("error", (e) => { if (e.target.tagName === "IMG" && e.target.closest(".ph")) e.target.remove(); }, true);
  document.querySelectorAll(".ph img").forEach((i) => { if (i.complete && !i.naturalWidth) i.remove(); });
}

/* ---------- Panel state (hapus sebelum rilis) ---------- */
function initPanel() {
  if (params.get("panel") === "off" || document.body.dataset.panel === "off") return;
  const keys = (document.body.dataset.states || "").split(" ").filter(Boolean);
  const opts = { proker: ["filled", "empty", "loading", "error"], news: ["filled", "empty", "loading", "error"], struktur: ["filled", "empty", "loading", "error"],
    soal: ["filled", "empty", "loading", "error"], map: ["ok", "error"], menu: ["closed", "open"] };
  const names = { proker: "Program kerja", news: "Publikasi", struktur: "Struktur", soal: "Bank soal", map: "Peta", menu: "Menu mobile" };
  const p = document.createElement("details");
  p.className = "state-panel";
  p.innerHTML = `<summary>State UI</summary><div class="body">${[...keys, "map", "menu"].map((k) => `<label>${names[k]}<select data-k="${k}">${opts[k].map((o) => `<option ${o === (params.get(k) || opts[k][0]) ? "selected" : ""}>${o}</option>`).join("")}</select></label>`).join("")}<small>Hanya untuk review. Sembunyikan: ?panel=off</small></div>`;
  p.addEventListener("change", (e) => { const q = new URLSearchParams(location.search); q.set(e.target.dataset.k, e.target.value); location.search = q; });
  document.body.appendChild(p);
}

document.addEventListener("DOMContentLoaded", () => {
  initChrome();
  renderProker($("#home-proker"), 3);
  renderNews($("#home-news"), 2);
  renderNews($("#news-list"), 0);
  renderDivisions($("#home-divisions"));
  renderStruktur();
  renderKegiatan();
  renderSoal();
  renderArtikel();
  initPanel();
});
