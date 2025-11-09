document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (!input) return;

  // Create overlay dynamically
  const overlay = document.createElement("div");
  overlay.id = "recommendationOverlay";
  overlay.style.position = "fixed";
  overlay.style.top = "50%";
  overlay.style.left = "50%";
  overlay.style.transform = "translate(-50%, -50%)";
  overlay.style.width = "70%";
  overlay.style.height = "70%";
  overlay.style.background = "white";
  overlay.style.zIndex = "9999";
  overlay.style.display = "none";
  overlay.style.overflow = "auto";
  overlay.style.padding = "20px";
  overlay.style.borderRadius = "12px";
  overlay.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

  // Close button
  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "10px";
  closeBtn.style.right = "20px";
  closeBtn.style.cursor = "pointer";
  closeBtn.style.fontSize = "24px";
  closeBtn.onclick = () => overlay.style.display = "none";
  overlay.appendChild(closeBtn);

  // Content container
  const content = document.createElement("pre");
  content.id = "recommendationContent";
  content.style.whiteSpace = "pre-wrap";
  content.style.marginTop = "40px";
  overlay.appendChild(content);

  document.body.appendChild(overlay);

  let debounceTimer;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const text = e.target.value.trim();
    if (text.length <= 3) {
      overlay.style.display = "none";
      return;
    }

    debounceTimer = setTimeout(() => {
      fetch(`http://127.0.0.1:5000/api/synonyms?q=${encodeURIComponent(text)}`)
        .then(res => res.json())
        .then(data => {
          document.getElementById("recommendationContent").textContent = JSON.stringify(data, null, 2);
          overlay.style.display = "block";
        })
        .catch(err => {
          document.getElementById("recommendationContent").textContent = `❌ Error: ${err}`;
          overlay.style.display = "block";
        });
    }, 400);
  });
});
