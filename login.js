document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  if (!startButton) return;

  const WHOP_LOGIN_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    const data = await res.json();
    const hasAccess = data && (data.role === "admin" || data.role === "premium");

    if (hasAccess) {
      startButton.href = "hub.html";
      startButton.textContent = "Zum Mitgliederbereich";
    } else {
      startButton.href = WHOP_LOGIN_URL;
      startButton.textContent = "Jetzt starten";
    }
  } catch (err) {
    startButton.href = WHOP_LOGIN_URL;
    startButton.textContent = "Jetzt starten";
  }
});
