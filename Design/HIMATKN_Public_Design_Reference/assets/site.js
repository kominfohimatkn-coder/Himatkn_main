(() => {
  const navItems = [
    ['Beranda', 'index.html', 'home'],
    ['Tentang', 'tentang.html', 'about'],
    ['Program Kerja', 'program-kerja.html', 'program'],
    ['Struktur', 'struktur.html', 'structure'],
    ['Kontak', 'index.html#kontak', 'contact'],
  ];

  const page = document.body.dataset.page || '';
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');

  const mark = () => `<span class="brand-mark" data-icon="mark"></span>`;
  const icon = (name, cls='') => `<span class="icon ${cls}" data-icon="${name}"></span>`;

  if (header) {
    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="HIMA Teknokimia Nuklir">${mark()}<span>HIMA Teknokimia Nuklir</span></a>
        <nav class="site-nav" aria-label="Navigasi utama">
          ${navItems.map(([label, href, key]) => `<a href="${href}" data-nav="${key}">${label}</a>`).join('')}
        </nav>
        <button class="mobile-toggle" type="button" aria-label="Buka menu" aria-expanded="false">${icon('menu')}</button>
      </div>
      <div class="mobile-menu" aria-label="Navigasi mobile">
        ${navItems.map(([label, href, key]) => `<a href="${href}" data-nav="${key}">${label}</a>`).join('')}
      </div>
    `;
    document.querySelectorAll('[data-icon]').forEach((el) => {
      const name = el.getAttribute('data-icon');
      if (window.ICONS && window.ICONS[name]) el.innerHTML = window.ICONS[name];
    });
    const activeKey = page === 'home' ? 'home' : page === 'about' ? 'about' : page === 'program' ? 'program' : page === 'structure' ? 'structure' : '';
    document.querySelectorAll('[data-nav]').forEach((a) => {
      if (a.dataset.nav === activeKey) a.setAttribute('aria-current', 'page');
    });
    const toggle = header.querySelector('.mobile-toggle');
    const menu = header.querySelector('.mobile-menu');
    toggle?.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = open ? icon('close') : icon('menu');
      document.querySelectorAll('[data-icon]').forEach((el) => {
        const name = el.getAttribute('data-icon');
        if (window.ICONS && window.ICONS[name]) el.innerHTML = window.ICONS[name];
      });
    });
  }

  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <span>© 2026 HIMATKN • Politeknik Teknologi Nuklir Indonesia, BRIN</span>
        <span>Kabinet Nexus</span>
      </div>
    `;
  }

  document.querySelectorAll('[data-year]').forEach((el) => el.textContent = new Date().getFullYear());

  const visitPage = () => {
    if (!navigator.sendBeacon) return;
    const payload = new URLSearchParams({ page: location.pathname + location.hash });
    try { navigator.sendBeacon('/api/v1/public/visits?page=' + encodeURIComponent(payload.get('page'))); } catch (_) {}
  };
  // Design reference only. In Next.js, point this to the actual FastAPI endpoint.
  if (document.body.dataset.track === 'true') window.addEventListener('load', visitPage, { once: true });
})();
