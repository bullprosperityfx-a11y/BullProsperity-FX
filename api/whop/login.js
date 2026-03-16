document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  const memberButtons = document.querySelectorAll("[data-member-link]");
  const loginButtons = document.querySelectorAll("[data-login-link]");

  const WHOP_LOGIN_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";

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

  if (document.body.dataset.protected === "true") {
    const data = await getAccess();

    if (!hasAccess(data)) {
      window.location.href = "locked.html";
      return;
    }
  } else {
    const data = await getAccess();
    const premium = hasAccess(data);

    if (startButton) {
      startButton.href = premium ? "hub.html" : WHOP_LOGIN_URL;
      startButton.textContent = premium ? "Zum Mitgliederbereich" : "Jetzt starten";
    }

    memberButtons.forEach((btn) => {
      btn.href = premium ? "hub.html" : WHOP_LOGIN_URL;
    });

    loginButtons.forEach((btn) => {
      btn.href = WHOP_LOGIN_URL;
    });
  }
});
