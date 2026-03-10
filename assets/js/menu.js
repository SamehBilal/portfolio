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
pop.addEventListener('toggle', async event => {
  if (event.newState === 'open') {
    await Promise.allSettled(pop.getAnimations().map(a => a.finished));
    pop.querySelector('[type=search]').focus();
  }
});

const themeToggler = document.querySelector('.theme-toggler');
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

    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4]   // linear 1→2→3→4→5
    ];

    /* ── Steps renderer ── */
    const stepsBar = document.getElementById("stepsBar");

    function buildSteps(labels) {
      stepsBar.innerHTML = "";

      // 3 step buttons
      labels.forEach((label, i) => {
        const btn = document.createElement("div");
        btn.className = `step-btn step-${i + 1}`;
        btn.innerHTML = `
      <div class="step-header">
        <span class="step-num">0${i + 1}</span>
        <div class="step-indicators">
          <span class="end-dot"   style="anchor-name: --s${i + 1}-end"></span>
          <span class="start-dot" style="anchor-name: --s${i + 1}-start"></span>
        </div>
      </div>
      <span class="step-label">${label}</span>`;
        stepsBar.appendChild(btn);
      });

      // 2 connector arrows using JS-computed positions (anchor API fallback)
      requestAnimationFrame(() => {
        for (let i = 0; i < 2; i++) {
          const fromBtn = stepsBar.querySelectorAll(".step-btn")[i];
          const toBtn = stepsBar.querySelectorAll(".step-btn")[i + 1];
          if (!fromBtn || !toBtn) continue;

          const fromDot = fromBtn.querySelector(".start-dot");
          const toDot = toBtn.querySelector(".end-dot");
          const barRect = stepsBar.getBoundingClientRect();
          const fR = fromDot.getBoundingClientRect();
          const tR = toDot.getBoundingClientRect();

          const arrow = document.createElement("div");
          arrow.className = `step-arrow arrow-${i + 1}-${i + 2}`;

          const top = Math.min(fR.top, tR.top) - barRect.top - 18;
          const left = fR.left + fR.width / 2 - barRect.left;
          const right = barRect.right - (tR.left + tR.width / 2);
          const height = 18;

          arrow.style.cssText = `
        top:${top}px; left:${left}px; right:${right}px; height:${height}px;
      `;
          stepsBar.appendChild(arrow);

          // show arrow on hover of adjacent steps
          const s1 = stepsBar.querySelectorAll(".step-btn")[i];
          const s2 = stepsBar.querySelectorAll(".step-btn")[i + 1];
          [s1, s2].forEach(s => {
            s.addEventListener("mouseenter", () => { arrow.style.opacity = "1"; arrow.style.transition = "none"; });
            s.addEventListener("mouseleave", () => { arrow.style.opacity = "0"; arrow.style.transition = "opacity 0.15s"; });
          });
        }
      });
    }

    buildSteps(slides[0]);

    /* ── Snake Menu ── */
    const menuContainer = document.querySelector(".snake-menu-container");
    const menuItems = document.querySelectorAll(".menu-item");
    const track = document.getElementById("cardsTrack");
    let currentx = 0;

    menuItems.forEach((item, i) => {
      item.addEventListener("click", () => {
        if (i === currentx) return;
        if (i < currentx) {
          menuContainer.className = "snake-menu-container right instant";
          void menuContainer.offsetHeight;
          menuContainer.className = `snake-menu-container left pos${i}`;
        } else {
          menuContainer.className = "snake-menu-container left instant";
          void menuContainer.offsetHeight;
          menuContainer.className = `snake-menu-container right pos${i}`;
        }
        menuItems[currentx].classList.remove("active");
        menuItems[i].classList.add("active");
        track.style.transform = `translateX(-${i * 810}px)`;
        buildSteps(slides[i]);
        currentx = i;
      });
    });