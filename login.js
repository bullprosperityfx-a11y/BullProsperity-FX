document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  const memberButtons = document.querySelectorAll("[data-member-link]");
  const loginButtons = document.querySelectorAll("[data-login-link]");
  const authStatus = document.getElementById("authStatus");
  const authDot = document.querySelector(".status-dot");

  // Nur Login / Session aufbauen
  const WHOP_LOGIN_URL = "https://whop.com/login";

  // Produkt / Checkout
  const WHOP_CHECKOUT_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";

  async function getAccess() {
    try {
      const res = await fetch("/api/access", {
        credentials: "include",
        cache: "no-store"
      });

      if (!res.ok) throw new Error("Access failed");
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  function hasAccess(data) {
    return !!data && (data.role === "admin" || data.role === "premium");
  }

  const data = await getAccess();
  const premium = hasAccess(data);
  const isProtected = document.body.dataset.protected === "true";

  // Geschützte Seiten immer erst auf locked.html
  if (isProtected && !premium) {
    window.location.href = "locked.html";
    return;
  }

  // Landing Page Hauptbutton
  if (startButton) {
    startButton.href = premium ? "hub.html" : WHOP_CHECKOUT_URL;
    startButton.textContent = premium ? "Zum Mitgliederbereich" : "Jetzt starten";
  }

  // Buttons: Mitglied werden -> Produkt
  memberButtons.forEach((btn) => {
    btn.href = premium ? "hub.html" : WHOP_CHECKOUT_URL;
  });

  // Buttons: Login mit Whop -> nur Login
  loginButtons.forEach((btn) => {
    btn.href = WHOP_LOGIN_URL;
  });

  if (authStatus) {
    if (premium && data.role === "admin") {
      authStatus.textContent = "Admin Zugang aktiv";
      if (authDot) authDot.classList.add("status-admin");
    } else if (premium) {
      authStatus.textContent = "Premium aktiv";
      if (authDot) authDot.classList.add("status-premium");
    } else {
      authStatus.textContent = "Kein Zugang";
      if (authDot) authDot.classList.add("status-locked");
    }
  }
});
