(function () {
  // --- Inject overlay HTML once ---
  const overlay = document.createElement("div");
  overlay.id = "aiOverlay";
  overlay.innerHTML = `
    <div class="ai-overlay-content">
      <span class="close-btn" id="aiOverlayClose">×</span>
      <div id="aiOverlayBody"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  // --- Inject CSS ---
  const style = document.createElement("style");
  style.textContent = `
    #aiOverlay {
      position: fixed;
      top: 0; left: 0;
      width: 99%; height: 99%;
      background: rgba(255,255,255,0.98);
      display: none;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 999999; /* top-most */
      padding: 20px;
      font-family: 'Quicksand', sans-serif;
      overflow-y: auto;
    }
    #aiOverlay .ai-overlay-content {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 20px;
      max-width: 600px;
      width: 90%;
      text-align: center;
      position: relative;
      animation: fadeIn 0.25s ease-in-out;
    }
    #aiOverlay .close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      color: #444;
    }
    #aiOverlay img {
      max-width: 80%;
      border-radius: 12px;
      margin-bottom: 15px;
    }
    #aiOverlay button {
      margin-top: 15px;
      padding: 10px 18px;
      border: none;
      border-radius: 8px;
      background: #007bff;
      color: white;
      cursor: pointer;
      font-size: 14px;
    }
    #aiOverlay button:hover {
      background: #0056b3;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  // --- Close handler ---
  overlay.querySelector("#aiOverlayClose").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  // --- Expose function globally ---
  window.showAiOverlay = function (product) {
    const body = document.getElementById("aiOverlayBody");
    body.innerHTML = `
      <h2>${product.title}</h2>
      <img src="${product.img}" alt="${product.title}">
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>${product.store}</strong></p>
      <button onclick="sendProductLink('${product.link}')">🔗 View in Store</button>
    `;
    overlay.style.display = "flex";
  };
})();
