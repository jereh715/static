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
      width: 99%;
      height: 99%;
      background: #fff;
      display: none;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      z-index: 999999;
      padding: 10px;
      font-family: 'Quicksand', sans-serif;
    }
    #aiOverlay .ai-overlay-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      padding: 20px;
      width: 99%;
      height: 99%;
      overflow-y: auto;
      position: relative;
      animation: fadeIn 0.25s ease-in-out;
    }
    #aiOverlay .close-btn {
      position: fixed;
      top: 15px;
      right: 20px;
      font-size: 32px;
      font-weight: bold;
      cursor: pointer;
      color: red;
      z-index: 1000000;
    }
    #aiOverlay h2 {
      margin-top: 0;
    }
    #aiOverlay img {
      max-width: 60%;
      height: auto;
      border-radius: 12px;
      margin: 20px auto;
      display: block;
    }

    /* Horizontal scroll for similar products */
    #aiOverlay .similar-list {
      margin-top: 30px;
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 10px;
    }
    #aiOverlay .similar-item {
      flex: 0 0 auto;
      width: 220px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    #aiOverlay .similar-item img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    #aiOverlay .similar-item a {
      text-decoration: none;
      color: #007bff;
      font-weight: bold;
      display: block;
      margin-bottom: 5px;
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
  function getAllowedRange(price) {
    if (price <= 10000) return { min: price * 0.5, max: price * 1.5 };
    if (price > 10000 && price <= 40000) return { min: price * 0.7, max: price * 1.3 };
    if (price > 40000 && price <= 100000) return { min: price * 0.9, max: price * 1.1 };
    return { min: 0, max: Infinity };
  }

  // --- Expose function globally ---
  window.showAiOverlay = function (product) {
    const body = document.getElementById("aiOverlayBody");

    // Base product info
    let html = `
      <h2>${product.title}</h2>
      <img src="${product.img || product.image_url || ""}" alt="${product.title}">
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Source:</strong> ${product.source || product.store || ""}</p>
    `;

    // --- Load cached products ---
    let allProducts = [];
    try {
      const saved = localStorage.getItem("lastSearchResults");
      if (saved) allProducts = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse cache", e);
    }

    // --- Find similar ---
    if (allProducts.length > 1) {
      const selectedPrice = parsePrice(product.price);
      const { min, max } = getAllowedRange(selectedPrice);

      const scored = allProducts
        .filter(p => p.title !== product.title)
        .map(p => ({
          ...p,
          score: similarity(product.title, p.title || ""),
          priceNum: parsePrice(p.price)
        }))
        .filter(p => p.priceNum >= min && p.priceNum <= max)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      if (scored.length) {
        html += `<div class="similar-list"><h3>Similar Products</h3>`;
        scored.forEach(sim => {
          html += `
            <div class="similar-item">
              <img src="${sim.img || sim.image_url || ""}" alt="${sim.title}">
              <a href="${sim.link || sim.product_link}" target="_blank">${sim.title}</a>
              <div><strong>${sim.price}</strong> | ${sim.source || ""}</div>
            </div>
          `;
        });
        html += `</div>`;
      } else {
        html += `<p><em>No similar products found in range.</em></p>`;
      }
    }

    body.innerHTML = html;
    overlay.style.display = "flex";
  };
})();
