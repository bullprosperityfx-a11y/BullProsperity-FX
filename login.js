document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  const memberButtons = document.querySelectorAll("[data-member-link]");
  const loginButtons = document.querySelectorAll("[data-login-link]");
  const authStatus = document.getElementById("authStatus");

  // LOGIN / SESSION AUFBAU
  const WHOP_LOGIN_URL = "https://whop.com/login";

  // PRODUKT / CHECKOUT
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
    return data && (data.role === "admin" || data.role === "premium");
  }

  const data = await getAccess();
  const premium = hasAccess(data);
  const isProtected = document.body.dataset.protected === "true";
  const redirectMode = document.body.dataset.redirectMode || "locked";

  if (isProtected && !premium) {
    if (redirectMode === "checkout") {
      window.location.href = WHOP_CHECKOUT_URL;
    } else {
      window.location.href = "locked.html";
    }
    return;
  }

  // LANDING PAGE BUTTON
  if (startButton) {
    startButton.href = premium ? "hub.html" : WHOP_CHECKOUT_URL;
    startButton.textContent = premium ? "Zum Mitgliederbereich" : "Jetzt starten";
  }

  // BUTTONS DIE DIREKT ZUM MITGLIEDERBEREICH SOLLEN
  memberButtons.forEach((btn) => {
    btn.href = premium ? "hub.html" : WHOP_CHECKOUT_URL;
  });

  // LOGIN BUTTONS = NUR EINLOGGEN
  loginButtons.forEach((btn) => {
    btn.href = WHOP_LOGIN_URL;
  });

  if (authStatus) {
    authStatus.textContent = premium
      ? "Aktive Membership erkannt."
      : "Keine aktive Membership erkannt.";
  }
});
