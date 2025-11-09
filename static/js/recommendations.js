document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (!input) return;

  // Create overlay dynamically
  const overlay = document.createElement("div");
  overlay.id = "recommendationOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "70%",
    height: "70%",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    overflow: "auto",
    padding: "20px",
    zIndex: "9999",
    display: "none"
  });

  const content = document.createElement("pre");
  Object.assign(content.style, {
    whiteSpace: "pre-wrap",
    margin: 0
  });
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  let debounceTimer;
  let hideTimer;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    clearTimeout(hideTimer);

    const text = e.target.value.trim();
    if (text === "") {
      overlay.style.display = "none";
      return;
    }

    // Show popup like before
    addPopup(`📝 ${text}`);

    // Only fetch when >3 characters
    if (text.length > 3) {
      debounceTimer = setTimeout(() => {
        fetch(`/api/synonyms?q=${encodeURIComponent(text)}`)
          .then(res => res.json())
          .then(data => {
            content.textContent = JSON.stringify(data, null, 2);
            overlay.style.display = "block";
          })
          .catch(err => {
            content.textContent = `❌ Error: ${err}`;
            overlay.style.display = "block";
          });
      }, 400);
    }

    // Hide overlay a bit after user stops typing
    hideTimer = setTimeout(() => {
      overlay.style.display = "none";
    }, 1200);
  });
});
