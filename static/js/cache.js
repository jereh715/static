// cache-watcher.js — persistent popup showing current store
document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ cache-watcher.js loaded — persistent store tracker active");

  let lastShownSource = null;
  let persistentPopup = null;
  let interval = null;

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

  function showPersistentPopup(message) {
    const container = document.getElementById("popupContainer");
    if (!container) return;

    // Create only once
    if (!persistentPopup) {
      persistentPopup = document.createElement("div");
      persistentPopup.className = "popupMessage cacheWatcherPopup";
      container.appendChild(persistentPopup);
    }
    persistentPopup.textContent = message;
  }

  function removePersistentPopup() {
    if (persistentPopup && persistentPopup.parentNode) {
      persistentPopup.remove();
    }
    persistentPopup = null;
  }

  document.addEventListener("spinnerChange", (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      if (interval) clearInterval(interval);
      showPersistentPopup("🌀 Searching stores...");

      interval = setInterval(() => {
        const source = getLastProductSource();
        if (source && source !== lastShownSource) {
          lastShownSource = source;
          showPersistentPopup(`🌀 Searching ${source}...`);
        }
      }, 500);
    } else {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      const source = getLastProductSource();
      if (source) {
        showPersistentPopup(`✅ Finished searching ${source}`);
      } else {
        showPersistentPopup("✅ Search complete.");
      }

      setTimeout(removePersistentPopup, 2500);
      lastShownSource = null;
    }
  });
});
