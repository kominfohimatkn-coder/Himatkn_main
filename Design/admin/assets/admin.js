/* HIMATKN Admin — prototipe interaktif (revisi 2).
   URL: index.html?role=superadmin|admin|editor&state=normal|loading|empty|error|expired#/halaman
   Simpan/hapus hanya simulasi di memori. */

const params = new URLSearchParams(location.search);
const ROLE = ROLES[params.get("role")] ? params.get("role") : "superadmin";
const STATE = params.get("state") || "normal";
const DELAY = params.has("delay") ? Number(params.get("delay")) || 0 : 450;
const me = { ...ME[ROLE], perms: new Set(ROLES[ROLE].perms) };
const can = (p) => !p || me.perms.has(p);
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
const initials = (n) => n.replace(/^(Dr|Ir)\. /, "").replace(/[^A-Za-z .]/g, "").split(/[ .]/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = (s) => String(s).toLowerCase();
const isEmpty = STATE === "empty";
const data = (arr) => (isEmpty ? [] : arr);
const activePeriod = () => DB.periods.find((p) => p.is_active);
const periodName = (id) => DB.periods.find((p) => p.id === +id)?.name || "—";
const divsOf = (pid) => DB.divisions.filter((x) => x.period_id === +pid).sort((a, b) => a.sort_order - b.sort_order);
const membersOf = (pid) => data(DB.members).filter((m) => m.period_id === +pid);
const plabel = (p) => `“${PERM_LABEL[p] || p}”`;
function device(ua) {
  const kind = /iPhone|Android|Mobile/.test(ua) ? "Ponsel" : "Komputer";
  const br = /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : /Firefox\//.test(ua) ? "Firefox" : "Peramban lain";
  return `${kind} · ${br}`;
}

/* ---------- Ikon ---------- */
const P = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  news: '<path d="M4 5h13v14H6a2 2 0 0 1-2-2z"/><path d="M17 9h3v8a2 2 0 0 1-2 2"/><path d="M8 9h5M8 13h5M8 17h3"/>',
  programs: '<path d="M9 4h6v3H9z"/><path d="M7 5H5v16h14V5h-2"/><path d="m9 13 2 2 4-4"/>',
  agenda: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  org: '<circle cx="12" cy="6" r="2.5"/><circle cx="5" cy="18" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M12 8.5V12M5 15.5V12h14v3.5"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  admins: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.5 6-5.5s5.4 2.1 6 5.5"/><path d="M16 4.5a3 3 0 0 1 0 6M18 14.6c2 .6 3.2 2.4 3.5 4.9"/>',
  activity: '<path d="M3 12h4l3-7 4 14 3-7h4"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.4 19.6l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.1 14H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.6 1.6 0 0 0 20.9 10H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12 5 5 9-10"/>', alert: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v4h16v-4"/>', external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>', menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-7 8-7s7 2.5 8 7"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>', grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>', power: '<path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"/>',
  pause: '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
  building: '<path d="M4 21h16M6 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M14 9h3a1 1 0 0 1 1 1v11M9 8h2M9 12h2M9 16h2"/>',
  heroImg: '<rect x="3" y="5" width="15" height="15" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m18 15-4-4-8 8"/><path d="M19 3v4M17 5h4"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 19c.6-3 2.8-5 6-5s5.4 2 6 5"/><circle cx="17" cy="9" r="2.2"/><path d="M17 14c2.1.4 3.5 2 4 5"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 0 0-5.7-5.7L11.5 6.8"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 0 0 5.7 5.7l1.3-1.3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'
};
const ic = (n, cls = "") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const LOGO = '<svg viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="#C9D6CF" stroke-width="2.2"><path d="M20 21 C12 4, 2 8, 4 14 C6 20, 14 21, 20 21Z"/><path d="M20 21 C28 4, 38 8, 36 14 C34 20, 26 21, 20 21Z"/><path d="M20 21 C14 28, 16 38, 20 38 C24 38, 26 28, 20 21Z"/></g><polygon points="20,16.5 23.5,18.5 23.5,22.5 20,24.5 16.5,22.5 16.5,18.5" fill="#06261B" stroke="#C9D6CF" stroke-width="1.4"/></svg>';

