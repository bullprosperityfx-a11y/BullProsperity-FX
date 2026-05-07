document.addEventListener("DOMContentLoaded", async () => {
  const loginBtn = document.getElementById("loginNavBtn");
  const authStatus = document.getElementById("authStatus");
  const statusDot = document.getElementById("statusDot");

  let accessData = null;

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    const data = await res.json();
    accessData = data;

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

      startInactivityLogout(accessData);
    }

  } catch (err) {
    console.log("Auth Fehler");

    if (authStatus) authStatus.textContent = "Fehler";
    if (statusDot) statusDot.className = "status-dot status-locked";
  }

  await trackLessonOpen(accessData);
  setupVimeoWatchtimeTracking(accessData);
});

async function trackLessonOpen(accessData) {
  try {
    const path = window.location.pathname.toLowerCase();

    const isLessonPage = path.includes("lesson");

    if (!isLessonPage) return;

    if (!window.supabaseClient) {
      console.log("Supabase Client nicht geladen");
      return;
    }

    const userEmail =
      accessData?.email || "admin@bullprosperity.local";

    const lessonTitle =
      document.querySelector("h1")?.textContent?.trim() ||
      document.title ||
      "Unbekannte Lesson";

    const { error } = await supabaseClient
      .from("lesson_activity")
      .insert({
        email: userEmail,
        role: accessData?.role || "guest",
        lesson: lessonTitle,
        lesson_url: window.location.pathname,
        action: "lesson_opened"
      });

    if (error) {
      console.log("Lesson Tracking Fehler:", error);
    } else {
      console.log("Lesson Tracking gespeichert");
    }

  } catch (err) {
    console.log("Lesson Tracking System Fehler:", err);
  }
}

function setupVimeoWatchtimeTracking(accessData) {
  try {
    const path = window.location.pathname.toLowerCase();
    const isLessonPage = path.includes("lesson");

    if (!isLessonPage) return;

    if (!window.supabaseClient) {
      console.log("Watchtime: Supabase Client nicht geladen");
      return;
    }

    const vimeoIframes = document.querySelectorAll(
      'iframe[src*="player.vimeo.com"]'
    );

    if (!vimeoIframes.length) {
      console.log("Watchtime: Kein Vimeo Video gefunden");
      return;
    }

    loadVimeoApi(() => {
      vimeoIframes.forEach((iframe) => {
        try {
          const player = new Vimeo.Player(iframe);

          let lastSavedSecond = 0;
          let durationSeconds = 0;

          const userEmail =
            accessData?.email || "admin@bullprosperity.local";

          const lessonTitle =
            document.querySelector("h1")?.textContent?.trim() ||
            document.title ||
            "Unbekannte Lesson";

          player.getDuration().then((duration) => {
            durationSeconds = Math.floor(duration || 0);
          });

          player.on("timeupdate", async (event) => {
            const currentSeconds = Math.floor(event.seconds || 0);

            if (currentSeconds < 1) return;
            if (currentSeconds - lastSavedSecond < 15) return;

            lastSavedSecond = currentSeconds;

            const progressPercent = durationSeconds > 0
              ? Math.min(100, Math.floor((currentSeconds / durationSeconds) * 100))
              : Math.floor(event.percent * 100 || 0);

            const { error } = await supabaseClient
              .from("video_watchtime")
              .insert({
                email: userEmail,
                role: accessData?.role || "guest",
                lesson: lessonTitle,
                current_seconds: currentSeconds,
                duration_seconds: durationSeconds,
                progress_percent: progressPercent
              });

            if (error) {
              console.log("Watchtime Fehler:", error);
            } else {
              console.log("Watchtime gespeichert:", progressPercent + "%");
            }
          });

        } catch (err) {
          console.log("Watchtime Vimeo Fehler:", err);
        }
      });
    });

  } catch (err) {
    console.log("Watchtime System Fehler:", err);
  }
}

function loadVimeoApi(callback) {
  if (window.Vimeo && window.Vimeo.Player) {
    callback();
    return;
  }

  const existingScript = document.querySelector(
    'script[src="https://player.vimeo.com/api/player.js"]'
  );

  if (existingScript) {
    existingScript.addEventListener("load", callback);
    return;
  }

  const script = document.createElement("script");
  script.src = "https://player.vimeo.com/api/player.js";
  script.onload = callback;
  document.body.appendChild(script);
}

function startInactivityLogout(accessData) {
  const INACTIVITY_LIMIT = 45 * 60 * 1000;
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

  function setupVimeoInactivityTracking() {
    const vimeoIframes = document.querySelectorAll(
      'iframe[src*="player.vimeo.com"]'
    );

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

  setupVimeoInactivityTracking();
  resetTimer();
}
