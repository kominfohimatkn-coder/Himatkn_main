const ICONS = {
  mark: `<svg viewBox="0 0 48 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M24 7l10.5 6.1v12.1L24 31.3l-10.5-6.1V13.1L24 7Z"/><path d="M24 31.3v9.7"/><path d="M13.5 25.2 6.7 29.1v7.2l6.8 3.9 6.8-3.9v-7.2l-6.8-3.9Z"/><path d="M34.5 25.2l6.8 3.9v7.2l-6.8 3.9-6.8-3.9v-7.2l6.8-3.9Z"/><circle cx="24" cy="19" r="4.2"/></g></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m7 10 5 5 5-5"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9" r="1.5"/><path d="m4.5 18 5-5 3.5 3 2.5-2.5 4 4"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 21 20H3L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="10" width="14" height="10" rx="1"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="6" rx="1"/><rect x="4" y="14" width="16" height="6" rx="1"/><path d="M7 7h.01M7 17h.01"/></svg>`,
  offline: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9c5-5 13-5 18 0M6 12c3.4-3.2 8.6-3.2 12 0M9 15c1.7-1.4 4.3-1.4 6 0M12 18h.01"/><path d="M4 4l16 16"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.3 2.3 4.7-5"/></svg>`
};

document.querySelectorAll('[data-icon]').forEach((el) => {
  const name = el.getAttribute('data-icon');
  if (ICONS[name]) el.innerHTML = ICONS[name];
});
