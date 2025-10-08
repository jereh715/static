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
        html {
          filter: invert(1) hue-rotate(180deg);
          background-color: #000 !important;
          color-scheme: dark;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        /* Re-invert media (so they stay normal) */
        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* 🧊 Prevent inversion for light UI elements (like hamburger menu) */
        #hamburger-menu,
        #menu-btn,
        #menu-panel,
        #menu-overlay {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* Optional small cleanup */
        * {
          box-shadow: none;
        }
      `;
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
        #hamburger-menu,
        #menu-btn,
        #menu-panel,
        #menu-overlay {
          filter: none !important;
        }
      `;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const theme = getSystemTheme();
    enforceTheme(theme);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    enforceTheme(e.matches ? 'dark' : 'light');
  });
})();
