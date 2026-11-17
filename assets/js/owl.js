// this file's URL (currentScript is null when loaded as a module, so fall back to a lookup)
const OWL_SRC = (document.currentScript || document.querySelector('script[src*="owl.js"]') || {}).src || '';

/* Footer pet: on each page load show the orca (3 in 4) or the owl (1 in 4).
   Shared by main.js and owl.js — whichever runs first decides; the orca script is
   loaded only when it's picked, and the owl stays as the fallback if it fails. */
window.footerPet = window.footerPet || function (owlEl, startOwl, base) {
  if (!owlEl) return;
  const pick = window.__footerPick || (window.__footerPick = Math.random() < 0.75 ? 'orca' : 'owl');
  if (pick === 'owl') return startOwl();
  if (window.__orcaRequested) return;          // main.js + owl.js on one page: swap once
  window.__orcaRequested = true;
  owlEl.style.visibility = 'hidden';           // no flash of the owl while orca.js loads

  const swap = () => {
    const orca = document.createElement('span');
    orca.id = 'orca';
    orca.className = 'ascii orca';
    orca.dataset.len = '34';
    orca.setAttribute('aria-hidden', 'true');
    owlEl.replaceWith(orca);
    const sr = orca.nextElementSibling;
    if (sr && sr.classList.contains('sr-only')) sr.textContent = 'Decorative orca animation indicating site activity';
    window.AsciiOrca.mount([orca]);
  };

  if (window.AsciiOrca) return swap();
  const s = document.createElement('script');
  s.src = new URL('orca.js', base || location.href).href;
  s.onload = swap;
  s.onerror = () => { window.__footerPick = 'owl'; owlEl.style.visibility = ''; startOwl(); };
  document.head.appendChild(s);
};

$(document).ready(function () {


    $(".logo").hover(function () {
        $('.logo-letter').toggleClass('is-active');
    });
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    const owl = document.getElementById("owl");
    if (!owl) return;
    window.footerPet(owl, runOwl, OWL_SRC);

    function runOwl() {

    /* === OWL FRAMES === */

    const OWL = {
        light: {
            idle: [
                `,___,
[-,-]
/)__)
-"--"-`,
                `,___,
[-,-]
/)__)
-"--"-`
            ],
            nod: [
                `,___,
[-,-]
/)__)
-"--"-`,
                `,___,
[-,-]
/)__>
-"--"-`
            ]
        },

        dark: {
            idle: [
                `,___,
[o,o]
/)__)
~"--"~`,
                `,___,
[o,-]
/)__)
~"--"~`,
                `,___,
[-,o]
/)__)
~"--"~`
            ],
            nod: [
                `,___,
[o,o]
/)__)
~"--"~`,
                `,___,
[o,o]
/)__>
~"--"~`
            ]
        },

        scroll: [
            `,___,
[o,o]
<(__)
/)__)
~"--"~`,
            `,___,
[o,o]
/)__>
~"--"~`
        ]
    };

    OWL.fly = [
        `,___,
[o,o]
/)__>
~"--"~`,
        `,___,
[o,o]
<(__)
~"--"~`,
        `,___,
[o,o]
/)__>
~"--"~`
    ];


    let frames = [];
    let index = 0;
    let interval = null;
    let idleTimer = null;

    /* =========================
       THEME HANDLING (yours)
    ========================= */

    function currentTheme() {
        return document.documentElement.dataset.theme === "dark"
            ? "dark"
            : "light";
    }

    function setIdleFrames() {
        frames = OWL[currentTheme()].idle;
    }

    function flyAway() {
        clearInterval(interval);

        let flyIndex = 0;
        const flyFrames = OWL.fly;

        const flyInterval = setInterval(() => {
            owl.textContent = flyFrames[flyIndex % flyFrames.length];
            flyIndex++;
        }, 120);

        owl.style.transition = "transform 0.8s ease, opacity 0.6s ease";
        owl.style.transform = "translateY(-40px) scale(0.9)";
        owl.style.opacity = "0";

        setTimeout(() => {
            clearInterval(flyInterval);
        }, 700);
    }

    function returnOwl() {
        owl.style.transition = "none";
        owl.style.transform = "translateY(0)";
        owl.style.opacity = "0";

        setTimeout(() => {
            owl.style.transition = "opacity 0.6s ease";
            owl.style.opacity = "0.85";
            startIdle();
        }, 100);
    }

    function handleRouteChange() {
        flyAway();
        setTimeout(returnOwl, 900);
    }

    /* Watch theme changes */
    new MutationObserver(() => {
        nod();
        setIdleFrames();
    }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
    });

    setIdleFrames();

    /* =========================
       ANIMATION ENGINE
    ========================= */

    function play(frameset, speed = 1200, once = false) {
        clearInterval(interval);
        index = 0;

        interval = setInterval(() => {
            owl.textContent = frameset[index];
            index++;

            if (index >= frameset.length) {
                if (once) {
                    clearInterval(interval);
                    startIdle();
                } else {
                    index = 0;
                }
            }
        }, speed);
    }

    function startIdle() {
        setIdleFrames();
        play(frames, 1400);
    }

    function nod() {
        play(OWL[currentTheme()].nod, 180, true);
    }

    /* =========================
       INTERACTIONS
    ========================= */

    // Hover → wake up
    owl.addEventListener("mouseenter", () => {
        play(OWL.dark.idle, 300);
    });

    owl.addEventListener("mouseleave", startIdle);

    // Scroll → curious glance
    let scrolling = false;
    window.addEventListener("scroll", () => {
        if (scrolling) return;
        scrolling = true;

        play(OWL.scroll, 200, true);

        setTimeout(() => (scrolling = false), 600);
    });

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const now = Date.now();
        if (now - lastScroll < 1200) return;
        lastScroll = now;

        play(OWL.scroll, 200, true);
    });

    // Idle detection (extra sleepy)
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(startIdle, 6000);
    }

    ["mousemove", "keydown", "scroll"].forEach(evt =>
        document.addEventListener(evt, resetIdleTimer)
    );

    /* Anchor link clicks */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", handleRouteChange);
    });

    /* Back / forward navigation */
    window.addEventListener("hashchange", handleRouteChange);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearInterval(interval);
        else startIdle();
    });

    //startIdle();
    }
})