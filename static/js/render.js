// render.js
document.addEventListener("DOMContentLoaded", () => {
  const resultsDiv = document.getElementById("results");
  if (!resultsDiv) return;

  // Create the container for your text
  const preProducts = document.createElement("div");
  preProducts.id = "pre-products";
  preProducts.style.padding = "10px";
  preProducts.style.textAlign = "center";
  preProducts.style.fontSize = "16px";
  preProducts.style.fontWeight = "600";
  preProducts.style.marginTop = "120px"; // <-- keeps 250px from top
  preProducts.style.border = "3px solid pink"; // <-- visualize the div
  preProducts.textContent = "👋 Welcome! Here are some recommendations:";

  // Wait for #products to appear, then insert before it
  const observer = new MutationObserver(() => {
    const productsDiv = document.getElementById("products");
    if (productsDiv && !document.getElementById("pre-products")) {
      productsDiv.parentNode.insertBefore(preProducts, productsDiv);
      observer.disconnect(); // stop observing once done
    }
  });

  observer.observe(resultsDiv, { childList: true, subtree: true });
});
