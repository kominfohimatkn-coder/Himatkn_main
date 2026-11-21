/* HIMATKN — data + render state.
   Atur state lewat URL, contoh: index.html?proker=empty&news=loading&map=error
   proker / news / struktur / dokumen = filled | empty | loading | error
   loading = all  → seluruh bagian web dalam keadaan memuat
   delay = <ms>   → lama simulasi jaringan (default 650, 0 = tanpa jeda)
   map = ok | error · menu = open · info = open (dropdown Informasi) · header = scrolled · panel = off · q = kata kunci */

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
  // CONTOH — judul, keterangan, dan ukuran masih dummy; ganti dengan dokumen asli
  dokumen: [
    { id: "ad", title: "Anggaran Dasar HIMATKN", category: "Konstitusi", desc: "Dasar organisasi: nama, asas, tujuan, keanggotaan, dan struktur himpunan.", size: "1,2 MB", updated: "2026-02-10", file: "#" },
    { id: "art", title: "Anggaran Rumah Tangga HIMATKN", category: "Konstitusi", desc: "Aturan pelaksanaan Anggaran Dasar, termasuk hak dan kewajiban anggota.", size: "980 KB", updated: "2026-02-10", file: "#" },
    { id: "gbho", title: "Garis Besar Haluan Organisasi", category: "Pedoman", desc: "Arah kerja dan program jangka panjang himpunan untuk setiap kepengurusan.", size: "1,6 MB", updated: "2026-03-02", file: "#" },
    { id: "sop", title: "Pedoman Administrasi Kesekretariatan", category: "Pedoman", desc: "Tata naskah surat, penomoran, dan pengarsipan dokumen himpunan.", size: "2,4 MB", updated: "2026-03-15", file: "#" }
  ]
};

