const config = {
  speed: 0.35,
  backdrop: false,
  theme: 'light'
};

const update = () => {
  document.documentElement.dataset.theme = config.theme;
  document.documentElement.dataset.backdrop = config.backdrop;
  document.documentElement.style.setProperty('--speed', config.speed);
};

const sync = event => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'Theme')

    return update();
  document.startViewTransition(() => update());
};

update();

const pop = document.querySelector('[popover]');
if (pop) {
  pop.addEventListener('toggle', async event => {
    if (event.newState === 'open') {
      await Promise.allSettled(pop.getAnimations().map(a => a.finished));
      pop.querySelector('[type=search]').focus();
    }
  });
}

const themeToggler = document.querySelector('.theme-toggler');
if (themeToggler) {
  themeToggler.addEventListener('click', () => {
    const options = ['system', 'light', 'dark'];
    const index = options.indexOf(config.theme);
    const newTheme = options.at(index + 1 > options.length - 1 ? 0 : index + 1);
    config.theme = newTheme;

    sync({
      target: {
        controller: {
          view: {
            labelElement: {
              innerText: 'Theme'
            }
          }
        }
      }
    });

  });
}


const container = document.querySelector(".container-snake");
const menu = document.querySelector(".menu-snake");
const items = document.querySelectorAll(".item-snake");
let current = 0;
items.forEach((item, i) =>
  item.addEventListener("click", () => {
    if (i < current) {
      // ltr
      container.className = "container-snake right instant";
      void container.offsetHeight; // force reflow
      container.className = `container-snake left pos${i}`;
    } else if (i > current) {
      // rtl
      container.className = "container-snake left instant";
      void container.offsetHeight; // force reflow
      container.className = `container-snake right pos${i}`;
    }
    current = i;
  })
);




const magicAreas = [...document.querySelectorAll(".c-magic-area")];

const getAreaDetails = (area) => {
  const width = area.clientWidth;
  const height = area.clientHeight;

  const position = area.getBoundingClientRect();
  const top = position.top + window.scrollY;
  const left = position.left;
  //console.log(position.top);
  return {
    left,
    height,
    top,
    width
  };
};

const setTweenArea = (link, magicArea) => {
  const { left, height, top, width } = getAreaDetails(link);

  gsap.set(magicArea, {
    top,
    left,
    width,
    height
  });
};

const tweenMagicArea = (target, magicArea) => {
  const { left, height, top, width } = getAreaDetails(target);

  gsap.to(magicArea, 0.5, {
    left,
    top,
    width,
    height,
    ease: Power3.easeInOut
  });
};

const getMagicActiveElement = (links) => {
  return links.filter((link) => {
    return (
      link.classList.contains("is-magic-active") ||
      link.getAttribute("aria-current") === "page"
    );
  });
};

const moveMagicArea = (links, magicArea, isTweenBack) => {
  const magicActiveElement = getMagicActiveElement(links);

  links.map((link) => {
    link.addEventListener("mouseenter", function (e) {
      tweenMagicArea(e.target, magicArea);
    });

    link.addEventListener("focus", function (e) {
      tweenMagicArea(e.target, magicArea);
    });

    if (isTweenBack && magicActiveElement.length) {
      link.addEventListener("mouseleave", function (e) {
        tweenMagicArea(magicActiveElement[0], magicArea);
      });

      link.addEventListener("focusout", function (e) {
        tweenMagicArea(magicActiveElement[0], magicArea);
      });
    }
  });
};

const setMagic = (links, magicArea) => {
  // check if .is-magic-active || aria-current="page"
  const magicActiveElement = getMagicActiveElement(links);

  if (magicActiveElement.length) {
    setTweenArea(magicActiveElement[0], magicArea);
  } else {
    setTweenArea(links[0], magicArea);
  }
};

// const onResize = (links, magicArea) => {
//   setMagic(links, magicArea);
// };

const initMagic = ({ isResize } = { isResize: false }) => {
  if (!magicAreas.length) return;

  magicAreas.map((magicArea) => {
    const targetMagicArea = magicArea.getAttribute("data-target-class");

    const links = [...document.querySelectorAll(targetMagicArea)];

    if (!links.length) return;

    setMagic(links, magicArea);

    if (!isResize) {
      const isTweenBack = magicArea.getAttribute("data-tween-back") === "true";

      moveMagicArea(links, magicArea, isTweenBack);
    }
  });
};

initMagic();

const articleLinks = document.querySelectorAll(".c-article__link");

articleLinks.forEach(link => {
  link.addEventListener("mouseenter", () => {
    articleLinks.forEach(l => l.classList.remove("is-magic-active"));
    link.classList.add("is-magic-active");
  });
});

window.addEventListener(
  "resize",
  _.throttle(function () {
    initMagic({ isResize: true });
  }, 100)
);

