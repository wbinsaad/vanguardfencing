

const projectFallbacks = {
  "https://vanguardfencing.com.au/images/projects/colorbond-tarneit-after.jpg": "assets/project-tarneit.jpg",
  "https://vanguardfencing.com.au/images/projects/sliding-gate-werribee-after.jpg": "assets/project-werribee.jpg",
  "https://vanguardfencing.com.au/images/projects/timber-hoppers-after.jpg": "assets/project-hoppers.jpg",
  "https://vanguardfencing.com.au/images/projects/colorbond-gate-werribee-after.jpg": "assets/project-truganina.jpg",
  "https://vanguardfencing.com.au/images/projects/aluminium-tarneit-after.jpg": "assets/project-pointcook.jpg",
  "https://vanguardfencing.com.au/images/projects/picket-scalloped-altona.jpg": "assets/project-altona.jpg"
};

// Live Vanguard photography with resilient offline fallbacks.
document.querySelectorAll('img[data-fallback]').forEach((img) => {
  img.addEventListener('error', () => {
    const fallback = img.dataset.fallback;
    if (fallback && img.getAttribute('src') !== fallback) {
      img.src = fallback;
    }
  }, { once: true });
});

(() => {
  const qs = (s, root = document) => root.querySelector(s);
  const qsa = (s, root = document) => [...root.querySelectorAll(s)];

  // Mobile navigation
  const menuButton = qs('.menu-button');
  const mobileMenu = qs('#mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      mobileMenu.hidden = open;
      menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    });
    qsa('a, button', mobileMenu).forEach(el => el.addEventListener('click', () => {
      if (!el.classList.contains('js-open-quote')) {
        mobileMenu.hidden = true;
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open menu');
      }
    }));
  }

  // Quote modal
  const quoteDialog = qs('#quote-dialog');
  const quoteForm = qs('#quote-form');
  const success = qs('#form-success');
  qsa('.js-open-quote').forEach(trigger => trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (quoteDialog?.showModal) {
      if (success) success.hidden = true;
      quoteDialog.showModal();
      setTimeout(() => qs('input[name="name"]', quoteDialog)?.focus(), 40);
    }
  }));

  qs('.quote-close')?.addEventListener('click', () => quoteDialog?.close());

  quoteForm?.addEventListener('submit', (e) => {
    const submitter = e.submitter;
    if (submitter?.value === 'cancel') return;
    e.preventDefault();
    if (!quoteForm.reportValidity()) return;
    if (success) success.hidden = false;
    submitter.disabled = true;
    submitter.textContent = 'Request Ready ✓';
    setTimeout(() => {
      submitter.disabled = false;
      submitter.textContent = 'Send Quote Request';
    }, 1800);
  });

  // FAQ accordion
  qsa('.faq-item button').forEach(button => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const panel = button.nextElementSibling;
      button.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
      const icon = qs('i', button);
      if (icon) icon.textContent = expanded ? '+' : '−';
    });
  });

  // Price panel
  const priceButton = qs('.js-toggle-prices');
  const pricePanel = qs('#price-panel');
  priceButton?.addEventListener('click', () => {
    const expanded = priceButton.getAttribute('aria-expanded') === 'true';
    priceButton.setAttribute('aria-expanded', String(!expanded));
    if (pricePanel) pricePanel.hidden = expanded;
    priceButton.textContent = expanded ? 'See Indicative Prices' : 'Hide Indicative Prices';
  });

  // Lightweight suburb/postcode UX demo. This intentionally avoids claiming exhaustive coverage.
  const knownPostcodes = new Set(['3046','3047','3048','3049','3059','3060','3061','3062','3064','3073','3074','3075','3076','3082','3083','3085','3087','3088']);
  const postcode = qs('#postcode');
  const areaResult = qs('#area-result');
  qs('#check-area')?.addEventListener('click', () => {
    const value = (postcode?.value || '').trim();
    if (!/^\d{4}$/.test(value)) {
      areaResult.textContent = 'Enter a 4-digit postcode and we’ll check the northern-suburbs list.';
      return;
    }
    areaResult.textContent = knownPostcodes.has(value)
      ? 'This postcode is within or near Vanguard’s listed northern Melbourne service area. Confirm the exact address when requesting a quote.'
      : 'This postcode is not in the quick-check list. Call or request a quote — Vanguard can confirm whether the address is serviceable.';
  });

  // Lightbox
  const lightbox = qs('#lightbox');
  const lbImg = qs('#lightbox-img');
  const lbCaption = qs('#lightbox-caption');
  qsa('[data-lightbox]').forEach(card => card.addEventListener('click', () => {
    if (!lightbox?.showModal) return;
    if (lbImg) {
      lbImg.dataset.fallback = projectFallbacks[card.dataset.lightbox] || 'assets/project-tarneit.jpg';
      lbImg.src = card.dataset.lightbox;
      lbImg.alt = card.dataset.caption || 'Vanguard Fencing project';
    }
    if (lbCaption) lbCaption.textContent = card.dataset.caption || '';
    lightbox.showModal();
  }));
  qs('.lightbox-close')?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', e => { if (e.target === lightbox) lightbox.close(); });

  // Scroll reveal with reduced-motion fallback
  const revealEls = qsa('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }
})();
