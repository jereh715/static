// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // ---------- Create horizontal card container ----------
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  Object.assign(preProducts.style, {
    padding: "10px 0",
    display: "flex",
    overflowX: "auto",
    gap: "5px",
    marginTop: "120px",
    boxSizing: "border-box",
    scrollBehavior: "smooth"
  });

  // ---------- Create scroll dots (pill) ----------
  const pill = document.createElement("div");
  pill.id = "scroll-pill";
  Object.assign(pill.style, {
    display: "flex",
    justifyContent: "center",
    gap: "5px",
    marginTop: "8px",
    marginBottom: "10px"
  });

  const totalDots = 5;
  const dots = [];
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: "blue",
      transition: "background-color 0.3s"
    });
    pill.appendChild(dot);
    dots.push(dot);
  }

  // ---------- Insert preProducts and pill persistently ----------
  function ensurePreProducts() {
    if (!document.getElementById("pre-products")) {
      resultsDiv.prepend(pill);
      resultsDiv.prepend(preProducts);
    }
  }
  ensurePreProducts();

  new MutationObserver(() => {
    ensurePreProducts();
  }).observe(resultsDiv, { childList: true });

  // ---------- Update active dot based on scroll ----------
  preProducts.addEventListener("scroll", () => {
    const scrollLeft = preProducts.scrollLeft;
    const cardWidth = preProducts.children[0]?.offsetWidth + 5 || 1; // width + gap
    const index = Math.floor(scrollLeft / (cardWidth * 4)); // every 4 cards scroll
    dots.forEach((dot, i) => {
      dot.style.backgroundColor = i === index ? "cyan" : "blue";
    });
  });

  // ---------- Recalculate card widths on window resize ----------
  window.addEventListener("resize", () => {
    const cardWidth = (window.innerWidth - 10) / 3;
    for (let i = 0; i < preProducts.children.length; i++) {
      preProducts.children[i].style.width = `${cardWidth}px`;
    }
  });

  // ---------- Spinner-based offer fetching ----------
  document.addEventListener("spinnerChange", async (e) => {
    if (!e.detail.visible) return; // only when spinner turns ON

    const query = localStorage.getItem("lastSearchQuery");
    if (!query) return;

    fetchOffers(query);
  });

  // ---------- Fetch offers API ----------
  async function fetchOffers(query) {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/offers?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.status !== "success" || !Array.isArray(data.products)) return;

      renderOfferCards(data.products);
    } catch (err) {
      console.error("Offer fetch failed", err);
    }
  }

  // ---------- Render lightweight offer cards ----------
  function renderOfferCards(products) {
    preProducts.innerHTML = ""; // clear old cards

    products.forEach((p) => {
      const card = document.createElement("div");

      Object.assign(card.style, {
        flex: "0 0 auto",
        width: "110px",
        height: "110px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        gap: "4px",
        padding: "6px",
        boxSizing: "border-box",
        cursor: "pointer"
      });

      card.innerHTML = `
        <img src="${p.image}" style="width:60px;height:60px;object-fit:contain">
        <div style="font-weight:600">${p.price}</div>
        <div style="color:red;font-size:11px">${p.offer}</div>
      `;

      card.onclick = () => {
        window.open(p.product_link, "_blank");
      };

      preProducts.appendChild(card);
    });

    // Show or hide pill based on number of cards
    pill.style.display = products.length > 0 ? "flex" : "none";
  }

});
