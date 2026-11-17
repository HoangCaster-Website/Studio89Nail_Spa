/* Accessible navigation, a progressively enhanced menu, and a native-dialog gallery. */
'use strict';

const header = document.querySelector('.header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navLinks = [...nav.querySelectorAll('a')];

function closeMenu(returnFocus = false) {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
  header.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
  if (returnFocus) toggle.focus();
}

toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  if (isOpen) return closeMenu();
  toggle.setAttribute('aria-expanded', 'true');
  toggle.setAttribute('aria-label', 'Close navigation');
  nav.classList.add('open');
  header.classList.add('menu-active');
  document.body.classList.add('menu-open');
});

navLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (nav.classList.contains('open') && !header.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 768px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

let scrollPending = false;
function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 30);
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) {
    scrollPending = true;
    requestAnimationFrame(updateHeader);
  }
}, { passive: true });
updateHeader();

// Keep all prices in the HTML for search engines, no-JS visitors, and printing.
const tabList = document.querySelector('.price-tabs');
const priceTabs = [...document.querySelectorAll('[data-price-tab]')];
const pricePanels = [...document.querySelectorAll('[data-price-panel]')];
function selectPrice(category, moveFocus = false) {
  priceTabs.forEach(tab => {
    const selected = tab.dataset.priceTab === category;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) tab.focus();
  });
  pricePanels.forEach(panel => { panel.hidden = panel.dataset.pricePanel !== category; });
}
if (priceTabs.length && pricePanels.length) {
  tabList.hidden = false;
  tabList.setAttribute('role', 'tablist');
  document.querySelector('#price-content').classList.add('js-menu');
  priceTabs.forEach((tab, index) => {
    const category = tab.dataset.priceTab;
    tab.id = `tab-${category}`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `panel-${category}`);
    tab.addEventListener('click', () => selectPrice(category));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % priceTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + priceTabs.length) % priceTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = priceTabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectPrice(priceTabs[next].dataset.priceTab, true);
      }
    });
  });
  pricePanels.forEach(panel => {
    panel.id = `panel-${panel.dataset.pricePanel}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${panel.dataset.pricePanel}`);
    panel.tabIndex = 0;
  });
  selectPrice('nails');
  document.querySelectorAll('[data-price-link]').forEach(link => {
    link.addEventListener('click', () => selectPrice(link.dataset.priceLink));
  });
}

// Reveal once; reduced-motion visitors get the complete, static composition.
if ('IntersectionObserver' in window) {
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('motion-ready');
    const reveals = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          reveals.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
  }
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-15% 0px -65% 0px' });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
}

