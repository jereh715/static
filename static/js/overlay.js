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
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
      color: #444;
      z-index: 1000;
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
    #aiOverlay .similar-list {
      margin-top: 30px;
    }
    #aiOverlay .similar-item {
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 10px;
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

    // Base product info (without button)
    let html = `
      <h2>${product.title}</h2>
      <img src="${product.img || product.image_url || ""}" alt="${product.title}">
      <p><strong>Price:</strong> ${product.price}</p>
      <p><strong>Source:</strong> ${product.source || product.store || ""}</p>
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
        .slice(0, 30);

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
