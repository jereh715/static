// cache-watcher.js — listens for spinnerChange and reports cache size
document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ cache-watcher.js loaded — live cache counter active");

  // Helper: safely get count of cached products
  function getCachedProductsCount() {
    try {
      const saved = JSON.parse(localStorage.getItem("lastSearchResults") || "[]");
      return Array.isArray(saved) ? saved.length : 0;
    } catch {
      return 0;
    }
  }

  // Helper: popup message (uses global showDebugPopup if available)
  function showCachePopup(count) {
    const msg = `${count} product${count !== 1 ? "s" : ""} in cache`;
    if (typeof showDebugPopup === "function") {
      showDebugPopup(msg);
    } else {
      const popup = document.createElement("div");
      popup.textContent = msg;
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
      showCachePopup("🌀 Building cache...");
      if (!window.cacheWatcherInterval) {
        window.cacheWatcherInterval = setInterval(() => {
          const count = getCachedProductsCount();
          if (count > 0) showCachePopup(count);
        }, 2000);
      }
    } else {
      // Spinner OFF → stop polling
      clearInterval(window.cacheWatcherInterval);
      window.cacheWatcherInterval = null;

      const finalCount = getCachedProductsCount();
      if (finalCount > 0) {
        showCachePopup(`✅ ${finalCount} products cached`);
      } else {
        showCachePopup("⚠️ No cached products");
      }
    }
  });
});
