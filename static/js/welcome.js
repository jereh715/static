// welcome.js
// Self-contained: loads external CSS, injects HTML overlay, handles logic and rotating message.

(function() {
  const STORAGE_KEY = "lastSearchResults";
  let shopMessageInterval = null;

  // --- Inject external CSS ---
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/static_updated/js/welcome.css";
  document.head.appendChild(link);

  // --- Create overlay HTML ---
  const overlay = document.createElement("div");
  overlay.id = "welcome-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Welcome overlay");

  overlay.innerHTML = `
    <div class="welcome-card" role="document">
      <div class="slider" aria-hidden="false">
        <span>welcome</span>
        <span>to</span>
        <span>looc</span>
      </div>
      <div class="footer">Looc for it!</div>
      <div class="welcome-actions">
        <button class="welcome-close" aria-label="Close welcome">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  const closeBtn = overlay.querySelector(".welcome-close");

  // --- Functions ---
  function showWelcome() {
    overlay.classList.add("visible");
    document.addEventListener("keydown", onKeydown);
    closeBtn.focus();
  }

  function hideWelcome() {
    overlay.remove();
    document.removeEventListener("keydown", onKeydown);

    if (!document.querySelector("#shop-message")) {
      const msg = document.createElement("div");
      msg.id = "shop-message";
      msg.innerHTML = `
        <div class="inline-text">
          Begin your search
          <img src="https://img.icons8.com/?size=100&id=112468&format=png&color=000000" alt="Search icon"/>
        </div>
        <div class="rotating-text">
          <span>Shop easily</span>
          <span>Get Offers</span>
          <span>Save</span>
        </div>
      `;
      document.body.appendChild(msg);

      shopMessageInterval = setInterval(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const msgEl = document.querySelector("#shop-message");
          if (msgEl) msgEl.remove();
          clearInterval(shopMessageInterval);
        }
      }, 500);
    }
  }

  function onKeydown(ev) {
    if (ev.key === "Escape") hideWelcome();
  }

  closeBtn.addEventListener("click", hideWelcome);

  // --- Cache check at startup ---
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (e) {
    saved = null;
  }

  if (!saved || (Array.isArray(saved) && saved.length === 0)) {
    // No cache → show welcome overlay
    showWelcome();
  } else {
    // Cache exists → remove overlay immediately
    if (overlay) overlay.remove();
    const existingMsg = document.querySelector("#shop-message");
    if (existingMsg) existingMsg.remove();
    if (shopMessageInterval) clearInterval(shopMessageInterval);
  }
})();
