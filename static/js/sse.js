/* ----------- SSE STREAM WITH PROCEDURAL RENDERING ---------- */
function startScrape(url, query, resultList, resultsDiv, onComplete) {
  showStoreSpinner(true); // 🔹 start spinner when scraping begins
  const source = new EventSource(`${url}?q=${encodeURIComponent(query)}`);
  let firstMessageReceived = false;
  let buffer = [];
  let rendering = false;

  function flushBuffer() {
    if (buffer.length === 0) return;
    const productsDiv = document.getElementById("products");
    buffer.forEach(p => {
      productsDiv.innerHTML += renderProductHTML(p);
    });
    buffer = [];
    rendering = false;
  }

  source.onmessage = function(event) {
    if (!firstMessageReceived) {
      if (!document.getElementById("products")) {
        resultsDiv.innerHTML = `<div id="products"></div>`;
      }
      firstMessageReceived = true;
    }

    const item = JSON.parse(event.data);
    if (item.type === "product") {
      buffer.push(item);
      resultList.push(item);
      localStorage.setItem("lastSearchResults", JSON.stringify(resultList));
      updateProductCountPopup(resultList.length);

      if (item.source) {
        globalStoreSet.add(cleanStoreName(item.source.trim()));
        updateStoreCountPopup(globalStoreSet.size);
      }

      if (!rendering) {
        rendering = true;
        requestAnimationFrame(() => setTimeout(flushBuffer, 50));
      }
    }
  };

  source.onerror = function() {
    source.close();
    onComplete();
  };
}

function search() {
  const query = document.getElementById("query").value.trim();
  const resultsDiv = document.getElementById("results");
  if (!query) {
    resultsDiv.innerHTML = "<p>Please enter a search term.</p>";
    return;
  }

  clearPopups();
  globalStoreSet.clear();
  resultsDiv.innerHTML = "<p>Loading products...</p>";
  const resultList = [];
  localStorage.setItem("lastSearchQuery", query);

  startScrape("http://127.0.0.1:5000/scrape", query, resultList, resultsDiv, function() {
    startScrape("http://127.0.0.1:5001/scrape", query, resultList, resultsDiv, function() {
      resultsDiv.innerHTML += "<p style='color:green;'>✅ Finished scraping all sources.</p>";
    });
  });
}
