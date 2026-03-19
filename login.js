document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginNavBtn");
  const authStatus = document.getElementById("authStatus");
  const statusDot = document.getElementById("statusDot");

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    const data = await res.json();

    // 🔥 DEFAULT (nicht eingeloggt)
    if (authStatus) authStatus.textContent = "Kein Zugang";
    if (statusDot) statusDot.className = "status-dot status-locked";

    // 🔥 ADMIN oder PREMIUM
    if (data.role === "admin" || data.role === "premium") {

      // Login Button weg
      if (loginBtn) loginBtn.style.display = "none";

      // Status setzen
      if (authStatus) {
        authStatus.textContent =
          data.role === "admin"
            ? "Admin Zugang aktiv"
            : "Premium aktiv";
      }

      if (statusDot) {
        statusDot.className =
          "status-dot " +
          (data.role === "admin" ? "status-admin" : "status-premium");
      }

    }

  } catch (err) {
    console.log("Auth Fehler");

    if (authStatus) authStatus.textContent = "Fehler";
    if (statusDot) statusDot.className = "status-dot status-locked";
  }
});
