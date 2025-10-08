// spinner.js — listens for spinnerChange events and reacts with popups + notifications

document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ spinner.js loaded — waiting for spinnerChange events...");

  // Listen for spinner state changes globally
  document.addEventListener("spinnerChange", async (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange event received → visible: ${visible}`);

    // Show popup (for debug / user feedback)
    showDebugPopup(visible ? "🌀 Spinner started" : "✅ Spinner stopped");

    // Send backend notification
    if (visible) {
      await sendSpinnerNotification("⚠️ Alert", "We are looking for your product!");
    } else {
      await sendSpinnerNotification("⚠️ Alert", "✅ Success! Products found.");
    }
  });
});

/**
 * Sends notification to Flask backend /notify endpoint
 */
async function sendSpinnerNotification(title, message) {
  console.log(`📡 Sending notification → ${title}: ${message}`);
  try {
    const response = await fetch("http://127.0.0.1:5000/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message }),
    });

    const result = await response.json();
    console.log("📨 Notification response:", result);
  } catch (err) {
    console.error("❌ Failed to send notification:", err.message);
  }
}

/**
 * Shows a small popup message (uses addPopup if available, or fallback div)
 */
function showDebugPopup(message) {
  if (typeof addPopup === "function") {
    addPopup(message);
  } else {
    // fallback popup if addPopup isn't defined yet
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.right = "20px";
    popup.style.background = "#333";
    popup.style.color = "#fff";
    popup.style.padding = "10px 16px";
    popup.style.borderRadius = "8px";
    popup.style.fontSize = "14px";
    popup.style.zIndex = 9999;
    popup.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
  }
}
