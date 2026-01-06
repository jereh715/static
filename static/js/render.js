// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // ---------- Create horizontal card container ----------
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.style.padding = "10px 0";
  preProducts.style.display = "flex";
  preProducts.style.overflowX = "auto"; // horizontal scroll
  preProducts.style.gap = "5px";
  preProducts.style.marginTop = "120px";
  preProducts.style.boxSizing = "border-box";
  preProducts.style.scrollBehavior = "smooth";

  // Generate 20 cards
  const totalCards = 20;
  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("div");
    const cardWidth = (window.innerWidth - 10) / 3; // 3 cards visible

    Object.assign(card.style, {
      flex: "0 0 auto", // no shrinking
      width: `${cardWidth}px`,
      height: "100px",
      borderRadius: "12px",
      backgroundColor: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "600",
      fontSize: "14px",
      boxSizing: "border-box"
    });

    card.textContent = `Card ${i + 1}`;
    preProducts.appendChild(card);
  }

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

  const totalDots = 5; // 5 blue dots
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

  // ---------- Insert preProducts and pill before #products ----------
  const observer = new MutationObserver(() => {
    const productsDiv = document.getElementById("products");
    if (productsDiv && !document.getElementById("pre-products")) {
      productsDiv.parentNode.insertBefore(preProducts, productsDiv);
      productsDiv.parentNode.insertBefore(pill, productsDiv);
      observer.disconnect();
    }
  });

  observer.observe(resultsDiv, { childList: true, subtree: true });

  // ---------- Update active dot based on scroll ----------
  preProducts.addEventListener("scroll", () => {
    const scrollLeft = preProducts.scrollLeft;
    const cardWidth = preProducts.children[0].offsetWidth + 5; // card width + gap
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
});
