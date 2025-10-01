// overlay.js

(function () {
  // Inject styles
  const style = document.createElement("style");
  style.textContent = `
    #aiOverlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 99%;
      height: 99%;
      background: #fff;
      z-index: 99999;
      display: none;
      flex-direction: column;
      border-radius: 10px;
      overflow: hidden;
    }
    #aiOverlay.active { display: flex; }

    #aiOverlayClose {
      position: absolute;
      top: 10px;
      right: 20px;
      font-size: 28px;
      font-weight: bold;
      color: red;
      cursor: pointer;
      z-index: 100000;
    }

    #aiOverlayBody {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;
      overflow: hidden;
    }

    .main-product {
      display: flex;
      flex-shrink: 0;
      margin-bottom: 20px;
      align-items: center;
    }
    .main-product img {
      width: 150px;
      height: 150px;
      object-fit: contain;
      margin-right: 15px;
    }
    .main-product .main-details {
      flex: 1;
    }
    .main-product h2 {
      margin: 0 0 8px 0;
      font-size: 18px;
      line-height: 1.2;
    }
    .main-product .price-source {
      display: flex;
      gap: 12px;
      font-size: 14px;
    }

    .space-card {
      flex-shrink: 0;
      width: 100%;
      height: 200px;
      background: #f1f1f1;
      border-radius: 20px;
      margin: 20px 0;
    }

    .similar-products-container {
      flex-shrink: 0;
      margin-top: auto;
    }

    .similar-products {
      display: flex;
      overflow-x: auto;
      gap: 12px;
      padding: 10px 0;
      scroll-behavior: smooth;
    }

    .similar-item {
      flex: 0 0 auto;
      width: 180px;
      height: 120px;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      padding: 8px;
    }
    .similar-item h4 {
      font-size: 14px;
      margin: 0 0 4px 0;
      line-height: 1.2;
    }
    .similar-item h4 a {
      text-decoration: none;
      color: #0077cc;
    }
    .similar-item .sim-body {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .similar-item img {
      width: 60px;
      height: 60px;
      object-fit: contain;
    }
    .similar-item .sim-details {
      font-size: 12px;
    }

    /* scroll dots */
    .scroll-dots {
      display: flex;
      justify-content: center;
      margin-top: 6px;
    }
    .scroll-dots .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #bbb;
      margin: 0 4px;
    }
    .scroll-dots .dot.active {
      background: #333;
    }
  `;
  document.head.appendChild(style);

  // Build overlay container
  const overlay = document.createElement("div");
  overlay.id = "aiOverlay";
  overlay.innerHTML = `
    <span id="aiOverlayClose">×</span>
    <div id="aiOverlayBody"></div>
  `;
  document.body.appendChild(overlay);

  // Close logic
  document.getElementById("aiOverlayClose").addEventListener("click", () => {
    overlay.classList.remove("active");
  });

  // Escape HTML util
  function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (m) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m]);
    });
  }

  // Price parser
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^\d]/g, "")) || 0;
  }

  // Similarity calc
  function similarity(a, b) {
    const tokensA = new Set((a || "").toLowerCase().split(/\s+/));
    const tokensB = new Set((b || "").toLowerCase().split(/\s+/));
    let common = 0;
    tokensA.forEach((t) => {
      if (tokensB.has(t)) common++;
    });
    return common / Math.max(tokensA.size, tokensB.size);
  }

  // Price tolerance
  function withinPriceRange(base, candidate) {
    if (!base || !candidate) return false;
    const diff = Math.abs(candidate - base);
    if (base <= 10000) return candidate <= base * 1.5;
    if (base <= 40000) return diff <= base * 0.3;
    if (base <= 100000) return diff <= base * 0.1;
    return true;
  }

  // --- Show overlay: receives product object, reads cache ---
  window.showAiOverlay = function (product) {
    const body = document.getElementById("aiOverlayBody");

    // Similar products
    const saved = localStorage.getItem("lastSearchResults");
    let products = [];
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) products = parsed;
      }
    } catch (err) {
      console.error("parse error", err);
    }

    const selectedPrice = parsePrice(product.price);
    const scored = products
      .filter((p) => p !== product)
      .map((p) => ({
        ...p,
        score: similarity(product.title, p.title),
        priceNum: parsePrice(p.price),
      }))
      .filter((p) => withinPriceRange(selectedPrice, p.priceNum))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .sort(
        (a, b) =>
          Math.abs(a.priceNum - selectedPrice) -
          Math.abs(b.priceNum - selectedPrice)
      )
      .slice(0, 10);

    let html = `
      <div class="main-product">
        <img src="${product.img || product.image_url || ""}" alt="${escapeHtml(
      product.title || ""
    )}">
        <div class="main-details">
          <h2 title="${escapeHtml(product.title || "")}">${escapeHtml(
      product.title || ""
    )}</h2>
          <div class="price-source">
            <div class="price">${escapeHtml(product.price || "N/A")}</div>
            <div class="source">${escapeHtml(product.source || "N/A")}</div>
          </div>
        </div>
      </div>

      <div class="space-card"></div>

      <div class="similar-products-container">
        <div class="similar-products">
          ${scored
            .map(
              (p) => `
            <div class="similar-item">
              <h4><a href="${p.link ||
                "#"}" target="_blank">${escapeHtml(p.title || "Untitled")}</a></h4>
              <div class="sim-body">
                <img src="${p.img || p.image_url || ""}" alt="${escapeHtml(
                p.title || ""
              )}">
                <div class="sim-details">
                  <div class="price">${escapeHtml(p.price || "N/A")}</div>
                  <div class="source">${escapeHtml(p.source || "N/A")}</div>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="scroll-dots">
          ${scored.map(
            (_, i) => `<div class="dot ${i === 0 ? "active" : ""}"></div>`
          ).join("")}
        </div>
      </div>
    `;

    body.innerHTML = html;
    overlay.classList.add("active");
  };
})();
