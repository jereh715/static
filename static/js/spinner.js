// spinner.js — listens for spinner state changes and sends notifications

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ spinner.js loaded and listening for spinner changes...");

  // Listen for spinnerChange event globally
  document.addEventListener("spinnerChange", async (event) => {
    const { visible } = event.detail;

    if (visible) {
      // 🔹 Spinner started
      await sendSpinnerNotification("⚠️ Alert", "We are looking for your product!");
    } else {
      // 🔹 Spinner stopped
      await sendSpinnerNotification("⚠️ Alert", "✅ Success! Products found.");
    }
  });
});

/**
 * Sends notification to backend via Flask endpoint /notify
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
async function sendSpinnerNotification(title, message) {
  try {
    const response = await fetch("http://127.0.0.1:5000/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message })
    });

    if (!response.ok) {
      console.error("❌ Failed to send spinner notification:", response.statusText);
      return;
    }

    const result = await response.json();
    if (result.status === "success") {
      console.log(`📨 Notification sent → ${result.title}: ${result.message || message}`);
    } else {
      console.warn("⚠️ Notification error:", result.message || "Unknown error");
    }
  } catch (err) {
    console.error("❌ Error sending spinner notification:", err.message);
  }
}
