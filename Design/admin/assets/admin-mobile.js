/* HIMATKN Admin — lapisan tampilan PONSEL (dipakai mobile.html).
   Dimuat SETELAH data.js dan admin.js. Shell (sidebar + hamburger), dialog, toast, dan
   halaman lain tetap dari admin.js. File ini hanya mengganti isi DAFTAR supaya hierarki
   kartunya rapi di layar sempit:

     [gambar]  Judul (maks. 2 baris)                         ›
               [STATUS]  info · info · info  (1 baris, terpotong …)

   - Judul selalu baris pertama dan memakai lebar penuh (status tidak memakan tempat judul).
   - Badge status + satu baris keterangan tanpa label (tidak ditumpuk per kolom).
   - Seluruh baris bisa diketuk untuk membuka edit; tombol hapus ada di dalam form edit. */

Object.assign(P, { right: '<path d="m9 5 7 7-7 7"/>' });

/* ---------- Komponen baris ---------- */
function row({ tag = "button", attrs = "", lead = "", title, titleCls = "", status = "", meta, muted = false, chev = true }) {
  return `<li><${tag} ${attrs} class="m-row ${chev ? "" : "m-row--static"} ${muted ? "is-muted" : ""}">${lead}
    <span class="m-row__main"><span class="m-row__title ${titleCls}">${title}</span>
    <span class="m-row__sub">${status}<span class="m-row__meta">${meta}</span></span></span>
    ${chev ? ic("right", "m-row__chev") : ""}</${tag}></li>`;
}
/* Tanggal ringkas: tahun berjalan tidak ditulis (12 Okt), tahun lain lengkap (12 Okt 2025) */
const shortDate = (s) => (d(s).getFullYear() === NOW.getFullYear() ? `${d(s).getDate()} ${BULAN[d(s).getMonth()]}` : fmtDate(s));
const tagText = (ids) => { const names = ids.map(tagName).filter(Boolean); return names.length ? names[0] + (names.length > 1 ? ` +${names.length - 1}` : "") : ""; };
const segHtml = (list, sel) => `<div class="seg" role="group" aria-label="Status">${list.map(([k, l, n]) => `<button type="button" aria-pressed="${k === sel}" data-st="${k}">${l}<span class="count">${n}</span></button>`).join("")}</div>`;

/* Drawer: tombol hapus (danger) masuk ke "Zona berbahaya" di akhir isi form, bukan di footer
   (footer ponsel terlalu sempit untuk Hapus + Batal + Simpan). */
function openDrawer({ label, title, body, submit = "Simpan", onSubmit, danger }) {
  const wrap = mountLayer(`<div class="overlay" data-close></div><form class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title" novalidate>
    <div class="drawer__head"><div><p class="label">${label}</p><h2 id="dr-title">${title}</h2></div><button type="button" class="icon-btn" data-close aria-label="Tutup">${ic("x")}</button></div>
    <div class="drawer__body">${body}${danger ? `<div class="m-danger"><p class="label">Zona berbahaya</p><p class="small muted">Tindakan ini tidak bisa dibatalkan.</p>${danger}</div>` : ""}</div>
    <div class="drawer__foot"><button type="button" class="btn btn--outline" data-close>Batal</button>${submit ? `<button type="submit" class="btn btn--solid">${submit}</button>` : ""}</div></form>`);
  const form = $("form", wrap);
  setTimeout(() => $(".drawer__head [data-close]", form)?.focus(), 60);
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeLayers(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $('[type="submit"]', form);
    if (onSubmit && onSubmit(form) === false) { $(".has-error input, .has-error select, .has-error textarea", form)?.focus(); return; }
    btn.classList.add("is-busy"); btn.textContent = "Menyimpan";
    setTimeout(() => closeLayers(), 650);
  });
  return form;
}

/* =========================================================
   PUBLIKASI
   [sampul] Judul
            [STATUS] 12 Okt · Kegiatan +2 · penulis
   ========================================================= */
