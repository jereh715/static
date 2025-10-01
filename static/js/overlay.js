(function () {
  const GEMINI_API_KEY = "AIzaSyDI_9R2l_sUKcp4nwKMj7SEbVexN47Nr7Q";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const overlay = document.createElement("div");
  overlay.id = "aiOverlay";
  overlay.innerHTML = `
    <div class="ai-overlay-content">
      <span class="close-btn" id="aiOverlayClose">×</span>
      <div id="aiOverlayBody"></div>
      <div class="scroll-dots" id="similarDots"></div>
    </div>
  `;
  document.body.appendChild(overlay);

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
    #aiOverlay .main-product {
      display: flex;
      align-items: flex-start;
      gap: 15px;
      margin-bottom: 20px;
    }
    #aiOverlay .main-product img {
      width: 160px;
      height: auto;
      border-radius: 10px;
      flex-shrink: 0;
    }
    #aiOverlay .main-details {
      flex-grow: 1;
    }
    #aiOverlay .main-details h2 {
      font-size: 18px;
      margin: 0 0 10px;
    }
    #aiOverlay .main-details p {
      margin: 5px 0;
      font-size: 14px;
    }
    #aiOverlay .spacer-card {
      min-height: 80px;
      border-radius: 20px;
      background: #f1f1f1;
      margin: 20px 0 10px 0;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #444;
      font-size: 14px;
      font-style: italic;
      text-align: center;
    }
    #aiOverlay .similar-list {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 10px 0;
      margin-bottom: 15px;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }
    #aiOverlay .similar-item {
      flex: 0 0 auto;
      width: 180px;
      height: 120px;
      background: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 6px;
      text-align: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      cursor: pointer;
      scroll-snap-align: center;
      scroll-snap-stop: always;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border 0.15s ease;
    }
    #aiOverlay .similar-item img {
      max-width: 100%;
      max-height: 60px;
      object-fit: contain;
      border-radius: 4px;
      margin: 0 auto 4px;
      pointer-events: none;
    }
    #aiOverlay .product-link {
      color: #007bff;
      font-size: 12px;
      line-height: 1.2em;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      pointer-events: none;
    }
    #aiOverlay .similar-item div {
      font-size: 11px;
      color: #444;
      pointer-events: none;
    }
    #aiOverlay .similar-item.focused {
      border: 2px solid #28a745;
      box-shadow: 0 0 14px rgba(40, 167, 69, 0.55);
      transform: scale(1.06);
    }
    #aiOverlay .scroll-dots {
      text-align: center;
      margin-top: 8px;
    }
    #aiOverlay .scroll-dots span {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin: 0 3px;
      background: #ccc;
      border-radius: 50%;
    }
    #aiOverlay .scroll-dots span.active {
      background: #007bff;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

  overlay.querySelector("#aiOverlayClose").addEventListener("click", () => {
    overlay.style.display = "none";
  });

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

  async function fetchGemini(prompt) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insights available.";
    } catch (err) {
      console.error("Gemini error:", err);
      return "⚠️ Failed to fetch insights.";
    }
  }

  async function updateSpacer(text) {
    const card = document.querySelector("#aiOverlay .spacer-card");
    if (card) card.textContent = text;
  }

  function sendProductLink(link) {
    if (!link) return;
    fetch("http://127.0.0.1:5000/open-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link })
    }).then(res => {
      if (res.ok) addPopup("opening in browser");
      else addPopup("failed to open");
    }).catch(() => addPopup("⚠️ Error sending link"));
  }

  window.showAiOverlay = async function (product) {
    const body = document.getElementById("aiOverlayBody");
    const dots = document.getElementById("similarDots");

    let html = `
      <div class="main-product">
        <img src="${product.img || product.image_url || ""}" alt="${product.title}">
        <div class="main-details">
          <h2>${product.title}</h2>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Source:</strong> ${product.source || product.store || ""}</p>
        </div>
      </div>
    `;
    html += `<div class="spacer-card">Fetching insights...</div>`;

    let allProducts = [];
    try {
      const saved = localStorage.getItem("lastSearchResults");
      if (saved) allProducts = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse cache", e);
    }

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
        html += `<div class="similar-list">`;
        scored.forEach(sim => {
          const link = sim.link || sim.product_link;
          html += `
            <div class="similar-item" data-link="${link}" data-title="${sim.title}" data-price="${sim.price}" data-source="${sim.source || ""}">
              <img src="${sim.img || sim.image_url || ""}" alt="${sim.title}" loading="lazy">
              <span class="product-link">${sim.title}</span>
              <div>${sim.price} | ${sim.source || ""}</div>
            </div>
          `;
        });
        html += `</div>`;

        dots.innerHTML = "";
        scored.forEach((_, i) => {
          const dot = document.createElement("span");
          if (i === 0) dot.classList.add("active");
          dots.appendChild(dot);
        });
      } else {
        html += `<p><em>No similar products found in range.</em></p>`;
        dots.innerHTML = "";
      }
    }

    body.innerHTML = html;
    overlay.style.display = "flex";

    // --- Initial Gemini insights for main product ---
    fetchGemini(`Give a short 3-sentence customer insight about the product: "${product.title}" priced at ${product.price} from ${product.source || product.store || ""}.`).then(updateSpacer);

    // Attach click listeners
    body.querySelectorAll(".similar-item").forEach(el => {
      el.addEventListener("click", () => {
        sendProductLink(el.dataset.link);
      });
    });

    // Focus tracking & Gemini comparison
    const list = body.querySelector(".similar-list");
    if (list) {
      const items = [...list.querySelectorAll(".similar-item")];
      function updateFocus() {
        let center = list.scrollLeft + list.clientWidth / 2;
        let closest = null;
        let minDist = Infinity;
        items.forEach(item => {
          let itemCenter = item.offsetLeft + item.offsetWidth / 2;
          let dist = Math.abs(center - itemCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = item;
          }
        });
        items.forEach(item => item.classList.remove("focused"));
        if (closest) {
          closest.classList.add("focused");
          fetchGemini(
            `Compare the main product "${product.title}" (price ${product.price}, source ${product.source || product.store || ""}) with "${closest.dataset.title}" (price ${closest.dataset.price}, source ${closest.dataset.source}). Focus on differences in quality, value, and features in 3 sentences.`
          ).then(updateSpacer);
        }
      }
      let ticking = false;
      list.addEventListener("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            updateFocus();
            ticking = false;
          });
          ticking = true;
        }
      });
      updateFocus();
    }
  };
})();
