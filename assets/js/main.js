(function ($) {
  'use strict';

  /* ============================================================
     1. CONFIG & STATE
     ============================================================ */
  const MOBILE_BREAKPOINT = 992;

  // Theme cycles: system → light → dark
  const THEMES = ['system', 'light', 'dark'];
  const _savedTheme = localStorage.getItem('theme');
  let themeIndex = _savedTheme ? Math.max(THEMES.indexOf(_savedTheme), 0) : 0;

  /* ============================================================
     2. THEME
     ============================================================ */
  function applyTheme(theme) {
    const h = document.documentElement;
    if (!document.startViewTransition) {
      h.dataset.theme = theme;
    } else {
      document.startViewTransition(() => { h.dataset.theme = theme; });
    }
    localStorage.setItem('theme', theme);   // ← only line added
  }

  function cycleTheme() {
    themeIndex = (themeIndex + 1) % THEMES.length;
    applyTheme(THEMES[themeIndex]);
  }

  (function syncIndex() {
    const saved = localStorage.getItem('theme');
    if (saved) {
      const idx = THEMES.indexOf(saved);
      if (idx !== -1) themeIndex = idx;
    }
  })();

  // Popover theme-toggler button (bottom nav)
  const themeToggler = document.querySelector('.theme-toggler');
  if (themeToggler) themeToggler.addEventListener('click', cycleTheme);

  /* ============================================================
     3. HEADER — fixed on scroll
     ============================================================ */
  const $header = $('.main-header');

  function updateHeader() {
    if (!$header.length) return;
    const scrolled = $(window).scrollTop() >= 150;
    $header.toggleClass('fixed-header', scrolled);
  }

  /* ============================================================
     4. SCROLL-TO-TOP — progress ring
     ============================================================ */
  const $progressWrap = $('.progress-wrap');
  const progressPath = $progressWrap.find('path')[0];

  function initScrollTop() {
    if (!progressPath) return;

    const len = progressPath.getTotalLength();
    progressPath.style.transition = 'none';
    progressPath.style.strokeDasharray = `${len} ${len}`;
    progressPath.style.strokeDashoffset = len;
    progressPath.getBoundingClientRect(); // force reflow
    progressPath.style.transition = 'stroke-dashoffset 10ms linear';

    function updateProgress() {
      const scroll = $(window).scrollTop();
      const height = $(document).height() - $(window).height();
      progressPath.style.strokeDashoffset = len - (scroll * len / height);
    }

    $progressWrap.on('click', e => {
      e.preventDefault();
      $('html, body').animate({ scrollTop: 0 }, 550);
    });

    $(window).on('scroll.progress', () => {
      updateProgress();
      updateHeader();
      $progressWrap.toggleClass('active-progress', $(window).scrollTop() > 150);
    });

    updateProgress();
  }

  /* ============================================================
     5. SMOOTH ANCHOR SCROLL
     ============================================================ */
  function initSmoothScroll() {
    $('a[href*="#"]')
      .not('[href="#"]')
      .not('[href="#0"]')
      .on('click', function (e) {
        if (
          location.pathname.replace(/^\//, '') !== this.pathname.replace(/^\//, '') ||
          location.hostname !== this.hostname
        ) return;

        const $target = $(this.hash).length
          ? $(this.hash)
          : $('[name=' + this.hash.slice(1) + ']');

        if (!$target.length) return;
        e.preventDefault();
        $('html, body').animate({ scrollTop: $target.offset().top }, 1000, function () {
          $target.focus();
          if (!$target.is(':focus')) {
            $target.attr('tabindex', '-1').focus();
          }
        });
      });
  }

  /* ============================================================
     6. DROPDOWN NAV (mobile)
     ============================================================ */
  function initDropdowns() {
    const $dropdowns = $('.navigation li.dropdown');

    $dropdowns.hover(
      function () {
        if ($(window).innerWidth() >= MOBILE_BREAKPOINT) {
          $(this).children('ul, .megamenu').stop(true, false, true).slideToggle(300);
        }
      },
      function () {
        if ($(window).innerWidth() >= MOBILE_BREAKPOINT) {
          $(this).children('ul, .megamenu').stop(true, false, true).slideToggle(300);
        }
      }
    );

    if ($('.main-header .navigation li.dropdown ul').length) {
      $dropdowns.append('<div class="dropdown-btn"><span class="fas fa-chevron-down"></span></div>');
      $('.main-header .navigation li.dropdown .dropdown-btn').on('click', function () {
        $(this).prev('ul').slideToggle(500);
        $(this).prev('.megamenu').slideToggle(800);
      });
      $('.navigation li.dropdown > a').on('click', e => e.preventDefault());
    }
  }

  /* ============================================================
     7. COUNTER ANIMATION
     ============================================================ */
  function initCounters() {
    if (!$.fn.appear || !$('.counter-text-wrap').length) return;
    $('.counter-text-wrap').appear(function () {
      const $t = $(this);
      const stop = $t.find('.count-text').attr('data-stop');
      const spd = parseInt($t.find('.count-text').attr('data-speed'), 10);
      if ($t.hasClass('counted')) return;
      $t.addClass('counted');
      $({ countNum: $t.find('.count-text').text() }).animate(
        { countNum: stop },
        {
          duration: spd,
          easing: 'linear',
          step() { $t.find('.count-text').text(Math.floor(this.countNum)); },
          complete() { $t.find('.count-text').text(this.countNum); }
        }
      );
    }, { accY: 0 });
  }

  /* ============================================================
     8. SCROLL-TO-TARGET (data-target attribute)
     ============================================================ */
  function initScrollToTarget() {
    $('.scroll-to-target').on('click', function () {
      const target = $(this).attr('data-target');
      if ($(target).length) {
        $('html, body').animate({ scrollTop: $(target).offset().top }, 1000);
      }
    });
  }

  /* ============================================================
     9. PLUGINS
     ============================================================ */
  function initPlugins() {
    // Nice Select
    if ($.fn.niceSelect && $('select').length) $('select').niceSelect();

    // WOW animations
    if (typeof WOW !== 'undefined' && $('.wow').length) {
      new WOW({ boxClass: 'wow', animateClass: 'animated', offset: 0, mobile: false, live: true }).init();
    }

    // Magnific Popup — project gallery
    if ($.fn.magnificPopup) {
      $('.project-image').each(function () {
        $(this).magnificPopup({
          delegate: '.work-popup',
          type: 'image',
          removalDelay: 300,
          mainClass: 'mfp-with-zoom',
          gallery: { enabled: true },
          zoom: { enabled: false }
        });
      });
      $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,
        fixedContentPos: false
      });
    }

    // Testimonial slider
    if ($.fn.slick && $('.testimonials-wrap').length) {
      $('.testimonials-wrap').slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        speed: 1000,
        prevArrow: '.testimonial-prev',
        nextArrow: '.testimonial-next',
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [{ breakpoint: 767, settings: { slidesToShow: 1 } }]
      });
    }

    // Isotope project grid
    const $grid = $('.project-masonry-active');
    if ($grid.length && $.fn.isotope && $.fn.imagesLoaded) {
      $grid.imagesLoaded(() => {
        $grid.isotope({ itemSelector: '.item', layoutMode: 'fitRows', percentPosition: true });
      });
      $('.project-filter li').on('click', function () {
        $('.project-filter li').removeClass('current');
        $(this).addClass('current');
        $grid.isotope({ filter: $(this).attr('data-filter') });
      });
    }
  }

  /* ============================================================
     10. MAP TOGGLE
     ============================================================ */
  function initMap() {
    if (!$('.map').length) return;
    $('.map').hide();
    $('.map_title').on('click', () => { $('.map').show(500); $('.map_title').hide(500); });
    $('.close_btn').on('click', () => { $('.map').hide(500); $('.map_title').show(500); });
  }

  /* ============================================================
     11. MARQUEE SCROLLER
     ============================================================ */
  function initScroller() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.scroller').forEach(scroller => {
      scroller.setAttribute('data-animated', 'true');
      const inner = scroller.querySelector('.scroller__inner');
      if (!inner) return;
      [...inner.children].forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        inner.appendChild(clone);
      });
    });
  }

  /* ============================================================
     12. LOGO LETTER HOVER
     ============================================================ */
  function initLogo() {
    $('.logo').on('mouseenter mouseleave', () => {
      $('.logo-letter').toggleClass('is-active');
    });
  }

  /* ============================================================
     13. FOOTER YEAR
     ============================================================ */
  function initYear() {
    const el = document.getElementById('currentYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================================
     14. POPOVER MENU (bottom nav)
     ============================================================ */
  function initPopover() {
    const pop = document.querySelector('[popover]');
    if (!pop) return;
    pop.addEventListener('toggle', async e => {
      if (e.newState !== 'open') return;
      await Promise.allSettled(pop.getAnimations().map(a => a.finished));
      pop.querySelector('[type=search]')?.focus();
    });
  }

  /* ============================================================
     15. SNAKE MENU + CARDS (services section)
     ============================================================ */
  function initSnakeMenu() {
    const wrapper = document.querySelector('.cards-wrapper');
    const track = document.getElementById('cardsTrack');
    const slides = document.querySelectorAll('.cards-slide');
    const menuCon = document.querySelector('.snake-menu-container');
    const menuItems = document.querySelectorAll('.menu-item');
    const stepsBar = document.getElementById('stepsBar');

    if (!wrapper || !track || !stepsBar) return;

    const DATA = [
      ['Requirements', 'System Design', 'DB Modeling', 'Core Impl.', 'Code Review'],
      ['API Design', 'Auth Layer', 'Endpoints', 'Rate Limit', 'API Docs'],
      ['Profiling', 'Bottlenecks', 'Caching', 'Queues', 'Monitoring'],
      ['DB Schema', 'Backend Core', 'API Layer', 'Frontend', 'Deploy'],
    ];

    let current = 0;

    function syncSlideWidths() {
      const w = wrapper.clientWidth;
      slides.forEach(s => s.style.width = w + 'px');
      track.style.transition = 'none';
      track.style.transform = `translateX(-${current * w}px)`;
      requestAnimationFrame(() => track.style.transition = '');
    }

    function buildSteps(labels) {
      stepsBar.innerHTML = '';

      // inject SVG overlay
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.classList.add('steps-svg');
      svg.setAttribute('id', 'steps-svg');
      stepsBar.appendChild(svg);

      labels.forEach((label, i) => {
        const btn = document.createElement('div');
        btn.className = `step-btn step-${i + 1}`;
        btn.innerHTML = `
            <div class="step-header">
                <span class="step-num">0${i + 1}</span>
                <div class="step-indicators">
                    <span class="end-dot"></span>
                    <span class="start-dot"></span>
                </div>
            </div>
            <span class="step-label">${label}</span>`;
        stepsBar.appendChild(btn);
      });

      // wire arrows after layout
      requestAnimationFrame(() => {
        const btns = [...stepsBar.querySelectorAll('.step-btn')];
        const barRect = stepsBar.getBoundingClientRect();

        // sync SVG size
        function syncSvg() {
          const r = stepsBar.getBoundingClientRect();
          svg.style.width = r.width + 'px';
          svg.style.height = r.height + 'px';
        }
        syncSvg();
        window.addEventListener('resize', syncSvg);

        function makePath(key) {
          let p = svg.querySelector('#' + key);
          if (!p) {
            p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('id', key);
            p.classList.add('step-arr-path');
            svg.appendChild(p);
          }
          return p;
        }

        function bez(p, x1, y1, x2, y2) {
          const mx = (x1 + x2) / 2;
          const lift = Math.abs(x2 - x1) * 0.45; // how high the arc goes above the cards
          p.setAttribute('d',
            `M${x1},${y1} C${mx},${y1 - lift} ${mx},${y2 - lift} ${x2},${y2}`);
        }

        btns.forEach((btn, i) => {
          // find neighbours
          const prev = btns[i - 1];
          const next = btns[i + 1];

          btn.addEventListener('mouseenter', () => {
            btn.classList.add('hi');
            const br = stepsBar.getBoundingClientRect();

            // draw arrow to next
            if (next) {
              next.classList.add('hi');
              const bRect = btn.getBoundingClientRect();
              const nRect = next.getBoundingClientRect();
              const src = btn.querySelector('.start-dot').getBoundingClientRect();
              const dst = next.querySelector('.end-dot').getBoundingClientRect();
              if (src.right < dst.left) {
                const p = makePath(`arr-${i}-${i + 1}`);
                bez(p,
                  src.left + src.width / 2 - br.left,
                  src.top + src.height / 2 - br.top,
                  dst.left + dst.width / 2 - br.left,
                  dst.top + dst.height / 2 - br.top
                );
                p.classList.add('on');
              }
            }

            // draw arrow from prev
            if (prev) {
              prev.classList.add('hi');
              const pSrc = prev.querySelector('.start-dot').getBoundingClientRect();
              const bDst = btn.querySelector('.end-dot').getBoundingClientRect();
              if (pSrc.right < bDst.left) {
                const p = makePath(`arr-${i - 1}-${i}`);
                bez(p,
                  pSrc.left + pSrc.width / 2 - br.left,
                  pSrc.top + pSrc.height / 2 - br.top,
                  bDst.left + bDst.width / 2 - br.left,
                  bDst.top + bDst.height / 2 - br.top
                );
                p.classList.add('on');
              }
            }
          });

          btn.addEventListener('mouseleave', () => {
            stepsBar.querySelectorAll('.step-btn').forEach(b => b.classList.remove('hi'));
            svg.querySelectorAll('.step-arr-path').forEach(p => p.classList.remove('on'));
          });
        });
      });
    }

    function goTo(i) {
      if (i === current) return;
      const dir = i < current ? 'right' : 'left';
      const opp = dir === 'right' ? 'left' : 'right';
      menuCon.className = `snake-menu-container ${opp} instant`;
      void menuCon.offsetHeight;
      menuCon.className = `snake-menu-container ${dir} pos${i}`;
      menuItems[current].classList.remove('active');
      menuItems[i].classList.add('active');
      track.style.transform = `translateX(-${i * wrapper.clientWidth}px)`;
      buildSteps(DATA[i]);
      current = i;
    }

    menuItems.forEach((item, i) => item.addEventListener('click', () => goTo(i)));
    window.addEventListener('resize', () => { syncSlideWidths(); buildSteps(DATA[current]); });
    syncSlideWidths();
    buildSteps(DATA[0]);
  }

  /* ============================================================
     16. MAGIC AREA (nav hover underline)
     ============================================================ */
  function initMagicArea() {
    const magicAreas = [...document.querySelectorAll('.c-magic-area')];
    if (!magicAreas.length || typeof gsap === 'undefined') return;

    function getAreaDetails(el) {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top + window.scrollY, width: el.clientWidth, height: el.clientHeight };
    }
    function setTween(link, area) { const d = getAreaDetails(link); gsap.set(area, d); }
    function tweenTo(link, area) { const d = getAreaDetails(link); gsap.to(area, 0.5, { ...d, ease: Power3.easeInOut }); }
    function getActive(links) { return links.find(l => l.classList.contains('is-magic-active') || l.getAttribute('aria-current') === 'page'); }

    function mount({ isResize } = {}) {
      magicAreas.forEach(area => {
        const selector = area.getAttribute('data-target-class');
        const links = [...document.querySelectorAll(selector)];
        if (!links.length) return;
        const active = getActive(links);
        setTween(active || links[0], area);
        if (!isResize) {
          const tweenBack = area.getAttribute('data-tween-back') === 'true';
          links.forEach(link => {
            link.addEventListener('mouseenter', e => tweenTo(e.target, area));
            link.addEventListener('focus', e => tweenTo(e.target, area));
            if (tweenBack && active) {
              link.addEventListener('mouseleave', () => tweenTo(active, area));
              link.addEventListener('focusout', () => tweenTo(active, area));
            }
          });
        }
      });
    }

    mount();
    window.addEventListener('resize', _.throttle(() => mount({ isResize: true }), 100));

    // Article links
    const articleLinks = document.querySelectorAll('.c-article__link');
    articleLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        articleLinks.forEach(l => l.classList.remove('is-magic-active'));
        link.classList.add('is-magic-active');
      });
      link.addEventListener('focus', () => link.dispatchEvent(new Event('mouseenter')));
    });
  }

  /* ============================================================
     17. SCROLL SPY (nav active link)
     ============================================================ */
  function initScrollSpy() {
    const SECTIONS = ['about', 'service', 'works', 'stories', 'contact'];
    const navLinks = document.querySelectorAll('.c-main-menu__link');
    if (!navLinks.length) return;

    function update() {
      const offset = window.innerHeight * 0.35;
      let current = '';
      SECTIONS.forEach(id => {
        const s = document.getElementById(id);
        if (s && s.getBoundingClientRect().top <= offset) current = id;
      });
      navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        link.classList.toggle('is-magic-active', href === current);
        link.toggleAttribute('aria-current', href === current);
      });
      initMagicArea();
    }

    window.addEventListener('scroll', _.throttle(update, 100), { passive: true });
    update();
  }

  /* ============================================================
     18. NAV COLLAPSE (mobile)
     ============================================================ */
  function initNavCollapse() {
    $('.nav-link-click').on('click', () => $('.navbar-collapse').collapse('hide'));
  }

  /* ============================================================
     19. OWL (ASCII footer animation)
     ============================================================ */
  function initOwl() {
    const owl = document.getElementById('owl');
    if (!owl) return;

    const OWL = {
      light: {
        idle: [`,___,\n[-,-]\n/)__)\n-"--"-`],
        nod: [`,___,\n[-,-]\n/)__)\n-"--"-`, `,___,\n[-,-]\n/)__>\n-"--"-`]
      },
      dark: {
        idle: [
          `,___,\n[o,o]\n/)__)\n~"--"~`,
          `,___,\n[o,-]\n/)__)\n~"--"~`,
          `,___,\n[-,o]\n/)__)\n~"--"~`
        ],
        nod: [`,___,\n[o,o]\n/)__)\n~"--"~`, `,___,\n[o,o]\n/)__>\n~"--"~`]
      },
      scroll: [`,___,\n[o,o]\n<(__)\n/)__)\n~"--"~`, `,___,\n[o,o]\n/)__>\n~"--"~`],
      fly: [`,___,\n[o,o]\n/)__>\n~"--"~`, `,___,\n[o,o]\n<(__)\n~"--"~`, `,___,\n[o,o]\n/)__>\n~"--"~`]
    };

    let interval = null;
    let idleTimer = null;

    const theme = () => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

    function play(frames, speed = 1200, once = false) {
      clearInterval(interval);
      let i = 0;
      interval = setInterval(() => {
        owl.textContent = frames[i++];
        if (i >= frames.length) {
          if (once) { clearInterval(interval); startIdle(); }
          else i = 0;
        }
      }, speed);
    }

    function startIdle() { play(OWL[theme()].idle, 1400); }
    function nod() { play(OWL[theme()].nod, 180, true); }

    function flyAway() {
      clearInterval(interval);
      let fi = 0;
      const fi_iv = setInterval(() => { owl.textContent = OWL.fly[fi++ % OWL.fly.length]; }, 120);
      owl.style.cssText = 'transition:transform .8s ease,opacity .6s ease;transform:translateY(-40px) scale(.9);opacity:0';
      setTimeout(() => clearInterval(fi_iv), 700);
    }

    function returnOwl() {
      owl.style.cssText = 'transition:none;transform:translateY(0);opacity:0';
      setTimeout(() => {
        owl.style.cssText = 'transition:opacity .6s ease;opacity:.85';
        startIdle();
      }, 100);
    }

    function handleRouteChange() { flyAway(); setTimeout(returnOwl, 900); }

    function resetIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(startIdle, 6000);
    }

    new MutationObserver(() => { nod(); }).observe(document.documentElement, {
      attributes: true, attributeFilter: ['data-theme']
    });

    owl.addEventListener('mouseenter', () => play(OWL.dark.idle, 300));
    owl.addEventListener('mouseleave', startIdle);

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const now = Date.now();
      if (now - lastScroll < 1200) return;
      lastScroll = now;
      play(OWL.scroll, 200, true);
    });

    ['mousemove', 'keydown', 'scroll'].forEach(evt => document.addEventListener(evt, resetIdle));

    document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', handleRouteChange));
    window.addEventListener('hashchange', handleRouteChange);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(interval); else startIdle();
    });

    startIdle();
  }

  /* ============================================================
     20. PRELOADER (window load)
     ============================================================ */
  function initPreloader() {
    if (sessionStorage.getItem('visited')) return;
    sessionStorage.setItem('visited', 'true');

    if (typeof gsap === 'undefined') {
      document.querySelector('.preloader').style.display = 'none';
      return;
    }

    const svg = document.getElementById('preloaderSvg');
    if (!svg) return;

    const curve = 'M0 502S175 272 500 272s500 230 500 230V0H0Z';
    const flat = 'M0 2S175 1 500 1s500 1 500 1V0H0Z';

    gsap.timeline()
      .to('.preloader-heading .load-text', {
        delay: 0.5,
        y: -100,
        opacity: 0,
        duration: 0.3
      })
      .to(svg, { duration: 0.3, attr: { d: curve }, ease: 'power2.easeIn' })
      .to(svg, { duration: 0.3, attr: { d: flat }, ease: 'power2.easeOut' })
      .to('.preloader', { y: -1500, duration: 0.35 })
      .to('.preloader', { zIndex: -1, display: 'none' });
  }

  /* ============================================================
     21. ISOTOPE RE-LAYOUT ON LOAD
     ============================================================ */
  function initIsotopeOnLoad() {
    if (!$.fn.isotope || !$.fn.imagesLoaded) return;
    [$('.project-masonry-active'), $('.blog-standard-wrap')].forEach($g => {
      if (!$g.length) return;
      $g.imagesLoaded(() => {
        if ($g.data('isotope')) $g.isotope('layout');
        else $g.isotope({ itemSelector: '.item', layoutMode: 'fitRows', percentPosition: true });
      });
    });
  }

  /* ============================================================
     22. WINDOW RESIZE — collapse dropdowns
     ============================================================ */
  $(window).on('resize', () => {
    $('.navigation li.dropdown').children('ul, .megamenu').hide();
  });

  /* ============================================================
     INIT
     ============================================================ */
  $(document).ready(function () {
    initPreloader();
    initNavCollapse();
    initScrollTop();
    initSmoothScroll();
    initDropdowns();
    initCounters();
    initScrollToTarget();
    initPlugins();
    initMap();
    initScroller();
    initLogo();
    initYear();
    initPopover();
    initSnakeMenu();
    initMagicArea();
    initScrollSpy();
    initOwl();
    updateHeader();
  });

  $(window).on('load', function () {
    initIsotopeOnLoad();
  });

})(jQuery);