// welcome.js
// Two-step onboarding flow: external CSS, notification opt-in toggle, and API POST.

(function() {
  const STORAGE_KEY = "lastSearchResults";
  let shopMessageInterval = null;

  // --- Load external CSS ---
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/static_updated/js/welcome.css";
  document.head.appendChild(link);

  // --- Create overlay HTML ---
  const overlay = document.createElement("div");
  overlay.id = "welcome-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-label", "Welcome overlay");

  overlay.innerHTML = `
    <div class="welcome-card" role="document">
      <div class="slider step-content" aria-hidden="false">
        <span>welcome</span>
        <span>to</span>
        <span>looc</span>
      </div>
      <div class="footer">Looc for it!</div>
      <div class="welcome-actions">
        <button class="welcome-next" aria-label="Next step">Next</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const nextBtn = overlay.querySelector(".welcome-next");

  // --- Step handling ---
  let currentStep = 1;

  function showStep(step) {
    const content = overlay.querySelector(".step-content");

    // STEP 1: Intro animation
    if (step === 1) {
      content.classList.add("slider");
      content.innerHTML = `
        <span>welcome</span>
        <span>to</span>
        <span>looc</span>
      `;
      nextBtn.textContent = "Next";
    }

    // STEP 2: Notification opt-in
    if (step === 2) {
      content.classList.remove("slider");
      content.style.display = "flex";
      content.style.flexDirection = "column";
      content.style.justifyContent = "center";
      content.style.alignItems = "center";
      content.innerHTML = `
        <div style="text-align:center; font-family:'MySans','Quicksand',sans-serif;">
          <p style="font-size:2rem; font-weight:700; margin-bottom:1rem;">
            To get offers and deals
          </p>
          <p style="font-size:1.2rem; margin-bottom:1.5rem;">
            you would like to receive notifications
          </p>
          <label class="toggle-container">
            <span>Enable notifications</span>
            <div class="toggle-switch">
              <input type="checkbox" id="notifyToggle">
              <span class="toggle-slider"></span>
            </div>
          </label>
        </div>
      `;
      nextBtn.textContent = "Finish";

      // Attach toggle listener
      const toggle = overlay.querySelector("#notifyToggle");
      if (toggle) {
        toggle.addEventListener("change", async (e) => {
          if (e.target.checked) {
            try {
              const res = await fetch("http://127.0.0.1:5000/api/notify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: "System Update",
                  message: "A new update is available for download."
                })
              });
              console.log("Notification request sent:", res.status);
            } catch (err) {
              console.error("Notification request failed:", err);
            }
          }
        });
      }
    }
  }

  // --- Hide overlay and show message ---
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

  // --- Keyboard escape handling ---
  function onKeydown(ev) {
    if (ev.key === "Escape") hideWelcome();
  }

  // --- Next button logic ---
  nextBtn.addEventListener("click", () => {
    if (currentStep === 1) {
      currentStep = 2;
      showStep(currentStep);
    } else if (currentStep === 2) {
      hideWelcome();
    }
  });

  // --- Cache check at startup ---
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch (e) {
    saved = null;
  }

  if (!saved || (Array.isArray(saved) && saved.length === 0)) {
    overlay.classList.add("visible");
    document.addEventListener("keydown", onKeydown);
    nextBtn.focus();
  } else {
    overlay.remove();
    if (shopMessageInterval) clearInterval(shopMessageInterval);
  }
})();
