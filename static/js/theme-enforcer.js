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
        /* Invert everything for dark mode */
        html {
          filter: invert(1) hue-rotate(180deg);
          background-color: #A9A9A9 !important;
          color-scheme: dark;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        /* Re-invert images and media so they appear normal */
        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* 🟡 Re-invert ONLY the menu button so it stays visible */
        #menu-btn {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* Optional: make background behind menu button slightly darker */
        #menu-btn {
          background: #111 !important;
          color: #fff !important;
          border-color: #444 !important;
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
        #menu-btn {
          filter: none !important;
          background: #fff !important;
          color: #000 !important;
          border-color: #ccc !important;
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