function mViewNews(el, sub) {
  if (sub) return newsEditor(el, sub);
  let q = "", status = "all", tag = "", page = 1;
  const all = [...data(DB.news)].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  el.innerHTML = pageHead({ label: "Konten", title: "Publikasi", desc: "Hanya publikasi berstatus Terbit yang tampil di situs.", actions: can("news.create") ? `<a class="btn btn--solid" href="#/news/new">${ic("plus")} Tulis publikasi</a>` : "" })
    + (!can("news.update") ? readOnly("news.update") : "")
    + `<div class="card"><div class="toolbar m-toolbar"><div class="search"><input type="search" placeholder="Cari judul…" aria-label="Cari publikasi" data-q></div>
      <select class="select-sm" data-tag aria-label="Tag"><option value="">Semua tag</option>${DB.tags.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select><div data-seg></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    if (!all.length) { $(".m-toolbar", el).hidden = true; return (body.innerHTML = emptyBlock({ icon: "news", label: "Publikasi", title: "Belum ada publikasi", text: "Mulai dengan menulis kabar atau dokumentasi kegiatan pertama.", action: can("news.create") ? '<a class="btn btn--solid" href="#/news/new">Tulis publikasi</a>' : "" })); }
    const base = all.filter((n) => (!tag || n.tags.includes(+tag)) && (!q || norm(n.title).includes(norm(q))));
    const c = (k) => base.filter((n) => k === "all" || n.status === k).length;
    $("[data-seg]", el).innerHTML = segHtml([["all", "Semua", c("all")], ["published", "Terbit", c("published")], ["draft", "Draft", c("draft")], ["archived", "Arsip", c("archived")]], status);
    const rows = base.filter((n) => status === "all" || n.status === status);
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<ul class="m-rows">${rows.slice((page - 1) * 10, page * 10).map((n) => row({ tag: "a", attrs: `href="#/news/${n.id}"`,
      lead: `<span class="thumb">${coverOf(n)?.src ? `<img src="${coverOf(n).src}" alt="">` : ic("image")}</span>`,
      title: esc(n.title), status: badge(NEWS_STATUS, n.status),
      meta: [shortDate(n.updated_at), tagText(n.tags), n.author].filter(Boolean).join(" · ") })).join("")}</ul>${pager(rows.length, page)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-tag]", el).addEventListener("change", (e) => { tag = e.target.value; page = 1; draw(); });
  el.addEventListener("click", (e) => {
    const s = e.target.closest("[data-st]"); if (s) { status = s.dataset.st; page = 1; draw(); $(`[data-st="${status}"]`, el)?.focus(); }
    const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); }
    if (e.target.closest("[data-clear]")) { q = ""; status = "all"; tag = ""; $("[data-q]", el).value = ""; $("[data-tag]", el).value = ""; draw(); }
  });
  draw();
}

/* =========================================================
   PROGRAM KERJA
   Judul
   [STATUS] Divisi Minfo · 10–30 Nov 2026
   ========================================================= */
function mRange(s, e) {
  if (!s) return "Belum dijadwalkan";
  if (!e || e === s) return fmtDate(s);
  const a = d(s), b = d(e);
  if (a.getFullYear() !== b.getFullYear()) return `${fmtDate(s)} – ${fmtDate(e)}`;
  if (a.getMonth() !== b.getMonth()) return `${a.getDate()} ${BULAN[a.getMonth()]} – ${fmtDate(e)}`;
  return `${a.getDate()}–${b.getDate()} ${BULAN[b.getMonth()]} ${b.getFullYear()}`;
}
function programForm(p) {
  const isNew = !p; p = p || { status: "planned", period_id: activePeriod()?.id };
  const form = openDrawer({
    label: "Program kerja", title: isNew ? "Tambah program kerja" : "Edit program kerja", submit: isNew ? "Tambah program" : "Simpan perubahan",
    danger: !isNew ? `<button type="button" class="btn btn--danger-outline" data-delp>${ic("trash")} Hapus program kerja</button>` : "",
    body: field({ name: "name", label: "Nama program", value: p.name || "", req: true })
      + field({ name: "slug", label: "Alamat halaman", value: p.slug || "", req: true, prefix: "/program/", hint: "Terisi otomatis dari nama. Harus unik." })
      + `<div class="field-row">${field({ name: "period_id", label: "Periode", type: "select", req: true, options: opts(DB.periods.map((x) => [x.id, x.name + (x.is_active ? " (aktif)" : "")]), p.period_id) })}${field({ name: "division_id", label: "Divisi", type: "select", options: divisionOptions(p.period_id, p.division_id), hint: "Pilihan mengikuti periode." })}</div>`
      + field({ name: "status", label: "Status", type: "select", req: true, options: opts(Object.entries(PROG_STATUS).map(([k, v]) => [k, v[0]]), p.status) })
      + `<div class="field-row">${field({ name: "start_date", label: "Tanggal mulai", type: "date", value: p.start_date || "" })}${field({ name: "end_date", label: "Tanggal selesai", type: "date", value: p.end_date || "" })}</div>`
      + field({ name: "description", label: "Deskripsi", type: "textarea", value: p.description || "", hint: "Ditampilkan di halaman Program Kerja situs." }),
    onSubmit: (f) => {
      if (!required(f, ["name", "slug", "period_id", "status"])) return false;
      if (DB.programs.some((x) => x.slug === f.slug.value && x !== p)) { setError(f, "slug", "Alamat ini sudah dipakai program lain."); return false; }
      if (f.start_date.value && f.end_date.value && f.end_date.value < f.start_date.value) { setError(f, "end_date", "Tanggal selesai tidak boleh sebelum tanggal mulai."); return false; }
      setTimeout(() => { Object.assign(p, Object.fromEntries(new FormData(f))); p.period_id = +p.period_id; p.division_id = p.division_id ? +p.division_id : null; if (isNew) { p.id = Date.now(); DB.programs.unshift(p); } toast(isNew ? "Program kerja ditambahkan." : "Program kerja diperbarui."); route(); }, 660);
    }
  });
  let touched = !isNew; form.name.addEventListener("input", () => { if (!touched) form.slug.value = slugify(form.name.value); }); form.slug.addEventListener("input", () => (touched = true));
  form.period_id.addEventListener("change", () => { form.division_id.innerHTML = divisionOptions(form.period_id.value, ""); });
  $("[data-delp]", form)?.addEventListener("click", () => confirmDialog({ title: "Hapus program kerja?", text: `“${esc(p.name)}” akan dihapus dari situs dan tidak bisa dikembalikan.`, onConfirm: () => { DB.programs = DB.programs.filter((x) => x !== p); toast("Program kerja dihapus."); route(); } }));
}
function mViewPrograms(el) {
  let q = "", st = "all", div = "", period = String(activePeriod()?.id || ""), page = 1;
  const manage = can("programs.manage");
  const all = data(DB.programs);
  const byDate = (a, b) => (a.start_date || "9999").localeCompare(b.start_date || "9999") || a.name.localeCompare(b.name);
  el.innerHTML = pageHead({ label: "Konten", title: "Program Kerja", desc: "Ditampilkan di halaman Program Kerja situs.", actions: manage ? `<button type="button" class="btn btn--solid" data-new>${ic("plus")} Tambah program</button>` : "" })
    + (!manage ? readOnly("programs.manage") : "")
    + `<div class="card"><div class="toolbar m-toolbar"><div class="search"><input type="search" placeholder="Cari program…" aria-label="Cari program" data-q></div>
      <select class="select-sm" data-period aria-label="Periode">${opts(DB.periods.map((x) => [x.id, x.name + (x.is_active ? " ●" : "")]), period, "Semua periode")}</select>
      <select class="select-sm" data-div aria-label="Divisi"></select><div data-seg></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const fillDiv = () => { $("[data-div]", el).innerHTML = period ? divisionOptions(period, div, "Semua divisi") : '<option value="">Semua divisi</option>'; };
  const draw = () => {
    const newBtn = manage ? '<button type="button" class="btn btn--solid" data-new>Tambah program</button>' : "";
    if (!all.length) { $(".m-toolbar", el).hidden = true; return (body.innerHTML = emptyBlock({ icon: "programs", label: "Program kerja", title: "Belum ada program kerja", text: "Tambahkan program kerja hasil rapat kerja kabinet.", action: newBtn })); }
    const base = all.filter((p) => (!period || p.period_id === +period) && (!div || p.division_id === +div) && (!q || norm(p.name).includes(norm(q)))).sort(byDate);
    const c = (k) => base.filter((p) => k === "all" || p.status === k).length;
    $("[data-seg]", el).innerHTML = segHtml([["all", "Semua", c("all")], ...Object.entries(PROG_STATUS).map(([k, v]) => [k, v[0], c(k)])], st);
    if (!all.some((p) => !period || p.period_id === +period) && !q) return (body.innerHTML = emptyBlock({ icon: "programs", label: `Periode ${periodName(period)}`, title: "Periode ini belum punya program kerja", text: "Pilih periode lain atau tambahkan program baru.", action: newBtn }));
    const rows = base.filter((p) => st === "all" || p.status === st);
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<ul class="m-rows">${rows.slice((page - 1) * 10, page * 10).map((p) => row({
      tag: manage ? "button" : "div", attrs: manage ? `type="button" data-edit="${p.id}"` : "", chev: manage, muted: p.status === "cancelled",
      title: esc(p.name), status: badge(PROG_STATUS, p.status),
      meta: [p.division_id ? divName(p.division_id) : "Tanpa divisi", mRange(p.start_date, p.end_date), period ? "" : periodName(p.period_id)].filter(Boolean).join(" · ") })).join("")}</ul>${pager(rows.length, page)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-period]", el).addEventListener("change", (e) => { period = e.target.value; div = ""; page = 1; fillDiv(); draw(); });
  $("[data-div]", el).addEventListener("change", (e) => { div = e.target.value; page = 1; draw(); });
  el.addEventListener("click", (e) => {
    const s = e.target.closest("[data-st]"); if (s) { st = s.dataset.st; page = 1; draw(); $(`[data-st="${st}"]`, el)?.focus(); }
    const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); }
    if (e.target.closest("[data-new]")) programForm();
    const ed = e.target.closest("[data-edit]"); if (ed) programForm(DB.programs.find((x) => x.id === +ed.dataset.edit));
    if (e.target.closest("[data-clear]")) { q = ""; st = "all"; div = ""; $("[data-q]", el).value = ""; fillDiv(); draw(); }
  });
  fillDiv(); draw();
}

