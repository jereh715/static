// offers.js — listens for spinnerChange and renders offers overlay

document.addEventListener("DOMContentLoaded", () => {
  console.log("⚙️ offers.js loaded — Offers overlay only (no popups)");

  document.addEventListener("spinnerChange", async (event) => {
    const { visible } = event.detail || {};
    console.log(`🔄 spinnerChange → visible: ${visible}`);

    if (visible) {
      await triggerOfferScheduler();
    } else {
      setTimeout(fetchAndPrepareOffers, 5000);
    }
  });
});

/* ---------------- POST to /notify_scheduler ---------------- */
async function triggerOfferScheduler() {
  try {
    const lastQuery =
      window.currentSearchQuery ||
      localStorage.getItem("lastSearchQuery") ||
      "default";

    const payload = {
      title: "Offers",
      message: lastQuery,
      loops: 2,
      seconds: 7200
    };

    console.log("📨 Sending payload to scheduler:", payload);

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
      console.warn("⚠️ No offers found in JSON. Skipping button creation.");
      return;
    }

    window.offersCache = data[0];
    createOffersButton();

    // Start polling in case button creation happens too early
    pollOffersButton(5, 5000);
  } catch (err) {
    console.error("❌ Failed to fetch offers JSON:", err);
  }
}

/* ---------------- POLLING: RETRY OFFERS BUTTON CREATION ---------------- */
function pollOffersButton(retries = 5, interval = 5000) {
  let attempts = 0;

  const poller = setInterval(() => {
    attempts++;
    const btnExists = !!document.getElementById("offersButton");
    const hasData = !!(window.offersCache && Object.keys(window.offersCache).length);

    if (btnExists) {
      console.log("✅ Offers button already present. Polling stopped.");
      clearInterval(poller);
      return;
    }

    if (hasData) {
      console.log(`🔁 Poll attempt ${attempts} → trying to create button again`);
      createOffersButton();
    }

    if (attempts >= retries) {
      console.warn("⏹️ Max polling attempts reached. Stopping retries.");
      clearInterval(poller);
    }
  }, interval);
}

/* ---------------- CREATE FLOATING BUTTON ---------------- */
function createOffersButton() {
  if (document.getElementById("offersButton")) return;

  const btn = document.createElement("button");
  btn.id = "offersButton";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "none",
    border: "none",
    padding: "0",
    cursor: "pointer",
    zIndex: 9999,
  });

  const img = document.createElement("img");
  img.src = "/static_updated/js/discount.png";
  img.alt = "Offers";
  Object.assign(img.style, {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "contain",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  });

  img.addEventListener("mouseenter", () => {
    img.style.transform = "scale(1.1)";
    img.style.boxShadow = "0 6px 18px rgba(11, 118, 239, 0.5)";
  });

  img.addEventListener("mouseleave", () => {
    img.style.transform = "scale(1)";
    img.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
  });

  btn.appendChild(img);
  btn.addEventListener("click", showOffersOverlay);
  document.body.appendChild(btn);

  console.log("💰 Offers button created.");
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
    padding: "40px 20px",
  });

  const closeBtn = document.createElement("span");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "20px",
    right: "30px",
    fontSize: "36px",
    cursor: "pointer",
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
    margin: "0 auto",
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
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
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
