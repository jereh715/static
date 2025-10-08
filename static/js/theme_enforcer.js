// theme-enforcer.js
(function() {
  /**
   * Detect the current theme preference.
   * Returns 'dark' or 'light'
   */
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Adjusts CSS variables or inline styles to flip colors when dark mode is active.
   * This modifies only white (#fff, white) and black (#000, black) colors.
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
        html, body {
          background-color: #000 !important;
          color: #fff !important;
        }
        * {
          color-scheme: dark;
        }
        /* Flip all black/white colors */
        * {
          /* Text & backgrounds */
          --light-replace: #000 !important;
          --dark-replace: #fff !important;
        }

        /* Replace pure white backgrounds */
        *[style*="background-color: white"],
        *[style*="background-color: #fff"],
        *[style*="background-color:#fff"] {
          background-color: #000 !important;
        }

        /* Replace pure black backgrounds */
        *[style*="background-color: black"],
        *[style*="background-color: #000"],
        *[style*="background-color:#000"] {
          background-color: #fff !important;
        }

        /* Replace text colors */
        *[style*="color: white"],
        *[style*="color: #fff"],
        *[style*="color:#fff"] {
          color: #000 !important;
        }

        *[style*="color: black"],
        *[style*="color: #000"],
        *[style*="color:#000"] {
          color: #fff !important;
        }

        /* Optional: Adjust border colors */
        *[style*="border-color: black"] {
          border-color: #fff !important;
        }

        *[style*="border-color: white"] {
          border-color: #000 !important;
        }
      `;
    } else {
      // Light mode: remove injected overrides
      styleTag.textContent = "";
    }
  }

  // Run on load
  const currentTheme = getSystemTheme();
  enforceTheme(currentTheme);

  // React to system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    enforceTheme(e.matches ? 'dark' : 'light');
  });
})();
