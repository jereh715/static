// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // Create the container for your text / product cards
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.style.padding = "10px 0";
  preProducts.style.display = "flex";
  preProducts.style.overflowX = "auto"; // allow horizontal scroll
  preProducts.style.gap = "5px";        // gap between cards
  preProducts.style.marginTop = "120px"; // distance from top
  preProducts.style.boxSizing = "border-box";

  // Hide scrollbar for modern browsers
  preProducts.style.scrollBehavior = "smooth";

  // Generate 20 cards
  const totalCards = 20;
  for (let i = 0; i < totalCards; i++) {
    const card = document.createElement("div");

    // Calculate width so 3 cards fit the screen width minus total gaps
    const cardWidth = (window.innerWidth - 10) / 3; // 3 visible cards

    Object.assign(card.style, {
      flex: "0 0 auto",          // prevent shrinking
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

  // Wait for #products to appear, then insert before it
  const observer = new MutationObserver(() => {
    const productsDiv = document.getElementById("products");
    if (productsDiv && !document.getElementById("pre-products")) {
      productsDiv.parentNode.insertBefore(preProducts, productsDiv);
      observer.disconnect();
    }
  });

  observer.observe(resultsDiv, { childList: true, subtree: true });

  // Recalculate card widths on window resize
  window.addEventListener("resize", () => {
    const cards = preProducts.children;
    const cardWidth = (window.innerWidth - 10) / 3;
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.width = `${cardWidth}px`;
    }
  });
});
