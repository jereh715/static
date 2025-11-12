// cache-watcher.js — persistent popup showing current store
// this is used to show store progression eg, searching jumia
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

    // Create popup only once
    if (!persistentPopup) {
      persistentPopup = document.createElement("div");
      persistentPopup.className = "popupMessage cacheWatcherPopup";
      container.appendChild(persistentPopup);
    }

    // Color scheme: "Searching" white, store name orange
    const searchingMatch = message.match(/(Searching )(.+?)(\.\.\.)/i);
    if (searchingMatch) {
      const [, prefix, store, suffix] = searchingMatch;
      persistentPopup.innerHTML = `
        <span style="color: white;">${prefix}</span>
        <span style="color: orange;">${store}</span>
        <span style="color: white;">${suffix}</span>
      `;
    } else {
      persistentPopup.innerHTML = `<span style="color: white;">${message}</span>`;
    }
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
      // Start searching popup
      if (interval) clearInterval(interval);
      showPersistentPopup("🌀 Searching stores...");

      interval = setInterval(() => {
        const source = getLastProductSource();
        if (source && source !== lastShownSource) {
          lastShownSource = source;
          showPersistentPopup(`Searching ${source}...`);
        }
      }, 500);
    } else {
      // Stop searching, just remove popup
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      removePersistentPopup();
      lastShownSource = null;
    }
  });
});
