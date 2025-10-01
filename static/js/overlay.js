// overlay.js

(function () {
  // --- Inject CSS ---
  const style = document.createElement("style");
  style.textContent = `
    /* AI Overlay Fullscreen */
    .ai-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 99%;
      height: 99%;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 99999; /* top-most overlay */
      transition: opacity 0.3s ease;
    }

    .ai-overlay.hidden {
      display: none;
    }

    .ai-overlay-card {
      background: #fff;
      width: 99%;
      height: 99%;
      border-radius: 12px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      position: relative;
      overflow: auto;
      padding: 20px;
    }

    .ai-overlay-close {
      position: absolute;
      top: 12px;
      right: 20px;
      font-size: 28px;
      border: none;
      background: transparent;
      cursor: pointer;
      color: #333;
      font-weight: bold;
    }

    .ai-overlay-close:hover {
      color: red;
    }

    .ai-overlay-content {
      margin-top: 40px;
      font-family: "Quicksand", sans-serif;
      font-size: 18px;
      color: #222;
    }
  `;
  document.head.appendChild(style);

  // --- Create overlay container ---
  const overlay = document.createElement("div");
  overlay.id = "aiOverlay";
  overlay.className = "ai-overlay hidden";

  // Overlay inner card
  overlay.innerHTML = `
    <div class="ai-overlay-card">
      <button class="ai-overlay-close" id="aiOverlayClose">×</button>
      <div class="ai-overlay-content" id="aiOverlayContent">
        <!-- Dynamic content goes here -->
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close button listener
  document.getElementById("aiOverlayClose").addEventListener("click", () => {
    hideAiOverlay();
  });

  // --- Exposed functions ---
  window.showAiOverlay = function (contentHtml = "<p>🤖 AI Overlay Activated!</p>") {
    document.getElementById("aiOverlayContent").innerHTML = contentHtml;
    overlay.classList.remove("hidden");
  };

  window.hideAiOverlay = function () {
    overlay.classList.add("hidden");
  };
})();