/* ---------- Status ---------- */
const NEWS_STATUS = { published: ["Terbit", "badge--green"], draft: ["Draft", "badge--amber"], archived: ["Arsip", "badge--grey"] };
const PROG_STATUS = { planned: ["Direncanakan", "badge--amber"], ongoing: ["Berjalan", "badge--mint badge--dot"], completed: ["Selesai", "badge--green"], cancelled: ["Dibatalkan", "badge--cancel"] };
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
const forbidden = (perm) => `<div class="card">${stateBlock({ kind: "lock", icon: "lock", label: "Akses ditolak", title: "Anda tidak punya akses ke halaman ini", text: `Halaman ini membutuhkan izin ${plabel(perm)}. Role <strong>${ROLES[ROLE].label}</strong> tidak memilikinya. Hubungi superadmin bila Anda memerlukan akses.`, action: `<a class="btn btn--outline" href="#/dashboard">Kembali ke dashboard</a>` })}</div>`;
const readOnly = (perm) => `<div class="notice" style="margin-bottom:16px">${ic("eye")}<div><strong>Mode lihat saja.</strong> Role ${ROLES[ROLE].label} dapat melihat data ini tetapi tidak dapat mengubahnya (butuh izin ${plabel(perm)}).</div></div>`;
const tableSkel = (rows = 5, cols = 5) => `<div class="card"><div class="toolbar"><div class="skel" style="width:280px;height:36px"></div><div class="skel" style="width:220px;height:36px"></div></div><table class="table"><tbody>${Array.from({ length: rows }, () => `<tr>${Array.from({ length: cols }, (_, i) => `<td><div class="skel" style="height:12px;width:${i === 0 ? 70 : 40 + ((i * 17) % 40)}%"></div>${i === 0 ? '<div class="skel" style="height:10px;width:40%;margin-top:8px"></div>' : ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const headSkel = `<div class="page-head"><div><div class="skel" style="width:90px;height:11px"></div><div class="skel" style="width:260px;height:28px;margin-top:12px"></div></div></div>`;

function pager(total, page = 1, per = 10) {
  const pages = Math.max(1, Math.ceil(total / per));
  let nums = Array.from({ length: pages }, (_, i) => i + 1);
  if (pages > 7) nums = [...new Set([1, 2, page - 1, page, page + 1, pages - 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b).flatMap((n, i, arr) => (i && n - arr[i - 1] > 1 ? ["…", n] : [n]));
  return `<div class="table-foot"><span>Menampilkan ${total ? (page - 1) * per + 1 : 0}–${Math.min(total, page * per)} dari ${total}</span><nav class="pager" aria-label="Halaman"><button data-page="${page - 1}" ${page === 1 ? "disabled" : ""} aria-label="Sebelumnya">‹</button>${nums.map((n) => (n === "…" ? '<span class="pager__gap">…</span>' : `<button data-page="${n}" ${n === page ? 'aria-current="true"' : ""} aria-label="Halaman ${n}">${n}</button>`)).join("")}<button data-page="${page + 1}" ${page === pages ? "disabled" : ""} aria-label="Berikutnya">›</button></nav></div>`;
}

/* Toast */
function toast(msg, type = "ok") {
  const box = $(".toasts") || document.body.appendChild(Object.assign(document.createElement("div"), { className: "toasts" }));
  box.setAttribute("aria-live", "polite");
  const t = document.createElement("div");
  t.className = "toast" + (type === "error" ? " toast--error" : "");
  t.innerHTML = ic(type === "error" ? "alert" : "check") + `<span>${msg}</span>`;
  box.appendChild(t);
  setTimeout(() => { t.classList.add("is-out"); setTimeout(() => t.remove(), 260); }, 3400);
}

/* Lapisan (drawer/modal): Escape menutup, fokus terjebak, fokus kembali ke pemicu */
let lastFocus;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
function mountLayer(html) {
  closeLayers(false); lastFocus = document.activeElement;
  const wrap = document.createElement("div"); wrap.className = "layer"; wrap.innerHTML = html;
  document.body.appendChild(wrap); document.body.style.overflow = "hidden";
  wrap.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = $$(FOCUSABLE, wrap).filter((x) => x.offsetParent !== null); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  return wrap;
}
function closeLayers(restore = true) { const had = $$(".layer").length; $$(".layer").forEach((l) => l.remove()); document.body.style.overflow = ""; if (had && restore) lastFocus?.focus?.(); }

function openDrawer({ label, title, body, submit = "Simpan", onSubmit, danger }) {
  const wrap = mountLayer(`<div class="overlay" data-close></div><form class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-title" novalidate>
    <div class="drawer__head"><div><p class="label">${label}</p><h2 id="dr-title">${title}</h2></div><button type="button" class="icon-btn" data-close aria-label="Tutup">${ic("x")}</button></div>
    <div class="drawer__body">${body}</div>
    <div class="drawer__foot">${danger || ""}<span style="flex:1"></span><button type="button" class="btn btn--outline" data-close>Batal</button>${submit ? `<button type="submit" class="btn btn--solid">${submit}</button>` : ""}</div></form>`);
  const form = $("form", wrap);
  setTimeout(() => $(".drawer__body input:not([type=file]), .drawer__body select, .drawer__body textarea", form)?.focus(), 60);
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
function confirmDialog({ title, text, confirm = "Hapus", tone = "danger", icon = "trash", onConfirm, cancel = "Batal", extra = "" }) {
  const wrap = mountLayer(`<div class="overlay" data-close></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="md-t" aria-describedby="md-d">
    <div class="modal__body"><div class="modal__icon modal__icon--${tone}">${ic(icon)}</div><h2 id="md-t">${title}</h2><p id="md-d">${text}</p>${extra}</div>
    <div class="modal__foot">${cancel ? `<button class="btn btn--outline" data-close>${cancel}</button>` : ""}${confirm ? `<button class="btn ${tone === "danger" ? "btn--danger" : "btn--solid"}" data-ok>${confirm}</button>` : ""}</div></div>`);
  setTimeout(() => $(".modal__foot .btn", wrap)?.focus(), 30);
  wrap.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeLayers();
    const ok = e.target.closest("[data-ok]");
    if (ok) { if (!onConfirm) return closeLayers(); ok.classList.add("is-busy"); setTimeout(() => { closeLayers(); onConfirm(); }, 550); }
  });
}
const infoDialog = (o) => confirmDialog({ ...o, tone: o.tone || "info", icon: o.icon || "info", confirm: null, cancel: o.cancel || "Mengerti" });
addEventListener("keydown", (e) => { if (e.key === "Escape") { if ($(".layer") && !$(".layer [data-sticky]")) closeLayers(); else { closeMenus(); document.body.classList.remove("nav-open"); } } });

/* Field helpers */
const field = ({ name, label, type = "text", value = "", req, hint, attrs = "", options, prefix }) => {
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
  f.insertAdjacentHTML("beforeend", `<p class="error-text" id="err-${name}">${ic("alert")} ${msg}</p>`);
  const c = $("input, select, textarea", f); c?.setAttribute("aria-describedby", "err-" + name); c?.setAttribute("aria-invalid", "true");
}
function clearErrors(form) { $$(".has-error", form).forEach((f) => { f.classList.remove("has-error"); $(".error-text", f)?.remove(); $("[aria-invalid]", f)?.removeAttribute("aria-invalid"); }); }
function required(form, names) {
  clearErrors(form); let ok = true;
  names.forEach((n) => { const el = form.elements[n]; if (el && !String(el.value).trim()) { setError(form, n, "Wajib diisi."); ok = false; } });
  return ok;
}
const opts = (list, sel, ph) => (ph !== undefined ? `<option value="">${ph}</option>` : "") + list.map(([v, l, dis]) => `<option value="${v}" ${String(v) === String(sel) ? "selected" : ""} ${dis ? "disabled" : ""}>${esc(l)}</option>`).join("");
const mediaLocked = () => `<div class="notice notice--amber">${ic("lock")}<div>Mengunggah gambar membutuhkan izin ${plabel("media.manage")}. Minta superadmin atau admin mengunggahkan gambarnya.</div></div>`;
const IMG_TYPES = ["image/jpeg", "image/png", "image/webp"];
function checkImage(file) {
  if (!IMG_TYPES.includes(file.type)) return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  if (file.size > 4 * 1048576) return `Ukuran ${(file.size / 1048576).toFixed(1)} MB melebihi batas 4 MB.`;
  return null;
}
const readPreview = (file) => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });

/* Penjaga perubahan belum disimpan */
let dirtyGuard = null, prevHash = location.hash;
addEventListener("beforeunload", (e) => { if (dirtyGuard?.()) { e.preventDefault(); e.returnValue = ""; } });

/* =========================================================
   ROUTES
   ========================================================= */
const ROUTES = [
  { path: "dashboard", title: "Dashboard", perm: "dashboard.view", icon: "dashboard", group: "Utama", render: viewDashboard },
  { path: "news", title: "Publikasi", perm: "news.view", icon: "news", group: "Konten", render: viewNews },
  { path: "programs", title: "Program Kerja", perm: "programs.view", icon: "programs", group: "Konten", render: viewPrograms },
  { path: "organization", title: "Struktur Organisasi", perm: "organization.view", icon: "org", group: "Organisasi", render: viewOrganization },
  { path: "admins", title: "Administrator", perm: "admins.view", icon: "admins", group: "Sistem", render: viewAdmins },
  { path: "activity", title: "Log Aktivitas", perm: "activity_logs.view", icon: "activity", group: "Sistem", render: viewActivity },
  { path: "visitors", title: "Statistik Pengunjung", perm: "visitor_logs.view", icon: "chart", group: "Sistem", render: viewVisitors },
  { path: "settings", title: "Pengaturan Situs", perm: "settings.view", icon: "settings", group: "Sistem", render: viewSettings },
  { path: "account", title: "Akun Saya", perm: null, icon: "user", group: null, render: viewAccount },
  /* DITUNDA: tidak tampil di menu; hanya lewat URL atau panel Review */
  { path: "agendas", title: "Agenda", perm: "agendas.view", icon: "agenda", deferred: true, render: viewAgendas },
  { path: "documents", title: "Dokumen", perm: "documents.view", icon: "doc", deferred: true, render: viewDocuments },
  { path: "notifications", title: "Notifikasi", perm: "notifications.view", icon: "bell", deferred: true, render: viewNotifications }
];

function renderShell() {
  const groups = [...new Set(ROUTES.filter((r) => r.group).map((r) => r.group))];
  const nav = groups.map((g) => {
    const items = ROUTES.filter((r) => r.group === g && !r.deferred && can(r.perm));
    if (!items.length) return "";
    return `<div class="nav__group"><p class="nav__title">${g}</p>${items.map((r) => `<a href="#/${r.path}" data-route="${r.path}">${ic(r.icon)}<span>${r.title}</span></a>`).join("")}</div>`;
  }).join("");
  document.body.innerHTML = `<a class="skip" href="#content">Langsung ke konten</a><div class="topline" aria-hidden="true"></div>
  <div class="shell">
    <aside class="sidebar" aria-label="Navigasi admin">
      <a class="sidebar__brand" href="#/dashboard">${LOGO}<span><span class="sidebar__name">Hima Teknokimia Nuklir</span><span class="sidebar__sub">Panel Admin</span></span></a>
      <nav class="nav">${nav}</nav>
      <div class="sidebar__foot">Periode aktif <strong>${activePeriod()?.name || "belum ada"}</strong></div>
    </aside>
    <div class="sidebar-overlay" data-nav-close></div>
    <div class="main">
      <header class="topbar">
        <button class="icon-btn topbar__menu" data-nav-open aria-label="Buka navigasi">${ic("menu")}</button>
        <nav class="crumbs" aria-label="Breadcrumb" id="crumbs"></nav>
        <div class="topbar__right">
          <a class="btn btn--outline btn--sm topbar__site" href="../index.html" target="_blank" rel="noopener">${ic("external")}<span>Lihat situs</span></a>
          <div style="position:relative"><button class="user" data-menu="user" aria-haspopup="menu" aria-expanded="false"><span class="avatar">${initials(me.username)}</span><span class="user__text"><span class="user__name">${me.username}</span><span class="user__role">${ROLES[ROLE].label}</span></span></button></div>
        </div>
      </header>
      <main class="content" id="content" tabindex="-1"></main>
    </div>
  </div>`;
  document.addEventListener("click", onGlobalClick);
}

function closeMenus() {
  $$(".dropdown").forEach((x) => x.remove());
  $$("[data-menu]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  $$(".section-select__menu").forEach((m) => (m.hidden = true));
  $$(".section-select__trigger").forEach((b) => b.setAttribute("aria-expanded", "false"));
}
function onGlobalClick(e) {
  const m = e.target.closest("[data-menu]");
  if (m) {
    const open = m.getAttribute("aria-expanded") === "true"; closeMenus(); if (open) return;
    m.setAttribute("aria-expanded", "true");
    const dd = document.createElement("div");
    dd.className = "dropdown"; dd.setAttribute("role", "menu");
    dd.innerHTML = `<div class="dropdown__head"><div style="font-weight:600">${me.username}</div><div class="small muted">${ROLES[ROLE].label}</div></div>
      <a role="menuitem" href="#/account">${ic("user")} Akun saya</a>
      <a role="menuitem" href="../index.html" target="_blank" rel="noopener">${ic("external")} Lihat situs</a>
      <a role="menuitem" href="login.html?state=logged-out">${ic("logout")} Keluar</a>`;
    m.parentElement.appendChild(dd); $("a", dd).focus(); return;
  }
  if (!e.target.closest(".dropdown") && !e.target.closest("[data-sec-select]")) closeMenus();
  else if (e.target.closest(".dropdown a")) closeMenus();
  if (e.target.closest("[data-nav-open]")) document.body.classList.add("nav-open");
  if (e.target.closest("[data-nav-close]") || e.target.closest(".nav a")) document.body.classList.remove("nav-open");
  if (e.target.closest("[data-reload]")) route();
}

/* ---------- Router ---------- */
function onHash() {
  if (dirtyGuard?.()) {
    const target = location.hash;
    history.replaceState(null, "", prevHash);
    confirmDialog({ title: "Tinggalkan halaman ini?", text: "Ada perubahan yang belum disimpan. Jika Anda pindah halaman, perubahan itu akan hilang.", confirm: "Tinggalkan", cancel: "Tetap di sini", icon: "alert", onConfirm: () => { dirtyGuard = null; location.hash = target; } });
    return;
  }
  route();
}
function route() {
  closeLayers(false); closeMenus(); dirtyGuard = null; prevHash = location.hash;
  const [path, sub] = (location.hash.replace(/^#\/?/, "").split("?")[0] || "dashboard").split("/");
  const r = ROUTES.find((x) => x.path === path);
  $$(".nav a").forEach((a) => (a.dataset.route === path ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  const old = $("#content"), main = old.cloneNode(false); old.replaceWith(main);
  const title = r ? r.title : "Tidak ditemukan";
  $("#crumbs").innerHTML = `<a href="#/dashboard">Admin</a><span aria-hidden="true">/</span>${sub ? `<a href="#/${path}">${title}</a><span aria-hidden="true">/</span><strong>${sub === "new" ? "Baru" : "Edit"}</strong>` : `<strong>${title}</strong>`}`;
  document.title = `${title} · Admin HIMATKN`;
  const line = $(".topline"); line.classList.remove("is-done"); line.style.width = "45%";
  const done = () => { line.style.width = "100%"; line.classList.add("is-done"); };
  if (!r) { main.innerHTML = `<div class="card">${stateBlock({ icon: "search", label: "Halaman tidak ada", title: "Halaman admin tidak ditemukan", text: "Alamat ini tidak ada di panel admin.", action: '<a class="btn btn--outline" href="#/dashboard">Ke dashboard</a>' })}</div>`; done(); return; }
  if (!can(r.perm)) { main.innerHTML = forbidden(r.perm); done(); return; }
  main.innerHTML = headSkel + (path === "dashboard" ? `<div class="grid grid--stats">${'<div class="stat"><div class="skel" style="width:60%;height:11px"></div><div class="skel" style="width:40%;height:28px;margin-top:20px"></div></div>'.repeat(4)}</div>` : tableSkel());
  main.setAttribute("aria-busy", "true");
  if (STATE === "loading") return;
  setTimeout(() => {
    main.setAttribute("aria-busy", "false"); main.innerHTML = "";
    if (STATE === "error") { main.innerHTML = pageHead({ label: r.group || "Akun", title: r.title }) + `<div class="card">${errorBlock(r.title)}</div>`; done(); return; }
    main.classList.add("view-enter");
    if (r.deferred) main.insertAdjacentHTML("afterbegin", `<div class="notice notice--amber" style="margin-bottom:18px">${ic("pause")}<div><strong>Modul ditunda.</strong> ${r.title} belum menjadi bagian produk dan tidak tampil di menu maupun situs publik. Halaman ini disimpan hanya sebagai referensi.</div></div>`);
    const host = document.createElement("div"); main.appendChild(host);
    r.render(host, sub);
    done(); window.scrollTo(0, 0);
  }, DELAY);
}

/* =========================================================
   DASHBOARD — hanya angka total dari GET /admin/dashboard
   ========================================================= */
function viewDashboard(el) {
  const ap = activePeriod();
  const stats = [["news.view", "news", "Publikasi", data(DB.news).length, "news"], ["programs.view", "programs", "Program kerja", data(DB.programs).length, "programs"],
    ["organization.view", "organization", "Anggota (semua periode)", data(DB.members).length, "org"], ["visitor_logs.view", "visitors", "Kunjungan", data(DB.visits).length, "chart"]].filter((s) => can(s[0]));
  const quick = [["news.create", "#/news/new", "Tulis publikasi"], ["organization.manage", "#/organization?new", "Tambah anggota"]].filter((q) => can(q[0]));
  const latest = [...data(DB.news)].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 5);
  el.innerHTML = `<section class="hero-card"><div><p class="label">${ap ? `Periode aktif ${ap.name}` : "Belum ada periode aktif"}</p><h1>Selamat datang, ${me.username}</h1><p>Anda masuk sebagai <strong style="color:#fff">${ROLES[ROLE].label}</strong>. ${ROLES[ROLE].desc}</p></div>${quick.length ? `<div class="quick">${quick.map((q, i) => `<a class="btn ${i ? "btn--outline" : "btn--solid"}" href="${q[1]}">${ic("plus")} ${q[2]}</a>`).join("")}</div>` : ""}</section>
    ${stats.length ? `<div class="grid grid--stats" style="margin-bottom:16px">${stats.map((s) => `<a class="stat" href="#/${s[1]}"><div class="stat__top"><span class="label label--muted">${s[2]}</span><span class="stat__icon">${ic(s[4])}</span></div><div class="stat__value">${s[3]}</div></a>`).join("")}</div>` : ""}
    ${can("news.view") ? `<section class="card"><div class="card__head"><h2>Publikasi terbaru</h2><a class="btn btn--ghost btn--sm" href="#/news">Lihat semua</a></div>${latest.length ? `<ul class="list">${latest.map((n) => `<li><div class="list__icon">${ic("news")}</div><div class="list__main"><a class="list__title list__link" href="#/news/${n.id}">${esc(n.title)}</a><div class="list__meta">Diperbarui ${rel(n.updated_at)} · ${n.author}</div></div>${badge(NEWS_STATUS, n.status)}</li>`).join("")}</ul>` : emptyBlock({ icon: "news", title: "Belum ada publikasi", text: "Publikasi pertama akan muncul di sini.", action: can("news.create") ? '<a class="btn btn--solid" href="#/news/new">Tulis publikasi</a>' : "" })}</section>` : ""}`;
}

/* =========================================================
   PUBLIKASI
   ========================================================= */
const coverOf = (n) => n.images?.[0];
function viewNews(el, sub) {
  if (sub) return newsEditor(el, sub);
  let q = "", status = "all", tag = "", page = 1;
  const all = data(DB.news);
  const counts = { all: all.length, published: 0, draft: 0, archived: 0 }; all.forEach((n) => counts[n.status]++);
  el.innerHTML = pageHead({ label: "Konten", title: "Publikasi", desc: "Berita dan dokumentasi kegiatan. Hanya publikasi berstatus Terbit yang tampil di situs.", actions: can("news.create") ? `<a class="btn btn--solid" href="#/news/new">${ic("plus")} Tulis publikasi</a>` : "" })
    + (!can("news.update") ? readOnly("news.update") : "")
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari judul…" aria-label="Cari publikasi" data-q></div>
      <div class="seg" role="group" aria-label="Status">${[["all", "Semua"], ["published", "Terbit"], ["draft", "Draft"], ["archived", "Arsip"]].map(([k, l]) => `<button aria-pressed="${k === "all"}" data-st="${k}">${l}<span class="count">${counts[k]}</span></button>`).join("")}</div>
      <select class="select-sm" data-tag aria-label="Tag"><option value="">Semua tag</option>${DB.tags.map((t) => `<option value="${t.id}">${t.name}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((n) => (status === "all" || n.status === status) && (!tag || n.tags.includes(+tag)) && (!q || norm(n.title).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "news", label: "Publikasi", title: "Belum ada publikasi", text: "Mulai dengan menulis kabar atau dokumentasi kegiatan pertama.", action: can("news.create") ? '<a class="btn btn--solid" href="#/news/new">Tulis publikasi</a>' : "" }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Judul</th><th>Status</th><th>Tag</th><th>Penulis</th><th>Diperbarui</th><th><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>${rows.slice((page - 1) * 10, page * 10).map((n) => `<tr>
      <td><div class="cell-flex"><div class="thumb">${coverOf(n)?.src ? `<img src="${coverOf(n).src}" alt="">` : ic("image")}</div><div><div class="t-title">${esc(n.title)}</div><div class="t-sub">${n.images.length ? `${n.images.length} gambar` : "Belum ada gambar"}</div></div></div></td>
      <td data-label="Status">${badge(NEWS_STATUS, n.status)}</td>
      <td data-label="Tag"><div class="chips">${n.tags.map((t) => `<span class="badge badge--outline">${tagName(t)}</span>`).join("")}</div></td>
      <td data-label="Penulis">${n.author}</td><td data-label="Diperbarui" class="small">${fmtDate(n.updated_at)}</td>
      <td class="t-actions">${n.status === "published" ? `<a class="btn btn--ghost btn--icon" href="../artikel.html?type=berita&id=${n.slug}" target="_blank" rel="noopener" aria-label="Lihat “${esc(n.title)}” di situs" title="Lihat di situs">${ic("external")}</a>` : ""}<a class="btn btn--outline btn--sm" href="#/news/${n.id}">${can("news.update") ? ic("edit") + " Edit" : ic("eye") + " Lihat"}</a>${can("news.delete") ? `<button class="btn btn--danger-outline btn--sm btn--icon" data-del="${n.id}" aria-label="Hapus “${esc(n.title)}”">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>${pager(rows.length, page)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-tag]", el).addEventListener("change", (e) => { tag = e.target.value; page = 1; draw(); });
  $$("[data-st]", el).forEach((b) => b.addEventListener("click", () => { status = b.dataset.st; page = 1; $$("[data-st]", el).forEach((x) => x.setAttribute("aria-pressed", x === b)); draw(); }));
  el.addEventListener("click", (e) => {
    const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); }
    if (e.target.closest("[data-clear]")) { q = ""; status = "all"; tag = ""; $("[data-q]", el).value = ""; $("[data-tag]", el).value = ""; $$("[data-st]", el).forEach((x) => x.setAttribute("aria-pressed", x.dataset.st === "all")); draw(); }
    const del = e.target.closest("[data-del]");
    if (del) { const n = DB.news.find((x) => x.id === +del.dataset.del); confirmDialog({ title: "Hapus publikasi?", text: `“${esc(n.title)}” beserta semua gambarnya akan dihapus permanen dan tidak bisa dikembalikan.`, onConfirm: () => { DB.news = DB.news.filter((x) => x !== n); toast("Publikasi dihapus."); route(); } }); }
  });
  draw();
}

/* Markdown sederhana untuk pratinjau (di-escape dulu) */
function md(src) {
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>").replace(/(^|\s)_(.+?)_/g, "$1<em>$2</em>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const out = []; let list = null;
  src.split("\n").forEach((line) => {
    const li = line.match(/^\s*[-*] (.*)/), ol = line.match(/^\s*\d+\. (.*)/);
    if (li || ol) { const tag = li ? "ul" : "ol"; if (list !== tag) { if (list) out.push(`</${list}>`); out.push(`<${tag}>`); list = tag; } out.push(`<li>${inline((li || ol)[1])}</li>`); return; }
    if (list) { out.push(`</${list}>`); list = null; }
    if (/^### /.test(line)) out.push(`<h4>${inline(line.slice(4))}</h4>`);
    else if (/^## /.test(line)) out.push(`<h3>${inline(line.slice(3))}</h3>`);
    else if (/^> /.test(line)) out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  });
  if (list) out.push(`</${list}>`);
  return out.join("") || '<p class="muted">Belum ada isi.</p>';
}

function newsEditor(el, id) {
  const isNew = id === "new";
  if (isNew && !can("news.create")) { el.innerHTML = forbidden("news.create"); return; }
  const n = isNew ? { title: "", slug: "", content: "", status: "draft", tags: [], images: [] } : DB.news.find((x) => x.id === +id);
  if (!n) { el.innerHTML = `<div class="card">${stateBlock({ icon: "search", label: "Tidak ditemukan", title: "Publikasi tidak ditemukan", text: "Publikasi ini mungkin sudah dihapus.", action: '<a class="btn btn--outline" href="#/news">Kembali ke daftar</a>' })}</div>`; return; }
  const editable = isNew || can("news.update");
  const ro = editable ? "" : "readonly";
  const tags = new Set(n.tags);
  let dirty = false, act = "save";
  el.innerHTML = pageHead({ label: "Publikasi", title: isNew ? "Tulis publikasi" : editable ? "Edit publikasi" : "Lihat publikasi",
    actions: `${editable ? `<div class="savebar ${isNew ? "" : "is-saved"}" data-savebar role="status"><span class="dot" aria-hidden="true"></span><span data-savetext>${isNew ? "Belum disimpan" : "Tersimpan · " + rel(n.updated_at)}</span></div>` : ""}${n.status === "published" ? `<a class="btn btn--outline" href="../artikel.html?type=berita&id=${n.slug}" target="_blank" rel="noopener">${ic("external")} Lihat di situs</a>` : ""}<a class="btn btn--outline" href="#/news">Kembali</a>` })
    + (!editable ? readOnly("news.update") : "")
    + `<form class="editor" novalidate data-form>
      <div class="card"><div class="card__body">
        <div class="field" data-field="title"><label class="visually-hidden" for="f-title">Judul</label><input class="editor__title" id="f-title" name="title" placeholder="Judul publikasi" value="${esc(n.title)}" ${ro}></div>
        <div class="field" data-field="slug"><label for="f-slug">Alamat halaman <span class="req" aria-hidden="true">*</span></label><div class="input-group"><span class="prefix">/publikasi/</span><input class="input" id="f-slug" name="slug" value="${esc(n.slug)}" ${ro}></div><p class="hint">Terisi otomatis dari judul. Hanya huruf kecil, angka, dan tanda hubung; harus unik.</p></div>
        <div class="field" data-field="content"><div class="editor-tabs"><span class="field-label" id="lbl-content">Isi publikasi <span class="req" aria-hidden="true">*</span></span><span style="flex:1"></span><div role="tablist" aria-label="Mode isi" class="editor-tabs__list"><button type="button" role="tab" aria-selected="true" data-mode="write">Tulis</button><button type="button" role="tab" aria-selected="false" data-mode="preview">Pratinjau</button></div></div>
          <div data-write>
            ${editable ? `<div class="editor-bar" role="toolbar" aria-label="Format teks"><button type="button" data-md="**|**" title="Tebal" aria-label="Tebal"><b>B</b></button><button type="button" data-md="*|*" title="Miring" aria-label="Miring"><i>I</i></button><span class="sep"></span><button type="button" data-md="## |" data-line title="Subjudul" aria-label="Subjudul">H2</button><button type="button" data-md="- |" data-line title="Daftar berpoin" aria-label="Daftar berpoin">•</button><button type="button" data-md="1. |" data-line title="Daftar bernomor" aria-label="Daftar bernomor">1.</button><button type="button" data-md="> |" data-line title="Kutipan" aria-label="Kutipan">❝</button><span class="sep"></span><button type="button" data-md="[|](https://)" title="Tautan" aria-label="Tautan">🔗</button></div>` : ""}
            <textarea class="textarea textarea--editor" id="f-content" name="content" aria-labelledby="lbl-content" placeholder="Tulis isi publikasi… Gunakan **tebal**, *miring*, ## subjudul, atau - daftar." ${ro}>${esc(n.content)}</textarea>
            ${editable ? '<p class="hint" style="margin-top:6px">Format Markdown. Lihat hasilnya di tab Pratinjau.</p>' : ""}
          </div>
          <div class="md-preview" data-preview hidden></div></div>
      </div></div>
      <div class="side-stack">
        <section class="card"><div class="card__head"><h2>Status</h2>${badge(NEWS_STATUS, n.status)}</div><div class="card__body">
          ${field({ name: "status", label: "Status", type: "select", value: n.status, attrs: editable ? "" : "disabled", options: opts([["draft", "Draft — tidak tampil"], ["published", "Terbit — tampil di situs"], ["archived", "Arsip — disembunyikan"]], n.status) })}
          <p class="hint" style="margin-top:10px">${n.published_at ? `Terbit ${fmtDT(n.published_at)}` : "Tanggal terbit diisi otomatis saat status diubah ke Terbit."}${n.author ? `<br>Penulis: ${n.author}` : ""}</p>
          ${editable ? `<div style="display:grid;gap:8px;margin-top:16px"><button class="btn btn--solid" type="submit" data-act="save">${isNew ? "Simpan draft" : "Simpan perubahan"}</button>${n.status !== "published" ? `<button class="btn btn--outline" type="submit" data-act="publish">Simpan &amp; terbitkan</button>` : ""}</div>` : ""}
        </div></section>
        <section class="card"><div class="card__head"><h2>Tag</h2></div><div class="card__body"><div class="chips" data-tags>${DB.tags.map((t) => `<button type="button" class="chip" aria-pressed="${tags.has(t.id)}" data-tagid="${t.id}" ${editable ? "" : "disabled"}>${t.name}</button>`).join("")}</div>
          ${editable && can("news.create") ? `<div class="input-group" style="margin-top:12px"><label class="visually-hidden" for="newtag">Tag baru</label><input class="input" id="newtag" placeholder="Tag baru…" data-newtag style="border-radius:var(--radius) 0 0 var(--radius)"><button type="button" class="btn btn--outline" data-addtag style="border-radius:0 var(--radius) var(--radius) 0;height:auto">Tambah</button></div>` : ""}</div></section>
        <section class="card" data-gallery-card></section>
        ${!isNew && can("news.delete") ? `<section class="card"><div class="card__body"><p class="label" style="color:var(--red)">Zona berbahaya</p><p class="small muted" style="margin:6px 0 12px">Menghapus publikasi juga menghapus semua gambarnya.</p><button type="button" class="btn btn--danger-outline" data-delnews>${ic("trash")} Hapus publikasi</button></div></section>` : ""}
      </div></form>`;
  const form = $("[data-form]", el), sb = $("[data-savebar]", el), st = $("[data-savetext]", el);
  const setDirty = (v) => { dirty = v; if (!sb) return; sb.classList.toggle("is-saved", !v); if (v) st.textContent = "Ada perubahan belum disimpan"; };
  dirtyGuard = () => dirty;
  let slugTouched = !isNew;
  form.addEventListener("input", (e) => { if (e.target.closest("[data-gallery-card]")) return; setDirty(true); if (e.target.name === "title" && !slugTouched) form.slug.value = slugify(e.target.value); if (e.target.name === "slug") slugTouched = true; });
  const toggleChip = (c) => { c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") !== "true"); setDirty(true); };
  $$("[data-tagid]", el).forEach((c) => c.addEventListener("click", () => toggleChip(c)));
  $("[data-addtag]", el)?.addEventListener("click", () => { const inp = $("[data-newtag]", el); const v = inp.value.trim(); if (!v) return; if (DB.tags.some((t) => norm(t.name) === norm(v))) { toast("Tag itu sudah ada.", "error"); return; } const t = { id: Date.now(), name: v }; DB.tags.push(t); $("[data-tags]", el).insertAdjacentHTML("beforeend", `<button type="button" class="chip" aria-pressed="true" data-tagid="${t.id}">${esc(v)}</button>`); const c = $("[data-tags] .chip:last-child", el); c.addEventListener("click", () => toggleChip(c)); inp.value = ""; toast(`Tag “${esc(v)}” dibuat.`); setDirty(true); });
  $$("[data-mode]", el).forEach((b) => b.addEventListener("click", () => { const pv = b.dataset.mode === "preview"; $$("[data-mode]", el).forEach((x) => x.setAttribute("aria-selected", x === b)); $("[data-write]", el).hidden = pv; const p = $("[data-preview]", el); p.hidden = !pv; if (pv) p.innerHTML = md(form.content.value); }));
  $$("[data-md]", el).forEach((b) => b.addEventListener("click", () => {
    const ta = form.content, [pre, post] = b.dataset.md.split("|"); const s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e);
    if (b.hasAttribute("data-line")) { const ls = ta.value.lastIndexOf("\n", s - 1) + 1; ta.setRangeText(pre, ls, ls, "end"); }
    else { const word = sel || "teks"; ta.setRangeText(pre + word + post, s, e, "end"); ta.setSelectionRange(s + pre.length, s + pre.length + word.length); }
    ta.focus(); setDirty(true);
  }));
  $("[data-delnews]", el)?.addEventListener("click", () => confirmDialog({ title: "Hapus publikasi?", text: `“${esc(n.title)}” dan semua gambarnya akan dihapus permanen.`, onConfirm: () => { dirty = false; DB.news = DB.news.filter((x) => x !== n); toast("Publikasi dihapus."); location.hash = "#/news"; } }));
  renderGallery($("[data-gallery-card]", el), n, { isNew, editable, saveFirst: () => { act = "save"; form.requestSubmit($('[data-act="save"]', el)); } });
  $$("[data-act]", el).forEach((b) => b.addEventListener("click", () => (act = b.dataset.act)));
  form.addEventListener("submit", (e) => {
    e.preventDefault(); if (!editable) return;
    clearErrors(form); let bad = false;
    if (!form.title.value.trim()) { setError(form, "title", "Judul wajib diisi."); bad = true; }
    const slug = form.slug.value.trim();
    if (!slug) { setError(form, "slug", "Alamat halaman wajib diisi."); bad = true; }
    else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { setError(form, "slug", "Gunakan huruf kecil, angka, dan tanda hubung saja."); bad = true; }
    else if (DB.news.some((x) => x.slug === slug && x !== n)) { setError(form, "slug", "Alamat ini sudah dipakai publikasi lain."); bad = true; }
    if (!form.content.value.trim()) { setError(form, "content", "Isi publikasi wajib diisi."); bad = true; }
    if (bad) { $(".has-error input, .has-error textarea", form)?.focus(); toast("Periksa kembali isian yang ditandai.", "error"); return; }
    const btn = $(`[data-act="${act}"]`, el); btn.classList.add("is-busy");
    setTimeout(() => {
      btn.classList.remove("is-busy");
      Object.assign(n, { title: form.title.value, slug, content: form.content.value, status: act === "publish" ? "published" : form.status.value, tags: $$('[data-tagid][aria-pressed="true"]', el).map((c) => +c.dataset.tagid), updated_at: NOW.toISOString() });
      if (n.status === "published" && !n.published_at) n.published_at = NOW.toISOString();
      dirty = false;
      if (isNew) { n.id = Date.now(); n.author = me.username; DB.news.unshift(n); toast(act === "publish" ? "Publikasi diterbitkan." : "Draft disimpan. Sekarang Anda bisa menambahkan gambar."); location.hash = "#/news/" + n.id; return; }
      setDirty(false); st.textContent = "Tersimpan · baru saja"; toast(act === "publish" ? "Publikasi diterbitkan." : "Perubahan disimpan.");
      if (act === "publish") route();
    }, 700);
  });
}

/* Galeri: gambar pertama = sampul. Setiap aksi langsung tersimpan (endpoint gambar terpisah) */
function renderGallery(card, n, { isNew, editable, saveFirst }) {
  const head = `<div class="card__head"><h2>Galeri gambar</h2><span class="small muted">${n.images.length} gambar</span></div>`;
  if (isNew) { card.innerHTML = head + `<div class="card__body"><div class="gallery-locked">${ic("image")}<p><strong>Simpan draft dulu untuk menambahkan gambar.</strong><br>Gambar baru bisa diunggah setelah publikasi tersimpan.</p><button type="button" class="btn btn--outline btn--sm" data-savefirst>Simpan draft</button></div></div>`; $("[data-savefirst]", card).addEventListener("click", saveFirst); return; }
  const canUpload = editable && can("media.manage");
  const items = n.images.map((img, i) => `<li class="gal-item" draggable="${editable}" data-i="${i}">
      ${editable ? `<span class="gal-grip" aria-hidden="true" title="Seret untuk mengurutkan">${ic("grip")}</span>` : ""}
      <div class="gal-thumb">${img.src ? `<img src="${img.src}" alt="">` : ic("image")}${i === 0 ? '<span class="gal-cover">Sampul</span>' : ""}${img.uploading ? '<div class="gal-progress" role="progressbar" aria-label="Mengunggah"><span></span></div>' : ""}</div>
      <div class="gal-main"><label class="visually-hidden" for="cap-${img.id}">Keterangan gambar ${i + 1}</label><input class="input input--sm" id="cap-${img.id}" data-cap="${i}" value="${esc(img.caption)}" placeholder="Keterangan (opsional)" ${editable ? "" : "readonly"}>
        ${editable ? `<div class="gal-actions"><button type="button" class="btn btn--ghost btn--icon btn--xs" data-move="${i}:-1" ${i === 0 ? "disabled" : ""} aria-label="Naikkan gambar ${i + 1}">${ic("up")}</button><button type="button" class="btn btn--ghost btn--icon btn--xs" data-move="${i}:1" ${i === n.images.length - 1 ? "disabled" : ""} aria-label="Turunkan gambar ${i + 1}">${ic("down")}</button><span style="flex:1"></span><button type="button" class="btn btn--ghost btn--icon btn--xs gal-del" data-rm="${i}" aria-label="Hapus gambar ${i + 1}">${ic("trash")}</button></div>` : ""}</div></li>`).join("");
  card.innerHTML = head + `<div class="card__body">
    <p class="hint" style="margin-bottom:10px">Gambar pertama dipakai sebagai sampul di situs.${editable ? " Seret atau pakai tombol panah untuk mengubah urutan." : ""}</p>
    ${n.images.length ? `<ol class="gallery-list">${items}</ol>` : `<p class="small muted" style="margin-bottom:10px">Belum ada gambar.</p>`}
    ${editable ? (canUpload ? `<label class="dropzone dropzone--sm" data-drop>${ic("upload")}<strong>Tambah gambar</strong><span class="hint">JPG, PNG, atau WebP · maks 4 MB per file · otomatis dikompres</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple class="visually-hidden"></label><div data-upload-err></div>` : mediaLocked()) : ""}
  </div>`;
  const redraw = (focusSel) => { renderGallery(card, n, { isNew, editable, saveFirst }); if (focusSel) $(focusSel, card)?.focus(); };
  $$("[data-move]", card).forEach((b) => b.addEventListener("click", () => { const [i, dir] = b.dataset.move.split(":").map(Number); const to = i + dir; const [it] = n.images.splice(i, 1); n.images.splice(to, 0, it); redraw(`[data-move="${to}:${dir}"]:not([disabled])`); if (!$(`[data-move="${to}:${dir}"]:not([disabled])`, card)) $(`[data-move="${to}:${-dir}"]`, card)?.focus(); toast(to === 0 ? "Urutan disimpan. Sampul diperbarui." : "Urutan gambar disimpan."); }));
  $$("[data-rm]", card).forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.rm; confirmDialog({ title: "Hapus gambar ini?", text: i === 0 ? "Gambar ini adalah sampul. Setelah dihapus, gambar berikutnya menjadi sampul." : "Gambar akan dihapus dari galeri publikasi.", onConfirm: () => { n.images.splice(i, 1); redraw(); toast("Gambar dihapus."); } }); }));
  $$("[data-cap]", card).forEach((inp) => inp.addEventListener("change", () => { n.images[+inp.dataset.cap].caption = inp.value; toast("Keterangan disimpan."); }));
  let from = null;
  $$(".gal-item", card).forEach((li) => {
    li.addEventListener("dragstart", (e) => { from = +li.dataset.i; li.classList.add("is-dragging"); e.dataTransfer.effectAllowed = "move"; });
    li.addEventListener("dragend", () => li.classList.remove("is-dragging"));
    li.addEventListener("dragover", (e) => { e.preventDefault(); li.classList.add("is-over"); });
    li.addEventListener("dragleave", () => li.classList.remove("is-over"));
    li.addEventListener("drop", (e) => { e.preventDefault(); const to = +li.dataset.i; if (from === null || from === to) return; const [it] = n.images.splice(from, 1); n.images.splice(to, 0, it); redraw(); toast("Urutan gambar disimpan."); });
  });
  const dz = $("[data-drop]", card);
  if (dz) {
    const input = $("input", dz);
    const handle = async (files) => {
      const bad = [];
      for (const f of files) {
        const err = checkImage(f); if (err) { bad.push(`${esc(f.name)}: ${err}`); continue; }
        const img = { id: Date.now() + Math.random(), src: await readPreview(f), caption: "", uploading: true };
        n.images.push(img);
        setTimeout(() => { img.uploading = false; redraw(); toast("Gambar ditambahkan."); }, 1100);
      }
      redraw();
      if (bad.length) { $("[data-drop]", card)?.classList.add("is-error"); $("[data-upload-err]", card).innerHTML = `<p class="error-text" style="margin-top:8px">${ic("alert")} ${bad.join("<br>")}</p>`; }
    };
    input.addEventListener("change", () => handle([...input.files]));
    dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.classList.add("is-over"); });
    dz.addEventListener("dragleave", () => dz.classList.remove("is-over"));
    dz.addEventListener("drop", (e) => { e.preventDefault(); dz.classList.remove("is-over"); handle([...e.dataTransfer.files]); });
  }
}

