const BullProsperityAuth = (() => {
  const ACCESS_ENDPOINT = "/api/access";
  const WHOP_LOGIN_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/"; // <- deinen echten Link hier einsetzen

  async function getAccess() {
    try {
      const res = await fetch(ACCESS_ENDPOINT, {
        credentials: "include",
        cache: "no-store"
      });

      if (!res.ok) {
        throw new Error("Access check failed");
      }

      return await res.json();
    } catch (error) {
      return null;
    }
  }

  function hasPremiumAccess(data) {
    if (!data || !data.role) return false;
    return data.role === "admin" || data.role === "premium";
  }

  async function protectPage() {
    const data = await getAccess();

    if (!hasPremiumAccess(data)) {
      window.location.href = "locked.html";
      return;
    }

    document.documentElement.setAttribute("data-auth-ready", "true");
  }

  async function setupPublicButtons() {
    const data = await getAccess();
    const hasAccess = hasPremiumAccess(data);

    const startButton = document.getElementById("startButton");
    const memberButtons = document.querySelectorAll("[data-member-link]");
    const loginButtons = document.querySelectorAll("[data-login-link]");
    const logoutButtons = document.querySelectorAll("[data-logout-link]");

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

    logoutButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();

        try {
          await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
          });
        } catch (error) {}

        window.location.href = "index.html";
      });
    });

    const authStatus = document.getElementById("authStatus");
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
      await setupPublicButtons();
    }
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
  BullProsperityAuth.init();
});
