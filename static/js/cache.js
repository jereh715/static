// cache-watcher.js — uses built-in popup system from index.html
document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ cache-watcher.js loaded — single popup using global system");

  let lastShownSource = null;
  let popupId = null; // track the single popup instance

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

  function updatePopup(message) {
    // Reuse the existing popup by its id
    if (typeof addPopup === "function") {
      // If popupId is active, update it; otherwise create new
      if (popupId && window.activePopups && window.activePopups[popupId]) {
        window.activePopups[popupId].querySelector(".popup-text").textContent = message;
      } else {
        popupId = addPopup(message);
      }
    } else if (typeof showDebugPopup === "function") {
      showDebugPopup(message);
    } else {
      console.log("💬 Popup:", message);
    }
  }

  function removePopup() {
    if (popupId && window.activePopups && window.activePopups[popupId]) {
      const el = window.activePopups[popupId];
      el.remove();
      delete window.activePopups[popupId];
      popupId = null;
    }
  }

  document.addEventListener("spinnerChange", (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      // stop duplicates
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
      // stop polling
      if (window.cacheWatcherInterval) {
        clearInterval(window.cacheWatcherInterval);
        window.cacheWatcherInterval = null;
      }

      const source = getLastProductSource();
      if (source) updatePopup(`✅ Finished searching ${source}`);
      else updatePopup("✅ Search complete.");

      // remove popup after short delay
      setTimeout(removePopup, 3000);
      lastShownSource = null;
    }
  });
});
