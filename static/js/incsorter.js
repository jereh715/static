  /* ---------------- INCREMENTAL SORTING ---------------- */
  function sortProducts(mode) {
    if (mode) currentSortMode = mode;
    const saved = localStorage.getItem("lastSearchResults");
    if (!saved) return;

    const products = JSON.parse(saved);
    let sorted = products.slice();

    if (currentSortMode === 'cheap') {
      sorted.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    } else if (currentSortMode === 'expensive') {
      sorted.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    const maxPrice = parseFloat(document.getElementById("maxPriceInput").value);
    if (!isNaN(maxPrice)) {
      sorted = sorted.filter(p => parsePrice(p.price) <= maxPrice);
    }

    sortedProducts = sorted;
    sortedRenderedCount = 0;

    const productsDiv = document.getElementById("products");
    if (productsDiv) productsDiv.innerHTML = "";

    loadNextSortedBatch();
    if (sortedProducts.length > BATCH_SIZE) {
      setTimeout(loadRemainingSortedBatches, 100);
    }
  }

  function loadNextSortedBatch() {
    const productsDiv = document.getElementById("products");
    const nextBatch = sortedProducts.slice(sortedRenderedCount, sortedRenderedCount + BATCH_SIZE);
    nextBatch.forEach(p => {
      productsDiv.innerHTML += renderProductHTML(p);
    });
    sortedRenderedCount += nextBatch.length;
  }

  function loadRemainingSortedBatches() {
    if (sortedRenderedCount < sortedProducts.length) {
      loadNextSortedBatch();
      requestAnimationFrame(() => {
        setTimeout(loadRemainingSortedBatches, 50);
      });
    }
  }

  function toggleMaxPriceInput() {
    const input = document.getElementById("maxPriceInput");
    input.style.display = input.style.display === "inline-block" ? "none" : "inline-block";
  }