/* =========================================================
   ADMINISTRATOR
   (AV) username  ANDA
        [ROLE] Aktif · masuk 7 jam lalu
   ========================================================= */
function adminForm(a) {
  const isNew = !a; a = a || { role: "editor", is_active: true };
  const self = a.id === me.id;
  const f = openDrawer({ label: "Administrator", title: isNew ? "Tambah administrator" : `Edit ${a.username}`, submit: isNew ? "Tambah administrator" : "Simpan perubahan",
    danger: !isNew && !self ? `<button type="button" class="btn btn--danger-outline" data-dela>${ic("trash")} Hapus akun ${a.username}</button>` : "",
    body: field({ name: "username", label: "Username", value: a.username || "", req: true, attrs: 'autocomplete="off" autocapitalize="none" spellcheck="false"', hint: "Huruf kecil, angka, titik, atau garis bawah." })
      + `<div class="field" data-field="password"><label for="f-password">Kata sandi ${isNew ? '<span class="req" aria-hidden="true">*</span>' : ""}</label><div class="pw"><input class="input" id="f-password" name="password" type="password" autocomplete="new-password"><button type="button" data-pw aria-label="Tampilkan kata sandi">${ic("eye")}</button></div><p class="hint">${isNew ? "Minimal 8 karakter." : "Kosongkan bila tidak diubah."}</p></div>`
      + field({ name: "role", label: "Role", type: "select", req: true, attrs: self ? "disabled" : "", options: opts(Object.keys(ROLES).map((r) => [r, ROLES[r].label + (roleCovers(r) ? "" : " — melebihi akses Anda"), !roleCovers(r)]), a.role), hint: self ? "Anda tidak dapat mengubah role akun sendiri." : "Anda hanya dapat memberi role yang aksesnya tidak melebihi akses Anda." })
      + `<div class="field" style="margin-top:18px"><label class="switch"><input type="checkbox" name="is_active" ${a.is_active ? "checked" : ""} ${self ? "disabled" : ""}><span class="switch__track"></span><span>Akun aktif</span></label>${self ? '<p class="hint">Anda tidak dapat menonaktifkan akun sendiri.</p>' : ""}</div>`
      + (isNew ? "" : `<div class="notice notice--amber" style="margin-top:18px">${ic("alert")}<div>Mengganti kata sandi atau role, atau menonaktifkan akun, akan langsung mengakhiri semua sesi login ${a.username}.</div></div>`),
    onSubmit: (form) => {
      if (!required(form, isNew ? ["username", "password"] : ["username"])) return false;
      if (!/^[a-z0-9._]{3,50}$/.test(form.username.value)) { setError(form, "username", "Gunakan 3–50 karakter: huruf kecil, angka, titik, garis bawah."); return false; }
      if (DB.admins.some((x) => x.username === form.username.value && x !== a)) { setError(form, "username", "Username sudah dipakai."); return false; }
      if (form.password.value && form.password.value.length < 8) { setError(form, "password", "Kata sandi minimal 8 karakter."); return false; }
      setTimeout(() => { Object.assign(a, { username: form.username.value, role: self ? a.role : form.role.value, is_active: self ? true : form.is_active.checked }); if (isNew) { a.id = Date.now(); a.last_login_at = null; DB.admins.push(a); } toast(isNew ? "Administrator ditambahkan." : "Administrator diperbarui."); route(); }, 660);
    } });
  wirePw($("[data-pw]", f), $("#f-password", f));
  $("[data-dela]", f)?.addEventListener("click", () => confirmDialog({ title: `Hapus akun ${a.username}?`, text: "Akun ini tidak bisa login lagi dan semua sesinya diakhiri. Riwayat aktivitasnya tetap tersimpan.", onConfirm: () => { DB.admins = DB.admins.filter((x) => x !== a); toast("Administrator dihapus."); route(); } }));
}
function mViewAdmins(el) {
  const manage = can("admins.manage");
  let tab = "list";
  const RANK = { superadmin: 0, admin: 1, editor: 2 };
  const roleBadge = (r) => `<span class="badge ${r === "superadmin" ? "badge--green" : r === "admin" ? "badge--mint" : "badge--outline"}">${ROLES[r].label}</span>`;
  const shell = () => {
    el.innerHTML = pageHead({ label: "Sistem", title: "Administrator", desc: "Akun yang dapat masuk ke panel admin.", actions: manage && tab === "list" ? `<button type="button" class="btn btn--solid" data-new>${ic("plus")} Tambah administrator</button>` : "" })
      + (!manage ? readOnly("admins.manage") : "")
      + (can("roles.manage") ? `<div class="tabs" role="tablist"><button role="tab" aria-selected="${tab === "list"}" data-tab="list">Administrator</button><button role="tab" aria-selected="${tab === "roles"}" data-tab="roles">Role</button></div>` : "")
      + `<div data-body></div>`;
    const body = $("[data-body]", el);
    if (tab === "roles") {
      const lvl = (r, v, m) => (m && ROLES[r].perms.includes(m) ? '<span class="tick">Kelola</span>' : v && ROLES[r].perms.includes(v) ? '<span class="muted">Lihat</span>' : '<span class="cross" aria-label="Tidak ada akses">—</span>');
      body.innerHTML = `<p class="small muted" style="margin-bottom:12px">Informasi saja. Role bersifat tetap dan tidak bisa diubah dari panel.</p>${Object.keys(ROLES).map((r) => `<section class="card m-role"><div class="card__head">${roleBadge(r)}<span class="small muted">${DB.admins.filter((a) => a.role === r).length} akun</span></div><ul class="m-kv">${MODULES.map(([name, v, m]) => `<li><span>${name}</span>${lvl(r, v, m)}</li>`).join("")}</ul></section>`).join("")}`;
      return;
    }
    const list = [...data(DB.admins)].sort((a, b) => (b.id === me.id) - (a.id === me.id) || b.is_active - a.is_active || RANK[a.role] - RANK[b.role] || a.username.localeCompare(b.username));
    if (!list.length) { body.innerHTML = `<div class="card">${emptyBlock({ icon: "admins", title: "Belum ada administrator lain", text: "Tambahkan akun untuk pengurus yang membantu mengelola situs.", action: manage ? '<button type="button" class="btn btn--solid" data-new>Tambah administrator</button>' : "" })}</div>`; return; }
    body.innerHTML = `<div class="card"><ul class="m-rows">${list.map((a) => row({
      tag: manage ? "button" : "div", attrs: manage ? `type="button" data-edit="${a.id}"` : "", chev: manage, muted: !a.is_active,
      lead: `<span class="avatar ${a.is_active ? "" : "avatar--off"}">${initials(a.username)}</span>`,
      title: a.username + (a.id === me.id ? '<span class="m-you">Anda</span>' : ""), status: roleBadge(a.role),
      meta: `${a.is_active ? "Aktif" : "Nonaktif"} · ${a.last_login_at ? "masuk " + rel(a.last_login_at) : "belum pernah masuk"}` })).join("")}</ul></div>`;
  };
  el.onclick = (e) => {
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; shell(); $(`[data-tab="${tab}"]`, el)?.focus(); }
    if (e.target.closest("[data-new]")) adminForm();
    const ed = e.target.closest("[data-edit]"); if (ed) adminForm(DB.admins.find((x) => x.id === +ed.dataset.edit));
  };
  shell();
}

