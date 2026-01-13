// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  /* ===============================
     CREATE HORIZONTAL CONTAINER
  =============================== */
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

  /* ===============================
     SCROLL DOTS (PILL)
  =============================== */
  const pill = document.createElement("div");
  pill.id = "scroll-pill";
  Object.assign(pill.style, {
    display: "flex",
    justifyContent: "center",
    gap: "5px",
    marginTop: "8px",
    marginBottom: "10px"
  });

  const dots = [];
  for (let i = 0; i < 5; i++) {
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

  /* ===============================
     INSERT PERSISTENTLY
  =============================== */
  function ensurePreProducts() {
    if (!document.getElementById("pre-products")) {
      resultsDiv.prepend(pill);
      resultsDiv.prepend(preProducts);
    }
  }

  ensurePreProducts();
  new MutationObserver(ensurePreProducts)
    .observe(resultsDiv, { childList: true });

  /* ===============================
     SCROLL DOT UPDATE
  =============================== */
  preProducts.addEventListener("scroll", () => {
    const card = preProducts.children[0];
    if (!card) return;

    const cardWidth = card.offsetWidth + 5;
    const index = Math.floor(preProducts.scrollLeft / (cardWidth * 4));

    dots.forEach((dot, i) => {
      dot.style.backgroundColor = i === index ? "cyan" : "blue";
    });
  });

  /* ===============================
     RESPONSIVE CARD WIDTH
  =============================== */
  function updateCardWidths() {
    const cardWidth = (window.innerWidth - 10) / 3;
    [...preProducts.children].forEach(card => {
      card.style.width = `${cardWidth}px`;
    });
  }

  window.addEventListener("resize", updateCardWidths);

  /* ===============================
     LOAD CACHED OFFERS ON START
  =============================== */
  const cachedOffers = localStorage.getItem("lastFoundOffers");
  if (cachedOffers) {
    try {
      const offers = JSON.parse(cachedOffers);
      if (Array.isArray(offers) && offers.length) {
        renderOfferCards(offers);
      }
    } catch (_) {}
  }

  /* ===============================
     SPINNER → FETCH NEW OFFERS
  =============================== */
  document.addEventListener("spinnerChange", (e) => {
    if (!e.detail.visible) return;

    const query = localStorage.getItem("lastSearchQuery");
    if (!query) return;

    fetchOffers(query);
  });

  /* ===============================
     FETCH OFFERS API
  =============================== */
  async function fetchOffers(query) {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/offers?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.status !== "success" || !Array.isArray(data.products)) return;

      localStorage.setItem(
        "lastFoundOffers",
        JSON.stringify(data.products)
      );

      renderOfferCards(data.products);
    } catch (err) {
      console.error("Offer fetch failed", err);
    }
  }

  /* ===============================
     RENDER OFFER CARDS
  =============================== */
  function renderOfferCards(products) {
    preProducts.innerHTML = "";

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

    updateCardWidths();
    pill.style.display = products.length ? "flex" : "none";
  }

});