const PERIOD = "2025/2026";
const BULAN = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const STATUS = { berjalan: "Berjalan", selesai: "Selesai", terencana: "Terencana" };
const params = new URLSearchParams(location.search);
/* Simulasi jeda jaringan supaya loading state terlihat. ?delay=0 untuk mematikan. */
const DELAY = params.has("delay") ? Number(params.get("delay")) || 0 : 650;
const mode = (k) => (params.get("loading") === "all" ? "loading" : params.get(k) || "filled");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (iso) => { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`; };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
function mark(text, term) {
  const t = esc(text); if (!term) return t;
  const i = norm(text).indexOf(norm(term)); if (i < 0) return t;
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + term.length)) + "</mark>" + esc(text.slice(i + term.length));
}

/* ---------- Progress bar global ---------- */
const Topbar = {
  el: null, pending: 0,
  init() { this.el = document.createElement("div"); this.el.className = "topbar"; this.el.setAttribute("aria-hidden", "true"); document.body.prepend(this.el); requestAnimationFrame(() => (this.el.style.width = "35%")); },
  start() { this.pending++; if (this.el) { this.el.classList.remove("is-done"); this.el.style.width = Math.min(85, 35 + this.pending * 15) + "%"; } },
  done() { this.pending = Math.max(0, this.pending - 1); if (!this.pending && this.el) this.el.classList.add("is-done"); },
  go() { if (this.el) { this.el.classList.remove("is-done"); this.el.style.transition = "none"; this.el.style.width = "0"; requestAnimationFrame(() => { this.el.style.transition = ""; this.el.style.width = "70%"; }); } }
};

/* Render dengan loading: tampilkan skeleton → tunggu → render konten + animasi */
function load(el, skeleton, render, { key, delay = DELAY } = {}) {
  if (!el) return;
  el.classList.remove("swap-in");
  el.innerHTML = skeleton;
  el.setAttribute("aria-busy", "true");
  Topbar.start();
  if (key && mode(key) === "loading") return; // state "loading" permanen untuk review
  setTimeout(() => {
    render();
    el.setAttribute("aria-busy", "false");
    void el.offsetWidth; el.classList.add("swap-in");
    watchImages(el);
    Topbar.done();
  }, delay);
}

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
const noResult = (term, what) => stateBox({ icon: "search", label: "Pencarian", title: `Tidak ada ${what} untuk “${esc(term)}”`,
  text: "Periksa ejaan atau gunakan kata kunci lain.", action: `<button class="btn btn--outline" type="button" data-clear-search>Hapus pencarian</button>` });

/* ---------- Program kerja ---------- */
const prokerItem = (p, term) => `<li class="proker__item">
  <span class="badge badge--${p.status}">${STATUS[p.status]}</span>
  <div><h3>${mark(p.title, term)}</h3><p>${mark(p.desc.slice(0, 118), term)}…</p></div>
  <div class="proker__meta">${esc(p.org)}<br>${esc(p.period)}</div>
  <a class="read-more proker__more" href="artikel.html?type=proker&id=${p.id}">Baca Selengkapnya →</a></li>`;
const prokerSkel = (n) => `<ul class="proker">${Array.from({ length: n }, () => `<li class="proker__item" aria-hidden="true">
  <span class="skel" style="width:96px;height:26px"></span>
  <div><div class="skel" style="width:40%;height:18px;margin-top:8px"></div><div class="skel" style="width:90%;height:12px;margin-top:14px"></div><div class="skel" style="width:70%;height:12px;margin-top:8px"></div></div>
  <div class="proker__meta"><div class="skel" style="width:70px;height:12px;margin-left:auto"></div></div></li>`).join("")}</ul>`;

function prokerHTML({ limit, filter = "semua", term = "" }) {
  const m = mode("proker");
  if (m === "error") return errorBox("Program kerja");
  const all = m === "empty" ? [] : DATA.proker;
  if (!all.length) return stateBox({ icon: "calendar", label: "Program kerja", title: "Belum ada program kerja", text: "Program kerja Kabinet Nexus akan tampil di sini setelah disahkan dalam rapat kerja." });
  const items = all.filter((p) => (filter === "semua" || p.status === filter) && (!term || norm(p.title + " " + p.desc).includes(norm(term)))).slice(0, limit || 99);
  if (!items.length && term) return noResult(term, "program kerja");
  if (!items.length) return stateBox({ icon: "search", label: "Filter", title: `Tidak ada program berstatus “${STATUS[filter]}”`, text: "Coba pilih status lain untuk melihat program kerja yang tersedia.", action: `<button class="btn btn--outline" type="button" data-reset-filter>Tampilkan semua</button>` });
  return `<ul class="proker">${items.map((p) => prokerItem(p, term)).join("")}</ul>`;
}

/* ---------- Publikasi ---------- */
const pubItem = (n, term) => `<li class="pub">
  <a class="ph" data-label="Foto" href="artikel.html?type=berita&id=${n.id}" tabindex="-1" aria-hidden="true"><img src="${n.img}" alt=""></a>
  <div><h3><a href="artikel.html?type=berita&id=${n.id}">${mark(n.title, term)}</a></h3><p>${mark(n.desc.slice(0, 150), term)}…</p>
  <div class="pub__foot"><span>${fmt(n.date)}</span><a class="read-more" href="artikel.html?type=berita&id=${n.id}">Baca Selengkapnya →</a></div></div></li>`;
const pubSkel = (n) => `<ul class="pubs">${Array.from({ length: n }, () => `<li class="pub" aria-hidden="true"><div class="skel" style="aspect-ratio:3/2;max-width:180px"></div>
  <div><div class="skel" style="width:60%;height:18px"></div><div class="skel" style="width:95%;height:12px;margin-top:14px"></div><div class="skel" style="width:75%;height:12px;margin-top:8px"></div><div class="skel" style="width:80px;height:10px;margin-top:18px"></div></div></li>`).join("")}</ul>`;

function newsHTML({ limit, term = "" }) {
  const m = mode("news");
  $$("[data-hide-when-empty]").forEach((x) => (x.hidden = m === "empty"));
  if (m === "error") return errorBox("Publikasi");
  if (m === "empty") return stateBox({ icon: "doc", label: "Publikasi", title: "Belum ada publikasi", text: "Dokumentasi dan kabar kegiatan HIMATKN akan diunggah di sini. Sementara itu, ikuti Instagram @himatknuklir.",
    action: `<a class="btn btn--outline" href="https://instagram.com/himatknuklir" target="_blank" rel="noopener">Buka Instagram</a>` });
  let list = [...DATA.news].sort((a, b) => b.date.localeCompare(a.date));
  if (!limit) list = [...list, ...list]; // halaman daftar: contoh lebih banyak
  if (term) list = list.filter((n) => norm(n.title + " " + n.desc).includes(norm(term)));
  $$("[data-hide-when-searching]").forEach((x) => (x.hidden = !!term));
  if (!list.length) return noResult(term, "publikasi");
  return `<ul class="pubs">${list.slice(0, limit || 99).map((n) => pubItem(n, term)).join("")}</ul>`;
}

/* ---------- Search bar (dipakai di halaman Program Kerja & Publikasi) ---------- */
function initSearch({ input, onSearch, what }) {
  if (!input) return { term: "" };
  const box = input.closest(".search"), info = $("#search-info"), clear = box.querySelector(".search__clear");
  const state = { term: params.get("q") || "" };
  input.value = state.term;
  let t;
  const run = (fromTyping) => {
    state.term = input.value.trim();
    clear.hidden = !state.term;
    const url = new URL(location.href); state.term ? url.searchParams.set("q", state.term) : url.searchParams.delete("q"); history.replaceState(null, "", url);
    if (fromTyping) { box.classList.add("is-searching"); setTimeout(() => box.classList.remove("is-searching"), 350); }
    onSearch(state.term, fromTyping);
  };
  input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(() => run(true), 250); });
  input.closest("form")?.addEventListener("submit", (e) => { e.preventDefault(); clearTimeout(t); run(true); });
  clear.addEventListener("click", () => { input.value = ""; run(true); input.focus(); });
  document.addEventListener("click", (e) => { if (e.target.closest("[data-clear-search]")) { input.value = ""; run(true); input.focus(); } });
  state.setInfo = (count) => { if (info) info.innerHTML = state.term && count ? `<strong>${count}</strong> ${what} cocok dengan “${esc(state.term)}”` : ""; };
  clear.hidden = !state.term;
  return state;
}

/* ---------- Beranda ---------- */
function renderHome() {
  const pk = $("#home-proker"); if (pk) load(pk, prokerSkel(3), () => (pk.innerHTML = prokerHTML({ limit: 3 })), { key: "proker" });
  const nw = $("#home-news"); if (nw) load(nw, pubSkel(2), () => (nw.innerHTML = newsHTML({ limit: 2 })), { key: "news" });
  const dv = $("#home-divisions");
  if (dv) load(dv, `<div class="divisions" aria-hidden="true">${Array.from({ length: 6 }, () => `<div class="division"><div class="skel" style="width:50px;height:10px"></div><div class="skel" style="width:55%;height:16px;margin-top:16px"></div><div class="skel" style="width:85%;height:11px;margin-top:12px"></div></div>`).join("")}</div>`, () => {
    const m = mode("struktur");
    if (m === "error") return (dv.innerHTML = errorBox("Struktur kepengurusan"));
    if (m === "empty") return (dv.innerHTML = stateBox({ icon: "people", label: "Kepengurusan", title: "Struktur periode baru sedang disusun", text: "Susunan pengurus akan diumumkan setelah pelantikan kabinet." }));
    dv.innerHTML = `<div class="divisions">${DATA.divisions.map((d) => `<div class="division"><p class="label">${d.kind}</p><h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p></div>`).join("")}
      ${DATA.divisions.length % 2 ? `<a class="division division--link" href="struktur.html?view=semua"><p class="label">Struktur</p><h3>Lihat seluruh pengurus</h3><p>Nama dan jabatan tiap divisi periode ${PERIOD}.</p></a>` : ""}</div>`;
  }, { key: "struktur" });
}

/* ---------- Halaman Program Kerja ---------- */
function renderKegiatan() {
  const el = $("#kegiatan-list"); if (!el) return;
  const seg = $$("#kegiatan-seg button");
  let filter = params.get("filter") || "semua";
  const counts = { semua: DATA.proker.length };
  DATA.proker.forEach((p) => (counts[p.status] = (counts[p.status] || 0) + 1));
  seg.forEach((b) => b.insertAdjacentHTML("beforeend", `<span class="count">${mode("proker") === "filled" ? counts[b.dataset.filter] || 0 : 0}</span>`));
  const search = initSearch({ input: $("#q"), what: "program kerja", onSearch: (term, typing) => draw(typing ? 220 : DELAY) });
  function draw(delay = DELAY) {
    seg.forEach((b) => b.setAttribute("aria-selected", b.dataset.filter === filter));
    load(el, prokerSkel(3), () => {
      el.innerHTML = prokerHTML({ filter, term: search.term });
      search.setInfo(mode("proker") === "filled" ? $$(".proker__item", el).length : null);
    }, { key: "proker", delay });
  }
  seg.forEach((b) => b.addEventListener("click", () => { filter = b.dataset.filter; draw(220); }));
  el.addEventListener("click", (e) => { if (e.target.closest("[data-reset-filter]")) { filter = "semua"; draw(220); } });
  draw();
}

/* ---------- Halaman Publikasi ---------- */
function renderPublikasi() {
  const el = $("#news-list"); if (!el) return;
  const search = initSearch({ input: $("#q"), what: "publikasi", onSearch: (term, typing) => draw(typing ? 220 : DELAY) });
  function draw(delay = DELAY) {
    load(el, pubSkel(3), () => {
      el.innerHTML = newsHTML({ term: search.term });
      search.setInfo(mode("news") === "filled" ? $$(".pub", el).length : null);
    }, { key: "news", delay });
  }
  draw();
}

/* ---------- Halaman Struktur ---------- */
const personCard = (p) => `<article class="person">
  <div class="avatar">${p.photo ? `<img src="${p.photo}" alt="">` : ICON.avatar}</div>
  <span class="role${p.tier === "lead" ? " role--lead" : p.tier === "vice" ? " role--vice" : ""}">${esc(p.role)}</span>
  <h3 class="person__name">${esc(p.name)}</h3><p class="person__period">${PERIOD}</p></article>`;
const link = (t) => `<div class="tree__link" aria-hidden="true"><span>${t}</span></div>`;
function divisionTree(d) {
  if (!d.members.length) return stateBox({ icon: "people", label: d.name, title: "Data pengurus belum tersedia", text: "Nama pengurus divisi ini belum diunggah. Hubungi Divisi Minfo jika ada data yang perlu ditambahkan." });
  const lead = d.members.filter((m) => m.tier === "lead"), vice = d.members.filter((m) => m.tier === "vice"), rest = d.members.filter((m) => !m.tier);
  return `<div class="tree">
    ${lead.length ? `<div class="tree__row">${lead.map(personCard).join("")}</div>` : ""}
    ${vice.length ? link("Koordinasi") + `<div class="tree__row">${vice.map(personCard).join("")}</div>` : ""}
    ${rest.length ? link(lead.length ? "Pelaksana" : "Anggota") + `<div class="tree__row">${rest.map(personCard).join("")}</div>` : ""}</div>`;
}
const treeSkel = `<div class="skel" style="width:280px;height:26px;margin:56px auto 0"></div><div class="tree" aria-hidden="true"><div class="tree__row">${'<div class="person"><div class="avatar skel"></div><div class="skel" style="width:60%;height:16px;margin:0 auto"></div><div class="skel" style="width:80%;height:14px;margin:12px auto 0"></div></div>'.repeat(3)}</div></div>`;

function renderStruktur() {
  const root = $("#struktur-root"); if (!root) return;
  const m = mode("struktur");
  const segBtns = $$("#struktur-seg button"), picker = $("#struktur-picker"), select = $("#div-select"), count = $("#div-count");
  let view = params.get("view") === "semua" ? "semua" : "divisi";
  let cur = DATA.divisions.find((d) => d.id === params.get("div")) || DATA.divisions[0];
  select.innerHTML = DATA.divisions.map((d) => `<option value="${d.id}" ${d.id === cur.id ? "selected" : ""}>${esc(d.name)}${d.short ? ` (${d.short})` : ""}</option>`).join("");
  const draw = (delay = DELAY) => {
    segBtns.forEach((b) => b.setAttribute("aria-selected", b.dataset.view === view));
    picker.hidden = view !== "divisi";
    count.textContent = m === "filled" ? `${cur.members.length} personil` : "—";
    load(root, treeSkel, () => {
      if (m === "error") return (root.innerHTML = `<div style="margin-top:48px">${errorBox("Struktur kepengurusan")}</div>`);
      if (m === "empty") return (root.innerHTML = `<div style="margin-top:48px">${stateBox({ icon: "people", label: "Kepengurusan", title: "Struktur periode baru sedang disusun", text: "Susunan pengurus akan tampil setelah pelantikan kabinet." })}</div>`);
      root.innerHTML = view === "divisi"
        ? `<h2 class="div-title">${esc(cur.name)}${cur.short ? ` (${cur.short})` : ""}</h2>${divisionTree(cur)}`
        : `<div class="all-divs">${DATA.divisions.map((d) => `<section><h2 class="div-title">${esc(d.name)}</h2><div style="margin-top:32px">${divisionTree(d)}</div></section>`).join("")}</div>`;
    }, { key: "struktur", delay });
  };
  segBtns.forEach((b) => b.addEventListener("click", () => { view = b.dataset.view; draw(300); }));
  select.addEventListener("change", () => { cur = DATA.divisions.find((d) => d.id === select.value); draw(300); });
  draw();
}

/* ---------- Dokumen ---------- */
function docItem(d) {
  return `<article class="doc">
  <div class="doc__icon" aria-hidden="true">${ICON.doc}<span>PDF</span></div>
  <div class="doc__body">
    <p class="label">${esc(d.category)}</p>
    <h3>${esc(d.title)}</h3>
    <p class="doc__desc">${esc(d.desc)}</p>
    <p class="doc__meta">PDF · ${esc(d.size)} · Diperbarui ${fmt(d.updated)}</p>
    <div class="doc__actions">
      <a class="btn btn--outline btn--sm" href="${d.file}" target="_blank" rel="noopener" aria-label="Lihat ${esc(d.title)} (PDF, tab baru)">Lihat <span aria-hidden="true">↗</span></a>
      <a class="btn btn--solid btn--sm" href="${d.file}" download aria-label="Unduh ${esc(d.title)} (PDF, ${esc(d.size)})">Unduh</a>
    </div>
  </div>
</article>`;
}
function renderDokumen() {
  const el = $("#dokumen-list"); if (!el) return;
  const skel = `<div class="docs" aria-hidden="true">${'<div class="doc"><div class="skel" style="width:44px;height:54px"></div><div class="doc__body"><div class="skel" style="width:30%;height:11px"></div><div class="skel" style="width:70%;height:18px;margin-top:10px"></div><div class="skel" style="width:100%;height:36px;margin-top:10px"></div><div class="skel" style="width:45%;height:11px;margin-top:10px"></div></div></div>'.repeat(4)}</div>`;
  load(el, skel, () => {
    const m = mode("dokumen");
    if (m === "error") return (el.innerHTML = errorBox("Dokumen"));
    if (m === "empty") return (el.innerHTML = stateBox({ icon: "doc", label: "Dokumen", title: "Belum ada dokumen", text: "Dokumen resmi HIMATKN akan tersedia di sini. Butuh dokumen tertentu? Hubungi himatknuklir@gmail.com.", action: `<a class="btn btn--outline" href="mailto:himatknuklir@gmail.com">Hubungi kami</a>` }));
    el.innerHTML = `<div class="docs">${DATA.dokumen.map(docItem).join("")}</div>`;
  }, { key: "dokumen" });
}

/* ---------- Artikel (detail proker / berita) ---------- */
function renderArtikel() {
  const el = $("#artikel"); if (!el) return;
  const type = params.get("type") === "proker" ? "proker" : "berita";
  const back = type === "proker" ? ["kegiatan.html", "Program Kerja"] : ["publikasi.html", "Publikasi"];
  $$(".nav a, .mobile-nav a").forEach((a) => { a.removeAttribute("aria-current"); if (a.getAttribute("href") === back[0]) a.setAttribute("aria-current", "page"); });
  // search bar di halaman detail: mencari di daftar terkait
  const form = $("#detail-search");
  form.action = back[0];
  $("#detail-q").placeholder = type === "proker" ? "Cari program kerja lain…" : "Cari berita atau publikasi lain…";
  $("#detail-q-label").textContent = type === "proker" ? "Cari program kerja" : "Cari publikasi";
  const skel = `<div class="skel" style="width:160px;height:12px"></div><div class="skel" style="width:80%;height:36px;margin-top:20px"></div><div class="skel" style="width:40%;height:14px;margin-top:16px"></div>
    <div class="skel" style="aspect-ratio:16/9;margin:32px 0"></div>${'<div class="skel" style="height:14px;margin-top:12px"></div>'.repeat(5)}`;
  load(el, skel, () => {
    const m = mode(type === "proker" ? "proker" : "news");
    if (m === "error") return (el.innerHTML = errorBox("Konten"));
    const item = (type === "proker" ? DATA.proker : DATA.news).find((x) => x.id === params.get("id")) || (params.has("id") ? null : DATA.news[0]);
    if (!item || m === "empty") return (el.innerHTML = stateBox({ icon: "search", label: "404", title: "Konten tidak ditemukan", text: "Tulisan ini mungkin sudah dihapus atau tautannya salah.", action: `<a class="btn btn--outline" href="${back[0]}">Kembali ke ${back[1]}</a>` }));
    document.title = `${item.title} · HIMATKN`;
    el.innerHTML = `<p class="crumb"><a href="index.html">Beranda</a> / <a href="${back[0]}">${back[1]}</a></p>
      <h1>${esc(item.title)}</h1>
      <div class="article__meta">${type === "proker" ? `<span class="badge badge--${item.status}">${STATUS[item.status]}</span><span>${item.org} · ${item.period}</span>` : `<span>${fmt(item.date)}</span><span>Divisi Minfo</span>`}</div>
      <div class="ph article__cover" data-label="Foto">${item.img ? `<img src="${item.img}" alt="">` : ""}</div>
      <div class="article__body"><p>${LOREM} Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p></div>
      <div class="article__nav"><a class="read-more" href="${back[0]}">← Kembali ke ${back[1]}</a><a class="read-more" href="https://instagram.com/himatknuklir" target="_blank" rel="noopener">Dokumentasi di Instagram →</a></div>`;
  }, { key: type === "proker" ? "proker" : "news" });
}

/* ---------- Gambar: shimmer → fade-in ---------- */
function watchImages(root = document) {
  $$(".ph img", root).forEach((img) => {
    const ph = img.closest(".ph");
    const ok = () => { img.classList.add("is-loaded"); ph.classList.remove("is-loading"); };
    const fail = () => { ph.classList.remove("is-loading"); img.remove(); };
    if (img.complete) { img.naturalWidth ? ok() : fail(); return; }
    ph.classList.add("is-loading");
    img.addEventListener("load", ok, { once: true });
    img.addEventListener("error", fail, { once: true });
  });
}

/* ---------- Reveal saat scroll ---------- */
function initReveal() {
  const targets = $$(".sec-head, .about > div, .pillar, .struct-head, .struct-stats, .struct-foot, .sec-foot, .page-title, .page-intro, .page-rule, .seg, .picker, .search, .footer-top, .footer-map");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  targets.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => targets.includes(c));
    el.style.setProperty("--i", Math.min(sibs.indexOf(el), 5));
    el.classList.add("reveal"); io.observe(el);
  });
}

/* ---------- Header, menu, peta, transisi halaman ---------- */
function initChrome() {
  const header = $(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8 || params.get("header") === "scrolled");
  onScroll(); addEventListener("scroll", onScroll, { passive: true });
  const btn = $(".menu-btn");
  const set = (open) => { document.body.classList.toggle("menu-open", open); btn?.setAttribute("aria-expanded", open); btn?.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu"); };
  btn?.addEventListener("click", () => set(!document.body.classList.contains("menu-open")));
  $$(".mobile-nav a").forEach((a) => a.addEventListener("click", () => set(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  if (params.get("menu") === "open") set(true);

  // Dropdown "Informasi": buka saat hover (desktop) atau klik/Enter (sentuh & keyboard)
  $$(".nav__group").forEach((g) => {
    const t = g.querySelector(".nav__trigger");
    const open = (o) => { g.classList.toggle("is-open", o); t.setAttribute("aria-expanded", o); };
    t.addEventListener("click", () => open(!g.classList.contains("is-open")));
    g.addEventListener("mouseenter", () => open(true));
    g.addEventListener("mouseleave", () => open(false));
    g.addEventListener("focusout", (e) => { if (!g.contains(e.relatedTarget)) open(false); });
    document.addEventListener("click", (e) => { if (!g.contains(e.target)) open(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && g.classList.contains("is-open")) { open(false); t.focus(); } });
    if (g.querySelector('[aria-current="page"]')) t.classList.add("is-current");
    if (params.get("info") === "open") open(true);
  });

  const map = $(".map");
  if (map) {
    if (params.get("map") === "error") map.classList.add("is-error");
    else { const t = setTimeout(() => map.classList.add("is-error"), 9000); map.querySelector("iframe")?.addEventListener("load", () => clearTimeout(t)); }
  }

  // Transisi antarhalaman: fade-out + progress bar sebelum pindah
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download") || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    if (url.href === location.href) return;
    e.preventDefault();
    document.body.classList.add("is-leaving"); Topbar.go();
    setTimeout(() => (location.href = url.href), 200);
  });
  addEventListener("pageshow", (e) => { if (e.persisted) document.body.classList.remove("is-leaving"); });
}

/* ---------- Panel state (hapus sebelum rilis) ---------- */
function initPanel() {
  if (params.get("panel") === "off" || document.body.dataset.panel === "off") return;
  const keys = (document.body.dataset.states || "").split(" ").filter(Boolean);
  const opts = { loading: ["off", "all"], proker: ["filled", "empty", "loading", "error"], news: ["filled", "empty", "loading", "error"], struktur: ["filled", "empty", "loading", "error"],
    dokumen: ["filled", "empty", "loading", "error"], map: ["ok", "error"], menu: ["closed", "open"] };
  const names = { loading: "Loading semua", proker: "Program kerja", news: "Publikasi", struktur: "Struktur", dokumen: "Dokumen", map: "Peta", menu: "Menu mobile" };
  const p = document.createElement("details");
  p.className = "state-panel";
  p.innerHTML = `<summary>State UI</summary><div class="body">${["loading", ...keys, "map", "menu"].map((k) => `<label>${names[k]}<select data-k="${k}">${opts[k].map((o) => `<option ${o === (params.get(k) || opts[k][0]) ? "selected" : ""}>${o}</option>`).join("")}</select></label>`).join("")}<small>Hanya untuk review. Sembunyikan: ?panel=off · tanpa jeda: ?delay=0</small></div>`;
  p.addEventListener("change", (e) => { const q = new URLSearchParams(location.search); q.set(e.target.dataset.k, e.target.value); location.search = q; });
  document.body.appendChild(p);
}

document.addEventListener("DOMContentLoaded", () => {
  Topbar.init(); Topbar.start();
  initChrome();
  watchImages();
  renderHome();
  renderKegiatan();
  renderPublikasi();
  renderStruktur();
  renderDokumen();
  renderArtikel();
  initReveal();
  initPanel();
  if (document.readyState === "complete") Topbar.done(); else addEventListener("load", () => Topbar.done(), { once: true });
});
