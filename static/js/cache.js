// cache-watcher.js — listens for spinnerChange and reports active store
document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ cache-watcher.js loaded — live store tracker active");

  // Helper: safely get last product and its store name
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

  // Helper: popup message (uses global showDebugPopup if available)
  function showCachePopup(message) {
    if (typeof showDebugPopup === "function") {
      showDebugPopup(message);
    } else {
      const popup = document.createElement("div");
      popup.textContent = message;
      Object.assign(popup.style, {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        background: "#333",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: 9999,
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
      });
      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 2000);
    }
  }

  // Listen to the global spinnerChange event
  document.addEventListener("spinnerChange", (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      // Spinner ON → start polling cache
      showCachePopup("🌀 Searching stores...");
      if (!window.cacheWatcherInterval) {
        window.cacheWatcherInterval = setInterval(() => {
          const source = getLastProductSource();
          if (source) showCachePopup(`🌀 Searching ${source}...`);
        }, 500);
      }
    } else {
      // Spinner OFF → stop polling
      clearInterval(window.cacheWatcherInterval);
      window.cacheWatcherInterval = null;

      const source = getLastProductSource();
      if (source) {
        showCachePopup(`✅ Finished searching ${source}`);
      } else {
        showCachePopup("✅ Search complete.");
      }
    }
  });
});
