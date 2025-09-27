  /* ---------------- STORE OVERLAY ---------------- */
  function showStoreOverlay() {
    const overlay = document.getElementById("storeOverlay");
    const grid = document.getElementById("storeGrid");
    grid.innerHTML = "";

    const saved = localStorage.getItem("lastSearchResults");
    if (saved) {
      globalStoreSet.clear();
      JSON.parse(saved).forEach(p => {
        if (p.source) globalStoreSet.add(cleanStoreName(p.source.trim()));
      });
    }

    const stores = Array.from(globalStoreSet);
    if (stores.length === 0) {
      grid.innerHTML = "<p>No stores found yet.</p>";
    } else {
      stores.forEach(store => {
        const div = document.createElement("div");
        div.className = "store-item";
        div.textContent = store;
        div.onclick = () => filterByStore(store);
        grid.appendChild(div);
      });
    }

    overlay.style.display = "flex";
  }

  function hideStoreOverlay(event) {
    if (event) event.stopPropagation();
    document.getElementById("storeOverlay").style.display = "none";
  }

  function filterByStore(storeName) {
    const saved = localStorage.getItem("lastSearchResults");
    if (!saved) return;
    const products = JSON.parse(saved);
    const filtered = products.filter(p => cleanStoreName(p.source || "").trim() === storeName.trim());

    sortedProducts = filtered;
    sortedRenderedCount = 0;
    const productsDiv = document.getElementById("products");
    if (productsDiv) productsDiv.innerHTML = "";
    loadNextSortedBatch();
    if (sortedProducts.length > BATCH_SIZE) {
      setTimeout(loadRemainingSortedBatches, 100);
    }

    hideStoreOverlay();
  }