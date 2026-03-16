const BullProsperityAuth = (() => {
  const ACCESS_ENDPOINT = "/api/access";

  // HIER DEINEN ECHTEN WHOP LINK EINTRAGEN
  const WHOP_LOGIN_URL = "https://whop.com/joined/bullprosperity-fx/products/bullprosperity-fx/";

  function hasPremiumAccess(data) {
    return !!data && (data.role === "admin" || data.role === "premium");
  }

  async function getAccess() {
    try {
      const res = await fetch(ACCESS_ENDPOINT, {
        credentials: "include",
        cache: "no-store"
      });

      if (!res.ok) throw new Error("Access check failed");
      return await res.json();
    } catch (error) {
      return null;
    }
  }

  async function protectPage() {
    const data = await getAccess();

    if (!hasPremiumAccess(data)) {
      window.location.href = "locked.html";
      return;
    }

    const authStatus = document.getElementById("authStatus");
    if (authStatus) {
      authStatus.textContent = `Zugang aktiv${data.role ? " • " + data.role : ""}`;
    }
  }

  async function setupPublicPage() {
    const data = await getAccess();
    const hasAccess = hasPremiumAccess(data);

    const startButton = document.getElementById("startButton");
    const memberButtons = document.querySelectorAll("[data-member-link]");
    const loginButtons = document.querySelectorAll("[data-login-link]");
    const authStatus = document.getElementById("authStatus");

    if (startButton) {
      if (hasAccess) {
        startButton.href = "hub.html";
        startButton.textContent = "Zum Mitgliederbereich";
      } else {
        startButton.href = WHOP_LOGIN_URL;
        startButton.textContent = "Jetzt starten";
      }
    }

    memberButtons.forEach((btn) => {
      btn.href = hasAccess ? "hub.html" : WHOP_LOGIN_URL;
    });

    loginButtons.forEach((btn) => {
      btn.href = WHOP_LOGIN_URL;
    });

    if (authStatus) {
      authStatus.textContent = hasAccess
        ? "Premium Zugang erkannt."
        : "Kein aktiver Premium-Zugang erkannt.";
    }
  }

  async function init() {
    const isProtected = document.body.dataset.protected === "true";

    if (isProtected) {
      await protectPage();
    } else {
      await setupPublicPage();
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  BullProsperityAuth.init();
});
