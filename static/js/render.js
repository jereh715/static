document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // Create the container for your text
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.textContent = "👋 Welcome! Here are some recommendations:";

  // Style it to appear 250px from top without pushing products
  Object.assign(preProducts.style, {
    position: "absolute",
    top: "250px",     // 250px from top of screen
    left: "0",
    right: "0",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    padding: "10px",
    zIndex: "1000",
    backgroundColor: "rgba(255,255,255,0.95)" // optional, looks nice
  });

  // Wait for #products to appear, then append it to results container
  const observer = new MutationObserver(() => {
    const productsDiv = document.getElementById("products");
    if (productsDiv && !document.getElementById("pre-products")) {
      resultsDiv.appendChild(preProducts);
      observer.disconnect();
    }
  });

  observer.observe(resultsDiv, { childList: true, subtree: true });
});
