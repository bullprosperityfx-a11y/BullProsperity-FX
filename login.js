document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  const memberButtons = document.querySelectorAll("[data-member-link]");
  const loginButtons = document.querySelectorAll("[data-login-link]");
  const authStatus = document.getElementById("authStatus");
  const authDot = document.querySelector(".status-dot");

  const WHOP_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";

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
      window.location.href = WHOP_URL;
    } else {
      window.location.href = "locked.html";
    }
    return;
  }

  if (startButton) {
    startButton.href = premium ? "hub.html" : WHOP_URL;
    startButton.textContent = premium ? "Zum Mitgliederbereich" : "Jetzt starten";
  }

  memberButtons.forEach((btn) => {
    btn.href = premium ? "hub.html" : WHOP_URL;
  });

  loginButtons.forEach((btn) => {
    btn.href = WHOP_URL;
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
