// welcome.js
// Self-contained: injects CSS, HTML, overlay logic, and post-overlay rotating text.

(function() {
  const STORAGE_KEY = "lastSearchResults";
  let shopMessageInterval = null;

  // --- Inject CSS ---
  const style = document.createElement("style");
  style.textContent = `
@font-face {
  font-family: "MySans";
  src: url("/static/sans.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

* { box-sizing: border-box; }

#welcome-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,0.25);
  z-index: 9999;
  padding: 0;
  transition: opacity 240ms ease;
  opacity: 0;
}
#welcome-overlay.visible { opacity: 1; display: flex; }

.welcome-card {
  width: 99%; height: 99%;
  background: linear-gradient(135deg, #ff0000, #000000);
  border-radius: 2rem;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6);
  padding: 2rem; color: white;
  position: relative; box-sizing: border-box;
}

.slider {
  flex: 1; width: 100%;
  display: flex; justify-content: center; align-items: center;
  position: relative; overflow: hidden;
}
.slider span {
  position: absolute;
  font-family: "MySans", "Quicksand", system-ui, sans-serif;
  font-size: 8vw; font-weight: 700; color: white;
  opacity: 0; transform: translateX(100%);
  animation: slide 9s infinite ease-in-out;
  white-space: nowrap; text-transform: lowercase; letter-spacing: 0.02em;
}
.slider span:nth-child(1) { animation-delay: 0s; }
.slider span:nth-child(2) { animation-delay: 3s; }
.slider span:nth-child(3) { animation-delay: 6s; }

@keyframes slide {
  0%, 100% { opacity: 0; transform: translateX(100%); }
  10%, 30% { opacity: 1; transform: translateX(0); }
  40% { opacity: 0; transform: translateX(-100%); }
}

.footer { font-family: "MySans", "Quicksand", sans-serif; font-size: 0.75rem; font-weight: 700; text-align: left; margin-bottom: 0rem; }

.welcome-actions { position: absolute; bottom: 1rem; right: 1.5rem; }
.welcome-close {
  background: none; border: none; padding: 0; margin: 0;
  cursor: pointer;
  font-family: "MySans", "Quicksand", sans-serif;
  font-size: 1rem; font-weight: 700; text-align: right;
  background: linear-gradient(90deg, blue, red);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.welcome-close:focus { outline: none; text-decoration: underline; }

#shop-message {
  position: fixed;
  top: 40%; /* center roughly middle of screen */
  left: 50%;
  transform: translateX(-50%);
  font-family: "MySans", "Quicksand", sans-serif;
  font-weight: 700; font-size: 3.2rem;
  text-align: center; z-index: 500;
  display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  width: 100%; max-width: 90%;
}

#shop-message .inline-text {
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: black; margin-bottom: 1rem;
}

#shop-message .inline-text img {
  width: 30px; height: 30px; margin-left: 0.5rem;
}

/* rotating text container */
#shop-message .rotating-text {
  position: relative;
  height: 3.5rem; /* fixed height to prevent overlap */
  display: flex; justify-content: center; align-items: center;
}

#shop-message .rotating-text span {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  background: linear-gradient(90deg, red, black);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  animation: fadeRotate 9s infinite;
}
#shop-message .rotating-text span:nth-child(1) { animation-delay: 0s; }
#shop-message .rotating-text span:nth-child(2) { animation-delay: 3s; }
#shop-message .rotating-text span:nth-child(3) { animation-delay: 6s; }

@keyframes fadeRotate {
  0%, 100% { opacity: 0; }
  10%, 30% { opacity: 1; }
  40% { opacity: 0; }
}

@media (min-width: 900px) {
  .slider span { font-size: 5rem; }
  .footer { font-size: 1.2rem; }
  .welcome-close { font-size: 1.2rem; }
  #shop-message .inline-text { font-size: 1.5rem; }
  #shop-message .inline-text img { width: 40px; height: 40px; }
}
  `;
  document.head.appendChild(style);

  // --- Inject overlay HTML ---
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

  function showWelcome() {
    overlay.classList.add("visible");
    document.addEventListener("keydown", onKeydown);
    closeBtn.focus();
  }

  function hideWelcome() {
    // Remove overlay completely
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

  function onKeydown(ev) { if (ev.key === "Escape") hideWelcome(); }
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