/* =========================================================
   LOG AKTIVITAS — ketuk baris untuk melihat IP & perangkat
   (AV) Keterangan
        [AKSI] 16 Nov, 09:12 · admin
   ========================================================= */
function mViewActivity(el) {
  let q = "", kind = "all", who = "", page = 1;
  const all = [...data(DB.activity)].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const KB = { create: ["Tambah", "badge--mint"], update: ["Ubah", "badge--blue"], delete: ["Hapus", "badge--red"] };
  el.innerHTML = pageHead({ label: "Sistem", title: "Log Aktivitas", desc: "Catatan setiap perubahan data oleh administrator. Tidak dapat diubah atau dihapus." })
    + `<div class="card"><div class="toolbar m-toolbar"><div class="search"><input type="search" placeholder="Cari keterangan…" aria-label="Cari log" data-q></div>
      <select class="select-sm" data-w aria-label="Administrator"><option value="">Semua admin</option>${[...new Set(all.map((a) => a.admin))].map((u) => `<option>${u}</option>`).join("")}</select><div data-seg></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    if (!all.length) { $(".m-toolbar", el).hidden = true; return (body.innerHTML = emptyBlock({ icon: "activity", label: "Log", title: "Belum ada aktivitas tercatat", text: "Setiap perubahan data oleh administrator akan tercatat otomatis." })); }
    const base = all.filter((a) => (!who || a.admin === who) && (!q || norm(a.description).includes(norm(q))));
    const c = (k) => base.filter((a) => k === "all" || a.kind === k).length;
    $("[data-seg]", el).innerHTML = segHtml([["all", "Semua", c("all")], ...Object.entries(KB).map(([k, v]) => [k, v[0], c(k)])], kind);
    const rows = base.filter((a) => kind === "all" || a.kind === kind);
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<ul class="m-rows">${rows.slice((page - 1) * 20, page * 20).map((a) => `<li><details class="m-log"><summary class="m-row">
      <span class="avatar avatar--sm">${initials(a.admin)}</span>
      <span class="m-row__main"><span class="m-row__title m-row__title--plain">${esc(a.description)}</span>
      <span class="m-row__sub">${badge(KB, a.kind)}<span class="m-row__meta">${shortDate(a.created_at)}, ${fmtTime(a.created_at)} · ${a.admin}</span></span></span>${ic("right", "m-row__chev")}</summary>
      <p class="m-log__more">Alamat IP ${a.ip_address} · ${a.device}</p></details></li>`).join("")}</ul>${pager(rows.length, page, 20)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-w]", el).addEventListener("change", (e) => { who = e.target.value; page = 1; draw(); });
  el.onclick = (e) => {
    const s = e.target.closest("[data-st]"); if (s) { kind = s.dataset.st; page = 1; draw(); $(`[data-st="${kind}"]`, el)?.focus(); }
    const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); }
    if (e.target.closest("[data-clear]")) { q = ""; kind = "all"; who = ""; $("[data-q]", el).value = ""; $("[data-w]", el).value = ""; draw(); }
  };
  draw();
}

/* =========================================================
   STATISTIK PENGUNJUNG
   /halaman
   16 Nov 2026, 15:50 · Ponsel · Safari
   ========================================================= */
function mViewVisitors(el) {
  const v = [...data(DB.visits)].sort((a, b) => b.visited_at.localeCompare(a.visited_at)); let page = 1; const per = 20;
  el.innerHTML = pageHead({ label: "Sistem", title: "Statistik Pengunjung", desc: "Catatan kunjungan ke situs publik." })
    + `<div class="visitor-head"><div class="stat"><div class="stat__top"><span class="label label--muted">Total kunjungan</span><span class="stat__icon">${ic("chart")}</span></div><div class="stat__value">${v.length}</div></div>
      <div class="notice">${ic("lock")}<div><strong>Privasi pengunjung.</strong> Alamat IP tidak disimpan; hanya kode anonim, halaman, waktu, dan jenis perangkat.</div></div></div>
    <section class="card"><div class="card__head"><h2>Log kunjungan</h2><span class="small muted">Terbaru di atas</span></div><div data-body></div></section>`;
  const body = $("[data-body]", el);
  const draw = () => {
    if (!v.length) { body.innerHTML = emptyBlock({ icon: "chart", label: "Statistik", title: "Belum ada kunjungan tercatat", text: "Data akan muncul setelah situs publik dikunjungi." }); return; }
    body.innerHTML = `<ul class="m-rows">${v.slice((page - 1) * per, page * per).map((x) => row({ tag: "div", chev: false, title: x.page, titleCls: "m-row__title--mono", meta: `${fmtDT(x.visited_at)} · ${device(x.user_agent)}` })).join("")}</ul>${pager(v.length, page, per)}`;
  };
  el.onclick = (e) => { const pg = e.target.closest("[data-page]"); if (pg && !pg.disabled) { page = +pg.dataset.page; draw(); } };
  draw();
}

/* =========================================================
   PASANG
   ========================================================= */
const MOBILE_VIEWS = { news: mViewNews, programs: mViewPrograms, admins: mViewAdmins, activity: mViewActivity, visitors: mViewVisitors };
ROUTES.forEach((r) => { if (MOBILE_VIEWS[r.path]) r.render = MOBILE_VIEWS[r.path]; });
/* Di bingkai pratinjau (layar lebar) yang menggulir adalah .shell, bukan jendela */
addEventListener("hashchange", () => { const s = $(".shell"); if (s) s.scrollTop = 0; });
route();
