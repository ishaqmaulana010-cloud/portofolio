/* ═══════════════════════════════════════════════════════════════
   ISHAQ — CREATIVE PORTFOLIO
   Lightweight Vanilla JS — No Dependencies
   Text Animations: Scramble, Spotlight, Weight Hover, Magnetic
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     1. SCROLL PROGRESS BAR
     ───────────────────────────────────── */
  const progressBar = document.getElementById('scroll-progress');
  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      progressBar.style.transform = 'scaleX(' + (scrollTop / docHeight) + ')';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  /* ─────────────────────────────────────
     2. NAV SCROLL STATE
     ───────────────────────────────────── */
  const nav = document.getElementById('main-nav');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ─────────────────────────────────────
     3. MOBILE MENU
     ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ─────────────────────────────────────
     4. SMOOTH ANCHOR SCROLL
     ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─────────────────────────────────────
     5. HERO VIDEO SCRUBBER
     Pointer controls video playback position
     ───────────────────────────────────── */
  var heroSection = document.getElementById('hero');
  var video = document.getElementById('hero-video');
  var vTargetTime = 0;
  var vDuration = 0;
  var vRafId = 0;
  var vSeekQueued = false;

  function vScheduleSeek() {
    if (vRafId || !vDuration) return;
    vRafId = requestAnimationFrame(vCommitSeek);
  }

  function vCommitSeek() {
    vRafId = 0;
    if (video.seeking) { vSeekQueued = true; return; }
    if (Math.abs(video.currentTime - vTargetTime) >= 1 / 30) {
      video.currentTime = vTargetTime;
    }
  }

  function vSetFromPointer(e) {
    if (!vDuration) return;
    var rect = heroSection.getBoundingClientRect();
    var x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
    vTargetTime = (1 - x / rect.width) * Math.max(0, vDuration - 0.05);
    vScheduleSeek();
  }

  function vInit() {
    vDuration = video.duration || 0;
    if (!vDuration) return;
    vTargetTime = Math.max(0, vDuration - 0.05);
    video.currentTime = vTargetTime;
  }

  if (video.readyState >= 1) {
    vInit();
  } else {
    video.addEventListener('loadedmetadata', vInit, { once: true });
    video.load();
  }

  heroSection.addEventListener('pointermove', vSetFromPointer, { passive: true });
  heroSection.addEventListener('pointerdown', vSetFromPointer, { passive: true });
  video.addEventListener('seeked', function () {
    if (vSeekQueued) { vSeekQueued = false; vScheduleSeek(); }
  });

  /* ─────────────────────────────────────
     6. SCROLL REVEAL (IntersectionObserver)
     ───────────────────────────────────── */
  var reveals = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { revealObserver.observe(el); });

  /* ─────────────────────────────────────
     7. ANIMATED COUNTERS
     ───────────────────────────────────── */
  var counters = document.querySelectorAll('[data-count]');

  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!entry.target.isAnimatingCounter) {
          animateCounter(entry.target);
        }
      } else {
        entry.target.isAnimatingCounter = false;
        entry.target.textContent = '0' + (entry.target.dataset.suffix || '');
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function (el) { counterObserver.observe(el); });

  function animateCounter(el) {
    el.isAnimatingCounter = true;
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || '';
    var duration = 1600;
    var start = performance.now();

    function tick(now) {
      if (!el.isAnimatingCounter) return; // stop if out of view
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target) + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ─────────────────────────────────────
     8. SCRAMBLE TEXT ANIMATION
     Characters cycle through random chars
     before revealing the actual text.
     ───────────────────────────────────── */
  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';

  function scrambleText(el, callback) {
    if (!el.dataset.originalText) {
      el.dataset.originalText = el.textContent;
    }
    var original = el.dataset.originalText;
    var length = original.length;
    var duration = 600 + length * 30; // adaptive duration
    var start = performance.now();

    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var revealedCount = Math.floor(progress * length);
      var result = '';

      for (var i = 0; i < length; i++) {
        if (original[i] === ' ') {
          result += ' ';
        } else if (i < revealedCount) {
          result += original[i];
        } else {
          result += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      el.textContent = result;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = original;
        if (callback) callback();
      }
    }

    requestAnimationFrame(tick);
  }

  // Auto-scramble on page load
  var autoScrambles = document.querySelectorAll('[data-scramble-auto]');
  autoScrambles.forEach(function (el) {
    var delay = parseInt(el.dataset.scrambleDelay || '400', 10);
    setTimeout(function () {
      scrambleText(el);
    }, delay);
  });

  // Scramble on hover
  var hoverScrambles = document.querySelectorAll('[data-scramble-hover]');
  hoverScrambles.forEach(function (el) {
    var isAnimating = false;
    el.addEventListener('mouseenter', function () {
      if (isAnimating) return;
      isAnimating = true;
      scrambleText(el, function () { isAnimating = false; });
    });
  });

  /* ─────────────────────────────────────
     9. SPOTLIGHT TEXT
     Gradient sweep triggered on scroll
     ───────────────────────────────────── */
  var spotlights = document.querySelectorAll('[data-spotlight]');

  var spotlightObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        setTimeout(function () {
          entry.target.classList.add('spotlight-active');
        }, 150);
      } else {
        entry.target.classList.remove('spotlight-active');
      }
    });
  }, { threshold: 0.2 });

  spotlights.forEach(function (el) { spotlightObserver.observe(el); });

  /* ─────────────────────────────────────
     10. FONT WEIGHT HOVER
     Characters near cursor get heavier weight.
     Only for elements marked with data-weight-hover.
     ───────────────────────────────────── */
  function initWeightHover() {
    var elements = document.querySelectorAll('[data-weight-hover]');

    elements.forEach(function (el) {
      // Skip nav links — they're small and don't need char splitting
      if (el.closest('.nav__links')) return;

      var text = el.textContent;
      el.innerHTML = '';
      el.setAttribute('aria-label', text);

      for (var i = 0; i < text.length; i++) {
        var span = document.createElement('span');
        span.classList.add('char-wrap');
        span.textContent = text[i];
        if (text[i] === ' ') span.innerHTML = '&nbsp;';
        el.appendChild(span);
      }

      var chars = el.querySelectorAll('.char-wrap');
      var isHovering = false;

      el.addEventListener('mouseenter', function () { isHovering = true; });
      el.addEventListener('mouseleave', function () {
        isHovering = false;
        chars.forEach(function (ch) {
          ch.style.fontWeight = '';
          ch.style.color = '';
        });
      });

      el.addEventListener('mousemove', function (e) {
        if (!isHovering) return;
        var rect = el.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;

        chars.forEach(function (ch) {
          var charRect = ch.getBoundingClientRect();
          var charCenter = charRect.left + charRect.width / 2 - rect.left;
          var dist = Math.abs(mouseX - charCenter);
          var maxDist = 80;

          if (dist < maxDist) {
            var proximity = 1 - (dist / maxDist);
            var weight = Math.round(400 + proximity * 400); // 400 → 800
            ch.style.fontWeight = weight;
            ch.style.color = proximity > 0.5 ? '#eeeef0' : '';
          } else {
            ch.style.fontWeight = '';
            ch.style.color = '';
          }
        });
      });
    });
  }

  initWeightHover();

  /* ─────────────────────────────────────
     11. PROJECT CARD GLOW FOLLOW
     Radial gradient follows mouse on cards
     ───────────────────────────────────── */
  var projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty('--glow-x', (e.clientX - rect.left) + 'px');
      card.style.setProperty('--glow-y', (e.clientY - rect.top) + 'px');
    });
  });

  /* ─────────────────────────────────────
     12. MAGNETIC BUTTON EFFECT
     Buttons subtly follow cursor proximity
     ───────────────────────────────────── */
  var magneticEls = document.querySelectorAll('[data-magnetic]');

  magneticEls.forEach(function (el) {
    el.addEventListener('mousemove', function (e) {
      var rect = el.getBoundingClientRect();
      var centerX = rect.left + rect.width / 2;
      var centerY = rect.top + rect.height / 2;
      var dx = e.clientX - centerX;
      var dy = e.clientY - centerY;
      // Move button slightly toward cursor (max 6px)
      var moveX = dx * 0.15;
      var moveY = dy * 0.15;
      el.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
    });

    el.addEventListener('mouseleave', function () {
      el.style.transform = '';
      el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(function () {
        el.style.transition = '';
      }, 400);
    });
  });

  /* ─────────────────────────────────────
     13. NAV LINK WEIGHT HOVER (Simple)
     For nav links — no char splitting,
     just smooth weight transition on hover
     ───────────────────────────────────── */
  var navWeightLinks = document.querySelectorAll('.nav__links a[data-weight-hover]');
  navWeightLinks.forEach(function (link) {
    link.addEventListener('mouseenter', function () {
      link.style.fontWeight = '600';
    });
    link.addEventListener('mouseleave', function () {
      link.style.fontWeight = '';
    });
  });

  /* ─────────────────────────────────────
     14. PROJECT TITLE SCRAMBLE ON HOVER
     Scramble effect when hovering project cards
     ───────────────────────────────────── */
  projectCards.forEach(function (card) {
    var titleEl = card.querySelector('.project__title[data-scramble-hover]');
    if (!titleEl) return;

    var isAnimating = false;
    card.addEventListener('mouseenter', function () {
      if (isAnimating) return;
      isAnimating = true;
      scrambleText(titleEl, function () { isAnimating = false; });
    });
  });

  /* ─────────────────────────────────────
     15. THEME TOGGLE & VIDEO SWITCH
     ───────────────────────────────────── */
  var themeToggle = document.getElementById('theme-toggle');
  var videoSource = video ? video.querySelector('source') : null;

  var iconSun = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var iconMoon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  // Dapatkan tema saat ini dari atribut yang diset inline di HTML
  var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  
  // Set Icon di Toggle (kebalikannya, jika gelap tampil matahari)
  if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'dark' ? iconSun : iconMoon;
  }

  // Set Icon di Loader (sesuai temanya)
  var loaderIcon = document.getElementById('loader-icon');
  if (loaderIcon) {
    loaderIcon.innerHTML = currentTheme === 'dark' ? iconMoon : iconSun;
  }

  // Sinkronkan video hero yang pertama kali di render sesuai tema
  if (video && videoSource) {
    var expectedSrc = currentTheme === 'dark' ? '0711(2).mp4' : '0711(1).mp4';
    if (!videoSource.src.endsWith(expectedSrc)) {
      videoSource.src = expectedSrc;
      video.load(); // Load if wrong source
    }
  }

  // Event saat toggle ditekan
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', currentTheme);
      themeToggle.innerHTML = currentTheme === 'dark' ? iconSun : iconMoon;
      
      // Simpan di local storage
      localStorage.setItem('ishaq-theme', currentTheme);

      // Switch video
      if (video && videoSource) {
        var oldTime = video.currentTime;
        videoSource.src = currentTheme === 'dark' ? '0711(2).mp4' : '0711(1).mp4';
        
        function onLoaded() {
          video.currentTime = oldTime;
          vDuration = video.duration || 0;
          video.removeEventListener('loadedmetadata', onLoaded);
        }
        
        video.addEventListener('loadedmetadata', onLoaded);
        video.load();
      }
    });
  }

  /* ─────────────────────────────────────
     16. DISMISS LOADER
     ───────────────────────────────────── */
  window.addEventListener('load', function () {
    setTimeout(function () {
      var loader = document.getElementById('theme-loader');
      if (loader) loader.classList.add('fade-out');
    }, 600); // 600ms buffer agar loader terlihat jelas
  });

  /* ─────────────────────────────────────
     DONE — All systems initialized
     ───────────────────────────────────── */
  console.log('%c✦ Ishaq Portfolio — All systems go.', 'color: #7c6aef; font-weight: bold; font-size: 12px;');

})();
