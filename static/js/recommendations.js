// recommendations.js
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("query");
  if (!input) return;

  let debounceTimer;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const text = e.target.value.trim();
      if (text === "") return;  // don’t show empty popups
      addPopup(`📝 ${text}`);
    }, 200); // small debounce so it doesn’t spam popups too fast
  });
});
