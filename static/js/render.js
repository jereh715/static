document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.textContent = "👋 Welcome! Here are some recommendations:";

  // Style it as absolute so it doesn't push products down
  Object.assign(preProducts.style, {
    position: "absolute",
    top: "250px",      // 250px from top of screen
    left: "0",
    right: "0",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    padding: "10px",
    backgroundColor: "rgba(255,255,255,0.95)", // optional: slightly opaque background
    zIndex: "1000"
  });

  // Wait for #products to appear, then insert before it (so it’s in the same container)
  const observer = new MutationObserver(() => {
    const productsDiv = document.getElementById("products");
    if (productsDiv && !document.getElementById("pre-products")) {
      resultsDiv.appendChild(preProducts); // append to results
      observer.disconnect();
    }
  });

  observer.observe(resultsDiv, { childList: true, subtree: true });
});
