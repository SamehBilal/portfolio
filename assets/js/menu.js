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