/* =========================================================
   PROGRAM KERJA
   ========================================================= */
function divisionOptions(pid, sel, ph = "Tanpa divisi") { return opts(divsOf(pid).map((x) => [x.id, x.name]), sel, ph); }
function programForm(p) {
  const isNew = !p; p = p || { status: "planned", period_id: activePeriod()?.id };
  const form = openDrawer({
    label: "Program kerja", title: isNew ? "Tambah program kerja" : "Edit program kerja", submit: isNew ? "Tambah program" : "Simpan perubahan",
    body: field({ name: "name", label: "Nama program", value: p.name || "", req: true })
      + field({ name: "slug", label: "Alamat halaman", value: p.slug || "", req: true, prefix: "/program-kerja/", hint: "Terisi otomatis dari nama. Harus unik." })
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
}
function viewPrograms(el) {
  let q = "", st = "all", div = "", period = String(activePeriod()?.id || ""), page = 1;
  const manage = can("programs.manage");
  el.innerHTML = pageHead({ label: "Konten", title: "Program Kerja", desc: "Program kerja kabinet per periode. Ditampilkan di halaman Program Kerja situs.", actions: manage ? `<button class="btn btn--solid" data-new>${ic("plus")} Tambah program</button>` : "" })
    + (!manage ? readOnly("programs.manage") : "")
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari program…" aria-label="Cari program" data-q></div>
      <select class="select-sm" data-period aria-label="Periode">${opts(DB.periods.map((x) => [x.id, "Periode " + x.name + (x.is_active ? " (aktif)" : "")]), period, "Semua periode")}</select>
      <select class="select-sm" data-div aria-label="Divisi"></select></div>
      <div class="toolbar toolbar--sub"><div class="seg" role="group" aria-label="Status" data-seg></div></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const inPeriod = data(DB.programs).filter((p) => !period || p.period_id === +period);
    const counts = { all: inPeriod.length }; Object.keys(PROG_STATUS).forEach((k) => (counts[k] = inPeriod.filter((p) => p.status === k).length));
    $("[data-seg]", el).innerHTML = [["all", "Semua"], ...Object.entries(PROG_STATUS).map(([k, v]) => [k, v[0]])].map(([k, l]) => `<button aria-pressed="${k === st}" data-st="${k}">${l}<span class="count">${counts[k]}</span></button>`).join("");
    const rows = inPeriod.filter((p) => (st === "all" || p.status === st) && (!div || p.division_id === +div) && (!q || norm(p.name).includes(norm(q))));
    if (!data(DB.programs).length) return (body.innerHTML = emptyBlock({ icon: "programs", label: "Program kerja", title: "Belum ada program kerja", text: "Tambahkan program kerja hasil rapat kerja kabinet.", action: manage ? '<button class="btn btn--solid" data-new>Tambah program</button>' : "" }));
    if (!inPeriod.length && !q) return (body.innerHTML = emptyBlock({ icon: "programs", label: `Periode ${periodName(period)}`, title: "Periode ini belum punya program kerja", text: "Pilih periode lain atau tambahkan program baru.", action: manage ? '<button class="btn btn--solid" data-new>Tambah program</button>' : "" }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Program</th><th>Divisi</th><th>Status</th><th>Jadwal</th>${period ? "" : "<th>Periode</th>"}<th><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>${rows.slice((page - 1) * 10, page * 10).map((p) => `<tr class="${p.status === "cancelled" ? "is-cancelled" : ""}"><td><div class="t-title">${esc(p.name)}</div><div class="t-sub">${esc(p.description || "")}</div></td><td data-label="Divisi">${divName(p.division_id)}</td><td data-label="Status">${badge(PROG_STATUS, p.status)}</td><td data-label="Jadwal" class="small">${p.start_date ? fmtDate(p.start_date) + (p.end_date ? " – " + fmtDate(p.end_date) : "") : '<span class="muted">Belum dijadwalkan</span>'}</td>${period ? "" : `<td data-label="Periode" class="small">${periodName(p.period_id)}</td>`}
      <td class="t-actions">${manage ? `<button class="btn btn--outline btn--sm" data-edit="${p.id}">${ic("edit")} Edit</button><button class="btn btn--danger-outline btn--sm btn--icon" data-del="${p.id}" aria-label="Hapus “${esc(p.name)}”">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div>${pager(rows.length, page)}`;
  };
  const fillDiv = () => { $("[data-div]", el).innerHTML = period ? divisionOptions(period, div, "Semua divisi") : '<option value="">Semua divisi</option>'; };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-period]", el).addEventListener("change", (e) => { period = e.target.value; div = ""; page = 1; fillDiv(); draw(); });
  $("[data-div]", el).addEventListener("change", (e) => { div = e.target.value; page = 1; draw(); });
  el.addEventListener("click", (e) => {
    const s = e.target.closest("[data-st]"); if (s) { st = s.dataset.st; page = 1; draw(); $(`[data-st="${st}"]`, el)?.focus(); }
    const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); }
    if (e.target.closest("[data-new]")) programForm();
    const ed = e.target.closest("[data-edit]"); if (ed) programForm(DB.programs.find((x) => x.id === +ed.dataset.edit));
    const del = e.target.closest("[data-del]");
    if (del) { const p = DB.programs.find((x) => x.id === +del.dataset.del); confirmDialog({ title: "Hapus program kerja?", text: `“${esc(p.name)}” akan dihapus dari situs dan tidak bisa dikembalikan.`, onConfirm: () => { DB.programs = DB.programs.filter((x) => x !== p); toast("Program kerja dihapus."); route(); } }); }
    if (e.target.closest("[data-clear]")) { q = ""; st = "all"; div = ""; $("[data-q]", el).value = ""; fillDiv(); draw(); }
  });
  fillDiv(); draw();
}

/* =========================================================
   STRUKTUR ORGANISASI
   ========================================================= */
function periodStats(p) {
  const divs = divsOf(p.id).length, mem = DB.members.filter((m) => m.period_id === p.id).length, prog = DB.programs.filter((x) => x.period_id === p.id).length;
  const deletable = !p.is_active && !divs && !mem && !prog;
  const reason = p.is_active ? "Periode aktif tidak bisa dihapus." : !deletable ? `Masih ada ${[divs && divs + " divisi", mem && mem + " anggota", prog && prog + " program kerja"].filter(Boolean).join(", ")}.` : "";
  return { divs, mem, prog, deletable, reason };
}
function periodForm(p, onDone) {
  const isNew = !p; p = p || {};
  openDrawer({ label: "Struktur organisasi", title: isNew ? "Buat periode baru" : `Ubah periode ${p.name}`, submit: isNew ? "Buat periode" : "Simpan perubahan",
    body: field({ name: "name", label: "Nama periode", value: p.name || "", req: true, hint: "Contoh: 2026/2027. Harus unik." }) + `<div class="field-row">${field({ name: "start_date", label: "Mulai", type: "date", value: p.start_date || "" })}${field({ name: "end_date", label: "Selesai", type: "date", value: p.end_date || "" })}</div>`
      + (isNew ? `<div class="notice" style="margin-top:18px">${ic("info")}<div>Periode baru dibuat dalam keadaan <strong>tidak aktif</strong>. Lengkapi divisi dan anggotanya dulu, lalu aktifkan.</div></div>` : ""),
    onSubmit: (form) => {
      if (!required(form, ["name"])) return false;
      if (DB.periods.some((x) => x.name === form.name.value.trim() && x !== p)) { setError(form, "name", "Nama periode sudah dipakai."); return false; }
      if (form.start_date.value && form.end_date.value && form.end_date.value < form.start_date.value) { setError(form, "end_date", "Tanggal selesai tidak boleh sebelum tanggal mulai."); return false; }
      setTimeout(() => { Object.assign(p, { name: form.name.value.trim(), start_date: form.start_date.value || null, end_date: form.end_date.value || null }); if (isNew) { p.id = Date.now(); p.is_active = false; DB.periods.unshift(p); } toast(isNew ? "Periode dibuat. Lanjutkan dengan menyalin divisi." : "Periode diperbarui."); onDone(p); }, 660);
    } });
}
const renderShellFoot = () => { const f = $(".sidebar__foot strong"); if (f) f.textContent = activePeriod()?.name || "belum ada"; };
function activatePeriod(p, onDone) {
  const s = periodStats(p), cur = activePeriod();
  const missing = [!s.divs && "divisi", !s.mem && "anggota"].filter(Boolean).join(" dan ");
  confirmDialog({ tone: "info", icon: "power", title: `Aktifkan periode ${p.name}?`, confirm: "Aktifkan periode",
    text: `Situs publik akan langsung menampilkan struktur periode ${p.name}.${cur ? ` Periode ${cur.name} otomatis menjadi tidak aktif.` : ""}`,
    extra: missing ? `<div class="notice notice--amber" style="margin-top:14px">${ic("alert")}<div><strong>Periode ini belum memiliki ${missing}.</strong> Halaman Struktur di situs akan tampil kosong sampai datanya diisi. Anda tetap bisa mengaktifkannya.</div></div>` : "",
    onConfirm: () => { DB.periods.forEach((x) => (x.is_active = x === p)); toast(`Periode ${p.name} sekarang aktif.`); renderShellFoot(); onDone(); } });
}
function memberForm(m, periodId, preset = {}) {
  const isNew = !m; m = m || { period_id: periodId, division_id: preset.division_id || "", position_id: 9, sort_order: 0, photo_url: null };
  let photo = m.photo_url;
  const photoBlock = () => `<div class="photo-edit"><span class="avatar avatar--xl ${photo ? "avatar--photo" : ""}">${photo ? `<img src="${photo}" alt="Pratinjau foto">` : initials(m.name || "A")}</span><div style="flex:1;min-width:0">
      ${can("media.manage") ? `<div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn btn--outline btn--sm">${ic("upload")} ${photo ? "Ganti foto" : "Unggah foto"}<input type="file" accept="image/jpeg,image/png,image/webp" class="visually-hidden" data-photo></label>${photo ? `<button type="button" class="btn btn--ghost btn--sm" data-photo-rm>${ic("trash")} Hapus foto</button>` : ""}</div><p class="hint" style="margin-top:6px">JPG, PNG, atau WebP · maks 4 MB · rasio 1:1 disarankan</p>` : mediaLocked()}
      <div data-photo-err></div></div></div>`;
  const f = openDrawer({
    label: "Struktur organisasi", title: isNew ? "Tambah anggota" : "Edit anggota", submit: isNew ? "Tambah anggota" : "Simpan perubahan",
    danger: !isNew ? `<button type="button" class="btn btn--danger-outline" data-delm>${ic("trash")} Hapus</button>` : "",
    body: `<div class="field" style="margin-bottom:18px"><span class="field-label">Foto</span><div data-photo-wrap>${photoBlock()}</div></div>`
      + field({ name: "name", label: "Nama lengkap", value: m.name || "", req: true })
      + `<div class="field-row">${field({ name: "period_id", label: "Periode", type: "select", req: true, options: opts(DB.periods.map((x) => [x.id, x.name + (x.is_active ? " (aktif)" : "")]), m.period_id) })}${field({ name: "position_id", label: "Jabatan", type: "select", req: true, options: opts(DB.positions.map((x) => [x.id, x.name]), m.position_id) })}</div>`
      + field({ name: "division_id", label: "Divisi", type: "select", options: divisionOptions(m.period_id, m.division_id), hint: "Hanya divisi dari periode yang dipilih." })
      + field({ name: "sort_order", label: "Urutan tampil", type: "number", value: m.sort_order, attrs: 'min="0" inputmode="numeric"', hint: "Angka kecil tampil lebih dulu di dalam divisi." }),
    onSubmit: (form) => {
      if (!required(form, ["name", "period_id", "position_id"])) return false;
      setTimeout(() => { Object.assign(m, { name: form.name.value.trim(), period_id: +form.period_id.value, position_id: +form.position_id.value, division_id: form.division_id.value ? +form.division_id.value : null, sort_order: +form.sort_order.value || 0, photo_url: photo }); if (isNew) { m.id = Date.now(); DB.members.push(m); } toast(isNew ? "Anggota ditambahkan." : "Data anggota diperbarui."); route(); }, 660);
    }
  });
  const wire = () => {
    $("[data-photo]", f)?.addEventListener("change", async (e) => {
      const file = e.target.files[0]; if (!file) return; const err = checkImage(file);
      if (err) { $("[data-photo-err]", f).innerHTML = `<p class="error-text" style="margin-top:6px">${ic("alert")} ${err}</p>`; return; }
      photo = await readPreview(file); $("[data-photo-wrap]", f).innerHTML = photoBlock(); wire();
    });
    $("[data-photo-rm]", f)?.addEventListener("click", () => { photo = null; $("[data-photo-wrap]", f).innerHTML = photoBlock(); wire(); });
  };
  wire();
  f.period_id.addEventListener("change", () => { f.division_id.innerHTML = divisionOptions(f.period_id.value, ""); });
  $("[data-delm]", f)?.addEventListener("click", () => confirmDialog({ title: "Hapus anggota?", text: `${esc(m.name)} akan dihapus dari struktur periode ${periodName(m.period_id)}.`, onConfirm: () => { DB.members = DB.members.filter((x) => x !== m); toast("Anggota dihapus."); route(); } }));
}
function divisionForm(dv, periodId, onDone) {
  const isNew = !dv; dv = dv || { period_id: periodId, sort_order: divsOf(periodId).length };
  openDrawer({ label: `Periode ${periodName(dv.period_id)}`, title: isNew ? "Tambah divisi" : "Ubah divisi", submit: isNew ? "Tambah divisi" : "Simpan perubahan",
    body: field({ name: "name", label: "Nama divisi", value: dv.name || "", req: true, hint: "Harus unik di dalam periode ini." }) + field({ name: "description", label: "Deskripsi", type: "textarea", value: dv.description || "", hint: "Opsional. Tampil di beranda situs." }) + field({ name: "sort_order", label: "Urutan", type: "number", value: dv.sort_order, attrs: 'min="0" inputmode="numeric"', hint: "Angka kecil tampil lebih dulu." }),
    onSubmit: (form) => {
      if (!required(form, ["name"])) return false;
      if (divsOf(dv.period_id).some((x) => norm(x.name) === norm(form.name.value.trim()) && x !== dv)) { setError(form, "name", "Nama divisi sudah ada di periode ini."); return false; }
      setTimeout(() => { Object.assign(dv, { name: form.name.value.trim(), description: form.description.value || null, sort_order: +form.sort_order.value || 0 }); if (isNew) { dv.id = Date.now(); DB.divisions.push(dv); } toast(isNew ? "Divisi ditambahkan." : "Divisi diperbarui."); onDone(); }, 600);
    } });
}
function copyDivisions(target, onDone) {
  const sources = DB.periods.filter((p) => p.id !== target.id && divsOf(p.id).length);
  if (!sources.length) return infoDialog({ title: "Tidak ada divisi untuk disalin", text: "Belum ada periode lain yang punya divisi. Tambahkan divisi secara manual." });
  openDrawer({ label: `Periode ${target.name}`, title: "Salin divisi dari periode lain", submit: "Salin divisi",
    body: field({ name: "source", label: "Salin dari periode", type: "select", req: true, options: opts(sources.map((p) => [p.id, `${p.name} · ${divsOf(p.id).length} divisi`]), sources[0].id) })
      + `<div class="notice" style="margin-top:16px">${ic("info")}<div>Yang disalin hanya <strong>nama, deskripsi, dan urutan divisi</strong>. <strong>Anggota tidak ikut disalin.</strong> Divisi yang namanya sudah ada di periode ${target.name} akan dilewati.</div></div>`,
    onSubmit: (form) => {
      const src = divsOf(form.source.value), existing = new Set(divsOf(target.id).map((x) => norm(x.name)));
      const copied = src.filter((x) => !existing.has(norm(x.name))), skipped = src.filter((x) => existing.has(norm(x.name)));
      setTimeout(() => {
        copied.forEach((x, i) => DB.divisions.push({ ...x, id: Date.now() + i, period_id: target.id }));
        onDone();
        infoDialog({ tone: "info", icon: "check", title: `${copied.length} disalin, ${skipped.length} dilewati`, text: copied.length ? `Divisi dari periode ${periodName(form.source.value)} sudah ditambahkan ke periode ${target.name}. Anggota tidak ikut disalin.` : "Semua divisi sudah ada di periode ini.",
          extra: skipped.length ? `<p class="small" style="margin-top:10px"><strong>Dilewati karena namanya sudah ada:</strong> ${skipped.map((x) => esc(x.name)).join(", ")}</p>` : "", cancel: "Selesai" });
      }, 650);
    } });
}
function viewOrganization(el) {
  const manage = can("organization.manage");
  let period = activePeriod()?.id || DB.periods[0].id, tab = "members", q = "", div = "";
  const setupChecklist = (Pd, s) => {
    const steps = [["Buat periode", true, ""], ["Salin divisi dari periode lain", s.divs > 0, `<button class="btn btn--outline btn--xs" data-copy>${ic("copy")} Salin divisi</button>`], ["Sesuaikan divisi (tambah, ubah, hapus)", s.divs > 0 && s.mem > 0, `<button class="btn btn--ghost btn--xs" data-tab="ref">Buka daftar divisi</button>`], ["Isi anggota", s.mem > 0, `<button class="btn btn--outline btn--xs" data-newm>${ic("plus")} Tambah anggota</button>`], ["Aktifkan periode", Pd.is_active, `<button class="btn btn--solid btn--xs" data-activate="${Pd.id}">${ic("power")} Aktifkan</button>`]];
    const next = steps.findIndex((x) => !x[1]);
    return `<section class="card checklist" aria-label="Langkah menyiapkan periode ${Pd.name}"><div class="card__head"><div><p class="label">Menyiapkan periode ${Pd.name}</p><h2 style="margin-top:4px">${steps.filter((x) => x[1]).length} dari ${steps.length} langkah selesai</h2></div></div><ol>${steps.map(([t, ok, act], i) => `<li class="${ok ? "is-done" : i === next ? "is-next" : ""}"><span class="checklist__n" aria-hidden="true">${ok ? ic("check") : i + 1}</span><span class="checklist__t">${t}${ok ? '<span class="visually-hidden"> (selesai)</span>' : ""}</span>${!ok && i === next ? act : ""}</li>`).join("")}</ol></section>`;
  };
  const shell = () => {
    const Pd = DB.periods.find((x) => x.id === period), s = periodStats(Pd);
    el.innerHTML = pageHead({ label: "Organisasi", title: "Struktur Organisasi", desc: "Kelola periode kepengurusan, divisi, dan anggota. Periode aktif ditampilkan di halaman Struktur situs.", actions: manage ? `<button class="btn btn--outline" data-newperiod>${ic("plus")} Periode baru</button><button class="btn btn--solid" data-newm>${ic("plus")} Tambah anggota</button>` : "" })
      + (!manage ? readOnly("organization.manage") : "")
      + `<div class="period-strip" role="list" aria-label="Periode">${DB.periods.map((p) => { const ps = periodStats(p); return `<div class="period ${p.id === period ? "is-selected" : ""} ${p.is_active ? "is-active" : ""}" role="listitem">
          <button class="period__pick" data-period="${p.id}" aria-pressed="${p.id === period}"><span class="label ${p.is_active ? "" : "label--muted"}">${p.is_active ? "Periode aktif" : "Tidak aktif"}</span><h3>${p.name}</h3><span class="small muted">${ps.divs} divisi · ${ps.mem} anggota</span><span class="small muted">${p.start_date ? fmtDate(p.start_date) + " – " + fmtDate(p.end_date) : "Tanggal belum diisi"}</span></button>
          ${manage ? `<div class="period__actions"><button class="btn btn--ghost btn--xs" data-editperiod="${p.id}" aria-label="Ubah periode ${p.name}">${ic("edit")} Ubah</button>${!p.is_active ? `<button class="btn btn--ghost btn--xs" data-activate="${p.id}" aria-label="Aktifkan periode ${p.name}">${ic("power")} Aktifkan</button>` : ""}${!p.is_active ? `<button class="btn btn--ghost btn--xs period__del" data-delperiod="${p.id}" aria-label="Hapus periode ${p.name}" ${ps.deletable ? "" : 'aria-disabled="true"'}>${ic("trash")} Hapus</button>` : ""}</div>${!p.is_active && !ps.deletable ? `<p class="period__reason">Tidak bisa dihapus: ${ps.reason.charAt(0).toLowerCase() + ps.reason.slice(1)}</p>` : ""}` : ""}</div>`; }).join("")}</div>
      ${manage && !Pd.is_active && (!s.divs || !s.mem) ? setupChecklist(Pd, s) : ""}
      <div class="tabs" role="tablist" aria-label="Tampilan struktur"><button role="tab" aria-selected="${tab === "members"}" data-tab="members">Anggota <span class="count">${s.mem}</span></button><button role="tab" aria-selected="${tab === "ref"}" data-tab="ref">Divisi &amp; jabatan <span class="count">${s.divs}</span></button></div><div data-body></div>`;
    draw();
  };
  const draw = () => {
    const body = $("[data-body]", el), Pd = DB.periods.find((x) => x.id === period);
    if (tab === "ref") {
      const divs = divsOf(period);
      body.innerHTML = `<div class="grid grid--2"><section class="card"><div class="card__head"><div><h2>Divisi periode ${Pd.name}</h2><p class="small muted" style="margin-top:2px">${divs.length} divisi</p></div>${manage ? `<div class="head-actions"><button class="btn btn--outline btn--sm" data-copy>${ic("copy")} Salin dari periode lain</button><button class="btn btn--solid btn--sm" data-newdiv>${ic("plus")} Tambah</button></div>` : ""}</div>
        ${divs.length ? `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Urutan</th><th>Divisi</th><th>Anggota</th><th>Program</th><th><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>${divs.map((x) => { const mc = DB.members.filter((m) => m.division_id === x.id).length, pc = DB.programs.filter((p) => p.division_id === x.id).length; return `<tr><td data-label="Urutan" class="small muted">${x.sort_order}</td><td><div class="t-title">${esc(x.name)}</div>${x.description ? `<div class="t-sub">${esc(x.description)}</div>` : ""}</td><td data-label="Anggota">${mc}</td><td data-label="Program">${pc}</td><td class="t-actions">${manage ? `<button class="btn btn--outline btn--sm" data-editdiv="${x.id}">${ic("edit")} Ubah</button><button class="btn btn--danger-outline btn--sm btn--icon" data-deldiv="${x.id}" aria-label="Hapus ${esc(x.name)}">${ic("trash")}</button>` : ""}</td></tr>`; }).join("")}</tbody></table></div>`
          : emptyBlock({ icon: "org", label: `Periode ${Pd.name}`, title: "Belum ada divisi", text: "Salin divisi dari periode sebelumnya agar tidak perlu mengetik ulang, lalu sesuaikan.", action: manage ? `<button class="btn btn--solid" data-copy>${ic("copy")} Salin divisi</button>` : "" })}</section>
        <section class="card"><div class="card__head"><div><h2>Jabatan</h2><p class="small muted" style="margin-top:2px">Jabatan berlaku untuk semua periode.</p></div></div><ol class="list list--numbered">${DB.positions.map((x) => `<li>${x.name}</li>`).join("")}</ol></section></div>`;
      return;
    }
    const ms = membersOf(period);
    if (!ms.length) { body.innerHTML = `<div class="card">${emptyBlock({ icon: "org", label: `Periode ${Pd.name}`, title: "Belum ada anggota di periode ini", text: divsOf(period).length ? "Tambahkan pengurus mulai dari Ketua Himpunan dan Badan Pengurus Harian." : "Siapkan divisi dulu, lalu isi anggotanya.", action: manage ? (divsOf(period).length ? '<button class="btn btn--solid" data-newm>Tambah anggota</button>' : `<button class="btn btn--solid" data-copy>${ic("copy")} Salin divisi</button>`) : "" })}</div>`; return; }
    body.innerHTML = `<div class="card" style="margin-bottom:14px"><div class="toolbar" style="border:0"><div class="search"><input type="search" placeholder="Cari nama anggota…" aria-label="Cari anggota" data-q value="${esc(q)}"></div><select class="select-sm" data-div aria-label="Divisi">${divisionOptions(period, div, "Semua divisi")}</select><span class="small muted" style="margin-left:auto">${ms.length} anggota</span></div></div><div data-groups></div>`;
    const groups = () => {
      const list = ms.filter((m) => (!q || norm(m.name).includes(norm(q))) && (!div || m.division_id === +div));
      const g = $("[data-groups]", el);
      if (!list.length) { g.innerHTML = `<div class="card">${noResult(q || "filter ini")}</div>`; return; }
      const blocks = [...divsOf(period), { id: null, name: "Tanpa divisi" }].filter((x) => list.some((m) => (m.division_id || null) === x.id));
      g.innerHTML = blocks.map((x) => {
        const rows = list.filter((m) => (m.division_id || null) === x.id).sort((a, b) => a.position_id - b.position_id || a.sort_order - b.sort_order);
        return `<section class="card division-block"><div class="card__head"><div><h2>${esc(x.name)}</h2><p class="small muted" style="margin-top:2px">${rows.length} orang</p></div>${manage && x.id ? `<button class="btn btn--ghost btn--sm" data-newm data-div-id="${x.id}">${ic("plus")} Tambah</button>` : ""}</div>
          <div class="member-grid">${rows.map((m) => `<div class="member"><span class="avatar ${m.photo_url ? "avatar--photo" : ""} ${m.position_id <= 2 ? "avatar--dark" : m.position_id >= 9 ? "avatar--mint" : ""}">${m.photo_url ? `<img src="${m.photo_url}" alt="">` : initials(m.name)}</span><div style="min-width:0"><div class="member__name">${esc(m.name)}</div><div class="member__role">${posName(m.position_id)}</div></div>${manage ? `<div class="member__actions"><button class="btn btn--ghost btn--icon" data-editm="${m.id}" aria-label="Edit ${esc(m.name)}">${ic("edit")}</button></div>` : ""}</div>`).join("")}</div></section>`;
      }).join("");
    };
    $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; groups(); });
    $("[data-div]", el).addEventListener("change", (e) => { div = e.target.value; groups(); });
    groups();
  };
  el.onclick = (e) => {
    const Pd = DB.periods.find((x) => x.id === period);
    const pk = e.target.closest("[data-period]"); if (pk) { period = +pk.dataset.period; div = ""; q = ""; shell(); $(`[data-period="${period}"]`, el)?.focus(); }
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; shell(); $(`.tabs [data-tab="${tab}"]`, el)?.focus(); }
    const nm = e.target.closest("[data-newm]"); if (nm) memberForm(null, period, { division_id: nm.dataset.divId ? +nm.dataset.divId : "" });
    const em = e.target.closest("[data-editm]"); if (em) memberForm(DB.members.find((x) => x.id === +em.dataset.editm));
    if (e.target.closest("[data-clear]")) { q = ""; div = ""; draw(); }
    if (e.target.closest("[data-newperiod]")) periodForm(null, (np) => { period = np.id; tab = "ref"; shell(); });
    const ep = e.target.closest("[data-editperiod]"); if (ep) periodForm(DB.periods.find((x) => x.id === +ep.dataset.editperiod), () => shell());
    const ac = e.target.closest("[data-activate]"); if (ac) activatePeriod(DB.periods.find((x) => x.id === +ac.dataset.activate), () => shell());
    const dp = e.target.closest("[data-delperiod]");
    if (dp) { const p = DB.periods.find((x) => x.id === +dp.dataset.delperiod), s = periodStats(p);
      if (!s.deletable) infoDialog({ tone: "lock", icon: "lock", title: `Periode ${p.name} tidak bisa dihapus`, text: `${s.reason} Periode hanya bisa dihapus jika tidak aktif dan benar-benar kosong.` });
      else confirmDialog({ title: `Hapus periode ${p.name}?`, text: "Periode ini kosong dan akan dihapus permanen.", onConfirm: () => { DB.periods = DB.periods.filter((x) => x !== p); period = activePeriod()?.id || DB.periods[0].id; toast("Periode dihapus."); shell(); } }); }
    if (e.target.closest("[data-copy]")) copyDivisions(Pd, () => { tab = "ref"; shell(); });
    if (e.target.closest("[data-newdiv]")) divisionForm(null, period, () => shell());
    const ed = e.target.closest("[data-editdiv]"); if (ed) divisionForm(DB.divisions.find((x) => x.id === +ed.dataset.editdiv), period, () => shell());
    const dd = e.target.closest("[data-deldiv]");
    if (dd) { const x = DB.divisions.find((y) => y.id === +dd.dataset.deldiv), mc = DB.members.filter((m) => m.division_id === x.id).length, pc = DB.programs.filter((p) => p.division_id === x.id).length;
      if (mc || pc) infoDialog({ tone: "lock", icon: "lock", title: `${esc(x.name)} tidak bisa dihapus`, text: `Masih ada ${[mc && mc + " anggota", pc && pc + " program kerja"].filter(Boolean).join(" dan ")} di divisi ini. Pindahkan atau hapus dulu, lalu coba lagi.` });
      else confirmDialog({ title: `Hapus ${esc(x.name)}?`, text: "Divisi ini kosong dan akan dihapus dari periode.", onConfirm: () => { DB.divisions = DB.divisions.filter((y) => y !== x); toast("Divisi dihapus."); shell(); } }); }
  };
  shell();
  if (location.hash.includes("?new") && manage) memberForm(null, period);
}

/* =========================================================
   ADMINISTRATOR
   ========================================================= */
const roleCovers = (r) => ROLES[r].perms.every((p) => me.perms.has(p));
function wirePw(btn, input) { btn.addEventListener("click", () => { const show = input.type === "password"; input.type = show ? "text" : "password"; btn.innerHTML = ic(show ? "eyeOff" : "eye"); btn.setAttribute("aria-label", show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"); }); }
function adminForm(a) {
  const isNew = !a; a = a || { role: "editor", is_active: true };
  const self = a.id === me.id;
  const f = openDrawer({ label: "Administrator", title: isNew ? "Tambah administrator" : `Edit ${a.username}`, submit: isNew ? "Tambah administrator" : "Simpan perubahan",
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
}
const MODULES = [["Publikasi", "news.view", "news.update"], ["Program kerja", "programs.view", "programs.manage"], ["Struktur organisasi", "organization.view", "organization.manage"], ["Unggah gambar", null, "media.manage"], ["Pengaturan situs", "settings.view", "settings.manage"], ["Administrator", "admins.view", "admins.manage"], ["Log & statistik", "activity_logs.view", null]];
function viewAdmins(el) {
  const manage = can("admins.manage");
  let tab = "list";
  const roleBadge = (r) => `<span class="badge ${r === "superadmin" ? "badge--green" : r === "admin" ? "badge--mint" : "badge--outline"}">${ROLES[r].label}</span>`;
  const shell = () => {
    el.innerHTML = pageHead({ label: "Sistem", title: "Administrator", desc: "Akun yang dapat masuk ke panel admin.", actions: manage && tab === "list" ? `<button class="btn btn--solid" data-new>${ic("plus")} Tambah administrator</button>` : "" })
      + (!manage ? readOnly("admins.manage") : "")
      + (can("roles.manage") ? `<div class="tabs" role="tablist"><button role="tab" aria-selected="${tab === "list"}" data-tab="list">Administrator</button><button role="tab" aria-selected="${tab === "roles"}" data-tab="roles">Role</button></div>` : "")
      + `<div data-body></div>`;
    const body = $("[data-body]", el);
    if (tab === "roles") {
      const lvl = (r, v, m) => (m && ROLES[r].perms.includes(m) ? '<span class="tick">Kelola</span>' : v && ROLES[r].perms.includes(v) ? '<span class="muted">Lihat</span>' : '<span class="cross" aria-label="Tidak ada">—</span>');
      body.innerHTML = `<div class="card"><div class="card__head"><p class="small muted">Informasi saja. Role bersifat tetap dan tidak bisa diubah dari panel.</p></div><div class="table-wrap"><table class="table matrix"><thead><tr><th>Akses</th>${Object.keys(ROLES).map((k) => `<th>${roleBadge(k)}<div class="t-sub th-sub">${DB.admins.filter((a) => a.role === k).length} akun</div></th>`).join("")}</tr></thead><tbody>${MODULES.map(([name, v, m]) => `<tr><td>${name}</td>${Object.keys(ROLES).map((r) => `<td>${lvl(r, v, m)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div>`;
      return;
    }
    const list = data(DB.admins);
    if (!list.length) { body.innerHTML = `<div class="card">${emptyBlock({ icon: "admins", title: "Belum ada administrator lain", text: "Tambahkan akun untuk pengurus yang membantu mengelola situs.", action: manage ? '<button class="btn btn--solid" data-new>Tambah administrator</button>' : "" })}</div>`; return; }
    body.innerHTML = `<div class="card"><div class="table-wrap"><table class="table table--cards"><thead><tr><th>Administrator</th><th>Role</th><th>Status</th><th>Login terakhir</th><th><span class="visually-hidden">Aksi</span></th></tr></thead><tbody>${list.map((a) => `<tr><td><div class="cell-flex"><span class="avatar ${a.is_active ? "" : "avatar--off"}">${initials(a.username)}</span><div><div class="t-title">${a.username}${a.id === me.id ? ' <span class="badge badge--outline" style="margin-left:6px">Anda</span>' : ""}</div></div></div></td><td data-label="Role">${roleBadge(a.role)}</td><td data-label="Status">${a.is_active ? '<span class="badge badge--mint badge--dot">Aktif</span>' : '<span class="badge badge--grey">Nonaktif</span>'}</td><td data-label="Login terakhir" class="small">${rel(a.last_login_at)}</td>
      <td class="t-actions">${manage ? `<button class="btn btn--outline btn--sm" data-edit="${a.id}">${ic("edit")} Edit</button><button class="btn btn--danger-outline btn--sm btn--icon" data-del="${a.id}" ${a.id === me.id ? 'disabled title="Tidak dapat menghapus akun sendiri"' : ""} aria-label="Hapus ${a.username}">${ic("trash")}</button>` : ""}</td></tr>`).join("")}</tbody></table></div></div>`;
  };
  el.onclick = (e) => {
    const t = e.target.closest("[data-tab]"); if (t) { tab = t.dataset.tab; shell(); $(`[data-tab="${tab}"]`, el)?.focus(); }
    if (e.target.closest("[data-new]")) adminForm();
    const ed = e.target.closest("[data-edit]"); if (ed) adminForm(DB.admins.find((x) => x.id === +ed.dataset.edit));
    const del = e.target.closest("[data-del]"); if (del) { const a = DB.admins.find((x) => x.id === +del.dataset.del); confirmDialog({ title: `Hapus akun ${a.username}?`, text: "Akun ini tidak bisa login lagi dan semua sesinya diakhiri. Riwayat aktivitasnya tetap tersimpan.", onConfirm: () => { DB.admins = DB.admins.filter((x) => x !== a); toast("Administrator dihapus."); route(); } }); }
  };
  shell();
}

/* =========================================================
   AKUN SAYA — ubah kata sandi sendiri
   ========================================================= */
function viewAccount(el) {
  el.innerHTML = pageHead({ label: "Akun", title: "Akun Saya", desc: "Informasi akun dan kata sandi Anda." })
    + `<div class="grid grid--2"><section class="card"><div class="card__head"><h2>Ubah kata sandi</h2></div><form class="card__body" novalidate data-pwform>
        <div data-pw-result></div>
        ${[["old_password", "Kata sandi saat ini", "current-password"], ["new_password", "Kata sandi baru", "new-password"], ["confirm_password", "Ulangi kata sandi baru", "new-password"]].map(([n, l, ac]) => `<div class="field" data-field="${n}"><label for="f-${n}">${l} <span class="req" aria-hidden="true">*</span></label><div class="pw"><input class="input" id="f-${n}" name="${n}" type="password" autocomplete="${ac}"><button type="button" data-pwt aria-label="Tampilkan kata sandi">${ic("eye")}</button></div>${n === "new_password" ? '<p class="hint">Minimal 8 karakter.</p>' : ""}</div>`).join("")}
        <div style="display:flex;justify-content:flex-end;margin-top:20px"><button class="btn btn--solid" type="submit">Simpan kata sandi</button></div>
      </form></section>
      <section class="card"><div class="card__head"><h2>Profil</h2></div><div class="card__body"><div class="cell-flex"><span class="avatar avatar--xl">${initials(me.username)}</span><div><div class="t-title" style="font-size:16px">${me.username}</div><div style="margin-top:6px"><span class="badge badge--mint">${ROLES[ROLE].label}</span></div></div></div>
        <dl class="kv"><dt>Username</dt><dd>${me.username}</dd><dt>Role</dt><dd>${ROLES[ROLE].label}</dd></dl><p class="hint">Username dan role hanya bisa diubah oleh superadmin.</p></div></section></div>`;
  const form = $("[data-pwform]", el), res = $("[data-pw-result]", el);
  $$("[data-pwt]", el).forEach((b) => wirePw(b, b.previousElementSibling));
  form.addEventListener("submit", (e) => {
    e.preventDefault(); res.innerHTML = "";
    if (!required(form, ["old_password", "new_password", "confirm_password"])) return $(".has-error input", form)?.focus();
    if (form.new_password.value.length < 8) { setError(form, "new_password", "Kata sandi baru minimal 8 karakter."); return form.new_password.focus(); }
    if (form.new_password.value === form.old_password.value) { setError(form, "new_password", "Kata sandi baru harus berbeda dari yang lama."); return form.new_password.focus(); }
    if (form.confirm_password.value !== form.new_password.value) { setError(form, "confirm_password", "Konfirmasi tidak cocok dengan kata sandi baru."); return form.confirm_password.focus(); }
    const b = $('[type="submit"]', form); b.classList.add("is-busy");
    setTimeout(() => {
      b.classList.remove("is-busy");
      if (form.old_password.value === "salah") { setError(form, "old_password", "Kata sandi saat ini salah."); form.old_password.focus(); return; }
      form.reset();
      res.innerHTML = `<div class="notice" style="margin-bottom:16px" role="status">${ic("check")}<div><strong>Kata sandi berhasil diubah.</strong> Sesi login Anda di perangkat lain telah diakhiri; perangkat ini tetap masuk.</div></div>`;
      toast("Kata sandi diubah.");
    }, 700);
  });
}

/* =========================================================
   LOG AKTIVITAS
   ========================================================= */
function viewActivity(el) {
  let q = "", kind = "", who = "", page = 1;
  const all = data(DB.activity);
  const KB = { create: ["Tambah", "badge--mint"], update: ["Ubah", "badge--blue"], delete: ["Hapus", "badge--red"] };
  el.innerHTML = pageHead({ label: "Sistem", title: "Log Aktivitas", desc: "Catatan setiap perubahan data oleh administrator. Tidak dapat diubah atau dihapus." })
    + `<div class="card"><div class="toolbar"><div class="search"><input type="search" placeholder="Cari keterangan…" aria-label="Cari log" data-q></div><select class="select-sm" data-k aria-label="Jenis aksi"><option value="">Semua aksi</option><option value="create">Tambah</option><option value="update">Ubah</option><option value="delete">Hapus</option></select><select class="select-sm" data-w aria-label="Administrator"><option value="">Semua admin</option>${[...new Set(DB.activity.map((a) => a.admin))].map((u) => `<option>${u}</option>`).join("")}</select></div><div data-body></div></div>`;
  const body = $("[data-body]", el);
  const draw = () => {
    const rows = all.filter((a) => (!kind || a.kind === kind) && (!who || a.admin === who) && (!q || norm(a.description).includes(norm(q))));
    if (!all.length) return (body.innerHTML = emptyBlock({ icon: "activity", label: "Log", title: "Belum ada aktivitas tercatat", text: "Setiap perubahan data oleh administrator akan tercatat otomatis." }));
    if (!rows.length) return (body.innerHTML = noResult(q || "filter ini"));
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Waktu</th><th>Administrator</th><th>Aksi</th><th>Keterangan</th></tr></thead><tbody>${rows.slice((page - 1) * 20, page * 20).map((a) => `<tr><td data-label="Waktu" class="small nowrap">${fmtDT(a.created_at)}</td><td data-label="Administrator"><div class="cell-flex"><span class="avatar avatar--sm">${initials(a.admin)}</span>${a.admin}</div></td><td data-label="Aksi">${badge(KB, a.kind)}</td><td data-label="Keterangan">${esc(a.description)}<details class="row-more"><summary>Detail</summary><div class="small muted">Alamat IP ${a.ip_address} · ${a.device}</div></details></td></tr>`).join("")}</tbody></table></div>${pager(rows.length, page, 20)}`;
  };
  $("[data-q]", el).addEventListener("input", (e) => { q = e.target.value; page = 1; draw(); });
  $("[data-k]", el).addEventListener("change", (e) => { kind = e.target.value; page = 1; draw(); });
  $("[data-w]", el).addEventListener("change", (e) => { who = e.target.value; page = 1; draw(); });
  el.onclick = (e) => { if (e.target.closest("[data-clear]")) viewActivity(el); const pg = e.target.closest("[data-page]"); if (pg) { page = +pg.dataset.page; draw(); } };
  draw();
}

/* =========================================================
   STATISTIK PENGUNJUNG — log mentah (tanpa agregat)
   ========================================================= */
function viewVisitors(el) {
  const v = data(DB.visits); let page = 1; const per = 20;
  el.innerHTML = pageHead({ label: "Sistem", title: "Statistik Pengunjung", desc: "Catatan kunjungan ke situs publik." })
    + `<div class="visitor-head"><div class="stat"><div class="stat__top"><span class="label label--muted">Total kunjungan</span><span class="stat__icon">${ic("chart")}</span></div><div class="stat__value">${v.length}</div></div>
      <div class="notice">${ic("lock")}<div><strong>Privasi pengunjung.</strong> Alamat IP tidak disimpan. Setiap kunjungan hanya dicatat dengan kode anonim, halaman yang dibuka, waktu, dan jenis perangkat.</div></div></div>
    <section class="card"><div class="card__head"><h2>Log kunjungan</h2><span class="small muted">Terbaru di atas</span></div><div data-body></div></section>`;
  const body = $("[data-body]", el);
  const draw = () => {
    if (!v.length) { body.innerHTML = emptyBlock({ icon: "chart", label: "Statistik", title: "Belum ada kunjungan tercatat", text: "Data akan muncul setelah situs publik dikunjungi." }); return; }
    body.innerHTML = `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Waktu</th><th>Halaman</th><th>Perangkat</th></tr></thead><tbody>${v.slice((page - 1) * per, page * per).map((x) => `<tr><td data-label="Waktu" class="small nowrap">${fmtDT(x.visited_at)}</td><td data-label="Halaman" class="path">${x.page}</td><td data-label="Perangkat" class="small">${device(x.user_agent)}</td></tr>`).join("")}</tbody></table></div>${pager(v.length, page, per)}`;
  };
  el.onclick = (e) => { const pg = e.target.closest("[data-page]"); if (pg && !pg.disabled) { page = +pg.dataset.page; draw(); $(`[data-page="${page}"][aria-current]`, el)?.focus(); } };
  draw();
}

/* =========================================================
   PENGATURAN SITUS — per section via dropdown, simpan atomik
   ========================================================= */
const GROUP_ICONS = {
  brand: "building",
  links: "link",
  contact: "mail",
  hero: "heroImg",
  about: "users",
  program: "agenda",
  news: "news",
  structure: "org"
};
const HINTS = {
  brand_name: "Tampil di header dan footer situs.", brand_subtitle: "Teks kecil di bawah nama brand.",
  footer_copyright: "Contoh: © 2026 HIMATKN. Kosongkan untuk menyembunyikan teks hak cipta.", footer_institution: "Kosongkan untuk menyembunyikan nama institusi di footer.",
  bank_soal_url: "Harus tautan Google Drive (https://drive.google.com/…). Kosongkan untuk menyembunyikan menu Bank Soal dari situs.",
  instagram_url: "Harus tautan Instagram (https://www.instagram.com/…). Kosongkan untuk menyembunyikan tautan Instagram.", instagram_label: "Teks tautan Instagram, misalnya @himatknuklir.",
  contact_email: "Kosongkan untuk menyembunyikan email dari situs.", secretariat_address: "Boleh lebih dari satu baris. Kosongkan untuk menyembunyikan alamat.",
  maps_url: "Tautan tombol “Buka di Google Maps”. Harus dari Google Maps (https://maps.app.goo.gl/… atau https://www.google.com/maps/…).",
  maps_embed_url: "Harus diawali https://www.google.com/maps/embed. Cara mengambilnya: buka Google Maps → Bagikan → Sematkan peta → salin alamat di dalam src=\"…\". Kosongkan untuk menyembunyikan peta.",
  hero_emphasis: "Tampil miring di baris kedua judul.", hero_description: "Kalimat singkat di bawah judul (tagline).",
  program_empty_text: "Tampil saat belum ada program kerja.", news_empty_text: "Tampil saat belum ada publikasi.", structure_note: "Catatan kecil di bawah daftar divisi. Kosongkan untuk menyembunyikan."
};
const hintOf = (s) => HINTS[s.key] || (/_eyebrow$/.test(s.key) ? "Teks kecil berhuruf kapital di atas judul. Kosongkan untuk menyembunyikan." : /_label$/.test(s.key) ? "Teks pada tombol atau tautan." : "");
const HOST_TEXT = { bank_soal_url: "Google Drive (drive.google.com)", instagram_url: "Instagram (instagram.com)", maps_url: "Google Maps", maps_embed_url: "Google Maps (www.google.com/maps/embed)" };
function validateSetting(s, val) {
  if (val.length > s.max_length) return `Terlalu panjang. Maksimal ${s.max_length} karakter (sekarang ${val.length}).`;
  if (!val) return null;
  if (s.type !== "multiline" && /\n/.test(val)) return "Tidak boleh lebih dari satu baris.";
  if (s.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val)) return "Format email tidak valid. Contoh: nama@gmail.com";
  if (s.type === "url") {
    if (/\s/.test(val)) return "Tautan tidak boleh mengandung spasi.";
    let u; try { u = new URL(val); } catch { return "Format tautan tidak valid. Salin tautan lengkap dari peramban."; }
    if (u.protocol !== "https:") return "Tautan harus diawali https://";
    if (!s.allowed_hosts.includes(u.hostname)) return `Tautan harus dari ${HOST_TEXT[s.key]}.`;
    if (s.key === "maps_embed_url" && !/^\/maps\/embed(\/|$)/.test(u.pathname)) return "Ini bukan tautan sematan. Ambil dari Bagikan → Sematkan peta, bukan dari bilah alamat.";
    if (s.key === "maps_url" && u.hostname !== "maps.app.goo.gl" && !/^\/maps(\/|$)/.test(u.pathname)) return "Tautan Google harus mengarah ke Google Maps (…/maps/…).";
  }
  return null;
}
function viewSettings(el, activeGroup = SETTING_GROUPS[0][0]) {
  const manage = can("settings.manage");
  const list = data(DB.settings);
  el.innerHTML = pageHead({ label: "Sistem", title: "Pengaturan Situs", desc: "Pilih bagian website untuk mengubah teks dan tautan yang tampil di situs publik. Kolom yang dikosongkan akan disembunyikan." }) + (!manage ? readOnly("settings.manage") : "");
  if (!list.length) { el.insertAdjacentHTML("beforeend", `<div class="card">${emptyBlock({ icon: "settings", title: "Pengaturan belum tersedia", text: "Data pengaturan situs belum bisa dimuat." })}</div>`); return; }

  const curGroup = SETTING_GROUPS.find((x) => x[0] === activeGroup) || SETTING_GROUPS[0];
  activeGroup = curGroup[0];
  const [g, label, desc, link] = curGroup;

  const byKey = Object.fromEntries(list.map((s) => [s.key, s]));
  const dis = manage ? "" : "readonly";
  const ctrl = (s) => {
    const id = "s-" + s.key, long = s.type === "multiline" || s.max_length >= 1000;
    const input = long ? `<textarea class="textarea textarea--sm" id="${id}" name="${s.key}" ${dis}>${esc(s.value)}</textarea>` : `<input class="input" id="${id}" name="${s.key}" type="${s.type === "email" ? "email" : s.type === "url" ? "url" : "text"}" value="${esc(s.value)}" ${s.type === "url" ? 'inputmode="url" placeholder="https://"' : ""} ${dis}>`;
    const isDef = s.value === s.default;
    return `<div class="field setting" data-field="${s.key}"><div class="setting__label"><label for="${id}">${s.label}</label>${isDef && s.default ? '<span class="badge badge--outline">Bawaan</span>' : ""}</div>${input}
      ${hintOf(s) ? `<p class="hint">${hintOf(s)}</p>` : ""}
      <div class="setting__meta"><span>${s.updated_at ? `Diubah ${fmtDate(s.updated_at)} oleh ${s.updated_by}` : isDef ? (s.default ? "Memakai nilai bawaan" : "Belum diisi — tidak tampil di situs") : ""}</span>${long ? `<span class="counter" data-count="${s.key}">${s.value.length}/${s.max_length}</span>` : ""}${manage && !isDef ? `<button type="button" class="link-btn" data-reset="${s.key}">${s.default ? "Kembalikan ke bawaan" : "Kosongkan"}</button>` : ""}</div></div>`;
  };
  const sectionItems = list.filter((s) => s.group === g);
  const groupBody = () => {
    if (g !== "about") return `<div class="setting-grid">${sectionItems.map(ctrl).join("")}</div>`;
    const head = sectionItems.filter((s) => !/about_item_/.test(s.key));
    return `<div class="setting-grid">${head.map(ctrl).join("")}</div><div class="points">${[1, 2, 3].map((i) => `<fieldset class="point"><legend>Poin ${i}</legend>${["tag", "title", "description"].map((k) => ctrl(byKey[`about_item_${i}_${k}`])).join("")}</fieldset>`).join("")}</div>`;
  };

  el.insertAdjacentHTML("beforeend", `<form class="settings-single" novalidate data-sform>
    <div class="section-picker-card">
      <span class="label label--muted" id="lbl-sec-picker">Bagian Website</span>
      <div class="section-select" data-sec-select>
        <button type="button" class="section-select__trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="lbl-sec-picker sec-trigger-title" data-sec-trigger>
          <span class="section-select__icon">${ic(GROUP_ICONS[g] || "settings")}</span>
          <span class="section-select__text">
            <span class="section-select__title" id="sec-trigger-title">${esc(label)}</span>
            <span class="section-select__desc">${esc(desc)}</span>
          </span>
          <span class="section-select__arrow">${ic("down")}</span>
        </button>
        <div class="section-select__menu" role="listbox" aria-labelledby="lbl-sec-picker" data-sec-menu hidden>
          ${SETTING_GROUPS.map(([sg, slabel, sdesc]) => {
            const sel = sg === g;
            return `<button type="button" class="section-select__opt" role="option" aria-selected="${sel}" data-sec-opt="${sg}">
              <span class="section-select__icon">${ic(GROUP_ICONS[sg] || "settings")}</span>
              <span class="section-select__text">
                <span class="section-select__title">${esc(slabel)}</span>
                <span class="section-select__desc">${esc(sdesc)}</span>
              </span>
              <span class="section-select__check" aria-hidden="true">${ic("check")}</span>
            </button>`;
          }).join("")}
        </div>
      </div>
    </div>

    ${manage ? `<div class="savebar-sticky"><div class="savebar is-saved" data-savebar role="status"><span class="dot" aria-hidden="true"></span><span data-savetext>Semua perubahan tersimpan</span></div><span style="flex:1"></span><button type="button" class="btn btn--ghost" data-discard disabled>Batalkan</button><button type="submit" class="btn btn--solid" data-save disabled>Simpan perubahan</button></div>` : ""}
    <div data-summary></div>
    <section class="card" id="g-${g}"><div class="card__head"><div><h2>${label}</h2><p class="small muted" style="margin-top:2px">${desc}</p></div><a class="btn btn--ghost btn--sm" href="../${link}" target="_blank" rel="noopener">${ic("external")} Lihat di situs</a></div><div class="card__body">${groupBody()}</div></section>
    ${data(DB.unknown_keys).length ? `<section class="card card--quiet" data-unknown><div class="card__head"><div><h2>Pengaturan lama yang tidak dikenal</h2><p class="small muted" style="margin-top:2px">Sisa data dari versi lama. Tidak dipakai situs dan aman dihapus.</p></div></div><ul class="list">${DB.unknown_keys.map((k) => `<li><span class="list__main"><code class="code">${k}</code></span>${manage ? `<button type="button" class="btn btn--danger-outline btn--sm" data-unk="${k}" aria-label="Hapus pengaturan lama ${k}">${ic("trash")} Hapus</button>` : ""}</li>`).join("")}</ul></section>` : ""}
  </form>`);

  const form = $("[data-sform]", el), sb = $("[data-savebar]", el), st = $("[data-savetext]", el), summary = $("[data-summary]", el);
  const trigger = $("[data-sec-trigger]", el), menu = $("[data-sec-menu]", el);
  const changed = () => sectionItems.filter((s) => form.elements[s.key] && form.elements[s.key].value !== s.value);
  const refresh = () => {
    if (!manage) return; const n = changed().length;
    sb.classList.toggle("is-saved", !n); st.textContent = n ? `${n} perubahan belum disimpan` : "Semua perubahan tersimpan";
    $("[data-save]", el).disabled = !n; $("[data-discard]", el).disabled = !n;
  };
  dirtyGuard = () => manage && changed().length > 0;

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    closeMenus();
    if (!isOpen) {
      trigger.setAttribute("aria-expanded", "true");
      menu.hidden = false;
      $(`[data-sec-opt="${activeGroup}"]`, menu)?.focus();
    }
  });

  $$("[data-sec-opt]", menu).forEach((opt) => {
    opt.addEventListener("click", () => {
      const nextGroup = opt.dataset.secOpt;
      closeMenus();
      if (nextGroup === activeGroup) { trigger.focus(); return; }
      if (dirtyGuard?.()) {
        confirmDialog({
          title: "Ganti bagian pengaturan?",
          text: "Ada perubahan yang belum disimpan di bagian ini. Jika Anda berpindah bagian, perubahan tersebut akan hilang.",
          confirm: "Pindah bagian",
          cancel: "Tetap di sini",
          icon: "alert",
          onConfirm: () => { dirtyGuard = null; viewSettings(el, nextGroup); }
        });
        return;
      }
      viewSettings(el, nextGroup);
    });
  });

  form.addEventListener("input", (e) => { const s = byKey[e.target.name]; if (!s) return; const c = $(`[data-count="${s.key}"]`, el); if (c) { c.textContent = `${e.target.value.length}/${s.max_length}`; c.classList.toggle("is-over", e.target.value.length > s.max_length); } refresh(); });
  $("[data-discard]", el)?.addEventListener("click", () => { dirtyGuard = null; viewSettings(el, activeGroup); });
  el.addEventListener("click", (e) => {
    const r = e.target.closest("[data-reset]");
    if (r) { const s = byKey[r.dataset.reset]; confirmDialog({ title: s.default ? `Kembalikan “${s.label}” ke bawaan?` : `Kosongkan “${s.label}”?`, icon: "refresh", confirm: s.default ? "Kembalikan" : "Kosongkan", text: s.default ? `Nilai akan kembali menjadi “${esc(s.default)}”.` : "Kolom akan dikosongkan sehingga elemennya disembunyikan dari situs.", onConfirm: () => { s.value = s.default; s.updated_at = null; s.updated_by = null; toast(`“${s.label}” dikembalikan.`); dirtyGuard = null; const y = scrollY; viewSettings(el, activeGroup); scrollTo(0, y); } }); }
    const u = e.target.closest("[data-unk]");
    if (u) confirmDialog({ title: "Hapus pengaturan lama ini?", text: "Data ini tidak dipakai situs. Menghapusnya tidak mengubah tampilan situs.", onConfirm: () => { DB.unknown_keys = DB.unknown_keys.filter((k) => k !== u.dataset.unk); u.closest("li").remove(); if (!DB.unknown_keys.length) $("[data-unknown]", el)?.remove(); toast("Pengaturan lama dihapus."); } });
    const go = e.target.closest("[data-goto]"); if (go) { e.preventDefault(); const t = form.elements[go.dataset.goto]; t.scrollIntoView({ block: "center" }); t.focus(); }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault(); if (!manage) return;
    clearErrors(form); summary.innerHTML = "";
    const ch = changed(), errs = [];
    ch.forEach((s) => { const msg = validateSetting(s, form.elements[s.key].value.trim()); if (msg) { errs.push([s, msg]); setError(form, s.key, msg); } });
    if (errs.length) {
      summary.innerHTML = `<div class="error-summary" role="alert" tabindex="-1"><strong>${errs.length} kolom perlu diperbaiki. Belum ada perubahan yang disimpan.</strong><ul>${errs.map(([s, m]) => `<li><a href="#s-${s.key}" data-goto="${s.key}">${s.label}</a>: ${m}</li>`).join("")}</ul></div>`;
      $(".error-summary", el).focus(); return;
    }
    const b = $("[data-save]", el); b.classList.add("is-busy");
    setTimeout(() => {
      ch.forEach((s) => Object.assign(s, { value: form.elements[s.key].value.trim(), updated_at: NOW.toISOString(), updated_by: me.username }));
      toast(`${ch.length} perubahan disimpan.`); dirtyGuard = null; const y = scrollY; viewSettings(el, activeGroup); scrollTo(0, y);
    }, 700);
  });
  refresh();
}

/* =========================================================
   MODUL DITUNDA — Agenda, Dokumen, Notifikasi (tanpa fitur baru)
   ========================================================= */
function viewAgendas(el) {
  const all = data(DB.agendas);
  el.innerHTML = pageHead({ label: "Ditunda", title: "Agenda", desc: "Jadwal internal kepengurusan." })
    + `<div class="card">${all.length ? `<ul class="list">${all.map((a) => `<li style="padding:16px 20px;align-items:center"><div class="datebox"><div class="datebox__d">${d(a.start_at).getDate()}</div><div class="datebox__m">${BULAN[d(a.start_at).getMonth()]} ${d(a.start_at).getFullYear()}</div></div><div class="list__main"><div class="list__title">${esc(a.title)}</div><div class="list__meta">${HARI[d(a.start_at).getDay()]}, ${fmtTime(a.start_at)}${a.end_at ? "–" + fmtTime(a.end_at) : ""} · ${esc(a.location || "Lokasi belum diisi")}</div></div></li>`).join("")}</ul>` : emptyBlock({ icon: "agenda", title: "Belum ada agenda", text: "Agenda yang dijadwalkan akan tampil di sini." })}</div>`;
}
function viewDocuments(el) {
  const all = data(DB.documents);
  el.innerHTML = pageHead({ label: "Ditunda", title: "Dokumen", desc: "Arsip PDF internal himpunan (privat)." })
    + `<div class="card">${all.length ? `<div class="table-wrap"><table class="table table--cards"><thead><tr><th>Dokumen</th><th>Kategori</th><th>Diunggah</th></tr></thead><tbody>${all.map((x) => `<tr><td><div class="t-title">${esc(x.title)}</div><div class="t-sub">${esc(x.original_filename)}</div></td><td data-label="Kategori">${esc(x.category || "—")}</td><td data-label="Diunggah" class="small">${fmtDate(x.created_at)} · ${x.uploaded_by}</td></tr>`).join("")}</tbody></table></div>` : emptyBlock({ icon: "doc", title: "Belum ada dokumen", text: "Dokumen PDF akan tampil di sini." })}</div>`;
}
function viewNotifications(el) {
  const all = data(DB.notifications);
  el.innerHTML = pageHead({ label: "Ditunda", title: "Notifikasi", desc: "Pesan antar-administrator." })
    + `<div class="card">${all.length ? `<ul class="list">${all.map((n) => `<li class="${n.read_at ? "" : "unread"}" style="padding:16px 20px">${n.read_at ? '<span style="width:8px;flex:none"></span>' : '<span class="unread-dot"></span>'}<div class="list__main"><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="list__title">${esc(n.title)}</span>${badge(NOTIF_TYPE, n.type)}</div><p class="small" style="margin-top:4px">${esc(n.message)}</p><div class="list__meta">Dari ${n.from} · ${rel(n.created_at)}</div></div></li>`).join("")}</ul>` : emptyBlock({ icon: "bell", title: "Belum ada notifikasi", text: "Pesan akan muncul di sini." })}</div>`;
}

/* =========================================================
   SESI BERAKHIR + PANEL REVIEW (alat bantu prototipe)
   ========================================================= */
function sessionExpired() {
  const wrap = mountLayer(`<div class="overlay" data-sticky></div><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="se-t" aria-describedby="se-d"><div class="modal__body"><div class="modal__icon modal__icon--lock">${ic("clock")}</div><h2 id="se-t">Sesi Anda telah berakhir</h2><p id="se-d">Demi keamanan, Anda perlu masuk kembali. Perubahan yang belum disimpan akan hilang.</p></div><div class="modal__foot"><a class="btn btn--solid" href="login.html?state=expired">Masuk kembali</a></div></div>`);
  $(".btn", wrap).focus();
}
function devPanel() {
  if (params.get("panel") === "off") return;
  const p = document.createElement("details"); p.className = "devpanel";
  p.innerHTML = `<summary aria-label="Panel review prototipe">${ic("eye")}<span>Review</span></summary><div class="body">
    <p class="small muted">Alat bantu prototipe — bukan bagian produk.</p>
    <label>Role<select data-k="role">${Object.keys(ROLES).map((r) => `<option value="${r}" ${r === ROLE ? "selected" : ""}>${ROLES[r].label}</option>`).join("")}</select></label>
    <label>State<select data-k="state">${[["normal", "Normal"], ["loading", "Memuat"], ["empty", "Kosong"], ["error", "Gagal"], ["expired", "Sesi berakhir"]].map(([v, l]) => `<option value="${v}" ${v === STATE ? "selected" : ""}>${l}</option>`).join("")}</select></label>
    <div class="small"><span class="muted">Modul ditunda:</span> ${ROUTES.filter((r) => r.deferred).map((r) => `<a href="#/${r.path}">${r.title}</a>`).join(" · ")}</div></div>`;
  p.addEventListener("change", (e) => { const q = new URLSearchParams(location.search); q.set(e.target.dataset.k, e.target.value); location.href = "?" + q.toString() + location.hash; });
  document.body.appendChild(p);
}

renderShell();
addEventListener("hashchange", onHash);
route();
devPanel();
if (STATE === "expired") setTimeout(sessionExpired, DELAY + 300);