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

  let fetchInterval;

  input.addEventListener("input", (e) => {
    const text = e.target.value.trim();

    if (text.length <= 3) {
      overlay.style.display = "none";
      clearInterval(fetchInterval);
      return;
    }

    overlay.style.display = "block"; // show overlay while typing

    // Start polling every 400ms if not already started
    if (!fetchInterval) {
      fetchInterval = setInterval(() => {
        const query = input.value.trim();
        if (query.length <= 3) {
          overlay.style.display = "none";
          clearInterval(fetchInterval);
          fetchInterval = null;
          return;
        }

        fetch(`/api/synonyms?q=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => {
            content.textContent = JSON.stringify(data, null, 2);
          })
          .catch(err => {
            content.textContent = `❌ Error: ${err}`;
          });
      }, 400); // poll every 400ms
    }
  });

  // Stop polling if user blurs input
  input.addEventListener("blur", () => {
    overlay.style.display = "none";
    clearInterval(fetchInterval);
    fetchInterval = null;
  });
});
