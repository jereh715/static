(function () {
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
    @font-face {
      font-family: 'GeminiSans';
      src: url('static_updated/js/sans.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
    }

    #aiOverlay {
      position: fixed;
      top: 0; left: 0;
      width: 100%;
      height: 100%;
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

    /* Main product layout */
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
      display: -webkit-box;
      -webkit-line-clamp: 5;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-word;
    }
    #aiOverlay .main-details p {
      margin: 5px 0;
      font-size: 14px;
    }

    /* Gemini insight card */
    #aiOverlay .spacer-card {
      height: 300px; 
      border-radius: 20px;
      background: linear-gradient(135deg, blue, red, black);
      margin: 20px 0 10px 0; 
      padding: 15px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      color: #fff;
      font-size: 14px;
      text-align: left;
      overflow-y: auto;
      font-family: 'GeminiSans', sans-serif;
      line-height: 1.4;
    }

    /* Section title */
    #aiOverlay .section-title {
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0 10px 5px;
      color: #222;
    }

    /* Horizontal scroll similar products */
    #aiOverlay .similar-list {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 10px;
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
      scroll-snap-align: start;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
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
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
      pointer-events: none;
    }
    #aiOverlay .similar-item div {
      font-size: 11px;
      color: #444;
      pointer-events: none;
    }

    /* Scroll dots */
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

  /* ---------------- HELPERS ---------------- */
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

  /* ---------------- POPUP ---------------- */
  function addPopup(msg) {
    const pop = document.createElement("div");
    pop.textContent = msg;
    Object.assign(pop.style, {
      position: "fixed", bottom: "20px", right: "20px",
      background: "#333", color: "#fff", padding: "8px 12px",
      borderRadius: "8px", fontSize: "13px", zIndex: 9999999
    });
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 2500);
  }

  /* ---------------- SEND PRODUCT LINK TO BACKEND ---------------- */
  function sendProductLink(link) {
    if (!link) return;
    fetch("http://127.0.0.1:5000/open-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link })
    })
    .then(res => res.ok ? addPopup("opening in browser") : addPopup("failed to open"))
    .catch(() => addPopup("⚠️ Error sending link"));
  }

  /* ---------------- GEMINI INSIGHT ---------------- */
  const GEMINI_API_KEY = "AIzaSyDI_9R2l_sUKcp4nwKMj7SEbVexN47Nr7Q";
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  async function fetchGeminiInsight(mainProduct, similarProducts) {
    const prompt = `
      The main product is: ${mainProduct.title} (Price: ${mainProduct.price}).
      Similar products: 
      ${similarProducts.map(p => `${p.title} (Price: ${p.price})`).join("\n")}
      
      Please provide a concise comparison/insight of how the main product stands against these similar options (value, uniqueness, etc.).
    `;
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No insight generated.";
    } catch (e) {
      console.error("Gemini error", e);
      return "⚠️ Error fetching insight.";
    }
  }

  /* --------- Simple Markdown parser for *bold* --------- */
  function formatInsightText(text) {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<b>$1</b>");
  }

  /* ---------------- SHOW OVERLAY ---------------- */
  window.showAiOverlay = async function (product) {
    const body = document.getElementById("aiOverlayBody");
    const dots = document.getElementById("similarDots");

    // --- Base product ---
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

    // --- Spacer (Gemini AI section) ---
    html += `<div class="spacer-card" id="spacerCard">Generating insights...</div>`;

    // --- Title before similar section ---
    html += `<div class="section-title">Similar Products</div>`;

    // --- Similar products logic ---
    let allProducts = [];
    try {
      const saved = localStorage.getItem("lastSearchResults");
      if (saved) allProducts = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse cache", e);
    }

    let scored = [];
    if (allProducts.length > 1) {
      const selectedPrice = parsePrice(product.price);
      const { min, max } = { min: selectedPrice * 0.8, max: selectedPrice * 1.1 };

      scored = allProducts
        .filter(p => p.title !== product.title)
        .map(p => ({
          ...p,
          score: similarity(product.title, p.title || ""),
          priceNum: parsePrice(p.price)
        }))
        .filter(p => p.priceNum >= min && p.priceNum <= max)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10); // max 10 products

      if (scored.length) {
        html += `<div class="similar-list">`;
        scored.forEach(sim => {
          const link = sim.link || sim.product_link;
          html += `
            <div class="similar-item" data-link="${link}">
              <img loading="lazy" src="${sim.img || sim.image_url || ""}" alt="${sim.title}">
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

    body.querySelectorAll(".similar-item").forEach(el => {
      el.addEventListener("click", () => sendProductLink(el.dataset.link));
    });

    // Scroll dots update
    const list = body.querySelector(".similar-list");
    if (list) {
      list.addEventListener("scroll", () => {
        const items = list.querySelectorAll(".similar-item");
        let closest = null;
        let minDist = Infinity;
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const dist = Math.abs(rect.left + rect.width / 2 - list.getBoundingClientRect().left - list.clientWidth / 2);
          if (dist < minDist) {
            minDist = dist;
            closest = item;
          }
          item.classList.remove("active"); // we removed green highlight styling
        });
        if (closest) closest.classList.add("active");
      });
    }

    if (scored.length) {
      const spacer = document.getElementById("spacerCard");
      spacer.textContent = "Fetching product insights...";
      const insight = await fetchGeminiInsight(product, scored);
      spacer.innerHTML = formatInsightText(insight);
    }
  };
})();
