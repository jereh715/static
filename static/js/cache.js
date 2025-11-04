// cache-watcher.js — single persistent popup showing current store
document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ cache-watcher.js loaded — single popup store tracker active");

  let lastShownSource = null;
  let popupEl = null;

  // 🧩 Get the latest store/source name from cache
  function getLastProductSource() {
    try {
      const saved = JSON.parse(localStorage.getItem("lastSearchResults") || "[]");
      if (!Array.isArray(saved) || saved.length === 0) return null;
      const last = saved[saved.length - 1];
      return last.source || last.store || "Unknown Store";
    } catch {
      return null;
    }
  }

  // 🧩 Create or update the persistent popup
  function updatePopup(message) {
    // Use global showDebugPopup if available AND it supports live updates
    if (typeof showDebugPopup === "function" && !window.forceLocalPopup) {
      // Instead of spawning new popups, we reuse one DOM element
      if (!popupEl) {
        popupEl = document.createElement("div");
        popupEl.id = "cacheWatcherPopup";
        Object.assign(popupEl.style, {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "#333",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 9999,
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "opacity 0.3s ease",
          opacity: "0.95"
        });
        document.body.appendChild(popupEl);
      }
      popupEl.textContent = message;
    } else {
      // Fallback if showDebugPopup not available
      if (!popupEl) {
        popupEl = document.createElement("div");
        popupEl.id = "cacheWatcherPopup";
        Object.assign(popupEl.style, {
          position: "fixed",
          bottom: "24px",
          right: "24px",
          background: "#333",
          color: "#fff",
          padding: "10px 16px",
          borderRadius: "8px",
          fontSize: "14px",
          zIndex: 9999,
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          transition: "opacity 0.3s ease",
          opacity: "0.95"
        });
        document.body.appendChild(popupEl);
      }
      popupEl.textContent = message;
    }
  }

  // 🧩 Remove popup when done
  function removePopup() {
    if (popupEl) {
      popupEl.remove();
      popupEl = null;
    }
  }

  // 🔄 Watch spinnerChange events
  document.addEventListener("spinnerChange", (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      // Prevent multiple intervals
      if (window.cacheWatcherInterval) clearInterval(window.cacheWatcherInterval);

      updatePopup("🌀 Searching stores...");
      window.cacheWatcherInterval = setInterval(() => {
        const source = getLastProductSource();
        if (source && source !== lastShownSource) {
          lastShownSource = source;
          updatePopup(`🌀 Searching ${source}...`);
        }
      }, 500);
    } else {
      // Stop polling
      if (window.cacheWatcherInterval) {
        clearInterval(window.cacheWatcherInterval);
        window.cacheWatcherInterval = null;
      }

      const source = getLastProductSource();
      if (source) updatePopup(`✅ Finished searching ${source}`);
      else updatePopup("✅ Search complete.");

      // Fade out popup a few seconds later
      setTimeout(removePopup, 3000);
      lastShownSource = null;
    }
  });
});
