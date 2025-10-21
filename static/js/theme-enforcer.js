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
          filter: invert(1) hue-rotate(160deg);
          background-color: #121212 !important; /* Dark grey, not pure black */
          color-scheme: dark;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        /* Re-invert images and media so they appear normal */
        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* Re-invert ONLY the menu button so it stays visible */
        #menu-btn {
          filter: invert(1) hue-rotate(180deg) !important;
        }

        /* Darker background behind menu button for visibility */
        #menu-btn {
          background: #1e1e1e !important; /* Slightly lighter grey for contrast */
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
