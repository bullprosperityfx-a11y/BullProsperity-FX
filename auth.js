document.addEventListener("DOMContentLoaded", async () => {
  const authBadge = document.getElementById("authBadge");
  const loginNavBtn = document.getElementById("loginNavBtn");

  const WHOP_LOGIN_URL = "/api/whop/login";

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    if (!res.ok) {
      if (loginNavBtn) {
        loginNavBtn.href = WHOP_LOGIN_URL;
        loginNavBtn.style.display = "";
      }

      if (authBadge) {
        authBadge.textContent = "Kein Zugang";
        authBadge.className = "auth-badge status-locked";
      }

      return;
    }

    const data = await res.json();
    const role = data?.role || "guest";

    if (role === "admin") {
      if (authBadge) {
        authBadge.textContent = "Admin Zugang aktiv";
        authBadge.className = "auth-badge status-admin";
      }
      if (loginNavBtn) loginNavBtn.style.display = "none";
      return;
    }

    if (role === "premium") {
      if (authBadge) {
        authBadge.textContent = "Premium aktiv";
        authBadge.className = "auth-badge status-premium";
      }
      if (loginNavBtn) loginNavBtn.style.display = "none";
      return;
    }

    if (loginNavBtn) {
      loginNavBtn.href = WHOP_LOGIN_URL;
      loginNavBtn.style.display = "";
    }

    if (authBadge) {
      authBadge.textContent = "Kein Zugang";
      authBadge.className = "auth-badge status-locked";
    }
  } catch (err) {
    if (loginNavBtn) {
      loginNavBtn.href = WHOP_LOGIN_URL;
      loginNavBtn.style.display = "";
    }

    if (authBadge) {
      authBadge.textContent = "Kein Zugang";
      authBadge.className = "auth-badge status-locked";
    }
  }
});
