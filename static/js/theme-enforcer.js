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

        /* ⚫ Force dark backgrounds for transparent elements */
        * {
          background-color: rgba(10, 10, 10, 0.85) !important;
          /* Ensures text readability on dark */
          color: inherit;
        }

        /* But let key layout containers remain clean */
        body, html, #results, .product, .search-container {
          background-color: #000 !important;
        }

        /* Restore expected transparency for overlays & popups */
        #overlay,
        #menu-overlay,
        #storeOverlay {
          background-color: rgba(0, 0, 0, 0.7) !important;
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

        * {
          background-color: transparent !important;
          color: inherit;
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