VanillaTilt.init(document.querySelector(".c-fe30__inner"), {
  max: 20,
  perspective: 1000,
  speed: 300
});

articleLinks.forEach(link => {
  link.addEventListener("focus", () => link.dispatchEvent(new Event("mouseenter")));
});


















/* ── Data ── */
const slides = [
  ["Requirements", "System Design", "DB Modeling", "Core Impl.", "Code Review"],
  ["API Design", "Auth Layer", "Endpoints", "Rate Limit", "API Docs"],
  ["Profiling", "Bottlenecks", "Caching", "Queues", "Monitoring"],
  ["DB Schema", "Backend Core", "API Layer", "Frontend", "Deploy"],
];

/* ── Measure wrapper width and sync slide widths ── */
const wrapper = document.querySelector(".cards-wrapper");
const track = document.getElementById("cardsTrack");
const allSlides = document.querySelectorAll(".cards-slide");
let currentx = 0;

if (!wrapper || !track || !allSlides.length) {
  function syncSlideWidths() {
    if (!wrapper) return;
    const w = wrapper.clientWidth;
    allSlides.forEach(s => s.style.width = w + "px");
    // re-apply current translate so position stays correct
    track.style.transition = "none";
    track.style.transform = `translateX(-${currentx * w}px)`;
    // restore transition on next frame
    requestAnimationFrame(() => track.style.transition = "");
  }

  window.addEventListener("resize", () => { syncSlideWidths(); buildSteps(slides[currentx]); });
  syncSlideWidths();
}

/* ── Steps renderer ── */
const stepsBar = document.getElementById("stepsBar");

function buildSteps(labels) {
  if (!stepsBar || !labels) return;
  stepsBar.innerHTML = "";

  labels.forEach((label, i) => {
    const btn = document.createElement("div");
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

  // Build connector arrows after layout is painted
  requestAnimationFrame(() => {
    const btns = stepsBar.querySelectorAll(".step-btn");
    const barRect = stepsBar.getBoundingClientRect();

    for (let i = 0; i < btns.length - 1; i++) {
      const fromBtn = btns[i];
      const toBtn = btns[i + 1];
      const fromDot = fromBtn.querySelector(".start-dot");
      const toDot = toBtn.querySelector(".end-dot");

      const fR = fromDot.getBoundingClientRect();
      const tR = toDot.getBoundingClientRect();

      // Skip if dots overlap (happens when buttons are too narrow)
      if (fR.right >= tR.left) continue;

      const arrow = document.createElement("div");
      arrow.className = `step-arrow arrow-${i + 1}-${i + 2}`;

      const top = Math.min(fR.top, tR.top) - barRect.top - 36;
      const left = fR.left + fR.width / 2 - barRect.left;
      const right = barRect.right - (tR.left + tR.width / 2);
      const height = 36;

      arrow.style.cssText = `top:${top}px;left:${left}px;right:${right}px;height:${height}px;`;
      stepsBar.appendChild(arrow);

      // Hover on either adjacent step shows the arrow
      [fromBtn, toBtn].forEach(btn => {
        btn.addEventListener("mouseenter", () => {
          arrow.style.opacity = "1";
          arrow.style.transition = "none";
        });
        btn.addEventListener("mouseleave", () => {
          arrow.style.opacity = "0";
          arrow.style.transition = "opacity 0.15s";
        });
      });
    }
  });
}

buildSteps(slides[0]);

/* ── Snake Menu ── */
const menuContainer = document.querySelector(".snake-menu-container");
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach((item, i) => {
  item.addEventListener("click", () => {
    if (!wrapper || !track) return;
    if (i === currentx) return;
    const dir = i < currentx ? "right" : "left";
    const opp = dir === "right" ? "left" : "right";

    menuContainer.className = `snake-menu-container ${opp} instant`;
    void menuContainer.offsetHeight;
    menuContainer.className = `snake-menu-container ${dir} pos${i}`;

    menuItems[currentx].classList.remove("active");
    menuItems[i].classList.add("active");

    const w = wrapper.clientWidth;
    track.style.transform = `translateX(-${i * w}px)`;

    buildSteps(slides[i]);
    currentx = i;
  });
});


// Scroll spy: update active nav link based on section in view
const sections = ['about', 'service', 'works', 'stories', 'contact'];
const navLinks = document.querySelectorAll('.c-main-menu__link');

function updateActiveLink() {
  let current = '';
  const offset = window.innerHeight * 0.35;

  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= offset) {
      current = id;
    }
  });

  navLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('is-magic-active', href === current);
    link.toggleAttribute('aria-current', href === current);
  });

  // Re-run magic area to follow the new active link
  initMagic();
}

window.addEventListener('scroll', _.throttle(updateActiveLink, 100), { passive: true });
updateActiveLink();