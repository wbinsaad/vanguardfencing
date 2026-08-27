(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Local fallback for remote project photography.
  qsa('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback;
      if (!fallback || img.dataset.fallbackUsed === 'true') return;
      img.dataset.fallbackUsed = 'true';
      img.src = fallback;
    });
  });

  // Mobile navigation.
  const menuButton = qs('.menu-button');
  const mobileMenu = qs('#mobile-menu');
  const closeMobileMenu = () => {
    if (!menuButton || !mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    mobileMenu.hidden = open;
  });

  qsa('a', mobileMenu || document).forEach((link) => link.addEventListener('click', closeMobileMenu));

  // Single quote journey: every quote CTA returns to the embedded hero form.
  const heroQuoteForm = qs('#hero-quote-form');
  const firstQuoteField = qs('#hero-quote-form [name="suburb"]');
  const focusHeroQuote = () => {
    closeMobileMenu();
    heroQuoteForm?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => firstQuoteField?.focus({ preventScroll: true }), 480);
  };
  qsa('.js-focus-hero-quote').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      focusHeroQuote();
    });
  });

  // Progressive optional quote details.
  const detailsToggle = qs('#hero-details-toggle');
  const optionalFields = qs('#hero-optional-fields');
  const formStep = qs('#hero-form-step');

  if (detailsToggle && optionalFields) {
    const setDetailsState = (expanded) => {
      detailsToggle.setAttribute('aria-expanded', String(expanded));
      optionalFields.hidden = !expanded;
      const icon = qs('b', detailsToggle);
      if (icon) icon.textContent = expanded ? '−' : '+';
      const label = qs('span', detailsToggle);
      if (label) label.textContent = expanded ? 'Hide extra job details' : 'Add more job details'
      if (formStep) formStep.textContent = expanded ? 'Step 2 of 2 · Extra job details' : 'Step 1 of 2 · Contact & service'
    };

    // Ensure the page always starts in the correct collapsed state.
    setDetailsState(false);

    detailsToggle.addEventListener('click', () => {
      const expanded = detailsToggle.getAttribute('aria-expanded') === 'true';
      setDetailsState(!expanded);
    });
  }

  // Accessible inline validation for the hero form.
  const fieldLabel = (field) => field?.closest('label');
  const errorNode = (name) => qs(`[data-error-for="${name}"]`, heroQuoteForm || document);
  const setFieldError = (field, message) => {
    if (!field) return;
    const label = fieldLabel(field);
    label?.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    const node = errorNode(field.name);
    if (node) node.textContent = message || '';
  };

  const validateField = (field) => {
    if (!field || !field.name) return true;
    const value = String(field.value || '').trim();
    let message = '';

    if (field.name === 'suburb' && !value) message = 'Enter your suburb.';
    if (field.name === 'service' && !value) message = 'Choose the fencing service you are interested in.';
    if (field.name === 'name' && !value) message = 'Enter your name.';
    if (field.name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (!value) message = 'Enter a phone number we can use to contact you.';
      else if (digits.length < 8 || digits.length > 12) message = 'Enter a valid phone number.';
    }
    if (field.name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      message = 'Enter a valid email address, or leave this optional field blank.';
    }

    setFieldError(field, message);
    return !message;
  };

  qsa('#hero-quote-form input:not([type="file"]), #hero-quote-form select').forEach((field) => {
    const eventName = field.tagName === 'SELECT' ? 'change' : 'blur';
    field.addEventListener(eventName, () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  // Mobile-friendly photo selection with selected-file state and size checks.
  const uploadLabel = qs('.hero-upload');
  const uploadInput = qs('#hero-quote-form input[name="photo"]');
  const uploadUi = qs('.hero-upload-ui');
  const uploadMain = qs('.hero-upload-main');
  const uploadPreview = qs('#upload-preview');
  const maxFileBytes = 10 * 1024 * 1024;

  const renderUploadState = () => {
    if (!uploadInput || !uploadPreview || !uploadMain) return true;
    const files = [...(uploadInput.files || [])];
    const tooLarge = files.find((file) => file.size > maxFileBytes);
    const notImage = files.find((file) => file.type && !file.type.startsWith('image/'));
    let message = '';
    if (tooLarge) message = `${tooLarge.name} is over 10MB.`;
    else if (notImage) message = 'Choose image files only.';

    uploadLabel?.classList.toggle('has-error', Boolean(message));
    const node = errorNode('photo');
    if (node) node.textContent = message;
    uploadInput.setAttribute('aria-invalid', message ? 'true' : 'false');
    uploadPreview.innerHTML = '';

    if (!files.length) {
      uploadMain.innerHTML = '<svg class="ui-icon" aria-hidden="true"><use href="#icon-upload"></use></svg> Take or choose photos';
      return !message;
    }

    uploadMain.textContent = files.length === 1 ? '1 photo selected' : `${files.length} photos selected`;
    files.slice(0, 4).forEach((file) => {
      const chip = document.createElement('span');
      chip.className = 'upload-chip';
      chip.textContent = file.name;
      uploadPreview.appendChild(chip);
    });
    if (files.length > 4) {
      const more = document.createElement('span');
      more.className = 'upload-chip';
      more.textContent = `+${files.length - 4} more`;
      uploadPreview.appendChild(more);
    }
    return !message;
  };

  uploadUi?.addEventListener('click', () => uploadInput?.click());
  uploadInput?.addEventListener('change', renderUploadState);
  ['dragenter', 'dragover'].forEach((eventName) => uploadLabel?.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadLabel.classList.add('is-dragging');
  }));
  ['dragleave', 'drop'].forEach((eventName) => uploadLabel?.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadLabel.classList.remove('is-dragging');
  }));
  uploadLabel?.addEventListener('drop', (event) => {
    if (!uploadInput || !event.dataTransfer?.files?.length) return;
    const transfer = new DataTransfer();
    [...event.dataTransfer.files].forEach((file) => transfer.items.add(file));
    uploadInput.files = transfer.files;
    renderUploadState();
  });

  const heroFormSuccess = qs('#hero-form-success');
  heroQuoteForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = ['suburb', 'service', 'name', 'phone', 'email']
      .map((name) => heroQuoteForm.elements.namedItem(name))
      .filter(Boolean);
    const fieldsValid = fields.map(validateField).every(Boolean);
    const filesValid = renderUploadState();
    if (!fieldsValid || !filesValid) {
      const firstInvalid = qs('[aria-invalid="true"]', heroQuoteForm);
      firstInvalid?.focus();
      return;
    }

    const submitter = event.submitter;
    if (heroFormSuccess) heroFormSuccess.hidden = false;
    if (submitter) {
      const original = submitter.textContent;
      submitter.disabled = true;
      submitter.textContent = 'Request Ready ✓';
      window.setTimeout(() => {
        submitter.disabled = false;
        submitter.textContent = original;
      }, 1800);
    }
  });

  // FAQ accordion.
  qsa('.faq-item button').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      const panel = button.nextElementSibling;
      button.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
      const icon = qs('i', button);
      if (icon) icon.textContent = expanded ? '+' : '−';
    });
  });

  // Indicative price disclosure.
  const priceButton = qs('.js-toggle-prices');
  const pricePanel = qs('#price-panel');
  priceButton?.addEventListener('click', () => {
    const expanded = priceButton.getAttribute('aria-expanded') === 'true';
    priceButton.setAttribute('aria-expanded', String(!expanded));
    if (pricePanel) pricePanel.hidden = expanded;
    priceButton.textContent = expanded ? 'See Indicative Prices' : 'Hide Indicative Prices';
  });

  // Lightweight suburb/postcode check.
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
      : 'This postcode is not in the quick-check list. Call or request a quote and Vanguard can confirm the address.';
  });

  // Mobile-only service-area disclosure.
  const areaToggle = qs('#area-toggle');
  const areaList = qs('#area-list');
  areaToggle?.addEventListener('click', () => {
    const expanded = areaToggle.getAttribute('aria-expanded') === 'true';
    areaToggle.setAttribute('aria-expanded', String(!expanded));
    areaList?.classList.toggle('is-expanded', !expanded);
    areaToggle.textContent = expanded ? 'Show all service areas' : 'Show fewer service areas';
  });

  // Recent Work before/after sliders. Native range controls keep mouse, touch, and keyboard support.
  qsa('.before-after-media').forEach((comparison) => {
    const range = qs('.ba-range', comparison);
    if (!range) return;

    const updateComparison = () => {
      const value = Math.max(0, Math.min(100, Number(range.value) || 0));
      comparison.style.setProperty('--position', `${value}%`);
      range.setAttribute('aria-valuetext', `${value}% before, ${100 - value}% after`);
    };

    range.addEventListener('input', updateComparison);
    range.addEventListener('change', updateComparison);
    updateComparison();
  });

  // Project lightbox.
  const lightbox = qs('#lightbox');
  const lbImg = qs('#lightbox-img');
  const lbCaption = qs('#lightbox-caption');
  qsa('[data-lightbox]').forEach((card) => card.addEventListener('click', () => {
    if (!lightbox?.showModal || !lbImg || !lbCaption) return;
    lbImg.dataset.fallbackUsed = 'false';
    lbImg.src = card.dataset.lightbox;
    const cardImage = qs('img', card);
    lbImg.dataset.fallback = cardImage?.dataset.fallback || '';
    lbImg.alt = card.dataset.caption || 'Vanguard Fencing project';
    lbCaption.textContent = card.dataset.caption || '';
    lightbox.showModal();
  }));
  qs('.lightbox-close')?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  // Sticky mobile Call / Quote bar appears only after the hero is out of view.
  const stickyActions = qs('#mobile-sticky-actions');
  const hero = qs('.hero');
  const updateStickyForViewport = (heroVisible = false) => {
    if (!stickyActions) return;
    const mobile = window.matchMedia('(max-width: 780px)').matches;
    stickyActions.hidden = !mobile || heroVisible;
    document.body.classList.toggle('has-mobile-sticky', mobile && !heroVisible);
  };

  if ('IntersectionObserver' in window && hero) {
    const heroObserver = new IntersectionObserver(([entry]) => updateStickyForViewport(entry.isIntersecting), { threshold: 0.05 });
    heroObserver.observe(hero);
    window.addEventListener('resize', () => updateStickyForViewport(hero.getBoundingClientRect().bottom > 0));
  } else {
    window.addEventListener('scroll', () => updateStickyForViewport((hero?.getBoundingClientRect().bottom || 0) > 0), { passive: true });
    updateStickyForViewport(true);
  }

  // Scroll reveal with reduced-motion fallback.
  const revealEls = qsa('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => revealObserver.observe(el));
  }
})();
