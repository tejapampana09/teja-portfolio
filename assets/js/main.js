/* Content is visible by default. Motion is a progressive enhancement. */
(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  const menuButton = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const mobile = window.matchMedia('(max-width: 720px)');
  const navLinks = [...document.querySelectorAll('.nav__link')];

  function updateThemeButton() {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    document.querySelector('meta[name="theme-color"]').content = dark ? '#111113' : '#f5f5f7';
  }
  updateThemeButton();
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (_) { /* Theme still works without storage. */ }
    updateThemeButton();
  });

  function setMenu(open, restoreFocus = false) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav')) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (!event.target.closest('.nav')) setMenu(false);
  });
  mobile.addEventListener('change', () => setMenu(false));

  // Native anchor scrolling preserves URLs, history, and keyboard navigation.
  if ('IntersectionObserver' in window) {
    const visible = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => visible.set(entry.target.id, entry.isIntersecting));
      const active = navLinks.find(link => visible.get(link.hash.slice(1)));
      navLinks.forEach(link => {
        if (link === active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }

  // One owner per animated property. No scroll pinning, cursor transforms, or CSS entrances.
  // matchMedia reverts animations if motion preference changes at runtime.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      document.querySelectorAll('[data-reveal]').forEach(element => {
        // Keep the initial viewport and restored/deep-linked scroll positions immediately readable.
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        gsap.fromTo(element, { y: 22, opacity: 0 }, {
          y: 0, opacity: 1, duration: .65, ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 96%', once: true }
        });
      });
    });
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  }

  const toast = document.getElementById('toast');
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
  }
  document.getElementById('copy-email').addEventListener('click', async event => {
    const email = event.currentTarget.dataset.email;
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(email);
      notify('Email copied to clipboard.');
    } catch (_) {
      notify(`Copy this address: ${email}`);
    }
  });
  document.getElementById('year').textContent = new Date().getFullYear();
})();
