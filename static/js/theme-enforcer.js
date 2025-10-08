// theme-enforcer.js
(function() {
  /**
   * Detect the user's system theme.
   * @returns {'light' | 'dark'}
   */
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Apply or remove dark-mode inversion.
   * Uses filter inversion + hue rotation to flip colors cleanly.
   */
  function enforceTheme(theme) {
    const styleId = "theme-enforcer-style";
    let styleTag = document.getElementById(styleId);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    if (theme === "dark") {
      styleTag.textContent = `
        html {
          filter: invert(1) hue-rotate(180deg);
          background-color: #000 !important;
          color-scheme: dark;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }

        /* Re-invert images, videos, and embedded media so they appear normal */
        img, picture, video, iframe, canvas, svg {
          filter: invert(1) hue-rotate(180deg) !important;
          transition: filter 0.3s ease;
        }

        /* Optional: tweak shadows and outlines a bit */
        * {
          box-shadow: none;
        }
      `;
    } else {
      styleTag.textContent = `
        html {
          filter: none;
          background-color: #fff !important;
          color-scheme: light;
          transition: filter 0.3s ease, background-color 0.3s ease;
        }
        img, picture, video, iframe, canvas, svg {
          filter: none !important;
        }
      `;
    }
  }

  // Apply the theme once the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    const currentTheme = getSystemTheme();
    enforceTheme(currentTheme);
  });

  // Watch for system theme changes in real time
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', e => {
    enforceTheme(e.matches ? 'dark' : 'light');
  });
})();
