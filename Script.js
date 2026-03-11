/* ============================================================
   SIDRA DPT — Pediatric Physiotherapy Website
   JavaScript — Interactions, Animations, Page Routing
   ============================================================ */

/* ─── WAIT FOR DOM ─── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── INIT AOS ── */
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });

  /* ── CUSTOM CURSOR ── */
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
  });

  /* Smooth lagging ring */
  function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* Grow ring on hoverable elements */
  document.querySelectorAll('a, button, .cond-card, .article-card, .skill-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1.8)';
      ring.style.opacity   = '.25';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.opacity   = '.4';
    });
  });

  /* ── NAVBAR SCROLL EFFECT ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  /* ── MOBILE NAV TOGGLE ── */
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
  });

  /* ── PARALLAX BLOBS ON SCROLL ── */
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    document.querySelectorAll('.blob-1').forEach(b => {
      b.style.transform = `translateY(${y * 0.08}px)`;
    });
    document.querySelectorAll('.blob-2').forEach(b => {
      b.style.transform = `translateY(${y * -0.05}px)`;
    });
    document.querySelectorAll('.blob-3').forEach(b => {
      b.style.transform = `translateY(${y * 0.06}px)`;
    });
  });

  /* ── GSAP SCROLL ANIMATIONS ── */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Hero title stagger */
    gsap.from('.hero-title', {
      opacity: 0,
      y: 60,
      duration: 1.2,
      ease: 'power3.out',
    });
    gsap.from('.hero-sub', {
      opacity: 0,
      y: 40,
      duration: 1,
      delay: .3,
      ease: 'power3.out',
    });
    gsap.from('.hero-actions', {
      opacity: 0,
      y: 30,
      duration: .9,
      delay: .55,
      ease: 'power3.out',
    });

    /* Stat bar fills on scroll */
    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 75%',
      onEnter: () => {
        document.querySelectorAll('.stat-fill').forEach(fill => {
          fill.classList.add('animated');
        });
      }
    });
  }

  /* ── COUNTER ANIMATION ── */
  const observerOptions = {
    threshold: 0.4,
    rootMargin: '0px 0px -50px 0px'
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        if (el.dataset.animated) return;
        el.dataset.animated = true;
        animateCounter(el);
      }
    });
  }, observerOptions);

  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const duration = 2000; // ms
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Observe all counter elements
  document.querySelectorAll('.stat-num, .pk-num').forEach(el => {
    counterObserver.observe(el);
  });

  /* ── PAGE ROUTING ── */
  // Initial active page
  setActivePage('home');

});

/* ─── SHOW PAGE (global function) ─── */
function showPage(name) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // Show target
  const target = document.getElementById('page-' + name);
  if (target) {
    target.classList.add('active');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-init AOS for new page content
    setTimeout(() => {
      if (window.AOS) AOS.refresh();
      // Re-observe counters in the newly visible page
      target.querySelectorAll('.stat-num:not([data-animated]), .pk-num:not([data-animated])').forEach(el => {
        // Force re-animation if in view
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * .8) {
          el.dataset.animated = true;
          animateCounterGlobal(el);
        }
      });
    }, 100);
  }

  // Update nav link active states
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.remove('active-link');
  });

  // Highlight matching nav link
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.textContent.toLowerCase().includes(name.toLowerCase())) {
      a.classList.add('active-link');
    }
  });
}

/* ─── HELPER: set active page on load ─── */
function setActivePage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById('page-' + name);
  if (t) t.classList.add('active');
}

/* ─── GLOBAL counter animation (for page switching) ─── */
function animateCounterGlobal(el) {
  const target = parseFloat(el.dataset.target);
  const duration = 2000;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = isDecimal ? current.toFixed(1) : Math.round(current);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/* ─── CLOSE NAV (global function) ─── */
function closeNav() {
  document.getElementById('navLinks').classList.remove('open');
}

/* ─── TOGGLE CONDITION CARDS ─── */
function toggleCondition(header) {
  const body = header.nextElementSibling;
  const isOpen = header.classList.contains('open');

  // Close all others
  document.querySelectorAll('.cc-header.open').forEach(h => {
    h.classList.remove('open');
    h.nextElementSibling.classList.remove('open');
  });

  // Toggle clicked
  if (!isOpen) {
    header.classList.add('open');
    body.classList.add('open');
    // Smooth scroll to card
    setTimeout(() => {
      header.closest('.cond-card').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

/* ─── ARTICLE FILTER ─── */
function filterArticles(category, btn) {
  // Update active button
  document.querySelectorAll('.af-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Show/hide articles
  document.querySelectorAll('.article-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('hidden');
      card.style.animation = 'fadeIn .4s ease';
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ─── CONTACT FORM SUBMISSION ─── */
function submitForm() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const msg     = document.getElementById('cf-msg').value.trim();

  // Simple validation
  if (!name || !email || !msg) {
    // Shake the form
    const form = document.getElementById('contactForm');
    form.style.animation = 'none';
    form.offsetHeight; // reflow
    form.style.animation = 'shake .4s ease';
    // Highlight empty fields
    ['cf-name','cf-email','cf-msg'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = '#e87c7c';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
      }
    });
    return;
  }

  // Show success
  document.getElementById('contactForm').style.display = 'none';
  document.getElementById('formSuccess').style.display = 'block';
}

function resetForm() {
  document.getElementById('cf-name').value = '';
  document.getElementById('cf-email').value = '';
  document.getElementById('cf-age').value = '';
  document.getElementById('cf-condition').value = '';
  document.getElementById('cf-msg').value = '';
  document.getElementById('contactForm').style.display = 'block';
  document.getElementById('formSuccess').style.display = 'none';
}

/* ─── SCROLL-BASED SHADOW EFFECT ─── */
window.addEventListener('scroll', () => {
  const scrollPct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const shadowIntensity = Math.sin(scrollPct * Math.PI * 4) * 0.05 + 0.08;

  document.querySelectorAll('.stat-card, .pk-card, .skill-card, .article-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const distFromCenter = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
    const maxDist = window.innerHeight / 2;
    const proximity = 1 - Math.min(distFromCenter / maxDist, 1);
    const shadowSize = 8 + proximity * 24;
    const shadowOpacity = 0.04 + proximity * 0.1;
    card.style.boxShadow = `0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,${shadowOpacity})`;
  });
});

/* ─── INJECT SHAKE KEYFRAME ─── */
(function injectShakeAnimation() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(6px); }
    }
    .active-link {
      color: var(--sage) !important;
    }
  `;
  document.head.appendChild(style);
})();

/* ─── SMOOTH ENTRANCE ON PAGE SWITCH ─── */
(function patchShowPage() {
  const origShow = window.showPage;
  window.showPage = function(name) {
    origShow(name);
    const page = document.getElementById('page-' + name);
    if (page) {
      page.style.opacity = '0';
      page.style.transform = 'translateY(16px)';
      requestAnimationFrame(() => {
        page.style.transition = 'opacity .4s ease, transform .4s ease';
        page.style.opacity = '1';
        page.style.transform = 'translateY(0)';
      });
    }
  };
})();
