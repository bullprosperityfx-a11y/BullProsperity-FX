document.addEventListener("DOMContentLoaded", async () => {
  const startButton = document.getElementById("startButton");
  const memberButtons = document.querySelectorAll("[data-member-link]");
  const loginButtons = document.querySelectorAll("[data-login-link]");
  const authStatus = document.getElementById("authStatus");
  const authDot =
    document.getElementById("statusDot") || document.querySelector(".status-dot");
  const authBadge = document.getElementById("authBadge");

  const WHOP_LOGIN_URL = "https://whop.com/bullprosperity-fx/bullprosperity-fx/";
  const LOCKED_URL = "locked.html";

  async function getAccess() {
    try {
      const res = await fetch("/api/access", {
        credentials: "include",
        cache: "no-store"
      });

      if (!res.ok) throw new Error("Access request failed");
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  function getRole(data) {
    if (!data || !data.role) return "guest";
    return data.role;
  }

  function hasMainAccess(role) {
    return role === "admin" || role === "premium";
  }

  function hasLongtermAccess(role) {
    return role === "admin" || role === "premium" || role === "longterm";
  }

  function getDefaultMemberPage(role) {
    if (hasMainAccess(role)) return "hub.html";
    return WHOP_LOGIN_URL;
  }

  function updateStatusUI(role) {
    let text = "Kein Zugang";
    let cls = "status-locked";

    if (role === "admin") {
      text = "Admin Zugang aktiv";
      cls = "status-admin";
    } else if (role === "premium") {
      text = "Premium aktiv";
      cls = "status-premium";
    } else if (role === "longterm") {
      text = "Longterm aktiv";
      cls = "status-longterm";
    }

    if (authStatus) {
      authStatus.textContent = text;
    }

    if (authDot) {
      authDot.classList.remove(
        "status-admin",
        "status-premium",
        "status-longterm",
        "status-locked"
      );
      authDot.classList.add(cls);
    }

    if (authBadge) {
      authBadge.textContent = text;
      authBadge.classList.remove(
        "status-admin",
        "status-premium",
        "status-longterm",
        "status-locked"
      );
      authBadge.classList.add(cls);
    }
  }

  function handleLoginButtons(role) {
    loginButtons.forEach((btn) => {
      if (hasMainAccess(role) || hasLongtermAccess(role)) {
        btn.style.display = "none";
      } else {
        btn.href = WHOP_LOGIN_URL;
        btn.style.display = "";
      }
    });
  }

  function handleMemberButtons(role) {
    memberButtons.forEach((btn) => {
      const target = btn.dataset.target || "hub";

      if (target === "longterm") {
        btn.href = hasLongtermAccess(role) ? "longterm.html" : "longterm-sales.html";
        return;
      }

      if (target === "course") {
        btn.href = hasMainAccess(role) ? "course.html" : WHOP_LOGIN_URL;
        return;
      }

      if (target === "tools") {
        btn.href = hasMainAccess(role) ? "tools.html" : WHOP_LOGIN_URL;
        return;
      }

      if (target === "setup-room") {
        btn.href = hasMainAccess(role) ? "setup-room.html" : WHOP_LOGIN_URL;
        return;
      }

      if (target === "community") {
        btn.href = hasMainAccess(role) ? "community.html" : WHOP_LOGIN_URL;
        return;
      }

      btn.href = getDefaultMemberPage(role);
    });
  }

  const data = await getAccess();
  const role = getRole(data);

  const isProtected = document.body.dataset.protected === "true";
  const pageType = document.body.dataset.page || "main";

  let allowed = true;

  if (isProtected) {
    if (pageType === "longterm") {
      allowed = hasLongtermAccess(role);
    } else {
      allowed = hasMainAccess(role);
    }

    if (!allowed) {
      if (pageType === "longterm") {
        window.location.href = "longterm-sales.html";
      } else {
        window.location.href = LOCKED_URL;
      }
      return;
    }
  }

  if (startButton) {
    startButton.href = hasMainAccess(role) ? "hub.html" : WHOP_LOGIN_URL;
    startButton.textContent = hasMainAccess(role)
      ? "Zum Mitgliederbereich"
      : "Jetzt starten";
  }

  handleLoginButtons(role);
  handleMemberButtons(role);
  updateStatusUI(role);

  document.body.style.visibility = "visible";
});
