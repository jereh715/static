<script>
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (!input) return;

  // === Create overlay dynamically ===
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
    display: "none",
    transition: "opacity 0.2s ease"
  });

  const content = document.createElement("div");
  Object.assign(content.style, {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  });
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let debounceTimer;
  let lastQuery = "";

  // === Fetch Jumia suggestions ===
  async function fetchJumiaSuggestions(query) {
    const url = `https://www.jumia.co.ke/fragment/suggestions/?query=${encodeURIComponent(query)}&lang=en`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const results = Array.from(doc.querySelectorAll("div.name, p"))
        .map(el => el.textContent.trim())
        .filter(Boolean);

      return [...new Set(results)].slice(0, 20);
    } catch (err) {
      console.error("❌ Jumia fetch error:", err);
      return [];
    }
  }

  // === Render suggestions ===
  function renderSuggestions(items) {
    content.innerHTML = "";

    if (!items || !items.length) {
      content.textContent = "No recommendations found.";
      return;
    }

    items.forEach(item => {
      const suggestion = document.createElement("div");
      suggestion.textContent = item;
      Object.assign(suggestion.style, {
        padding: "10px 14px",
        borderRadius: "8px",
        background: "#f8f8f8",
        cursor: "pointer",
        transition: "background 0.2s"
      });

      suggestion.addEventListener("mouseover", () => {
        suggestion.style.background = "#e6e6e6";
      });
      suggestion.addEventListener("mouseout", () => {
        suggestion.style.background = "#f8f8f8";
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
  input.addEventListener("input", e => {
    const text = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (text === "") {
      overlay.style.display = "none";
      lastQuery = "";
      return;
    }

    overlay.style.display = "block";
    overlay.style.opacity = "1";
    content.textContent = "Loading suggestions...";

    if (text !== lastQuery) {
      debounceTimer = setTimeout(async () => {
        const currentText = input.value.trim();
        if (!currentText) return;
        lastQuery = currentText;

        const suggestions = await fetchJumiaSuggestions(currentText);
        renderSuggestions(suggestions);
      }, 400);
    }
  });

  // === Hide overlay on outside click ===
  document.addEventListener("click", e => {
    if (!overlay.contains(e.target) && e.target !== input) {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.style.display = "none";
      }, 200);
    }
  });
});
</script>
