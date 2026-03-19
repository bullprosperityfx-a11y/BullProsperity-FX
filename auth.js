document.addEventListener("DOMContentLoaded", async () => {
  const authBadge = document.getElementById("authBadge");
  const loginNavBtn = document.getElementById("loginNavBtn");

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    if (!res.ok) {
      window.location.href = "locked.html";
      return;
    }

    const data = await res.json();
    const role = data?.role || "guest";

    if (role !== "admin" && role !== "premium") {
      window.location.href = "locked.html";
      return;
    }

    if (authBadge) {
      if (role === "admin") {
        authBadge.textContent = "Admin Zugang aktiv";
        authBadge.className = "auth-badge status-admin";
      } else {
        authBadge.textContent = "Premium aktiv";
        authBadge.className = "auth-badge status-premium";
      }
    }

    if (loginNavBtn) {
      loginNavBtn.style.display = "none";
    }

  } catch (err) {
    window.location.href = "locked.html";
  }
});
