<script>
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (!input) return;

  const overlay = document.createElement("div");
  overlay.id = "recommendationOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "95%",
    height: "70%",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    overflowY: "auto",
    padding: "20px",
    zIndex: "9999",
    display: "none"
  });

  const content = document.createElement("div");
  content.style.display = "flex";
  content.style.flexDirection = "column";
  content.style.gap = "8px";
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let debounceTimer;
  let lastQuery = "";

  // === Fetch Jumia suggestions with error capture ===
  async function fetchJumiaSuggestions(query) {
    const url = `https://www.jumia.co.ke/fragment/suggestions/?query=${encodeURIComponent(query)}&lang=en`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const results = Array.from(doc.querySelectorAll("div.name, p"))
        .map(el => el.textContent.trim())
        .filter(Boolean);

      return { items: [...new Set(results)], error: null };
    } catch (err) {
      console.error("❌ Jumia fetch error:", err);
      return { items: [], error: err.message || String(err) };
    }
  }

  // === Render suggestions + error ===
  function renderSuggestions(items, error) {
    content.innerHTML = "";

    if (!items.length) {
      const empty = document.createElement("div");
      empty.textContent = "No recommendations found.";
      empty.style.fontStyle = "italic";
      content.appendChild(empty);

      if (error) {
        const errDiv = document.createElement("div");
        errDiv.textContent = `❌ ${error}`;
        errDiv.style.color = "crimson";
        errDiv.style.fontSize = "13px";
        errDiv.style.marginTop = "6px";
        content.appendChild(errDiv);
      }
      return;
    }

    items.forEach(item => {
      const suggestion = document.createElement("div");
      suggestion.textContent = item;
      Object.assign(suggestion.style, {
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#f8f8f8",
        cursor: "pointer"
      });

      suggestion.addEventListener("click", () => {
        input.value = item;
        input.focus();
        overlay.style.display = "none";
      });

      content.appendChild(suggestion);
    });
  }

  // === Input listener ===
  input.addEventListener("input", () => {
    const text = input.value.trim();
    clearTimeout(debounceTimer);

    if (!text) {
      overlay.style.display = "none";
      lastQuery = "";
      return;
    }

    overlay.style.display = "block";
    content.textContent = "Loading suggestions...";

    if (text !== lastQuery) {
      debounceTimer = setTimeout(async () => {
        lastQuery = input.value.trim();
        if (!lastQuery) return;

        const { items, error } = await fetchJumiaSuggestions(lastQuery);
        renderSuggestions(items, error);
      }, 400);
    }
  });

  document.addEventListener("click", e => {
    if (!overlay.contains(e.target) && e.target !== input) {
      overlay.style.display = "none";
    }
  });
});
</script>
