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
      z-index: 999999;
      padding: 20px;
      font-family: 'Quicksand', sans-serif;
      overflow-y: auto;
    }
    #aiOverlay .ai-overlay-content {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 20px;
      max-width: 700px;
      width: 95%;
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
    #aiOverlay .similar-list {
      margin-top: 25px;
      text-align: left;
    }
    #aiOverlay .similar-item {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 8px;
    }
    #aiOverlay .similar-item a {
      text-decoration: none;
      color: #007bff;
    }
    #aiOverlay .similar-item a:hover {
      text-decoration: underline;
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

  // --- Utility functions ---
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^\d]/g, "")) || 0;
  }
  function similarity(a, b) {
    if (!a || !b) return 0;
    const tokensA = new Set(a.toLowerCase().split(/\s+/));
    const tokensB = new Set(b.toLowerCase().split(/\s+/));
    let common = 0;
    tokensA.forEach(t => { if (tokensB.has(t)) common++; });
    return common / Math.max(tokensA.size, tokensB.size);
  }

  // --- Expose function globally ---
  window.showAiOverlay = function (product) {
    const body = document.getElementById("aiOverlayBody");

    // Base product info
    let html = `
      <h2>${product.title}</h2>
      <img src="${product.img || product.image_url || ""}" alt="${product.title}">
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>${product.source || product.store || ""}</strong></p>
      <button onclick="window.open('${product.link || product.product_link}', '_blank')">🔗 View in Store</button>
    `;

    // --- Load all cached products ---
    let allProducts = [];
    try {
      const saved = localStorage.getItem("lastSearchResults");
      if (saved) {
        allProducts = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse cache", e);
    }

    // --- Find top 10 similar ---
    if (allProducts.length > 1) {
      const selectedPrice = parsePrice(product.price);
      const scored = allProducts
        .filter(p => p.title !== product.title)
        .map(p => ({
          ...p,
          score: similarity(product.title, p.title || ""),
          priceNum: parsePrice(p.price)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 30); // top 30 similar by title

      const priceSorted = scored.sort(
        (a, b) => Math.abs(a.priceNum - selectedPrice) - Math.abs(b.priceNum - selectedPrice)
      );
      const final10 = priceSorted.slice(0, 10);

      html += `<div class="similar-list"><h3>Similar Products</h3>`;
      final10.forEach(sim => {
        html += `
          <div class="similar-item">
            <a href="${sim.link || sim.product_link}" target="_blank">${sim.title}</a><br>
            <strong>${sim.price}</strong> | ${sim.source || ""}
          </div>
        `;
      });
      html += `</div>`;
    }

    body.innerHTML = html;
    overlay.style.display = "flex";
  };
})();
