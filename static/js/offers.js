// spinner.js — listens for spinnerChange and renders offers overlay

document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ spinner.js loaded — enhanced with Offers overlay feature");

  document.addEventListener("spinnerChange", async (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      showDebugPopup("🌀 Searching for offers...");
      await triggerOfferScheduler();
    } else {
      showDebugPopup("✅ Search complete. Fetching offers soon...");
      setTimeout(fetchAndPrepareOffers, 5000);
    }
  });
});

/* ---------------- POST to /notify_scheduler ---------------- */
async function triggerOfferScheduler() {
  try {
    const payload = {
      title: "Offers",
      message: "shoes",
      loops: 0,
      seconds: 0
    };
    const res = await fetch("/notify_scheduler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("📡 Scheduler response:", await res.text());
  } catch (err) {
    console.error("❌ Scheduler request failed:", err);
  }
}

/* ---------------- FETCH OFFERS JSON ---------------- */
async function fetchAndPrepareOffers() {
  try {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    console.log("📦 Offers JSON:", data);

    if (!Array.isArray(data) || !data[0]) {
      showDebugPopup("⚠️ No offers found.");
      return;
    }

    window.offersCache = data[0]; // store globally
    createOffersButton();
  } catch (err) {
    console.error("❌ Failed to fetch offers JSON:", err);
    showDebugPopup("⚠️ Failed to load offers data.");
  }
}

/* ---------------- CREATE FLOATING BUTTON ---------------- */
function createOffersButton() {
  if (document.getElementById("offersButton")) return; // already exists

  const btn = document.createElement("button");
  btn.id = "offersButton";
  btn.textContent = "💰 Offers";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#0b76ef",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    borderRadius: "50px",
    padding: "12px 20px",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    cursor: "pointer",
    zIndex: 9999
  });

  btn.addEventListener("click", showOffersOverlay);
  document.body.appendChild(btn);
  showDebugPopup("💰 Offers ready — click to view!");
}

/* ---------------- CREATE OFFERS OVERLAY ---------------- */
function showOffersOverlay() {
  if (document.getElementById("offersOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "offersOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.8)",
    color: "#fff",
    overflowY: "auto",
    zIndex: 10000,
    padding: "40px 20px"
  });

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "20px",
    right: "30px",
    fontSize: "36px",
    cursor: "pointer"
  });
  closeBtn.onclick = () => overlay.remove();

  const header = document.createElement("h2");
  header.textContent = "🔥 Offers Found";
  header.style.textAlign = "center";
  header.style.marginBottom = "20px";

  const container = document.createElement("div");
  Object.assign(container.style, {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    maxWidth: "1000px",
    margin: "0 auto"
  });

  const offersData = window.offersCache || {};
  for (const [store, items] of Object.entries(offersData)) {
    if (store === "timestamp") continue;
    const storeTitle = document.createElement("h3");
    storeTitle.textContent = store.toUpperCase();
    storeTitle.style.gridColumn = "1 / -1";
    container.appendChild(storeTitle);

    (items || []).forEach(prod => {
      const card = document.createElement("div");
      Object.assign(card.style, {
        background: "#fff",
        color: "#111",
        borderRadius: "12px",
        padding: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
      });
      card.innerHTML = `
        <img src="${prod.image}" alt="${prod.title}" style="width:100%;border-radius:8px;">
        <h4 style="margin:8px 0;">${prod.title}</h4>
        <p style="color:#0b76ef;font-weight:bold;">${prod.price}</p>
        <a href="${prod.product_link}" target="_blank" style="color:#0b76ef;text-decoration:underline;">View</a>
      `;
      container.appendChild(card);
    });
  }

  overlay.append(closeBtn, header, container);
  document.body.appendChild(overlay);
}

/* ---------------- POPUP FALLBACK ---------------- */
function showDebugPopup(message) {
  if (typeof addPopup === "function") {
    addPopup(message);
  } else {
    const popup = document.createElement("div");
    popup.textContent = message;
    Object.assign(popup.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#333",
      color: "#fff",
      padding: "10px 16px",
      borderRadius: "8px",
      fontSize: "14px",
      zIndex: 9999,
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
    });
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 2500);
  }
}
