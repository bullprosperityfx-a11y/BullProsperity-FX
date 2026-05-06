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

    if (authStatus) authStatus.textContent = "Kein Zugang";
    if (statusDot) statusDot.className = "status-dot status-locked";

    if (data.role === "admin" || data.role === "premium") {
      if (loginBtn) loginBtn.style.display = "none";

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

      startInactivityLogout();
    }

  } catch (err) {
    console.log("Auth Fehler");

    if (authStatus) authStatus.textContent = "Fehler";
    if (statusDot) statusDot.className = "status-dot status-locked";
  }
});

function startInactivityLogout() {
  const INACTIVITY_LIMIT = 45 * 60 * 1000; // 45 Minuten
  let inactivityTimer;
  let vimeoIsPlaying = false;

  function logoutUser() {
    document.cookie = "bp_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "bp_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "whop_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.href = "/locked.html?session=expired";
  }

  function isHtmlVideoPlaying() {
    const videos = document.querySelectorAll("video");

    for (const video of videos) {
      if (!video.paused && !video.ended && video.readyState > 2) {
        return true;
      }
    }

    return false;
  }

  function checkActivity() {
    if (isHtmlVideoPlaying() || vimeoIsPlaying) {
      resetTimer();
      return;
    }

    logoutUser();
  }

  function resetTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(checkActivity, INACTIVITY_LIMIT);
  }

  [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "click"
  ].forEach((eventName) => {
    document.addEventListener(eventName, resetTimer, true);
  });

  document.querySelectorAll("video").forEach((video) => {
    ["play", "pause", "seeking", "timeupdate"].forEach((eventName) => {
      video.addEventListener(eventName, resetTimer);
    });
  });

  function loadVimeoApi(callback) {
    if (window.Vimeo && window.Vimeo.Player) {
      callback();
      return;
    }

    const existingScript = document.querySelector('script[src="https://player.vimeo.com/api/player.js"]');

    if (existingScript) {
      existingScript.addEventListener("load", callback);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://player.vimeo.com/api/player.js";
    script.onload = callback;
    document.body.appendChild(script);
  }

  function setupVimeoTracking() {
    const vimeoIframes = document.querySelectorAll('iframe[src*="player.vimeo.com"]');

    if (!vimeoIframes.length) return;

    loadVimeoApi(() => {
      vimeoIframes.forEach((iframe) => {
        try {
          const player = new Vimeo.Player(iframe);

          player.on("play", () => {
            vimeoIsPlaying = true;
            resetTimer();
          });

          player.on("playing", () => {
            vimeoIsPlaying = true;
            resetTimer();
          });

          player.on("timeupdate", () => {
            vimeoIsPlaying = true;
            resetTimer();
          });

          player.on("pause", () => {
            vimeoIsPlaying = false;
            resetTimer();
          });

          player.on("ended", () => {
            vimeoIsPlaying = false;
            resetTimer();
          });

        } catch (err) {
          console.log("Vimeo Tracking Fehler");
        }
      });
    });
  }

  setupVimeoTracking();

  resetTimer();
}
