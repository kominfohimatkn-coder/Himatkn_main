/* HIMATKN Admin — prototipe interaktif.
   URL: index.html?role=superadmin|admin|editor&state=normal|loading|empty|error|expired#/halaman
   Semua aksi simpan/hapus hanya simulasi di memori. */

const params = new URLSearchParams(location.search);
const ROLE = ROLES[params.get("role")] ? params.get("role") : "superadmin";
const STATE = params.get("state") || "normal";
const DELAY = params.has("delay") ? Number(params.get("delay")) || 0 : 450;
const me = { ...ME[ROLE], perms: new Set(ROLES[ROLE].perms) };
const can = (p) => me.perms.has(p);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NOW = new Date("2026-11-16T16:00:00");
const d = (s) => new Date(s.length === 10 ? s + "T00:00:00" : s);
const fmtDate = (s) => (s ? `${d(s).getDate()} ${BULAN[d(s).getMonth()]} ${d(s).getFullYear()}` : "—");
const fmtTime = (s) => d(s).toTimeString().slice(0, 5);
const fmtDT = (s) => (s ? `${fmtDate(s)}, ${fmtTime(s)}` : "—");
function rel(s) {
  if (!s) return "Belum pernah";
  const m = Math.round((NOW - d(s)) / 60000);
  if (m < 1) return "baru saja"; if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60); if (h < 24) return `${h} jam lalu`;
  const dd = Math.round(h / 24); return dd < 7 ? `${dd} hari lalu` : fmtDate(s);
}
const bytes = (n) => (n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB");
const initials = (n) => n.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = (s) => String(s).toLowerCase();
const isEmpty = STATE === "empty";
const data = (arr) => (isEmpty ? [] : arr);

/* ---------- Ikon (garis, 24px) ---------- */
const P = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 17h3"/>',
  programs: '<path d="M9 4h6v3H9z"/><path d="M7 5H5v16h14V5h-2"/><path d="m9 13 2 2 4-4"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  org: '<circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M12 8.5V12M5 15.5V12h14v3.5"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  admins: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M16 4.5a3 3 0 0 1 0 6M18 14.6c2 .6 3.2 2.4 3.5 4.9"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.4 19.6l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12 5 5 9-10"/>', alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>', refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  file: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>', mapPin: '<path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};
const ic = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#C9D6CF" stroke-width="2.2"><path d="M20 21 C12 4, 2 8, 4 14 C6 20, 14 21, 20 21Z"/><path d="M20 21 C28 4, 38 8, 36 14 C34 20, 26 21, 20 21Z"/><path d="M20 21 C14 28, 16 38, 20 38 C24 38, 26 28, 20 21Z"/></g><polygon points="20,16.5 23.5,18.5 23.5,22.5 20,24.5 16.5,22.5 16.5,18.5" fill="#06261B" stroke="#C9D6CF" stroke-width="1.4"/></svg>';

/* ---------- Status ---------- */
const NEWS_STATUS = { published: ["Terbit", "badge--green"], draft: ["Draft", "badge--amber"], archived: ["Arsip", "badge--grey"] };
const PROG_STATUS = { ongoing: ["Berjalan", "badge--mint badge--dot"], planned: ["Terencana", "badge--amber"], completed: ["Selesai", "badge--green"] };
const NOTIF_TYPE = { info: ["Info", "badge--blue"], success: ["Berhasil", "badge--mint"], warning: ["Peringatan", "badge--amber"] };
const badge = (map, k) => `<span class="badge ${map[k][1]}">${map[k][0]}</span>`;
const divName = (id) => DB.divisions.find((x) => x.id === Number(id))?.name || "Tanpa divisi";
const posName = (id) => DB.positions.find((x) => x.id === Number(id))?.name || "—";
const tagName = (id) => DB.tags.find((t) => t.id === id)?.name;

/* =========================================================
   KOMPONEN UMUM
   ========================================================= */
const pageHead = ({ label, title, desc, actions = "" }) => `<header class="page-head"><div><p class="label">${label}</p><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div><div class="page-head__actions">${actions}</div></header>`;
function stateBlock({ kind = "", icon = "info", label, title, text, action = "" }) {
  return `<div class="state ${kind ? "state--" + kind : ""}" role="${kind === "error" ? "alert" : "status"}"><div class="state__icon">${ic(icon)}</div>${label ? `<p class="label">${label}</p>` : ""}<h3>${title}</h3><p>${text}</p>${action}</div>`;
}
const errorBlock = (what) => stateBlock({ kind: "error", icon: "alert", label: "Gagal memuat", title: `${what} tidak dapat dimuat`, text: "Server tidak merespons atau koneksi terputus. Coba muat ulang; jika masih gagal, hubungi superadmin.", action: `<button class="btn btn--outline" data-reload>${ic("refresh")} Coba lagi</button>` });
const emptyBlock = (o) => stateBlock({ icon: o.icon || "info", label: o.label, title: o.title, text: o.text, action: o.action || "" });
const noResult = (q) => stateBlock({ icon: "search", label: "Pencarian", title: `Tidak ada hasil untuk “${esc(q)}”`, text: "Periksa ejaan atau ubah filter yang dipakai.", action: `<button class="btn btn--outline" data-clear>Reset filter</button>` });
const forbidden = (perm) => `<div class="card">${stateBlock({ kind: "lock", icon: "lock", label: "403 · Akses ditolak", title: "Anda tidak punya akses ke halaman ini", text: `Halaman ini membutuhkan izin <code class="mono">${perm}</code>. Role <strong>${ROLES[ROLE].label}</strong> tidak memilikinya. Hubungi superadmin bila Anda memerlukan akses.`, action: `<a class="btn btn--outline" href="#/dashboard">Kembali ke dashboard</a>` })}</div>`;
const readOnly = (perm) => `<div class="notice" style="margin-bottom:16px">${ic("eye")}<div><strong>Mode lihat saja.</strong> Role ${ROLES[ROLE].label} dapat melihat data ini tetapi tidak dapat mengubahnya (butuh izin <code class="mono">${perm}</code>).</div></div>`;
const tableSkel = (rows = 5, cols = 5) => `<div class="card"><div class="toolbar"><div class="skel" style="width:280px;height:36px"></div><div class="skel" style="width:220px;height:36px"></div></div><table class="table"><tbody>${Array.from({ length: rows }, () => `<tr>${Array.from({ length: cols }, (_, i) => `<td><div class="skel" style="height:12px;width:${i === 0 ? 70 : 40 + ((i * 17) % 40)}%"></div>${i === 0 ? '<div class="skel" style="height:10px;width:40%;margin-top:8px"></div>' : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const headSkel = `<div class="page-head"><div><div class="skel" style="width:90px;height:10px"></div><div class="skel" style="width:260px;height:28px;margin-top:12px"></div></div></div>`;

function pager(total, page = 1, per = 10) {
  const pages = Math.max(1, Math.ceil(total / per));
  const nums = pages <= 5 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, 2, 3, "…", pages];
  return `<div class="table-foot"><span>Menampilkan ${total ? (page - 1) * per + 1 : 0}–${Math.min(total, page * per)} dari ${total}</span><nav class="pager" aria-label="Halaman"><button disabled aria-label="Sebelumnya">‹</button>${nums.map((n) => (n === "…" ? '<span class="small muted" style="padding:0 4px;align-self:center">…</span>' : `<button ${n === page ? 'aria-current="true"' : ""} aria-label="Halaman ${n}">${n}</button>`)).join("")}<button ${pages === 1 ? "disabled" : ""} aria-label="Berikutnya">›</button></nav></div>`;
}

/* Toast */
function toast(msg, type = "ok") {
  const box = $(".toasts") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toasts" }));
  box.setAttribute("aria-live", "polite");
  const t = document.createElement("div");
  t.className = "toast" + (type === "error" ? " toast--error" : "");
  t.innerHTML = ic(type === "error" ? "alert" : "check") + `<span>${msg}</span>`;
  box.appendChild(t);
  setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 260); }, 3200);
}

/* Drawer */
let lastFocus;
function openDrawer({ label, title, body, submit = "Simpan", onSubmit, danger }) {
  closeLayers(); lastFocus = document.activeElement;
  const wrap = document.createElement("div");
  wrap.className = "layer";
  wrap.innerHTML = `<div class="overlay" data-close></div><form class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title" novalidate>
    <div class="drawer__head"><div><p class="label">${label}</p><h2 id="dr-title">${title}</h2></div><button type="button" class="icon-btn" data-close aria-label="Tutup">${ic("x")}</button></div>
    <div class="drawer__body">${body}</div>
    <div class="drawer__foot">${danger || ""}<span style="flex:1"></span><button type="button" class="btn btn--outline" data-close>Batal</button>${submit ? `<button type="submit" class="btn btn--solid">${submit}</button>` : ""}</div></form>`;
  document.body.appendChild(wrap); document.body.style.overflow = "hidden";
  const form = $("form", wrap);
  setTimeout(() => $("input, select, textarea", form)?.focus(), 60);
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeLayers(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = $('[type="submit"]', form);
    if (onSubmit && onSubmit(form) === false) { $(".has-error input, .has-error select, .has-error textarea", form)?.focus(); return; }
    btn.classList.add("is-busy"); btn.textContent = "Menyimpan";
    setTimeout(() => { closeLayers(); }, 650);
  });
  return form;
}
function confirmDialog({ title, text, confirm = "Hapus", onConfirm }) {
  closeLayers(); lastFocus = document.activeElement;
  const wrap = document.createElement("div");
  wrap.className = "layer";
  wrap.innerHTML = `<div class="overlay" data-close></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="md-t" aria-describedby="md-d">
    <div class="modal__body"><div class="modal__icon">${ic("trash")}</div><h2 id="md-t">${title}</h2><p id="md-d">${text}</p></div>
    <div class="modal__foot"><button class="btn btn--outline" data-close>Batal</button><button class="btn btn--danger" data-ok>${confirm}</button></div></div>`;
  document.body.appendChild(wrap);
  setTimeout(() => $("[data-close].btn", wrap).focus(), 30);
  wrap.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeLayers();
    const ok = e.target.closest("[data-ok]");
    if (ok) { ok.classList.add("is-busy"); ok.textContent = "Menghapus"; setTimeout(() => { closeLayers(); onConfirm && onConfirm(); }, 600); }
  });
}
function closeLayers() { $$(".layer").forEach((l) => l.remove()); document.body.style.overflow = ""; lastFocus?.focus?.(); }
addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLayers(); closeMenus(); document.body.classList.remove("nav-open"); } });

/* Field helpers */
const field = ({ name, label, type = "text", value = "", req, hint, attrs = "", options, prefix, full }) => {
  const id = "f-" + name;
  let control;
  if (type === "textarea") control = `<textarea class="textarea" id="${id}" name="${name}" ${attrs}>${esc(value)}</textarea>`;
  else if (type === "select") control = `<select class="select" id="${id}" name="${name}" ${attrs}>${options}</select>`;
  else control = `<input class="input" id="${id}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}>`;
  if (prefix) control = `<div class="input-group"><span class="prefix">${prefix}</span>${control}</div>`;
  return `<div class="field" data-field="${name}"><label for="${id}">${label}${req ? ' <span class="req" aria-hidden="true">*</span>' : ""}</label>${control}${hint ? `<p class="hint">${hint}</p>` : ""}</div>`;
};
function setError(form, name, msg) {
  const f = $(`[data-field="${name}"]`, form); if (!f) return;
  f.classList.add("has-error"); $(".error-text", f)?.remove();
  f.insertAdjacentHTML("beforeend", `<p class="error-text" id="err-${name}">${ic("alert").replace('class=""', 'width="13" height="13"')} ${msg}</p>`);
  $("input, select, textarea", f)?.setAttribute("aria-describedby", "err-" + name);
}
function clearErrors(form) { $$(".has-error", form).forEach((f) => { f.classList.remove("has-error"); $(".error-text", f)?.remove(); }); }
function required(form, names) {
  clearErrors(form); let ok = true;
  names.forEach((n) => { const el = form.elements[n]; if (el && !String(el.value).trim()) { setError(form, n, "Wajib diisi."); ok = false; } });
  return ok;
}
const opts = (list, sel, ph) => (ph ? `<option value="">${ph}</option>` : "") + list.map(([v, l, dis]) => `<option value="${v}" ${String(v) === String(sel) ? "selected" : ""} ${dis ? "disabled" : ""}>${esc(l)}</option>`).join("");
function dropzone({ name, accept, note, needPerm }) {
  if (needPerm && !can(needPerm)) return `<div class="notice notice--amber">${ic("lock")}<div>Unggah gambar membutuhkan izin <code class="mono">${needPerm}</code>. Minta superadmin mengunggahkan foto, atau biarkan kosong.</div></div>`;
  return `<label class="dropzone" data-drop="${name}">${ic("upload")}<strong>Pilih file</strong> atau seret ke sini<div class="hint" style="margin-top:4px">${note}</div><input type="file" name="${name}" accept="${accept}" class="visually-hidden"></label><div data-file-for="${name}"></div>`;
}
function wireDropzones(root, { maxMB = 4, types }) {
  $$("[data-drop]", root).forEach((z) => {
    const input = $("input", z), out = $(`[data-file-for="${z.dataset.drop}"]`, root);
    const handle = (file) => {
      z.classList.remove("is-error");
      const okType = types.some((t) => file.type === t || file.name.toLowerCase().endsWith(t));
      if (!okType || file.size > maxMB * 1048576) {
        z.classList.add("is-error");
        out.innerHTML = `<p class="error-text" style="margin-top:8px">${!okType ? "Format file tidak didukung." : `Ukuran file ${bytes(file.size)} melebihi batas ${maxMB} MB.`}</p>`;
        return;
      }
      out.innerHTML = `<div class="file-item">${ic("file", "").replace("<svg", '<svg width="20" height="20"')}<div style="flex:1;min-width:0"><div class="small" style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(file.name)}</div><div class="progress"><span></span></div><div class="hint" data-st>Mengunggah… </div></div></div>`;
      const bar = $(".progress span", out), st = $("[data-st]", out); let p = 0;
      const t = setInterval(() => { p += 22; bar.style.width = Math.min(p, 100) + "%"; if (p >= 100) { clearInterval(t); st.textContent = `${bytes(file.size)} · siap disimpan`; } }, 140);
    };
    input.addEventListener("change", () => input.files[0] && handle(input.files[0]));
    z.addEventListener("dragover", (e) => { e.preventDefault(); z.classList.add("is-over"); });
    z.addEventListener("dragleave", () => z.classList.remove("is-over"));
    z.addEventListener("drop", (e) => { e.preventDefault(); z.classList.remove("is-over"); e.dataTransfer.files[0] && handle(e.dataTransfer.files[0]); });
  });
}

/* =========================================================
   ROUTES
   ========================================================= */
const ROUTES = [
  { path: "dashboard", title: "Dashboard", perm: "dashboard.view", icon: "dashboard", group: "Utama", render: viewDashboard },
  { path: "news", title: "Publikasi", perm: "news.view", icon: "news", group: "Konten", render: viewNews },
  { path: "programs", title: "Program Kerja", perm: "programs.view", icon: "programs", group: "Konten", render: viewPrograms },
  { path: "agendas", title: "Agenda", perm: "agendas.view", icon: "agenda", group: "Konten", render: viewAgendas },
  { path: "documents", title: "Dokumen", perm: "documents.view", icon: "doc", group: "Konten", render: viewDocuments },
  { path: "organization", title: "Struktur Organisasi", perm: "organization.view", icon: "org", group: "Organisasi", render: viewOrganization },
  { path: "notifications", title: "Notifikasi", perm: "notifications.view", icon: "bell", group: "Organisasi", render: viewNotifications },
  { path: "admins", title: "Administrator", perm: "admins.view", icon: "admins", group: "Sistem", render: viewAdmins },
  { path: "activity", title: "Log Aktivitas", perm: "activity_logs.view", icon: "activity", group: "Sistem", render: viewActivity },
  { path: "visitors", title: "Statistik Pengunjung", perm: "visitor_logs.view", icon: "chart", group: "Sistem", render: viewVisitors },
  { path: "settings", title: "Pengaturan Situs", perm: "settings.view", icon: "settings", group: "Sistem", render: viewSettings }
];
const unread = () => data(DB.notifications).filter((n) => !n.read_at).length;

function renderShell() {
  const groups = [...new Set(ROUTES.map((r) => r.group))];
  const nav = groups.map((g) => {
    const items = ROUTES.filter((r) => r.group === g && can(r.perm));
    if (!items.length) return "";
    return `<div class="nav__group"><p class="nav__title">${g}</p>${items.map((r) => `<a href="#/${r.path}" data-route="${r.path}">${ic(r.icon)}<span>${r.title}</span>${r.path === "notifications" && unread() ? `<span class="nav__count">${unread()}</span>` : ""}</a>`).join("")}</div>`;
  }).join("");
  document.body.innerHTML = `<a class="visually-hidden" href="#content">Langsung ke konten</a><div class="topline" aria-hidden="true"></div>
  <div class="shell">
    <aside class="sidebar" aria-label="Navigasi admin">
      <a class="sidebar__brand" href="#/dashboard">${LOGO}<span><span class="sidebar__name">Hima Teknokimia Nuklir</span><span class="sidebar__sub">Panel Admin</span></span></a>
      <nav class="nav">${nav}</nav>
      <div class="sidebar__foot">Periode aktif <strong style="color:#fff">${DB.periods.find((p) => p.is_active).name}</strong><br><a href="../index.html" target="_blank" rel="noopener">Lihat situs publik ↗</a></div>
    </aside>
    <div class="sidebar-overlay" data-nav-close></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn topbar__menu" data-nav-open aria-label="Buka navigasi">${ic("menu")}</button>
        <nav class="crumbs" aria-label="Breadcrumb" id="crumbs"></nav>
        <div class="topbar__right">
          ${can("notifications.view") ? `<div style="position:relative"><button class="icon-btn" data-menu="notif" aria-label="Notifikasi" aria-haspopup="true" aria-expanded="false">${ic("bell")}${unread() ? `<span class="dot">${unread()}</span>` : ""}</button></div>` : ""}
          <div style="position:relative"><button class="user" data-menu="user" aria-haspopup="true" aria-expanded="false"><span class="avatar">${initials(me.username)}</span><span class="user__text"><span class="user__name">${me.username}</span><span class="user__role">${ROLES[ROLE].label}</span></span></button></div>
        </div>
      </header>
      <main class="content" id="content" tabindex="-1"></main>
    </div>
  </div>`;
  document.addEventListener("click", onGlobalClick);
}

function closeMenus() { $$(".dropdown").forEach((x) => x.remove()); $$("[data-menu]").forEach((b) => b.setAttribute("aria-expanded", "false")); }
function onGlobalClick(e) {
  const m = e.target.closest("[data-menu]");
  if (m) {
    const open = m.getAttribute("aria-expanded") === "true"; closeMenus(); if (open) return;
    m.setAttribute("aria-expanded", "true");
    const dd = document.createElement("div");
    if (m.dataset.menu === "user") {
      dd.className = "dropdown";
      dd.innerHTML = `<div class="dropdown__head"><div style="font-weight:600">${me.username}</div><div class="small muted">${ROLES[ROLE].label} · ${me.perms.size} izin</div></div>
        <a href="../index.html" target="_blank" rel="noopener">${ic("external")} Lihat situs publik</a>
        <a href="login.html?state=logged-out">${ic("logout")} Keluar</a>`;
    } else {
      dd.className = "dropdown notif-pop";
      const list = data(DB.notifications).slice(0, 4);
      dd.innerHTML = `<div class="dropdown__head"><strong style="font-family:var(--serif)">Notifikasi</strong><span class="small muted">${unread()} belum dibaca</span></div>
        <div class="notif-pop__list">${list.length ? `<ul class="list">${list.map((n) => `<li class="${n.read_at ? "" : "unread"}">${n.read_at ? '<span style="width:8px"></span>' : '<span class="unread-dot"></span>'}<div class="list__main"><div class="list__title">${esc(n.title)}</div><div class="list__meta">${rel(n.created_at)} · ${n.from}</div></div></li>`).join("")}</ul>` : `<p class="small muted" style="padding:20px;text-align:center">Belum ada notifikasi.</p>`}</div>
        <div class="notif-pop__foot"><a class="btn btn--ghost btn--sm" href="#/notifications">Lihat semua</a></div>`;
    }
    m.parentElement.appendChild(dd); return;
  }
  if (!e.target.closest(".dropdown")) closeMenus();
  if (e.target.closest("[data-nav-open]")) document.body.classList.add("nav-open");
  if (e.target.closest("[data-nav-close]") || e.target.closest(".nav a")) document.body.classList.remove("nav-open");
  if (e.target.closest("[data-reload]")) route();
}

/* ---------- Router ---------- */
function route() {
  closeLayers(); closeMenus();
  const [path, sub] = (location.hash.replace(/^#\/?/, "").split("?")[0] || "dashboard").split("/");
  const r = ROUTES.find((x) => x.path === path);
  $$(".nav a").forEach((a) => (a.dataset.route === path ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  const old = $("#content"), main = old.cloneNode(false); old.replaceWith(main); // buang listener halaman sebelumnya
  const crumbs = $("#crumbs");
  const title = r ? r.title : "Tidak ditemukan";
  crumbs.innerHTML = `<a href="#/dashboard">Admin</a><span>/</span>${sub ? `<a href="#/${path}">${title}</a><span>/</span><strong>${sub === "new" ? "Baru" : "Edit"}</strong>` : `<strong>${title}</strong>`}`;
  document.title = `${title} · Admin HIMATKN`;
  const line = $(".topline"); line.classList.remove("is-done"); line.style.width = "45%";
  const done = () => { line.style.width = "100%"; line.classList.add("is-done"); };
  if (!r) { main.innerHTML = `<div class="card">${stateBlock({ icon: "search", label: "404", title: "Halaman admin tidak ditemukan", text: "Alamat ini tidak ada di panel admin.", action: '<a class="btn btn--outline" href="#/dashboard">Ke dashboard</a>' })}</div>`; done(); return; }
  if (!can(r.perm)) { main.innerHTML = forbidden(r.perm); done(); return; }
  main.innerHTML = headSkel + (path === "dashboard" ? `<div class="grid grid--stats">${'<div class="stat"><div class="skel" style="width:60%;height:10px"></div><div class="skel" style="width:40%;height:28px;margin-top:20px"></div></div>'.repeat(4)}</div>` : tableSkel());
  main.setAttribute("aria-busy", "true");
  if (STATE === "loading") return;
  setTimeout(() => {
    main.setAttribute("aria-busy", "false");
    if (STATE === "error") { main.innerHTML = pageHead({ label: r.group, title: r.title }) + `<div class="card">${errorBlock(r.title)}</div>`; done(); return; }
    main.classList.remove("view-enter"); void main.offsetWidth; main.classList.add("view-enter");
    r.render(main, sub);
    done();
    window.scrollTo(0, 0);
  }, DELAY);
}

/* =========================================================
   HALAMAN
   ========================================================= */

/* ---------- Dashboard ---------- */
function viewDashboard(el) {
  const stats = [
    ["news.view", "news", "Publikasi", data(DB.news).length, `${data(DB.news).filter((n) => n.status === "published").length} terbit · ${data(DB.news).filter((n) => n.status === "draft").length} draft`],
    ["programs.view", "programs", "Program kerja", data(DB.programs).length, `${data(DB.programs).filter((p) => p.status === "ongoing").length} sedang berjalan`],
    ["organization.view", "organization", "Anggota", data(DB.members).length, `${DB.divisions.length} divisi · periode aktif`],
    ["agendas.view", "agendas", "Agenda", data(DB.agendas).length, `${data(DB.agendas).filter((a) => d(a.start_at) > NOW).length} mendatang`],
    ["visitor_logs.view", "visitors", "Kunjungan", data(DB.visits).length, "14 hari terakhir"]
  ].filter((s) => can(s[0]));
  const icons = { news: "news", programs: "programs", organization: "org", agendas: "agenda", visitors: "chart" };
  const quick = [["news.create", "#/news/new", "Tulis publikasi"], ["programs.manage", "#/programs?new", "Tambah program"], ["agendas.manage", "#/agendas?new", "Tambah agenda"], ["organization.manage", "#/organization?new", "Tambah anggota"]].filter((q) => can(q[0]));
  const upcoming = data(DB.agendas).filter((a) => d(a.start_at) > NOW).sort((a, b) => a.start_at.localeCompare(b.start_at)).slice(0, 3);
  const panel = (perm, title, link, inner) => (can(perm) ? `<section class="card"><div class="card__head"><h2>${title}</h2><a class="btn btn--ghost btn--sm" href="${link}">Lihat semua</a></div>${inner}</section>` : "");
  const left = panel("news.view", "Publikasi terbaru", "#/news", data(DB.news).length ? `<ul class="list">${[...DB.news].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 4).map((n) => `<li><div class="list__icon">${ic("news")}</div><div class="list__main"><div class="list__title">${esc(n.title)}</div><div class="list__meta">Diperbarui ${rel(n.updated_at)} · ${n.author}</div></div>${badge(NEWS_STATUS, n.status)}</li>`).join("")}</ul>` : emptyBlock({ icon: "news", title: "Belum ada publikasi", text: "Publikasi pertama akan muncul di sini.", action: can("news.create") ? '<a class="btn btn--solid" href="#/news/new">Tulis publikasi</a>' : "" }))
    + panel("agendas.view", "Agenda mendatang", "#/agendas", upcoming.length ? `<ul class="list">${upcoming.map((a) => `<li><div style="width:44px;text-align:center;flex:none"><div style="font:700 22px/1 var(--serif);color:var(--green-900)">${d(a.start_at).getDate()}</div><div class="label label--muted" style="font-size:9.5px;margin-top:3px">${BULAN[d(a.start_at).getMonth()]}</div></div><div class="list__main"><div class="list__title">${esc(a.title)}</div><div class="list__meta">${HARI[d(a.start_at).getDay()]}, ${fmtTime(a.start_at)} · ${esc(a.location || "Lokasi belum diisi")}</div></div></li>`).join("")}</ul>` : emptyBlock({ icon: "agenda", title: "Tidak ada agenda mendatang", text: "Agenda yang dijadwalkan akan tampil di sini." }));
  const right = panel("notifications.view", "Notifikasi", "#/notifications", data(DB.notifications).length ? `<ul class="list">${DB.notifications.slice(0, 3).map((n) => `<li class="${n.read_at ? "" : "unread"}">${n.read_at ? '<span style="width:8px;flex:none"></span>' : '<span class="unread-dot"></span>'}<div class="list__main"><div class="list__title">${esc(n.title)}</div><div class="list__meta">${rel(n.created_at)}</div></div></li>`).join("")}</ul>` : emptyBlock({ icon: "bell", title: "Belum ada notifikasi", text: "Pesan dari pengurus lain akan muncul di sini." }))
    + panel("activity_logs.view", "Aktivitas terbaru", "#/activity", data(DB.activity).length ? `<ul class="list">${DB.activity.slice(0, 5).map((a) => `<li><span class="avatar" style="width:28px;height:28px;font-size:10px">${initials(a.admin)}</span><div class="list__main"><div class="list__title" style="font-weight:400"><strong>${a.admin}</strong> ${esc(a.description.charAt(0).toLowerCase() + a.description.slice(1))}</div><div class="list__meta">${rel(a.created_at)}</div></div></li>`).join("")}</ul>` : emptyBlock({ icon: "activity", title: "Belum ada aktivitas", text: "Perubahan oleh administrator akan tercatat di sini." }));
  el.innerHTML = `<section class="hero-card"><div><p class="label">Kabinet Nexus · Periode ${DB.periods.find((p) => p.is_active).name}</p><h1>Selamat datang, ${me.username}</h1><p>Anda masuk sebagai <strong style="color:#fff">${ROLES[ROLE].label}</strong>. ${ROLES[ROLE].desc}</p></div>${quick.length ? `<div class="quick">${quick.map((q, i) => `<a class="btn ${i ? "btn--outline" : "btn--solid"}" href="${q[1]}">${ic("plus")} ${q[2]}</a>`).join("")}</div>` : ""}</section>
    <div class="grid grid--stats" style="margin-bottom:16px">${stats.map((s) => `<a class="stat" href="#/${s[1]}"><div class="stat__top"><span class="label label--muted">${s[2]}</span><span class="stat__icon">${ic(icons[s[1]])}</span></div><div class="stat__value">${s[3]}</div><div class="stat__hint">${s[4]}</div></a>`).join("")}</div>
    <div class="grid grid--2"><div class="grid">${left || ""}</div><div class="grid">${right || ""}</div></div>`;
}

/* ---------- Publikasi ---------- */
function viewNews(el, sub) {
  if (sub) return newsEditor(el, sub);
  let q = "", status = "all", tag = "";
  const all = data(DB.news);
  const counts = { all: all.length, published: 0, draft: 0, archived: 0 }; all.forEach((n) => counts[n.status]++);
  el.innerHTML = pageHead({ label: "Konten", title: "Publikasi", desc: "Berita dan dokumentasi kegiatan. Hanya publikasi berstatus Terbit yang tampil di situs.", actions: can("news.create") ? `<a class="btn btn--solid" href="#/news/new">${ic("plus")} Tulis publikasi</a>` : "" })
    + (!can("news.update") ? readOnly("news.update") : "")
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari judul atau slug…" aria-label="Cari publikasi" data-q></div>
      <div class="seg" role="group" aria-label="Status">${[["all", "Semua"], ["published", "Terbit"], ["draft", "Draft"], ["archived", "Arsip"]].map(([k, l]) => `<button aria-pressed="${k === "all"}" data-st="${k}">${l}<span class="count">${counts[k]}</span></button>`).join("")}</div>
      <select class="select-sm" data-tag aria-label="Tag"><option value="">Semua tag</option>${DB.tags.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((n) => (status === "all" || n.status === status) && (!tag || n.tags.includes(+tag)) && (!q || norm(n.title + n.slug).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "news", label: "Publikasi", title: "Belum ada publikasi", text: "Mulai dengan menulis kabar atau dokumentasi kegiatan pertama.", action: can("news.create") ? '<a class="btn btn--solid" href="#/news/new">Tulis publikasi</a>' : "" }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Judul</th><th>Status</th><th>Tag</th><th>Penulis</th><th>Diperbarui</th><th></th></tr></thead><tbody>${rows.map((n) => `<tr>
      <td><div class="cell-flex"><div class="thumb">${n.featured_image ? `<img src="${n.featured_image}" alt="">` : ""}</div><div><div class="t-title">${esc(n.title)}</div><div class="t-sub mono">/${n.slug}${n.images ? ` · ${n.images} foto` : ""}</div></div></div></td>
      <td data-label="Status">${badge(NEWS_STATUS, n.status)}</td>
      <td data-label="Tag"><div class="chips">${n.tags.map((t) => `<span class="badge badge--outline">${tagName(t)}</span>`).join("")}</div></td>
      <td data-label="Penulis">${n.author}</td><td data-label="Diperbarui" class="small">${fmtDate(n.updated_at)}</td>
      <td class="t-actions">${n.status === "published" ? `<a class="btn btn--ghost btn--icon" href="../artikel.html?type=berita&id=${n.slug}" target="_blank" rel="noopener" aria-label="Lihat di situs" title="Lihat di situs">${ic("external")}</a>` : ""}${can("news.update") ? `<a class="btn btn--outline btn--sm" href="#/news/${n.id}">${ic("edit")} Edit</a>` : `<a class="btn btn--outline btn--sm" href="#/news/${n.id}">${ic("eye")} Lihat</a>`}${can("news.delete") ? `<button class="btn btn--danger-outline btn--sm btn--icon" data-del="${n.id}" aria-label="Hapus ${esc(n.title)}">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>${pager(rows.length)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; draw(); });
  $("[data-tag]", el).addEventListener("change", (e) => { tag = e.target.value; draw(); });
  $$("[data-st]", el).forEach((b) => b.addEventListener("click", () => { status = b.dataset.st; $$("[data-st]", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear]")) { q = ""; status = "all"; tag = ""; $("[data-q]", el).value = ""; $("[data-tag]", el).value = ""; $$("[data-st]", el).forEach((x) => x.setAttribute("aria-pressed", x.dataset.st === "all")); draw(); }
    const del = e.target.closest("[data-del]");
    if (del) { const n = DB.news.find((x) => x.id === +del.dataset.del); confirmDialog({ title: "Hapus publikasi?", text: `“${n.title}” beserta galeri fotonya akan dihapus permanen dan tidak bisa dikembalikan.`, onConfirm: () => { DB.news = DB.news.filter((x) => x !== n); toast("Publikasi dihapus."); viewNews(el); } }); }
  });
  draw();
}

function newsEditor(el, id) {
  const isNew = id === "new";
  if (isNew && !can("news.create")) { el.innerHTML = forbidden("news.create"); return; }
  const n = isNew ? { title: "", slug: "", content: "", status: "draft", tags: [], images: 0 } : DB.news.find((x) => x.id === +id);
  if (!n) { el.innerHTML = `<div class="card">${stateBlock({ icon: "search", label: "404", title: "Publikasi tidak ditemukan", text: "Publikasi ini mungkin sudah dihapus.", action: '<a class="btn btn--outline" href="#/news">Kembali ke daftar</a>' })}</div>`; return; }
  const editable = isNew || can("news.update");
  const ro = editable ? "" : "readonly disabled";
  const tags = new Set(n.tags);
  el.innerHTML = pageHead({ label: "Publikasi", title: isNew ? "Tulis publikasi" : editable ? "Edit publikasi" : "Lihat publikasi", actions: `<div class="savebar ${isNew ? "" : "is-saved"}" data-savebar><span class="dot"></span><span data-savetext>${isNew ? "Belum disimpan" : "Tersimpan · " + rel(n.updated_at)}</span></div><a class="btn btn--outline" href="#/news">Kembali</a>` })
    + (!editable ? readOnly("news.update") : "")
    + `<form class="editor" novalidate data-form>
      <div class="card"><div class="card__body">
        <div class="field" data-field="title"><label class="visually-hidden" for="f-title">Judul</label><input class="editor__title" id="f-title" name="title" placeholder="Judul publikasi" value="${esc(n.title)}" ${ro}></div>
        <div class="field" data-field="slug"><label for="f-slug">Slug URL <span class="req">*</span></label><div class="input-group"><span class="prefix">/berita/</span><input class="input mono" id="f-slug" name="slug" value="${esc(n.slug)}" ${ro}></div><p class="hint">Terisi otomatis dari judul. Harus unik.</p></div>
        <div class="field" data-field="content"><label for="f-content">Isi publikasi <span class="req">*</span></label>
          ${editable ? `<div class="editor-bar" role="toolbar" aria-label="Format teks"><button type="button" title="Tebal"><b>B</b></button><button type="button" title="Miring"><i>I</i></button><span class="sep"></span><button type="button" title="Subjudul">H2</button><button type="button" title="Daftar">•</button><button type="button" title="Kutipan">❝</button><span class="sep"></span><button type="button" title="Tautan">🔗</button></div>` : ""}
          <textarea class="textarea textarea--editor" id="f-content" name="content" placeholder="Tulis isi publikasi…" ${ro}>${esc(n.content)}</textarea></div>
      </div></div>
      <div class="side-stack">
        <section class="card"><div class="card__head"><h2>Publikasi</h2>${badge(NEWS_STATUS, n.status)}</div><div class="card__body">
          ${field({ name: "status", label: "Status", type: "select", value: n.status, attrs: ro, options: opts([["draft", "Draft — tidak tampil"], ["published", "Terbit — tampil di situs"], ["archived", "Arsip — disembunyikan"]], n.status) })}
          <p class="hint" style="margin-top:10px">${n.published_at ? `Terbit ${fmtDT(n.published_at)}` : "Tanggal terbit diisi otomatis saat status diubah ke Terbit."}${n.author ? `<br>Penulis: ${n.author}` : ""}</p>
          ${editable ? `<div style="display:grid;gap:8px;margin-top:16px"><button class="btn btn--solid" type="submit" data-act="save">${isNew ? "Simpan" : "Simpan perubahan"}</button>${n.status !== "published" ? `<button class="btn btn--outline" type="submit" data-act="publish">Simpan &amp; terbitkan</button>` : ""}</div>` : ""}
        </div></section>
        <section class="card"><div class="card__head"><h2>Tag</h2></div><div class="card__body"><div class="chips" data-tags>${DB.tags.map((t) => `<button type="button" class="chip" aria-pressed="${tags.has(t.id)}" data-tagid="${t.id}" ${editable ? "" : "disabled"}>${t.name}</button>`).join("")}</div>
          ${editable && can("news.create") ? `<div class="input-group" style="margin-top:12px"><input class="input" placeholder="Tag baru…" data-newtag aria-label="Tag baru" style="border-radius:var(--radius) 0 0 var(--radius)"><button type="button" class="btn btn--outline" data-addtag style="border-radius:0 var(--radius) var(--radius) 0;height:auto">Tambah</button></div>` : ""}</div></section>
        <section class="card"><div class="card__head"><h2>Gambar utama</h2></div><div class="card__body">${editable ? dropzone({ name: "featured", accept: "image/jpeg,image/png,image/webp", note: "JPG, PNG, atau WebP · maks 4 MB · otomatis dikompres", needPerm: "media.manage" }) : `<div class="thumb" style="width:100%">${n.featured_image ? `<img src="${n.featured_image}" alt="">` : ""}</div>`}</div></section>
        ${isNew ? "" : `<section class="card"><div class="card__head"><h2>Galeri</h2><span class="small muted">${n.images} foto</span></div><div class="card__body"><div class="gallery">${Array.from({ length: n.images }, (_, i) => `<div class="gallery__item">${i === 0 && n.featured_image ? `<img src="${n.featured_image}" alt="">` : ""}${editable ? `<button type="button" aria-label="Hapus foto ${i + 1}" data-rmimg>${ic("x").replace("<svg", '<svg width="12" height="12"')}</button>` : ""}</div>`).join("")}${editable ? `<label class="gallery__item gallery__add" title="Tambah foto">+<input type="file" accept="image/*" class="visually-hidden" data-addimg></label>` : ""}</div>${!n.images && !editable ? '<p class="small muted">Belum ada foto.</p>' : ""}</div></section>`}
        ${!isNew && can("news.delete") ? `<section class="card"><div class="card__body"><p class="label" style="color:var(--red)">Zona berbahaya</p><p class="small muted" style="margin:6px 0 12px">Menghapus publikasi juga menghapus seluruh fotonya.</p><button type="button" class="btn btn--danger-outline" data-delnews>${ic("trash")} Hapus publikasi</button></div></section>` : ""}
      </div></form>`;
  const form = $("[data-form]", el), sb = $("[data-savebar]", el), st = $("[data-savetext]", el);
  let slugTouched = !isNew;
  const dirty = () => { sb.classList.remove("is-saved"); st.textContent = "Ada perubahan belum disimpan"; };
  form.addEventListener("input", (e) => { dirty(); if (e.target.name === "title" && !slugTouched) form.slug.value = slugify(e.target.value); if (e.target.name === "slug") slugTouched = true; });
  $$("[data-tagid]", el).forEach((c) => c.addEventListener("click", () => { c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"); dirty(); }));
  $("[data-addtag]", el)?.addEventListener("click", () => { const inp = $("[data-newtag]", el); const v = inp.value.trim(); if (!v) return; const t = { id: Date.now(), name: v }; DB.tags.push(t); $("[data-tags]", el).insertAdjacentHTML("beforeend", `<button type="button" class="chip" aria-pressed="true" data-tagid="${t.id}">${esc(v)}</button>`); inp.value = ""; toast(`Tag “${esc(v)}” dibuat.`); dirty(); });
  $$("[data-rmimg]", el).forEach((b) => b.addEventListener("click", () => confirmDialog({ title: "Hapus foto ini?", text: "Foto akan dihapus dari galeri publikasi.", onConfirm: () => { b.parentElement.remove(); toast("Foto dihapus."); } })));
  $("[data-addimg]", el)?.addEventListener("change", (e) => { if (e.target.files[0]) { e.target.closest(".gallery__add").insertAdjacentHTML("beforebegin", `<div class="gallery__item skel"></div>`); setTimeout(() => { $(".gallery .skel", el)?.classList.remove("skel"); toast("Foto ditambahkan ke galeri."); }, 900); } });
  $("[data-delnews]", el)?.addEventListener("click", () => confirmDialog({ title: "Hapus publikasi?", text: `“${n.title}” akan dihapus permanen.`, onConfirm: () => { DB.news = DB.news.filter((x) => x !== n); toast("Publikasi dihapus."); location.hash = "#/news"; } }));
  wireDropzones(el, { types: ["image/jpeg", "image/png", "image/webp"] });
  let act = "save";
  $$("[data-act]", el).forEach((b) => b.addEventListener("click", () => (act = b.dataset.act)));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(form); let ok = true;
    if (!form.title.value.trim()) { setError(form, "title", "Judul wajib diisi."); ok = false; }
    if (!form.slug.value.trim()) { setError(form, "slug", "Slug wajib diisi."); ok = false; }
    else if (DB.news.some((x) => x.slug === form.slug.value.trim() && x !== n)) { setError(form, "slug", "Slug sudah dipakai publikasi lain."); ok = false; }
    if (!form.content.value.trim()) { setError(form, "content", "Isi publikasi wajib diisi."); ok = false; }
    if (!ok) { $(".has-error input, .has-error textarea", form)?.focus(); toast("Periksa kembali isian yang ditandai.", "error"); return; }
    const btn = $(`[data-act="${act}"]`, el); btn.classList.add("is-busy");
    setTimeout(() => {
      btn.classList.remove("is-busy");
      Object.assign(n, { title: form.title.value, slug: form.slug.value, content: form.content.value, status: act === "publish" ? "published" : form.status.value, tags: $$('[data-tagid][aria-pressed="true"]', el).map((c) => +c.dataset.tagid), updated_at: NOW.toISOString() });
      if (n.status === "published" && !n.published_at) n.published_at = NOW.toISOString();
      if (isNew) { n.id = Date.now(); n.author = me.username; DB.news.unshift(n); toast(act === "publish" ? "Publikasi diterbitkan." : "Draft disimpan."); location.hash = "#/news/" + n.id; return; }
      sb.classList.add("is-saved"); st.textContent = "Tersimpan · baru saja"; toast(act === "publish" ? "Publikasi diterbitkan." : "Perubahan disimpan.");
    }, 700);
  });
}

/* ---------- Program kerja ---------- */
function programForm(p) {
  const isNew = !p; p = p || { status: "planned", period_id: 1 };
  const form = openDrawer({
    label: "Program kerja", title: isNew ? "Tambah program kerja" : "Edit program kerja", submit: isNew ? "Tambah program" : "Simpan perubahan",
    body: field({ name: "name", label: "Nama program", value: p.name || "", req: true })
      + field({ name: "slug", label: "Slug", value: p.slug || "", req: true, prefix: "/program-kerja/", hint: "Harus unik. Terisi otomatis dari nama." })
      + `<div class="field-row">${field({ name: "period_id", label: "Periode", type: "select", req: true, options: opts(DB.periods.map((x) => [x.id, x.name + (x.is_active ? " (aktif)" : "")]), p.period_id) })}${field({ name: "division_id", label: "Divisi penanggung jawab", type: "select", options: opts(DB.divisions.map((x) => [x.id, x.name]), p.division_id, "Tanpa divisi") })}</div>`
      + field({ name: "status", label: "Status", type: "select", req: true, options: opts([["planned", "Terencana"], ["ongoing", "Berjalan"], ["completed", "Selesai"]], p.status) })
      + `<div class="field-row">${field({ name: "start_date", label: "Tanggal mulai", type: "date", value: p.start_date || "" })}${field({ name: "end_date", label: "Tanggal selesai", type: "date", value: p.end_date || "" })}</div>`
      + field({ name: "description", label: "Deskripsi", type: "textarea", value: p.description || "", hint: "Ditampilkan di halaman Program Kerja situs." }),
    onSubmit: (f) => {
      if (!required(f, ["name", "slug", "period_id", "status"])) return false;
      if (DB.programs.some((x) => x.slug === f.slug.value && x !== p)) { setError(f, "slug", "Slug sudah dipakai program lain."); return false; }
      if (f.start_date.value && f.end_date.value && f.end_date.value < f.start_date.value) { setError(f, "end_date", "Tanggal selesai tidak boleh sebelum tanggal mulai."); return false; }
      setTimeout(() => { Object.assign(p, Object.fromEntries(new FormData(f))); p.division_id = p.division_id ? +p.division_id : null; if (isNew) { p.id = Date.now(); DB.programs.unshift(p); } toast(isNew ? "Program kerja ditambahkan." : "Program kerja diperbarui."); route(); }, 660);
    }
  });
  let touched = !isNew; form.name.addEventListener("input", () => { if (!touched) form.slug.value = slugify(form.name.value); }); form.slug.addEventListener("input", () => (touched = true));
}
function viewPrograms(el) {
  let q = "", st = "all", div = "";
  const all = data(DB.programs), manage = can("programs.manage");
  const counts = { all: all.length, ongoing: 0, planned: 0, completed: 0 }; all.forEach((p) => counts[p.status]++);
  el.innerHTML = pageHead({ label: "Konten", title: "Program Kerja", desc: "Program kerja kabinet per periode. Ditampilkan di halaman Program Kerja situs.", actions: manage ? `<button class="btn btn--solid" data-new>${ic("plus")} Tambah program</button>` : "" })
    + (!manage ? readOnly("programs.manage") : "")
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari program…" aria-label="Cari program" data-q></div>
      <div class="seg" role="group" aria-label="Status">${[["all", "Semua"], ["ongoing", "Berjalan"], ["planned", "Terencana"], ["completed", "Selesai"]].map(([k, l]) => `<button aria-pressed="${k === "all"}" data-st="${k}">${l}<span class="count">${counts[k]}</span></button>`).join("")}</div>
      <select class="select-sm" data-div aria-label="Divisi"><option value="">Semua divisi</option>${DB.divisions.map((x) => `<option value="${x.id}">${x.name}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((p) => (st === "all" || p.status === st) && (!div || p.division_id === +div) && (!q || norm(p.name).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "programs", label: "Program kerja", title: "Belum ada program kerja", text: "Tambahkan program kerja hasil rapat kerja kabinet.", action: manage ? '<button class="btn btn--solid" data-new>Tambah program</button>' : "" }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Program</th><th>Divisi</th><th>Status</th><th>Jadwal</th><th></th></tr></thead><tbody>${rows.map((p) => `<tr><td><div class="t-title">${esc(p.name)}</div><div class="t-sub mono">/${p.slug}</div></td><td data-label="Divisi">${divName(p.division_id)}</td><td data-label="Status">${badge(PROG_STATUS, p.status)}</td><td data-label="Jadwal" class="small">${p.start_date ? fmtDate(p.start_date) + (p.end_date ? " – " + fmtDate(p.end_date) : "") : '<span class="muted">Belum dijadwalkan</span>'}</td>
      <td class="t-actions">${manage ? `<button class="btn btn--outline btn--sm" data-edit="${p.id}">${ic("edit")} Edit</button><button class="btn btn--danger-outline btn--sm btn--icon" data-del="${p.id}" aria-label="Hapus ${esc(p.name)}">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>${pager(rows.length)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; draw(); });
  $("[data-div]", el).addEventListener("change", (e) => { div = e.target.value; draw(); });
  $$("[data-st]", el).forEach((b) => b.addEventListener("click", () => { st = b.dataset.st; $$("[data-st]", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-new]")) programForm();
    const ed = e.target.closest("[data-edit]"); if (ed) programForm(DB.programs.find((x) => x.id === +ed.dataset.edit));
    const del = e.target.closest("[data-del]");
    if (del) { const p = DB.programs.find((x) => x.id === +del.dataset.del); confirmDialog({ title: "Hapus program kerja?", text: `“${p.name}” akan dihapus dari situs dan tidak bisa dikembalikan.`, onConfirm: () => { DB.programs = DB.programs.filter((x) => x !== p); toast("Program kerja dihapus."); route(); } }); }
    if (e.target.closest("[data-clear]")) { q = ""; st = "all"; div = ""; viewPrograms(el); }
  });
  draw();
  if (location.hash.includes("?new") && manage) programForm();
}

/* ---------- Agenda ---------- */
function agendaForm(a) {
  const isNew = !a; a = a || {};
  openDrawer({
    label: "Agenda", title: isNew ? "Tambah agenda" : "Edit agenda", submit: isNew ? "Tambah agenda" : "Simpan perubahan",
    body: field({ name: "title", label: "Judul agenda", value: a.title || "", req: true })
      + `<div class="field-row">${field({ name: "start_at", label: "Mulai", type: "datetime-local", value: (a.start_at || "").slice(0, 16), req: true })}${field({ name: "end_at", label: "Selesai", type: "datetime-local", value: (a.end_at || "").slice(0, 16), hint: "Opsional" })}</div>`
      + field({ name: "location", label: "Lokasi", value: a.location || "" })
      + field({ name: "description", label: "Keterangan", type: "textarea", value: a.description || "" }),
    onSubmit: (f) => {
      if (!required(f, ["title", "start_at"])) return false;
      if (f.end_at.value && f.end_at.value < f.start_at.value) { setError(f, "end_at", "Waktu selesai tidak boleh sebelum waktu mulai."); return false; }
      setTimeout(() => { Object.assign(a, Object.fromEntries(new FormData(f))); a.end_at = a.end_at || null; if (isNew) { a.id = Date.now(); DB.agendas.push(a); } toast(isNew ? "Agenda ditambahkan." : "Agenda diperbarui."); route(); }, 660);
    }
  });
}
function viewAgendas(el) {
  let when = "upcoming";
  const manage = can("agendas.manage"), all = data(DB.agendas);
  el.innerHTML = pageHead({ label: "Konten", title: "Agenda", desc: "Jadwal internal kepengurusan.", actions: manage ? `<button class="btn btn--solid" data-new>${ic("plus")} Tambah agenda</button>` : "" })
    + `<div class="notice notice--blue" style="margin-bottom:16px">${ic("info")}<div>Agenda saat ini hanya terlihat di panel admin. Situs publik belum menampilkan agenda (belum ada endpoint publik).</div></div>`
    + (!manage ? readOnly("agendas.manage") : "")
    + `<div class="card"><div class="toolbar"><div class="seg" role="group" aria-label="Waktu"><button aria-pressed="true" data-w="upcoming">Mendatang</button><button aria-pressed="false" data-w="past">Sudah lewat</button></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((a) => (when === "upcoming" ? d(a.start_at) >= NOW : d(a.start_at) < NOW)).sort((a, b) => (when === "upcoming" ? 1 : -1) * a.start_at.localeCompare(b.start_at));
    if (!rows.length) return (body.innerHTML = emptyBlock({ icon: "agenda", label: "Agenda", title: when === "upcoming" ? "Tidak ada agenda mendatang" : "Belum ada agenda yang lewat", text: when === "upcoming" ? "Jadwalkan rapat atau kegiatan berikutnya." : "Riwayat agenda akan muncul di sini.", action: manage && when === "upcoming" ? '<button class="btn btn--solid" data-new>Tambah agenda</button>' : "" }));
    body.innerHTML = `<ul class="list">${rows.map((a) => `<li style="padding:16px 20px;align-items:center"><div style="width:56px;text-align:center;flex:none;padding-right:12px;border-right:1px solid var(--line)"><div style="font:700 28px/1 var(--serif);color:${when === "upcoming" ? "var(--green-900)" : "var(--muted-light)"}">${d(a.start_at).getDate()}</div><div class="label label--muted" style="font-size:9.5px;margin-top:4px">${BULAN[d(a.start_at).getMonth()]} ${d(a.start_at).getFullYear()}</div></div>
      <div class="list__main" style="padding-left:6px"><div class="list__title" style="font-family:var(--serif);font-weight:700;font-size:15px;color:var(--green-900)">${esc(a.title)}</div><div class="list__meta" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:4px"><span>${HARI[d(a.start_at).getDay()]}, ${fmtTime(a.start_at)}${a.end_at ? "–" + fmtTime(a.end_at) : ""}</span><span>${esc(a.location || "Lokasi belum diisi")}</span></div>${a.description ? `<p class="small muted" style="margin-top:6px">${esc(a.description)}</p>` : ""}</div>
      ${manage ? `<div class="t-actions" style="flex:none"><button class="btn btn--outline btn--sm" data-edit="${a.id}">${ic("edit")} Edit</button> <button class="btn btn--danger-outline btn--sm btn--icon" data-del="${a.id}" aria-label="Hapus">${ic("trash")}</button></div>` : ""}</li>`).join("")}</ul>`;
  };
  $$("[data-w]", el).forEach((b) => b.addEventListener("click", () => { when = b.dataset.w; $$("[data-w]", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-new]")) agendaForm();
    const ed = e.target.closest("[data-edit]"); if (ed) agendaForm(DB.agendas.find((x) => x.id === +ed.dataset.edit));
    const del = e.target.closest("[data-del]"); if (del) { const a = DB.agendas.find((x) => x.id === +del.dataset.del); confirmDialog({ title: "Hapus agenda?", text: `Agenda “${a.title}” akan dihapus.`, onConfirm: () => { DB.agendas = DB.agendas.filter((x) => x !== a); toast("Agenda dihapus."); route(); } }); }
  });
  draw();
  if (location.hash.includes("?new") && manage) agendaForm();
}

/* ---------- Dokumen ---------- */
function viewDocuments(el) {
  let q = "", cat = "";
  const all = data(DB.documents), manage = can("documents.manage");
  const cats = [...new Set(DB.documents.map((x) => x.category))];
  el.innerHTML = pageHead({ label: "Konten", title: "Dokumen", desc: "Arsip PDF internal himpunan: proposal, LPJ, AD/ART.", actions: manage ? `<button class="btn btn--solid" data-new>${ic("upload")} Unggah dokumen</button>` : "" })
    + `<div class="notice" style="margin-bottom:16px">${ic("lock")}<div>Dokumen bersifat <strong>privat</strong>. Tautan unduhan hanya berlaku 5 menit dan hanya untuk admin dengan izin <code class="mono">documents.view</code>.</div></div>`
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari dokumen…" aria-label="Cari dokumen" data-q></div><select class="select-sm" data-cat aria-label="Kategori"><option value="">Semua kategori</option>${cats.map((c) => `<option>${c}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((x) => (!cat || x.category === cat) && (!q || norm(x.title + x.original_filename).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "doc", label: "Dokumen", title: "Belum ada dokumen", text: "Unggah proposal, LPJ, atau arsip penting dalam format PDF.", action: manage ? '<button class="btn btn--solid" data-new>Unggah dokumen</button>' : "" }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Dokumen</th><th>Kategori</th><th>Ukuran</th><th>Diunggah</th><th></th></tr></thead><tbody>${rows.map((x) => `<tr><td><div class="cell-flex"><span class="stat__icon" style="background:var(--red-bg);color:var(--red);border-radius:4px">${ic("file")}</span><div><div class="t-title">${esc(x.title)}</div><div class="t-sub mono">${esc(x.original_filename)}</div></div></div></td><td data-label="Kategori"><span class="badge badge--outline">${esc(x.category || "—")}</span></td><td data-label="Ukuran" class="small">${bytes(x.size_bytes)}</td><td data-label="Diunggah" class="small">${fmtDate(x.created_at)}<div class="t-sub">${x.uploaded_by}</div></td><td class="t-actions"><button class="btn btn--outline btn--sm" data-open>${ic("external")} Buka</button></td></tr>`).join("")}</tbody></table></div>${pager(rows.length)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; draw(); });
  $("[data-cat]", el).addEventListener("change", (e) => { cat = e.target.value; draw(); });
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-open]")) { const b = e.target.closest("[data-open]"); b.classList.add("is-busy"); setTimeout(() => { b.classList.remove("is-busy"); toast("Tautan aman dibuat (berlaku 5 menit)."); }, 700); }
    if (e.target.closest("[data-clear]")) { q = ""; cat = ""; viewDocuments(el); }
    if (e.target.closest("[data-new]")) {
      const f = openDrawer({ label: "Dokumen", title: "Unggah dokumen", submit: "Unggah",
        body: field({ name: "title", label: "Judul dokumen", req: true }) + field({ name: "category", label: "Kategori", attrs: 'list="cats"', hint: "Contoh: Proposal, LPJ, Arsip" }) + `<datalist id="cats">${cats.map((c) => `<option>${c}</option>`).join("")}</datalist>`
          + `<div class="field" data-field="file" style="margin-top:16px"><span class="field-label">File PDF <span class="req">*</span></span>${dropzone({ name: "file", accept: "application/pdf", note: "Hanya PDF · maks 4 MB" })}</div>`
          + `<p class="hint" style="margin-top:14px">Dokumen yang sudah diunggah belum bisa diubah atau dihapus dari panel (endpoint belum tersedia).</p>`,
        onSubmit: (form) => { const ok = required(form, ["title"]); if (!form.file.files.length || $(".dropzone.is-error", form)) { setError(form, "file", "Pilih file PDF yang valid."); return false; } if (!ok) return false; setTimeout(() => { DB.documents.unshift({ id: Date.now(), title: form.title.value, category: form.category.value || null, original_filename: form.file.files[0].name, size_bytes: form.file.files[0].size, uploaded_by: me.username, created_at: NOW.toISOString() }); toast("Dokumen diunggah."); route(); }, 660); } });
      wireDropzones(f, { types: ["application/pdf", ".pdf"] });
    }
  });
  draw();
}

/* ---------- Struktur organisasi ---------- */
function memberForm(m, periodId) {
  const isNew = !m || m._new; m = m || { period_id: periodId, division_id: "", position_id: 9, sort_order: 0 }; delete m._new;
  const f = openDrawer({
    label: "Struktur organisasi", title: isNew ? "Tambah anggota" : "Edit anggota", submit: isNew ? "Tambah anggota" : "Simpan perubahan",
    danger: !isNew ? `<button type="button" class="btn btn--danger-outline" data-delm>${ic("trash")} Hapus</button>` : "",
    body: `<div class="field" style="margin-bottom:16px"><span class="field-label">Foto</span><div style="display:flex;gap:14px;align-items:center"><span class="avatar avatar--lg avatar--photo">${m.photo_url ? `<img src="${m.photo_url}" alt="">` : ""}</span><div style="flex:1">${dropzone({ name: "photo", accept: "image/jpeg,image/png,image/webp", note: "Rasio 1:1 disarankan · maks 4 MB", needPerm: "media.manage" })}</div></div></div>`
      + field({ name: "name", label: "Nama lengkap", value: m.name || "", req: true })
      + `<div class="field-row">${field({ name: "period_id", label: "Periode", type: "select", req: true, options: opts(DB.periods.map((x) => [x.id, x.name]), m.period_id) })}${field({ name: "position_id", label: "Jabatan", type: "select", req: true, options: opts(DB.positions.map((x) => [x.id, x.name]), m.position_id) })}</div>`
      + field({ name: "division_id", label: "Divisi", type: "select", options: opts(DB.divisions.filter((x) => x.period_id === +m.period_id || !m.period_id).map((x) => [x.id, x.name]), m.division_id, "Tanpa divisi"), hint: "Divisi harus berasal dari periode yang sama." })
      + field({ name: "sort_order", label: "Urutan tampil", type: "number", value: m.sort_order, attrs: 'min="0"', hint: "Angka kecil tampil lebih dulu dalam divisi." }),
    onSubmit: (form) => {
      if (!required(form, ["name", "period_id", "position_id"])) return false;
      setTimeout(() => { Object.assign(m, { name: form.name.value, period_id: +form.period_id.value, position_id: +form.position_id.value, division_id: form.division_id.value ? +form.division_id.value : null, sort_order: +form.sort_order.value }); if (isNew) { m.id = Date.now(); DB.members.push(m); } toast(isNew ? "Anggota ditambahkan." : "Data anggota diperbarui."); route(); }, 660);
    }
  });
  wireDropzones(f, { types: ["image/jpeg", "image/png", "image/webp"] });
  $("[data-delm]", f)?.addEventListener("click", () => confirmDialog({ title: "Hapus anggota?", text: `${m.name} akan dihapus dari struktur periode ini.`, onConfirm: () => { DB.members = DB.members.filter((x) => x !== m); toast("Anggota dihapus."); route(); } }));
}
function viewOrganization(el) {
  const manage = can("organization.manage");
  let period = DB.periods.find((p) => p.is_active).id, tab = "members", q = "", div = "";
  const shell = () => {
    el.innerHTML = pageHead({ label: "Organisasi", title: "Struktur Organisasi", desc: "Kelola periode kepengurusan dan anggota. Periode aktif ditampilkan di halaman Struktur situs.", actions: manage ? `<button class="btn btn--outline" data-newperiod>${ic("plus")} Periode baru</button><button class="btn btn--solid" data-newm>${ic("plus")} Tambah anggota</button>` : "" })
      + (!manage ? readOnly("organization.manage") : "")
      + `<div class="period-strip" style="margin-bottom:18px">${DB.periods.map((p) => `<button class="period" aria-pressed="${p.id === period}" data-period="${p.id}"><span class="label ${p.is_active ? "" : "label--muted"}">${p.is_active ? "Periode aktif" : "Periode lalu"}</span><h3>${p.name}</h3><div class="small muted">${data(DB.members).filter((m) => m.period_id === p.id).length} anggota · ${fmtDate(p.start_date)} – ${fmtDate(p.end_date)}</div></button>`).join("")}</div>
      <div class="seg" style="margin-bottom:14px" role="group" aria-label="Tampilan"><button aria-pressed="${tab === "members"}" data-tab="members">Anggota</button><button aria-pressed="${tab === "ref"}" data-tab="ref">Divisi &amp; jabatan</button></div><div data-body></div>`;
    draw();
  };
  const draw = () => {
    const body = $("[data-body]", el);
    if (tab === "ref") {
      body.innerHTML = `<div class="notice notice--blue" style="margin-bottom:14px">${ic("info")}<div>Divisi dan jabatan saat ini hanya bisa dilihat. Penambahan atau perubahan masih dilakukan oleh pengembang (endpoint CRUD belum tersedia).</div></div>
        <div class="grid grid--2"><div class="card"><div class="card__head"><h2>Divisi</h2><span class="small muted">${DB.divisions.length}</span></div><table class="table"><thead><tr><th>#</th><th>Nama divisi</th><th>Anggota</th></tr></thead><tbody>${DB.divisions.map((x) => `<tr><td class="small muted">${x.sort_order}</td><td><div class="t-title">${x.name}</div>${x.description ? `<div class="t-sub">${x.description}</div>` : ""}</td><td>${DB.members.filter((m) => m.division_id === x.id && m.period_id === period).length}</td></tr>`).join("")}</tbody></table></div>
        <div class="card"><div class="card__head"><h2>Jabatan</h2><span class="small muted">${DB.positions.length}</span></div><table class="table"><thead><tr><th>#</th><th>Jabatan</th></tr></thead><tbody>${DB.positions.map((x) => `<tr><td class="small muted">${x.sort_order}</td><td>${x.name}</td></tr>`).join("")}</tbody></table></div></div>`;
      return;
    }
    const ms = data(DB.members).filter((m) => m.period_id === period);
    if (!ms.length) { body.innerHTML = `<div class="card">${emptyBlock({ icon: "org", label: "Struktur", title: "Belum ada anggota di periode ini", text: "Tambahkan pengurus mulai dari Ketua Himpunan dan Badan Pengurus Harian.", action: manage ? '<button class="btn btn--solid" data-newm>Tambah anggota</button>' : "" })}</div>`; return; }
    body.innerHTML = `<div class="card" style="margin-bottom:14px"><div class="toolbar" style="border:0"><div class="search"><input type="search" placeholder="Cari nama anggota…" aria-label="Cari anggota" data-q value="${esc(q)}"></div><select class="select-sm" data-div aria-label="Divisi"><option value="">Semua divisi</option>${DB.divisions.map((x) => `<option value="${x.id}" ${String(x.id) === div ? "selected" : ""}>${x.name}</option>`).join("")}</select><span class="small muted" style="margin-left:auto">${ms.length} anggota</span></div></div><div data-groups></div>`;
    const groups = () => {
      const list = ms.filter((m) => (!q || norm(m.name).includes(norm(q))) && (!div || m.division_id === +div));
      const g = $("[data-groups]", el);
      if (!list.length) { g.innerHTML = `<div class="card">${noResult(q || "filter ini")}</div>`; return; }
      g.innerHTML = DB.divisions.filter((x) => list.some((m) => m.division_id === x.id)).map((x) => {
        const rows = list.filter((m) => m.division_id === x.id).sort((a, b) => a.position_id - b.position_id || a.sort_order - b.sort_order);
        return `<section class="card division-block"><div class="card__head"><div><h2>${x.name}</h2><p class="small muted" style="margin-top:2px">${rows.length} orang</p></div>${manage ? `<button class="btn btn--ghost btn--sm" data-newm data-div-id="${x.id}">${ic("plus")} Tambah</button>` : ""}</div>
          <div class="member-grid">${rows.map((m) => `<div class="member"><span class="avatar ${m.photo_url ? "avatar--photo" : ""}" style="${m.position_id <= 2 ? "background:var(--green-950)" : m.position_id >= 9 ? "background:var(--mint);color:var(--green-900)" : ""}">${m.photo_url ? `<img src="${m.photo_url}" alt="">` : initials(m.name)}</span><div style="min-width:0"><div class="member__name">${esc(m.name)}</div><div class="member__role">${posName(m.position_id)}</div></div>${manage ? `<div class="member__actions"><button class="btn btn--ghost btn--icon" data-editm="${m.id}" aria-label="Edit ${esc(m.name)}">${ic("edit")}</button></div>` : ""}</div>`).join("")}</div></section>`;
      }).join("");
    };
    $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; groups(); });
    $("[data-div]", el).addEventListener("change", (e) => { div = e.target.value; groups(); });
    groups();
  };
  el.onclick = (e) => {
    const p = e.target.closest("[data-period]"); if (p) { period = +p.dataset.period; shell(); }
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; shell(); }
    const nm = e.target.closest("[data-newm]"); if (nm) memberForm(nm.dataset.divId ? { period_id: period, division_id: +nm.dataset.divId, position_id: 9, sort_order: 0, _new: true } : null, period);
    const em = e.target.closest("[data-editm]"); if (em) memberForm(DB.members.find((x) => x.id === +em.dataset.editm));
    if (e.target.closest("[data-clear]")) { q = ""; div = ""; draw(); }
    if (e.target.closest("[data-newperiod]")) openDrawer({ label: "Struktur organisasi", title: "Buat periode baru", submit: "Buat periode",
      body: field({ name: "name", label: "Nama periode", req: true, hint: "Contoh: 2026/2027 · harus unik" }) + `<div class="field-row">${field({ name: "start_date", label: "Mulai", type: "date" })}${field({ name: "end_date", label: "Selesai", type: "date" })}</div>`
        + `<div class="field" style="margin-top:18px"><label class="switch"><input type="checkbox" name="is_active"><span class="switch__track"></span><span>Jadikan periode aktif</span></label><p class="hint">Periode aktif menentukan struktur yang tampil di situs. Periode lama otomatis menjadi tidak aktif.</p></div>`
        + `<div class="notice notice--amber" style="margin-top:16px">${ic("alert")}<div>Periode yang sudah dibuat belum bisa diubah atau dihapus dari panel. Periksa kembali sebelum menyimpan.</div></div>`,
      onSubmit: (form) => { if (!required(form, ["name"])) return false; if (DB.periods.some((x) => x.name === form.name.value.trim())) { setError(form, "name", "Nama periode sudah ada."); return false; } setTimeout(() => { const np = { id: Date.now(), name: form.name.value, start_date: form.start_date.value || null, end_date: form.end_date.value || null, is_active: form.is_active.checked }; if (np.is_active) DB.periods.forEach((x) => (x.is_active = false)); DB.periods.unshift(np); toast("Periode dibuat."); route(); }, 660); } });
  };
  shell();
  if (location.hash.includes("?new") && manage) memberForm(null, period);
}

/* ---------- Notifikasi ---------- */
function viewNotifications(el) {
  let only = false;
  const manage = can("notifications.manage");
  el.innerHTML = pageHead({ label: "Organisasi", title: "Notifikasi", desc: "Pesan antar-administrator.", actions: `<button class="btn btn--outline" data-readall>${ic("check")} Tandai semua dibaca</button>${manage ? `<button class="btn btn--solid" data-new>${ic("send")} Kirim notifikasi</button>` : ""}` })
    + `<div class="card"><div class="toolbar"><div class="seg" role="group"><button aria-pressed="true" data-f="all">Semua</button><button aria-pressed="false" data-f="unread">Belum dibaca<span class="count">${unread()}</span></button></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = data(DB.notifications).filter((n) => !only || !n.read_at);
    if (!rows.length) return (body.innerHTML = emptyBlock({ icon: "bell", label: "Notifikasi", title: only ? "Semua sudah dibaca" : "Belum ada notifikasi", text: only ? "Tidak ada pesan baru." : "Pesan dari administrator lain akan muncul di sini." }));
    body.innerHTML = `<ul class="list">${rows.map((n) => `<li class="${n.read_at ? "" : "unread"}" style="padding:16px 20px">${n.read_at ? '<span style="width:8px;flex:none"></span>' : '<span class="unread-dot"></span>'}<div class="list__main"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="list__title">${esc(n.title)}</span>${badge(NOTIF_TYPE, n.type)}</div><p class="small" style="margin-top:4px;color:var(--ink)">${esc(n.message)}</p><div class="list__meta">Dari ${n.from} · ${rel(n.created_at)}</div></div>${n.read_at ? "" : `<button class="btn btn--ghost btn--sm" data-read="${n.id}">Tandai dibaca</button>`}</li>`).join("")}</ul>`;
  };
  const refreshBadges = () => { const u = unread(); $$(".nav__count, .icon-btn .dot").forEach((x) => (u ? (x.textContent = u) : x.remove())); };
  el.onclick = (e) => {
    const f = e.target.closest("[data-f]"); if (f) { only = f.dataset.f === "unread"; $$("[data-f]", el).forEach((x) => x.setAttribute("aria-pressed", x === f)); draw(); }
    const r = e.target.closest("[data-read]"); if (r) { DB.notifications.find((x) => x.id === +r.dataset.read).read_at = NOW.toISOString(); draw(); refreshBadges(); }
    if (e.target.closest("[data-readall]")) { DB.notifications.forEach((x) => (x.read_at = x.read_at || NOW.toISOString())); draw(); refreshBadges(); toast("Semua notifikasi ditandai dibaca."); }
    if (e.target.closest("[data-new]")) {
      const form = openDrawer({ label: "Notifikasi", title: "Kirim notifikasi", submit: "Kirim",
        body: field({ name: "title", label: "Judul", req: true }) + field({ name: "message", label: "Pesan", type: "textarea", req: true })
          + field({ name: "type", label: "Jenis", type: "select", options: opts([["info", "Info"], ["success", "Berhasil"], ["warning", "Peringatan"]], "info") })
          + `<div class="field" style="margin-top:16px"><span class="field-label">Penerima</span><div style="display:grid;gap:8px"><label class="small"><input type="radio" name="to" value="all" checked> Semua administrator aktif</label><label class="small"><input type="radio" name="to" value="pick"> Pilih administrator</label></div><div class="chips" data-pick hidden style="margin-top:8px">${DB.admins.filter((a) => a.is_active && a.id !== me.id).map((a) => `<button type="button" class="chip" aria-pressed="false">${a.username}</button>`).join("")}</div></div>`,
        onSubmit: (f) => { if (!required(f, ["title", "message"])) return false; setTimeout(() => toast("Notifikasi terkirim."), 660); } });
      form.addEventListener("change", (ev) => { if (ev.target.name === "to") $("[data-pick]", form).hidden = ev.target.value !== "pick"; });
      $$("[data-pick] .chip", form).forEach((c) => c.addEventListener("click", () => c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true")));
    }
  };
  draw();
}

/* ---------- Administrator ---------- */
const roleCovers = (r) => ROLES[r].perms.every((p) => me.perms.has(p));
function adminForm(a) {
  const isNew = !a; a = a || { role: "editor", is_active: true };
  const self = a.id === me.id;
  openDrawer({ label: "Administrator", title: isNew ? "Tambah administrator" : `Edit ${a.username}`, submit: isNew ? "Tambah administrator" : "Simpan perubahan",
    body: field({ name: "username", label: "Username", value: a.username || "", req: true, attrs: 'autocomplete="off"', hint: "Huruf kecil, angka, titik, atau garis bawah." })
      + `<div class="field" data-field="password"><label for="f-password">Kata sandi ${isNew ? '<span class="req">*</span>' : ""}</label><div class="pw"><input class="input" id="f-password" name="password" type="password" autocomplete="new-password"><button type="button" data-pw aria-label="Tampilkan kata sandi">${ic("eye")}</button></div><p class="hint">${isNew ? "Minimal 8 karakter." : "Kosongkan bila tidak diubah."}</p></div>`
      + field({ name: "role", label: "Role", type: "select", req: true, attrs: self ? "disabled" : "", options: opts(Object.keys(ROLES).map((r) => [r, ROLES[r].label + (roleCovers(r) ? "" : " — melebihi izin Anda"), !roleCovers(r)]), a.role), hint: self ? "Anda tidak dapat mengubah role akun sendiri." : "Anda hanya dapat memberi role yang izinnya tidak melebihi izin Anda." })
      + `<div class="field" style="margin-top:18px"><label class="switch"><input type="checkbox" name="is_active" ${a.is_active ? "checked" : ""} ${self ? "disabled" : ""}><span class="switch__track"></span><span>Akun aktif</span></label>${self ? '<p class="hint">Anda tidak dapat menonaktifkan akun sendiri.</p>' : ""}</div>`
      + (isNew ? "" : `<div class="notice notice--amber" style="margin-top:18px">${ic("alert")}<div>Mengganti kata sandi atau role, atau menonaktifkan akun, akan langsung mengakhiri semua sesi login ${a.username}.</div></div>`),
    onSubmit: (f) => {
      if (!required(f, isNew ? ["username", "password"] : ["username"])) return false;
      if (!/^[a-z0-9._]{3,50}$/.test(f.username.value)) { setError(f, "username", "Gunakan 3–50 karakter: huruf kecil, angka, titik, garis bawah."); return false; }
      if (DB.admins.some((x) => x.username === f.username.value && x !== a)) { setError(f, "username", "Username sudah dipakai."); return false; }
      if (f.password.value && f.password.value.length < 8) { setError(f, "password", "Kata sandi minimal 8 karakter."); return false; }
      setTimeout(() => { Object.assign(a, { username: f.username.value, role: self ? a.role : f.role.value, is_active: self ? true : f.is_active.checked }); if (isNew) { a.id = Date.now(); a.last_login_at = null; DB.admins.push(a); } toast(isNew ? "Administrator ditambahkan." : "Administrator diperbarui."); route(); }, 660);
    } });
  $("[data-pw]").addEventListener("click", (e) => { const i = $("#f-password"); const show = i.type === "password"; i.type = show ? "text" : "password"; e.currentTarget.innerHTML = ic(show ? "eyeOff" : "eye"); e.currentTarget.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"); });
}
function viewAdmins(el) {
  const manage = can("admins.manage");
  let tab = "list";
  const roleBadge = (r) => `<span class="badge ${r === "superadmin" ? "badge--green" : r === "admin" ? "badge--mint" : "badge--outline"}">${ROLES[r].label}</span>`;
  const shell = () => {
    el.innerHTML = pageHead({ label: "Sistem", title: "Administrator", desc: "Akun yang dapat masuk ke panel admin.", actions: manage && tab === "list" ? `<button class="btn btn--solid" data-new>${ic("plus")} Tambah administrator</button>` : "" })
      + (!manage ? readOnly("admins.manage") : "")
      + (can("roles.manage") ? `<div class="seg" style="margin-bottom:14px" role="group"><button aria-pressed="${tab === "list"}" data-tab="list">Administrator</button><button aria-pressed="${tab === "roles"}" data-tab="roles">Role &amp; izin</button></div>` : "")
      + `<div data-body></div>`;
    const body = $("[data-body]", el);
    if (tab === "roles") {
      body.innerHTML = `<div class="notice notice--blue" style="margin-bottom:14px">${ic("info")}<div>Role bersifat tetap. Panel ini hanya menampilkan izin tiap role; mengubah role atau izin belum didukung API.</div></div>
        <div class="grid grid--stats" style="margin-bottom:16px">${Object.entries(ROLES).map(([k, r]) => `<div class="stat"><div class="stat__top">${roleBadge(k)}<span class="small muted">${DB.admins.filter((a) => a.role === k).length} akun</span></div><div class="stat__value" style="font-size:24px">${r.perms.length}<span class="small muted" style="font-family:var(--sans);font-weight:400"> / ${ALL.length} izin</span></div><div class="stat__hint">${r.desc}</div></div>`).join("")}</div>
        <div class="card"><div class="table-wrap"><table class="table matrix"><thead><tr><th>Izin</th>${Object.values(ROLES).map((r) => `<th>${r.label}</th>`).join("")}</tr></thead><tbody>${PERMISSIONS.map(([p, desc]) => `<tr><td><div class="mono" style="color:var(--green-900)">${p}</div><div class="t-sub">${desc}</div></td>${Object.values(ROLES).map((r) => `<td>${r.perms.includes(p) ? `<span class="tick" aria-label="Ya">✓</span>` : `<span class="cross" aria-label="Tidak">—</span>`}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
      return;
    }
    const list = data(DB.admins);
    if (!list.length) { body.innerHTML = `<div class="card">${emptyBlock({ icon: "admins", title: "Belum ada administrator lain", text: "Tambahkan akun untuk pengurus yang membantu mengelola situs.", action: manage ? '<button class="btn btn--solid" data-new>Tambah administrator</button>' : "" })}</div>`; return; }
    body.innerHTML = `<div class="card"><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Administrator</th><th>Role</th><th>Status</th><th>Login terakhir</th><th></th></tr></thead><tbody>${list.map((a) => `<tr><td><div class="cell-flex"><span class="avatar" style="${a.is_active ? "" : "background:#C2CBC6"}">${initials(a.username)}</span><div><div class="t-title">${a.username}${a.id === me.id ? ' <span class="badge badge--outline" style="margin-left:6px">Anda</span>' : ""}</div></div></div></td><td data-label="Role">${roleBadge(a.role)}</td><td data-label="Status">${a.is_active ? '<span class="badge badge--mint badge--dot">Aktif</span>' : '<span class="badge badge--grey">Nonaktif</span>'}</td><td data-label="Login terakhir" class="small">${rel(a.last_login_at)}</td>
      <td class="t-actions">${manage ? `<button class="btn btn--outline btn--sm" data-edit="${a.id}">${ic("edit")} Edit</button><button class="btn btn--danger-outline btn--sm btn--icon" data-del="${a.id}" ${a.id === me.id ? 'disabled title="Tidak dapat menghapus akun sendiri"' : ""} aria-label="Hapus ${a.username}">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div></div>`;
  };
  el.onclick = (e) => {
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; shell(); }
    if (e.target.closest("[data-new]")) adminForm();
    const ed = e.target.closest("[data-edit]"); if (ed) adminForm(DB.admins.find((x) => x.id === +ed.dataset.edit));
    const del = e.target.closest("[data-del]"); if (del) { const a = DB.admins.find((x) => x.id === +del.dataset.del); confirmDialog({ title: `Hapus akun ${a.username}?`, text: "Akun ini tidak bisa login lagi dan semua sesinya diakhiri. Riwayat aktivitasnya tetap tersimpan.", onConfirm: () => { DB.admins = DB.admins.filter((x) => x !== a); toast("Administrator dihapus."); route(); } }); }
  };
  shell();
}

/* ---------- Log aktivitas ---------- */
function viewActivity(el) {
  let q = "", kind = "", who = "";
  const all = data(DB.activity);
  const kindOf = (a) => (a.action.endsWith("delete") ? "delete" : a.action.endsWith("create") ? "create" : "update");
  const KB = { create: ["Tambah", "badge--mint"], update: ["Ubah", "badge--blue"], delete: ["Hapus", "badge--red"] };
  el.innerHTML = pageHead({ label: "Sistem", title: "Log Aktivitas", desc: "Jejak audit setiap perubahan data oleh administrator. Tidak dapat diubah atau dihapus." })
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari deskripsi…" aria-label="Cari log" data-q></div><select class="select-sm" data-k aria-label="Jenis aksi"><option value="">Semua aksi</option><option value="create">Tambah</option><option value="update">Ubah</option><option value="delete">Hapus</option></select><select class="select-sm" data-w aria-label="Administrator"><option value="">Semua admin</option>${[...new Set(DB.activity.map((a) => a.admin))].map((u) => `<option>${u}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((a) => (!kind || kindOf(a) === kind) && (!who || a.admin === who) && (!q || norm(a.description).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "activity", label: "Log", title: "Belum ada aktivitas tercatat", text: "Setiap perubahan data oleh administrator akan tercatat otomatis." }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Waktu</th><th>Administrator</th><th>Aksi</th><th>Deskripsi</th></tr></thead><tbody>${rows.map((a) => `<tr><td data-label="Waktu" class="small" style="white-space:nowrap">${fmtDT(a.created_at)}</td><td data-label="Admin"><div class="cell-flex"><span class="avatar" style="width:26px;height:26px;font-size:10px">${initials(a.admin)}</span>${a.admin}</div></td><td data-label="Aksi">${badge(KB, kindOf(a))}<div class="t-sub mono">${a.action}</div></td><td data-label="Deskripsi">${esc(a.description)}<details class="row-more"><summary>Detail permintaan</summary><div class="small muted">Entitas <span class="mono">${a.entity_type}#${a.entity_id}</span> · IP <span class="mono">${a.ip_address}</span><br>${esc(a.user_agent)}</div></details></td></tr>`).join("")}</tbody></table></div>${pager(rows.length, 1, 20)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; draw(); });
  $("[data-k]", el).addEventListener("change", (e) => { kind = e.target.value; draw(); });
  $("[data-w]", el).addEventListener("change", (e) => { who = e.target.value; draw(); });
  el.onclick = (e) => { if (e.target.closest("[data-clear]")) viewActivity(el); };
  draw();
}

/* ---------- Statistik pengunjung ---------- */
function viewVisitors(el) {
  const v = data(DB.visits);
  el.innerHTML = pageHead({ label: "Sistem", title: "Statistik Pengunjung", desc: "Kunjungan situs publik 14 hari terakhir.", actions: `<select class="select-sm" aria-label="Rentang"><option>14 hari terakhir</option><option>30 hari terakhir</option></select>` })
    + `<div class="notice" style="margin-bottom:16px">${ic("lock")}<div>Alamat IP pengunjung tidak disimpan. Pengunjung unik dihitung dari hash anonim.</div></div>`;
  if (!v.length) { el.insertAdjacentHTML("beforeend", `<div class="card">${emptyBlock({ icon: "chart", label: "Statistik", title: "Belum ada kunjungan tercatat", text: "Data akan muncul setelah situs publik dikunjungi." })}</div>`); return; }
  const days = Array.from({ length: 14 }, (_, i) => { const dt = new Date(2026, 10, 3 + i); const key = dt.toDateString(); return { dt, n: v.filter((x) => new Date(x.visited_at).toDateString() === key).length }; });
  const max = Math.max(...days.map((x) => x.n));
  const uniq = new Set(v.map((x) => x.visitor_hash)).size;
  const pages = Object.entries(v.reduce((m, x) => ((m[x.page] = (m[x.page] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
  const mobile = Math.round((v.filter((x) => x.user_agent.includes("Mobile")).length / v.length) * 100);
  el.insertAdjacentHTML("beforeend", `<div class="grid grid--stats" style="margin-bottom:16px">
      <div class="stat"><span class="label label--muted">Total kunjungan</span><div class="stat__value">${v.length}</div><div class="stat__hint">14 hari</div></div>
      <div class="stat"><span class="label label--muted">Pengunjung unik</span><div class="stat__value">${uniq}</div><div class="stat__hint">berdasarkan hash</div></div>
      <div class="stat"><span class="label label--muted">Hari ini</span><div class="stat__value">${days[13].n}</div><div class="stat__hint">${days[13].n >= days[12].n ? "▲" : "▼"} ${Math.abs(days[13].n - days[12].n)} dari kemarin</div></div>
      <div class="stat"><span class="label label--muted">Dari ponsel</span><div class="stat__value">${mobile}%</div><div class="stat__hint">perangkat mobile</div></div></div>
    <div class="grid grid--2"><section class="card"><div class="card__head"><h2>Kunjungan harian</h2></div><div class="card__body"><div class="bars" role="img" aria-label="Grafik kunjungan harian">${days.map((x, i) => `<div class="bars__col ${i === 13 ? "is-today" : ""}"><div class="bars__bar" style="height:${(x.n / max) * 100}%;animation-delay:${i * 30}ms"><span>${x.n}</span></div><span class="bars__x">${x.dt.getDate()}</span></div>`).join("")}</div></div></section>
    <section class="card"><div class="card__head"><h2>Halaman terpopuler</h2></div><ul class="list">${pages.map(([p, n]) => `<li style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><span class="mono" style="color:var(--green-900);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p}</span><strong>${n}</strong></div><div class="meter"><span style="width:${(n / pages[0][1]) * 100}%"></span></div></li>`).join("")}</ul></section></div>
    <section class="card" style="margin-top:16px"><div class="card__head"><h2>Kunjungan terbaru</h2></div><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Waktu</th><th>Halaman</th><th>Pengunjung</th><th>Perangkat</th></tr></thead><tbody>${v.slice(0, 8).map((x) => `<tr><td data-label="Waktu" class="small">${fmtDT(x.visited_at)}</td><td data-label="Halaman" class="mono">${x.page}</td><td data-label="Pengunjung" class="mono muted">${x.visitor_hash}</td><td data-label="Perangkat" class="small">${x.user_agent}</td></tr>`).join("")}</tbody></table></div>${pager(v.length, 1, 8)}</section>`);
}

/* ---------- Pengaturan ---------- */
function viewSettings(el) {
  const manage = can("settings.manage");
  const list = data(DB.settings);
  const groups = [...new Set(DB.settings.map((s) => s.group))];
  el.innerHTML = pageHead({ label: "Sistem", title: "Pengaturan Situs", desc: "Informasi yang tampil di situs publik dan bisa diubah tanpa mengubah kode." }) + (!manage ? readOnly("settings.manage") : "");
  if (!list.length) { el.insertAdjacentHTML("beforeend", `<div class="card">${emptyBlock({ icon: "settings", title: "Belum ada pengaturan", text: "Pengaturan situs belum diinisialisasi di database." })}</div>`); return; }
  const control = (s) => {
    const dis = manage ? "" : "disabled";
    if (s.type === "bool") return `<label class="switch"><input type="checkbox" name="${s.key}" ${s.value ? "checked" : ""} ${dis}><span class="switch__track"></span><span class="small">${s.value ? "Aktif" : "Nonaktif"}</span></label>`;
    if (s.type === "text") return `<textarea class="textarea" style="min-height:80px" name="${s.key}" ${dis}>${esc(s.value)}</textarea>`;
    const inp = `<input class="input" name="${s.key}" type="${s.type === "url" ? "url" : s.type === "email" ? "email" : "text"}" value="${esc(s.value)}" ${dis}>`;
    return s.prefix ? `<div class="input-group"><span class="prefix">${s.prefix}</span>${inp}</div>` : inp;
  };
  el.insertAdjacentHTML("beforeend", `<div class="settings"><nav aria-label="Kelompok pengaturan">${groups.map((g, i) => `<a href="#g-${g}" class="${i ? "" : "is-active"}" data-jump="${g}">${g}</a>`).join("")}</nav><div class="grid">${groups.map((g) => `<section class="card" id="g-${g}"><div class="card__head"><h2>${g}</h2></div>${list.filter((s) => s.group === g).map((s) => `<form class="setting-row" data-key="${s.key}" novalidate><div><h3>${s.label}</h3><p class="key">${s.key} · ${s.type}</p>${s.hint ? `<p class="hint" style="margin-top:6px">${s.hint}</p>` : ""}</div><div class="field" data-field="${s.key}">${control(s)}<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:6px"><span class="meta" data-meta>Diubah ${rel(s.updated_at)} oleh ${s.updated_by}</span>${manage ? `<span data-acts hidden><button type="button" class="btn btn--ghost btn--sm" data-reset>Batal</button> <button class="btn btn--solid btn--sm">Simpan</button></span>` : ""}</div></div></form>`).join("")}</section>`).join("")}</div></div>`);
  $$("[data-jump]", el).forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); $$("[data-jump]", el).forEach((x) => x.classList.toggle("is-active", x === a)); $("#g-" + a.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" }); }));
  $$("form[data-key]", el).forEach((f) => {
    const s = DB.settings.find((x) => x.key === f.dataset.key);
    const acts = $("[data-acts]", f);
    f.addEventListener("input", () => { if (acts) acts.hidden = false; if (s.type === "bool") $(".switch .small", f).textContent = f.elements[s.key].checked ? "Aktif" : "Nonaktif"; });
    $("[data-reset]", f)?.addEventListener("click", () => { viewSettings(el); });
    f.addEventListener("submit", (e) => {
      e.preventDefault(); clearErrors(f);
      const inp = f.elements[s.key]; const val = s.type === "bool" ? inp.checked : inp.value.trim();
      if (s.type === "url" && val && !/^https?:\/\/.+/.test(val)) { setError(f, s.key, "Masukkan URL lengkap yang diawali https://"); return; }
      if (s.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) { setError(f, s.key, "Format email tidak valid."); return; }
      const b = $("button:not([data-reset])", acts); b.classList.add("is-busy");
      setTimeout(() => { b.classList.remove("is-busy"); s.value = val; s.updated_at = NOW.toISOString(); s.updated_by = me.username; acts.hidden = true; $("[data-meta]", f).textContent = `Diubah baru saja oleh ${me.username}`; toast(`“${s.label}” disimpan.`); }, 600);
    });
  });
}

/* =========================================================
   SESI BERAKHIR + PANEL REVIEW
   ========================================================= */
function sessionExpired() {
  const wrap = document.createElement("div"); wrap.className = "layer";
  wrap.innerHTML = `<div class="overlay"></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="se-t"><div class="modal__body"><div class="modal__icon" style="background:var(--amber-bg);color:var(--amber)">${ic("clock")}</div><h2 id="se-t">Sesi Anda telah berakhir</h2><p>Demi keamanan, Anda perlu masuk kembali. Perubahan yang belum disimpan akan hilang.</p></div><div class="modal__foot"><a class="btn btn--solid" href="login.html?state=expired">Masuk kembali</a></div></div>`;
  document.body.appendChild(wrap);
}
function devPanel() {
  if (params.get("panel") === "off") return;
  const p = document.createElement("details"); p.className = "devpanel";
  p.innerHTML = `<summary>Review: role &amp; state</summary><div class="body">
    <label>Role<select data-k="role">${Object.keys(ROLES).map((r) => `<option value="${r}" ${r === ROLE ? "selected" : ""}>${ROLES[r].label}</option>`).join("")}</select></label>
    <label>State<select data-k="state">${["normal", "loading", "empty", "error", "expired"].map((s) => `<option ${s === STATE ? "selected" : ""}>${s}</option>`).join("")}</select></label>
    <small>Role ${ROLES[ROLE].label}: ${me.perms.size} dari ${ALL.length} izin. Panel ini hanya untuk review desain.</small></div>`;
  p.addEventListener("change", (e) => { const q = new URLSearchParams(location.search); q.set(e.target.dataset.k, e.target.value); location.href = "?" + q.toString() + location.hash; });
  document.body.appendChild(p);
}

renderShell();
addEventListener("hashchange", route);
route();
devPanel();
if (STATE === "expired") setTimeout(sessionExpired, DELAY + 300);
