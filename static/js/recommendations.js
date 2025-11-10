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
    display: "none"
  });

  const content = document.createElement("div");
  Object.assign(content.style, {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  });
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // === Variables ===
  let debounceTimer;
  let hideTimer;
  let lastQuery = "";

  // === Event listener ===
  input.addEventListener("input", (e) => {
    const text = e.target.value.trim();

    // Immediately hide overlay & cancel pending requests if empty
    if (text === "") {
      overlay.style.display = "none";
      clearTimeout(debounceTimer);
      clearTimeout(hideTimer);
      lastQuery = "";
      return;
    }

    clearTimeout(debounceTimer);
    clearTimeout(hideTimer);

    // Only fetch if input changed (≥ 1 character)
    if (text !== lastQuery) {
      debounceTimer = setTimeout(() => {
        const currentText = input.value.trim();
        if (currentText === "") return;

        lastQuery = currentText;

        fetch(`/api/synonyms?q=${encodeURIComponent(currentText)}`)
          .then(res => res.json())
          .then(data => {
            if (!data.synonyms || !data.synonyms.length) {
              overlay.style.display = "none";
              return;
            }

            // Clear old content
            content.innerHTML = "";

            // Create clickable suggestion items
            data.synonyms.forEach((item) => {
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
                overlay.style.display = "none";
              });
              content.appendChild(suggestion);
            });

            overlay.style.display = "block";
          })
          .catch(err => {
            content.textContent = `❌ Error: ${err}`;
            overlay.style.display = "block";
          });
      }, 400);
    }

    // Hide overlay 1.2s after typing stops
    hideTimer = setTimeout(() => {
      overlay.style.display = "none";
    }, 1200);
  });
});
