// theme-enforcer.js
(function() {
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function enforceTheme(theme) {
    const id = "theme-enforcer-style";
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.head.appendChild(style);
    }

    if (theme === "dark") {
      style.textContent = `
        /* 🌑 Global dark mode inversion */
        html {
          filter: invert(1) hue-rotate(180deg);
          background-color: #000 !important;
          color-scheme: dark;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        /* Re-invert media so they appear normal */
        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* 🟡 Menu button correction */
        #menu-btn {
          filter: invert(1) hue-rotate(180deg) !important;
          background: #111 !important;
          color: #fff !important;
          border-color: #444 !important;
        }

        /* Overlays retain translucent darkness */
        #overlay,
        #menu-overlay,
        #storeOverlay {
          background-color: rgba(0, 0, 0, 0.7) !important;
        }

        /* Core containers stay solid black */
        body, html, #results, .product, .search-container {
          background-color: #000 !important;
        }
      `;

      // After CSS inversion, run JS-based dark background enforcement
      setTimeout(forceDarkBackgrounds, 100);

    } else {
      style.textContent = `
        html {
          filter: none;
          background-color: #fff !important;
          color-scheme: light;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        img, picture, video, iframe, canvas, svg {
          filter: none !important;
        }

        #menu-btn {
          filter: none !important;
          background: #fff !important;
          color: #000 !important;
          border-color: #ccc !important;
        }
      `;

      // Remove forced dark backgrounds
      document.querySelectorAll("[data-dark-bg]").forEach(el => {
        el.style.backgroundColor = "";
        el.removeAttribute("data-dark-bg");
      });
    }
  }

  // 🧠 Dynamically find transparent / background-none elements
  function forceDarkBackgrounds() {
    const elements = document.querySelectorAll("*");
    elements.forEach(el => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const bgImg = style.backgroundImage;

      const isTransparent =
        bg === "rgba(0, 0, 0, 0)" ||
        bg === "transparent" ||
        bg === "inherit" ||
        bg === "initial";

      const hasNoBackgroundImage =
        !bgImg || bgImg === "none" || bgImg === "initial";

      if (isTransparent && hasNoBackgroundImage) {
        el.style.backgroundColor = "rgba(10, 10, 10, 0.85)";
        el.setAttribute("data-dark-bg", "true");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const theme = getSystemTheme();
    enforceTheme(theme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    enforceTheme(e.matches ? 'dark' : 'light');
  });
})();