// Native dialog handles focus trapping, Escape, and restoration to the gallery.
const lightbox = document.querySelector('.lightbox');
const gallery = [...document.querySelectorAll('.gallery-item')];
let currentImage = 0;
function showImage(index) {
  currentImage = (index + gallery.length) % gallery.length;
  const item = gallery[currentImage];
  const picture = lightbox.querySelector('figure img');
  picture.src = item.href;
  picture.alt = item.querySelector('img').alt;
  document.querySelector('#lightbox-caption').textContent = item.dataset.caption;
  lightbox.querySelector('.lightbox-counter').textContent = `${currentImage + 1} / ${gallery.length}`;
}
if (typeof lightbox.showModal === 'function') {
  gallery.forEach((item, index) => item.addEventListener('click', event => {
    event.preventDefault();
    showImage(index);
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentImage - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentImage + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(currentImage + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(currentImage - 1); }
  });
  lightbox.addEventListener('close', () => document.body.classList.remove('lightbox-open'));
}

/* ==========================================================================
   Motion layer — preloader, scroll progress, parallax, staggered reveals,
   cursor spotlight and hero tilt. Skipped entirely for reduced-motion users.
   ========================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Preloader: lift the curtain shortly after the DOM is ready.
const preloader = document.querySelector('.preloader');
if (preloader) {
  setTimeout(() => {
    preloader.classList.add('is-done');
    setTimeout(() => preloader.remove(), 700);
  }, reduceMotion ? 0 : 700);
}

// Stagger children of grids so they cascade in one after another.
document.querySelectorAll('.atelier-pillars, .atelier-list, .gallery-grid').forEach(grid => {
  [...grid.querySelectorAll(':scope > .reveal')].forEach((item, index) => {
    item.style.setProperty('--stagger', `${(index % 6) * 0.1}s`);
    // Once revealed, drop the delay so hover effects respond instantly.
    const clearDelay = event => {
      if (event.propertyName !== 'opacity') return;
      item.style.setProperty('--stagger', '0s');
      item.removeEventListener('transitionend', clearDelay);
    };
    item.addEventListener('transitionend', clearDelay);
  });
});

// Price menu: number groups and rows so they cascade on every tab change.
document.querySelectorAll('.price-panel').forEach(panel => {
  panel.querySelectorAll('.price-group').forEach((group, g) => {
    group.style.setProperty('--g', g);
    group.querySelectorAll('.price-row').forEach((row, r) => row.style.setProperty('--r', r));
  });
});

// Mobile menu links slide in one by one.
navLinks.forEach((link, index) => link.style.setProperty('--n', index));

// Interactive Atelier Directory: hovering or focusing a service row updates the sticky spotlight.
const atelierServices = [
  {
    tag: '01 · NAIL EXTENSIONS',
    price: 'From €50',
    title: 'Acrylic Extensions',
    desc: 'Beautiful and durable acrylic nail extensions with professional shaping, structure and colour.',
    tab: 'nails',
    highlights: ['New set / Refill + colour — €50', 'Redo / Long length — +€5', 'Removal + groomed finish — €15']
  },
  {
    tag: '02 · BUILDER GEL',
    price: 'From €40',
    title: 'BIAB (The Gel Bottle)',
    desc: 'Builder gel designed to strengthen natural nails while creating a beautiful long-lasting finish.',
    tab: 'nails',
    highlights: ['New set — €40', 'Refill + colour — €45', 'Removal + groomed finish — €15']
  },
  {
    tag: '03 · HIGH-GLOSS GEL',
    price: 'From €30',
    title: 'Shellac / Gel',
    desc: 'Glossy and long-lasting gel colour for hands and toes. Includes free take off with your set.',
    tab: 'nails',
    highlights: ['Hand / Toes — €30', 'Free take off included', 'Removal + groomed finish — €10']
  },
  {
    tag: '04 · TIMELESS CLASSIC',
    price: 'From €25',
    title: 'File + Normal Polish',
    desc: 'Classic nail shaping and traditional polish for a naturally elegant finish. Free take off included.',
    tab: 'nails',
    highlights: ['Hand / Toes — €25', 'Children under 12 years — €15', 'Mini manicure add-on — +€5']
  },
  {
    tag: '05 · HAND CARE',
    price: 'From €20',
    title: 'Spa Manicure',
    desc: 'Professional manicure treatments designed to deeply care for your hands, cuticles and nails.',
    tab: 'spa',
    highlights: ['Manicure no colour — €20', 'Groomed cuticles & hand care', 'Complimentary tea & coffee']
  },
  {
    tag: '06 · SIGNATURE SPA',
    price: 'From €45',
    title: 'Deluxe Spa Pedicure',
    desc: 'Relax and refresh your feet with our luxurious spa pedicure rituals and soothing foot care.',
    tab: 'spa',
    highlights: ['Mini pedicure — €45', 'Deluxe spa pedicure — €55', 'Elite spa pedicure — €68']
  }
];

const atelierRows = [...document.querySelectorAll('.atelier-row')];
const spotlight = document.querySelector('.atelier-spotlight');
if (atelierRows.length && spotlight) {
  const sTag = document.querySelector('#spotlight-tag');
  const sPrice = document.querySelector('#spotlight-price');
  const sTitle = document.querySelector('#spotlight-title');
  const sDesc = document.querySelector('#spotlight-desc');
  const sList = document.querySelector('#spotlight-highlights');
  const sBtn = document.querySelector('#spotlight-menu-btn');

  function activateService(index) {
    const data = atelierServices[index];
    if (!data) return;
    atelierRows.forEach((row, i) => row.classList.toggle('is-active', i === index));
    sTag.textContent = data.tag;
    sPrice.textContent = data.price;
    sTitle.textContent = data.title;
    sDesc.textContent = data.desc;
    sBtn.dataset.priceLink = data.tab;
    sList.innerHTML = data.highlights
      .map(item => `<li><svg><use href="#i-check"/></svg> ${item}</li>`)
      .join('');
    spotlight.classList.remove('is-updating');
    void spotlight.offsetWidth;
    spotlight.classList.add('is-updating');
  }

  atelierRows.forEach((row, index) => {
    row.addEventListener('pointerenter', () => activateService(index));
    row.addEventListener('focus', () => activateService(index));
  });

  if (typeof selectPrice === 'function') {
    sBtn.addEventListener('click', () => selectPrice(sBtn.dataset.priceLink));
  }
}

if (!reduceMotion) {
  // Image curtain wipes for elements that are not already observed as .reveal.
  if ('IntersectionObserver' in window) {
    const wipes = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          wipes.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.img-wipe:not(.reveal)').forEach(element => wipes.observe(element));
  }

  // Scroll progress bar + slow parallax on the hero 89 watermark.
  const progress = document.querySelector('.scroll-progress');
  const watermark = document.querySelector('.hero-watermark');
  let motionTicking = false;
  function updateMotion() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (watermark && window.scrollY < window.innerHeight * 1.2) {
      watermark.style.setProperty('--parallax-y', `${window.scrollY * 0.25}px`);
    }
    motionTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!motionTicking) {
      motionTicking = true;
      requestAnimationFrame(updateMotion);
    }
  }, { passive: true });
  updateMotion();

  if (finePointer) {
    // Hero photo tilts gently toward the cursor.
    const hero = document.querySelector('.hero');
    const frame = document.querySelector('.hero-visual .image-frame');
    if (hero && frame) {
      hero.addEventListener('pointermove', event => {
        const rect = hero.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        frame.style.setProperty('--tilt-y', `${x * 6}deg`);
        frame.style.setProperty('--tilt-x', `${y * -5}deg`);
      });
      hero.addEventListener('pointerleave', () => {
        frame.style.setProperty('--tilt-y', '0deg');
        frame.style.setProperty('--tilt-x', '0deg');
      });
    }

    // Atelier spotlight: a soft orange glow follows the cursor.
    if (spotlight) {
      spotlight.addEventListener('pointermove', event => {
        const rect = spotlight.getBoundingClientRect();
        spotlight.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        spotlight.style.setProperty('--my', `${event.clientY - rect.top}px`);
      });
    }

    // Custom boutique cursor (desktop fine pointer only).
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
      const dot = cursor.querySelector('.cursor-dot');
      const ring = cursor.querySelector('.cursor-ring');
      let mx = 0, my = 0, rx = 0, ry = 0, started = false;

      window.addEventListener('pointermove', event => {
        mx = event.clientX;
        my = event.clientY;
        if (!started) {
          rx = mx;
          ry = my;
          started = true;
          cursor.classList.add('is-visible');
        }
        dot.style.left = `${mx}px`;
        dot.style.top = `${my}px`;
      }, { passive: true });

      document.addEventListener('pointerleave', () => {
        cursor.classList.remove('is-visible');
        started = false;
      });

      const interactiveSelector = 'a, button, .atelier-row, .gallery-item';
      document.addEventListener('pointerover', event => {
        if (event.target.closest(interactiveSelector)) cursor.classList.add('is-hover');
      });
      document.addEventListener('pointerout', event => {
        if (event.target.closest(interactiveSelector)) cursor.classList.remove('is-hover');
      });

      function tickCursor() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.left = `${rx}px`;
        ring.style.top = `${ry}px`;
        requestAnimationFrame(tickCursor);
      }
      requestAnimationFrame(tickCursor);
    }
  }
}
