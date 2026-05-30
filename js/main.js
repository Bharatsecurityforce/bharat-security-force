/* ===================================================
   BHARAT SECURITY FORCE - Premium Main JS
   Optimized for 120Hz Fluid Rendering & Zero Jank
   =================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const hero = document.getElementById('hero');
  const heroBg = document.querySelector('.hero-bg');

  // ─────────────────────────────────────────────────
  // 1. PERFORMANCE-TUNED CENTRAL SCROLL HANDLING
  // ─────────────────────────────────────────────────
  let lastScrollY = window.scrollY;
  let scrollTicking = false;
  let sectionPositions = [];

  // Cache positions to prevent layout thrashing on scroll
  const cacheSectionPositions = () => {
    const sections = document.querySelectorAll('section[id]');
    sectionPositions = Array.from(sections).map(section => {
      const id = section.getAttribute('id');
      const link = document.querySelector(`#navLinks a[href="#${id}"]`);
      return {
        id,
        link,
        top: section.offsetTop,
        height: section.offsetHeight
      };
    });
  };

  // Active navigation link highlighting based on cached offsets
  const updateActiveNav = () => {
    const scrollY = lastScrollY + 120;
    const len = sectionPositions.length;
    for (let i = 0; i < len; i++) {
      const s = sectionPositions[i];
      if (s.link) {
        if (scrollY >= s.top && scrollY < s.top + s.height) {
          document.querySelectorAll('#navLinks a').forEach(l => l.classList.remove('active'));
          s.link.classList.add('active');
          break;
        }
      }
    }
  };

  // Synchronized scroll ticks running at display refresh rate (60Hz / 120Hz+)
  const updateScrollAnimations = () => {
    // A. Navbar background scrolled class trigger
    if (navbar) {
      if (lastScrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // B. Hero BG: STATIC — no parallax transform applied
    // (heroBg stays fixed; transform intentionally removed)

    // C. Highlight active navigation section
    updateActiveNav();

    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!scrollTicking) {
      requestAnimationFrame(updateScrollAnimations);
      scrollTicking = true;
    }
  }, { passive: true });

  window.addEventListener('load', () => {
    cacheSectionPositions();
    // Hero image stays static — no zoom on load
  });

  window.addEventListener('resize', () => {
    cacheSectionPositions();
  }, { passive: true });


  // ─────────────────────────────────────────────────
  // 2. MOBILE NAVIGATION
  // ─────────────────────────────────────────────────
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
      const isOpen = navLinks.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  document.querySelectorAll('#navLinks a').forEach(link => {
    link.addEventListener('click', () => {
      if (navToggle) navToggle.classList.remove('open');
      if (navLinks) navLinks.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  });


  // ─────────────────────────────────────────────────
  // 3. MOUSE-TRACKING GLOW (LERPed for Liquid Motion)
  // ─────────────────────────────────────────────────
  const heroGradientMove = document.getElementById('heroGradientMove');
  if (hero && heroGradientMove) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isHovering = false;
    let animId = null;

    const updateGradient = () => {
      if (!isHovering) {
        animId = null;
        return;
      }
      
      // Interpolate coordinates (LERP) for smooth fluid glide
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      
      hero.style.setProperty('--mx', `${currentX}px`);
      hero.style.setProperty('--my', `${currentY}px`);
      
      animId = requestAnimationFrame(updateGradient);
    };

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      
      isHovering = true;
      if (!animId) {
        animId = requestAnimationFrame(updateGradient);
      }
    }, { passive: true });

    hero.addEventListener('mouseleave', () => {
      isHovering = false;
    }, { passive: true });
  }


  // ─────────────────────────────────────────────────
  // 4. FLOATING PARTICLES (Pausable & High-Res)
  //    Disabled on mobile to prevent GPU flicker
  // ─────────────────────────────────────────────────
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const canvas = document.getElementById('particle-canvas');
  if (canvas && !isMobile) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let isCanvasVisible = true;
    let dpr = window.devicePixelRatio || 1;
    let logicalWidth = canvas.clientWidth;
    let logicalHeight = canvas.clientHeight;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      dpr = window.devicePixelRatio || 1;
      logicalWidth = parent.clientWidth;
      logicalHeight = parent.clientHeight;
      
      // Resize backing store for Retina/High-DPI sharp rendering
      canvas.width = logicalWidth * dpr;
      canvas.height = logicalHeight * dpr;
      ctx.scale(dpr, dpr);
      
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
    };

    class Particle {
      constructor() {
        this.reset();
        this.y = Math.random() * logicalHeight;
      }
      reset() {
        this.x = Math.random() * logicalWidth;
        this.y = logicalHeight + 10;
        this.radius = Math.random() * 1.6 + 0.6;
        this.vx = Math.random() * 0.4 - 0.2;
        this.vy = -(Math.random() * 0.5 + 0.15);
        this.alpha = Math.random() * 0.35 + 0.1;
        
        const rand = Math.random();
        if (rand < 0.4) {
          this.color = '201, 168, 76'; // Gold
        } else if (rand < 0.7) {
          this.color = '138, 154, 91'; // Olive/Sage Green
        } else {
          this.color = '232, 234, 240'; // Off-white
        }
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -10 || this.x < -10 || this.x > logicalWidth + 10) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(55, Math.floor(logicalWidth / 24));
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    resizeCanvas();
    initParticles();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    }, { passive: true });

    const animateParticles = () => {
      // If hero canvas is off-screen, stop loop to save battery and CPU cycles
      if (!isCanvasVisible) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);
      
      const maxDist = 110;
      const maxDistSq = maxDist * maxDist;
      const len = particles.length;

      // Draw high-tech linking mesh (optimized distance checks without math square-root)
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / maxDist) * 0.12 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(201, 168, 76, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animateParticles);
    };

    // Pause/Resume canvas animations dynamically when out of view
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
        if (isCanvasVisible) {
          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animateParticles);
          }
        } else {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });
    }, { threshold: 0.01 });

    canvasObserver.observe(hero);
  }


  // ─────────────────────────────────────────────────
  // 5. MAGNETIC BUTTONS (LERPed Elastic Glide)
  // ─────────────────────────────────────────────────
  const magneticEls = document.querySelectorAll('.btn-primary, .btn-outline, .whatsapp-btn, .social-btn');
  if (!isMobile) {
    magneticEls.forEach(btn => {
      let state = {
        tx: 0, ty: 0,
        cx: 0, cy: 0,
        active: false
      };

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const strength = btn.classList.contains('social-btn') ? 8 : 12;
        state.tx = x * (strength / rect.width);
        state.ty = y * (strength / rect.height);
        
        if (!state.active) {
          state.active = true;
          tick();
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        state.tx = 0;
        state.ty = 0;
      }, { passive: true });

      function tick() {
        // Elastic slide using linear interpolation
        state.cx += (state.tx - state.cx) * 0.12;
        state.cy += (state.ty - state.cy) * 0.12;
        
        const isSocial = btn.classList.contains('social-btn');
        const yOffset = isSocial ? 0 : -3;
        
        const dx = state.tx - state.cx;
        const dy = state.ty - state.cy;
        
        // Release animations when coordinates return to zero rest position
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && state.tx === 0 && state.ty === 0) {
          btn.style.transform = '';
          state.cx = 0;
          state.cy = 0;
          state.active = false;
        } else {
          // GPU acceleration layer trigger via translate3d
          btn.style.transform = `translate3d(${state.cx}px, ${state.cy + yOffset}px, 0)`;
          requestAnimationFrame(tick);
        }
      }
    });
  }


  // ─────────────────────────────────────────────────
  // 6. SCROLL REVEAL (Intersection Observer)
  // ─────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  // ─────────────────────────────────────────────────
  // 7. COUNTER ANIMATIONS
  // ─────────────────────────────────────────────────
  function animateCounter(el, target, suffix, duration = 1800) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Fluid cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };
    requestAnimationFrame(step);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count, 10);
          const suffix = counter.dataset.suffix || '';
          animateCounter(counter, target, suffix);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);


  // ─────────────────────────────────────────────────
  // 8. SERVICE MODALS SYSTEM
  // ─────────────────────────────────────────────────
  const serviceCards = document.querySelectorAll('.service-card');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const modalId = card.getAttribute('data-modal');
      const targetModal = document.getElementById(modalId);
      if (targetModal) {
        targetModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  const closeModal = (modal) => {
    modal.classList.remove('open');
    const anyOpen = Array.from(modalOverlays).some(m => m.classList.contains('open'));
    if (!anyOpen) {
      document.body.style.overflow = '';
    }
  };

  modalOverlays.forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal(modal);
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModal = document.querySelector('.modal-overlay.open');
      if (openModal) {
        closeModal(openModal);
      }
    }
  });


  // ─────────────────────────────────────────────────
  // 9. CONTACT FORM SUBMISSION
  // ─────────────────────────────────────────────────
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

    if (contactForm) {

     contactForm.addEventListener('submit', async (e) => {

      e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const btn = contactForm.querySelector('.form-submit');

    btn.innerHTML = `
      <svg class="spinner" viewBox="0 0 50 50" style="width:18px;height:18px;animation:spin 1s linear infinite;stroke:currentColor;fill:none;stroke-width:5;stroke-linecap:round;display:inline-block;vertical-align:middle;margin-right:8px;">
        <circle cx="25" cy="25" r="20"></circle>
      </svg>
      Sending...`;

     btn.disabled = true;

    const formData = new FormData(contactForm);

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });

      const result = await response.json();

      if (result.success) {

        contactForm.style.display = 'none';

        if (formSuccess) {
          formSuccess.style.display = 'block';
          formSuccess.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }

        contactForm.reset();

      } else {

        alert('Something went wrong. Please try again.');

        console.log(result);

      }

    } catch (error) {

      console.log(error);

      alert('Submission failed.');

    }

    btn.innerHTML = 'Submit Enquiry';
    btn.disabled = false;

  });

}


  // ─────────────────────────────────────────────────
  // 10. DECOUPLED SMOOTH SCROLLING
  // ─────────────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 76;
        const top = target.getBoundingClientRect().top + lastScrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  // ─────────────────────────────────────────────────
  // 11. GRID STAGGER REVEAL TIMINGS
  // ─────────────────────────────────────────────────
  const staggerReveal = (parentSelector, childSelector, baseDelay = 80) => {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;
    const children = parent.querySelectorAll(childSelector);
    children.forEach((child, idx) => {
      child.dataset.delay = idx * baseDelay;
    });
  };

  staggerReveal('.services-grid', '.service-card', 60);
  staggerReveal('.trust-inner', '.trust-item', 80);
  staggerReveal('.stats-grid', '.stat-item', 100);
  staggerReveal('.footer-grid', '> div', 80);


  // ─────────────────────────────────────────────────
  // 12. HERO HEADING TYPING ACCENT EFFECT
  // ─────────────────────────────────────────────────
  const heroAccent = document.getElementById('heroAccent');
  if (heroAccent) {
    const words = ['Trust', 'Strength', 'Discipline'];
    let currentWordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typeEffect() {
      const currentWord = words[currentWordIdx];
      
      if (isDeleting) {
        heroAccent.textContent = currentWord.substring(0, charIdx - 1);
        charIdx--;
      } else {
        heroAccent.textContent = currentWord.substring(0, charIdx + 1);
        charIdx++;
      }

      if (!isDeleting && charIdx === currentWord.length) {
        isDeleting = true;
        heroAccent.classList.remove('typing');
        setTimeout(typeEffect, 2200); // Hold word
      } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        currentWordIdx = (currentWordIdx + 1) % words.length;
        heroAccent.classList.add('typing');
        setTimeout(typeEffect, 400); // Short pause before next word
      } else {
        setTimeout(typeEffect, isDeleting ? 45 : 100);
      }
    }

    heroAccent.classList.add('typing');
    setTimeout(typeEffect, 1200);
  }

  // Inject spinner styles
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    @keyframes spin-stroke {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
    .spinner circle {
      animation: spin-stroke 1.5s ease-in-out infinite;
      stroke-linecap: round;
      stroke: currentColor;
    }
  `;
  document.head.appendChild(styleEl);

  // WhatsApp consultations clicks tracking
  document.querySelectorAll('.whatsapp-btn, #float-whatsapp').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('WhatsApp consultation clicked');
    });
  });


  // ─────────────────────────────────────────────────
  // 13. HERO FADE-IN ON LOAD (desktop only to avoid
  //     mobile flicker from will-change re-paints)
  // ─────────────────────────────────────────────────
  const isMobileFade = window.matchMedia('(max-width: 768px)').matches;

  if (!isMobileFade) {
    setTimeout(() => {
      const heroElements = document.querySelectorAll('.hero-badge, .hero-heading, .hero-sub, .hero-cta-row, .hero-indicators');
      heroElements.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translate3d(0, 16px, 0)';
        el.style.willChange = 'opacity, transform';
        el.style.transition = `opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.12}s, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.12}s`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.opacity = '1';
            el.style.transform = 'translate3d(0, 0, 0)';
          });
        });

        el.addEventListener('transitionend', function handler() {
          el.style.willChange = '';
          el.removeEventListener('transitionend', handler);
        });
      });
    }, 100);
  }
});

