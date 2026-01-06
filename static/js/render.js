// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // Create the container for your text / product cards
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.style.padding = "10px";
  preProducts.style.textAlign = "center";
  preProducts.style.fontSize = "16px";
  preProducts.style.fontWeight = "600";
  preProducts.style.marginTop = "120px"; // distance from top
  preProducts.style.border = "3px solid pink"; // visualize the div
  preProducts.style.display = "flex"; // flex row for 3 cards
  preProducts.style.gap = "5px"; // 5px gap between cards
  preProducts.style.justifyContent = "space-between"; // evenly spaced
  preProducts.style.boxSizing = "border-box";

  // Generate 3 sample product cards
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");

    // Calculate width: (screen width - 10px gap) / 3
    const cardWidth = (window.innerWidth - 10) / 3; // in px

    Object.assign(card.style, {
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

  // Optional: recalc card widths on window resize
  window.addEventListener("resize", () => {
    const cards = preProducts.children;
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.width = `${(window.innerWidth - 10) / 3}px`;
    }
  });
});
