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
        html, body {
          background-color: #121212 !important; /* dark grey instead of white */
          color: #e0e0e0 !important; /* light grey text for readability */
          color-scheme: dark;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Keep images and media as they are */
        img, picture, video, iframe, canvas, svg {
          filter: none !important;
        }

        /* Menu button styling in dark mode */
        #menu-btn {
          background: #1e1e1e !important;
          color: #ffffff !important;
          border-color: #444 !important;
        }
      `;
    } else {
      style.textContent = `
        html, body {
          background-color: #ffffff !important; /* white for light mode */
          color: #000000 !important; /* black text */
          color-scheme: light;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        img, picture, video, iframe, canvas, svg {
          filter: none !important;
        }

        #menu-btn {
          background: #ffffff !important;
          color: #000000 !important;
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
