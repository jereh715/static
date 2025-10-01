// static_updated/js/overlay.js
(function () {
  // --- Create overlay container ---
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
    /* Full-screen overlay */
    #aiOverlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 99%;
      height: 99%;
      background: #fff;
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      font-family: 'Quicksand', sans-serif;
    }

    /* Card that fills the overlay */
    #aiOverlay .ai-overlay-content {
      width: 99%;
      height: 99%;
      padding: 20px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 6px 30px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    /* Floating red close button */
    #aiOverlay .close-btn {
      position: fixed;
      top: 16px;
      right: 22px;
      z-index: 1000000;
      font-size: 32px;
      line-height: 1;
      color: #ff3b3b;
      cursor: pointer;
      background: transparent;
      border: none;
    }

    /* Main product area (fixed height, takes only needed space) */
    #aiOverlay .main-product {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      flex: 0 0 auto;
    }
    #aiOverlay .main-product img {
      width: 160px;
      height: auto;
      border-radius: 10px;
      object-fit: contain;
      flex-shrink: 0;
    }
    #aiOverlay .main-details {
      flex: 1 1 auto;
      min-width: 0;
    }
    #aiOverlay .main-details h2 {
      font-size: 16px; /* lowered font size */
      margin: 0 0 8px;
      line-height: 1.2;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    #aiOverlay .main-details .price-source {
      display: flex;
      gap: 12px;
      align-items: center;
      justify-content: flex-start;
      font-size: 14px;
    }
    #aiOverlay .main-details .price-source .price {
      font-weight: 700;
    }
    #aiOverlay .main-details .price-source .source {
      color: #555;
    }

    /* Spacer card: takes remaining vertical space */
    #aiOverlay .spacer-card {
      flex: 1 1 100%;
      min-height: 40vh; /* ensure it's large and pushes similar products down */
      border-radius: 18px;
      background: #f2f2f2;
      margin: 18px 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9aa1a6;
      font-style: italic;
      font-size: 14px;
    }

    /* Similar products container pinned at bottom */
    #aiOverlay .similar-container {
      flex: 0 0 auto;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(0,0,0,0.04);
      background: transparent;
    }

    /* Horizontal scroll list */
    #aiOverlay .similar-list {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding: 12px 6px;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    /* Compact cards (about 1/4 previous height) */
    #aiOverlay .similar-item {
      flex: 0 0 auto;
      width: 180px;
      height: 120px;
      background: #fafafa;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      scroll-snap-align: start;
      box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    #aiOverlay .similar-item img {
      max-width: 100%;
      max-height: 60px;
      object-fit: contain;
      margin: 0 auto;
      border-radius: 4px;
    }
    #aiOverlay .similar-item a {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #0a66ff;
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-top: 6px;
    }
    #aiOverlay .similar-item .meta {
      font-size: 11px;
      color: #444;
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    /* Dots below the carousel */
    #aiOverlay .dots {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-top: 8px;
      padding-bottom: 6px;
    }
    #aiOverlay .dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d0d6db;
    }
    #aiOverlay .dots span.active {
      background: #0a66ff;
    }

    @media (max-width: 600px) {
      #aiOverlay .main-product img { width: 120px; }
      #aiOverlay .similar-item { width: 150px; height: 100px; }
    }
  `;
  document.head.appendChild(style);

  // --- Close handler ---
  overlay.querySelector("#aiOverlayClose").addEventListener("click", () => {
    overlay.style.display = "none";
  });

  // --- Utility helpers ---
  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // remove non digits
    return Number((priceStr + "").replace(/[^\d]/g, "")) || 0;
  }
  function similarity(a, b) {
    if (!a || !b) return 0;
    const tokensA = new Set(a.toLowerCase().split(/\s+/));
    const tokensB = new Set(b.toLowerCase().split(/\s+/));
    let common = 0;
    tokensA.forEach(t => { if (tokensB.has(t)) common++; });
    return common / Math.max(tokensA.size || 1, tokensB.size || 1);
  }
  function getAllowedRange(price) {
    if (price <= 10000) return { min: price * 0.5, max: price * 1.5 };
    if (price > 10000 && price <= 40000) return { min: price * 0.7, max: price * 1.3 };
    if (price > 40000 && price <= 100000) return { min: price * 0.9, max: price * 1.1 };
    return { min: 0, max: Infinity };
  }

  // --- Show overlay: receives product object, reads cache itself ---
  window.showAiOverlay = function (product) {
    const body = document.getElementById("aiOverlayBody");

    // Build header/main product HTML
    let html = `
      <div class="main-product">
        <img src="${product.img || product.image_url || ''}" alt="${escapeHtml(product.title || '')}">
        <div class="main-details">
          <h2 title="${escapeHtml(product.title || '')}">${escapeHtml(product.title || '')}</h2>
          <div class="price-source">
            <div class="price">${escapeHtml(product.price || 'N/A')}</div>
            <div class="source">${escapeHtml(product.source || product.store || '')}</div>
          </div>
        </div>
      </div>

      <div class="spacer-card">decorative spacer</div>
    `;

    // Load cached products
    let allProducts = [];
    try {
      const saved = localStorage.getItem("lastSearchResults");
      if (saved) allProducts = JSON.parse(saved);
    } catch (e) {
      console.error("overlay: failed to parse cached products", e);
      allProducts = [];
    }

    // Find similar products with price window & title-similarity
    let similarList = [];
    if (allProducts && allProducts.length > 1) {
      const selectedPrice = parsePrice(product.price);
      const { min, max } = getAllowedRange(selectedPrice);

      similarList = allProducts
        .filter(p => (p.title || '') !== (product.title || ''))
        .map(p => {
          return {
            item: p,
            score: similarity(product.title || '', p.title || ''),
            priceNum: parsePrice(p.price)
          };
        })
        // price filter within allowed range
        .filter(x => x.priceNum >= min && x.priceNum <= max)
        // sort by similarity desc
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(x => x.item);
    }

    // Render similar products at the bottom
    if (similarList.length) {
      html += `
        <div class="similar-container">
          <div class="similar-list" id="similarList">
            ${similarList.map(sim => `
              <div class="similar-item">
                <img src="${escapeAttr(sim.img || sim.image_url || '')}" alt="${escapeAttr(sim.title || '')}">
                <a href="${escapeAttr(sim.link || sim.product_link || '#')}" target="_blank" rel="noopener">${escapeHtml(sim.title || '')}</a>
                <div class="meta"><span>${escapeHtml(sim.price || '')}</span><span>${escapeHtml(sim.source || '')}</span></div>
              </div>
            `).join('')}
          </div>
          <div class="dots" id="similarDots"></div>
        </div>
      `;
    } else {
      html += `<div class="similar-container"><div style="padding:12px;color:#777;">No similar products found in range.</div></div>`;
    }

    body.innerHTML = html;
    overlay.style.display = "flex";

    // After rendering, wire up dots and scroll behavior if list exists
    const list = document.getElementById('similarList');
    const dotsEl = document.getElementById('similarDots');

    if (list && dotsEl) {
      const cards = Array.from(list.querySelectorAll('.similar-item'));
      dotsEl.innerHTML = cards.map((_, i) => `<span class="${i === 0 ? 'active' : ''}"></span>`).join('');

      // compute per-card width including gap
      const gap = 12;
      const cardWidth = (cards[0] ? cards[0].offsetWidth : 180) + gap;

      // snap behavior: scroll-snap is in CSS already; but we'll update active dot on scroll
      let ticking = false;
      list.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const index = Math.round(list.scrollLeft / cardWidth);
            const dots = dotsEl.querySelectorAll('span');
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
            ticking = false;
          });
          ticking = true;
        }
      });

      // optional: click dots to scroll
      const dots = Array.from(dotsEl.querySelectorAll('span'));
      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          list.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
        });
      });
    }
  };

  // small HTML-escape helpers to avoid injecting raw values
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[s];
    });
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }
})();
