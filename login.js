document.addEventListener("DOMContentLoaded", async () => {
  const isProtectedPage = document.documentElement.classList.contains("bp-auth-checking");
  const loginBtn = document.getElementById("loginNavBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const authStatus = document.getElementById("authStatus");
  const statusDot = document.getElementById("statusDot");

  const startBtn = document.getElementById("startBtn");
  const learnMoreBtn = document.getElementById("learnMoreBtn");
  const homeHeroButtons = document.getElementById("homeHeroButtons");

  let accessData = null;

  try {
    const res = await fetch("/api/access", {
      credentials: "include",
      cache: "no-store"
    });

    const data = await res.json();
    accessData = data;

    const isLoggedIn = data.role === "admin" || data.role === "premium";

    if (isProtectedPage && !isLoggedIn) {
      window.location.replace("/locked");
      return;
    }

    if (isProtectedPage) {
      document.documentElement.classList.remove("bp-auth-checking");
    }

    if (authStatus) authStatus.textContent = "Kein Zugang";
    if (statusDot) statusDot.className = "status-dot status-locked";

    if (loginBtn) loginBtn.style.display = isLoggedIn ? "none" : "inline-flex";
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline-flex" : "none";

    if (isLoggedIn) {
      window.BP_ACCESS = data;
      if (authStatus) {
        authStatus.textContent =
          data.role === "admin" ? "Admin" : "Premium";
      }

      if (statusDot) {
        statusDot.className =
          "status-dot " +
          (data.role === "admin" ? "status-admin" : "status-premium");
      }

      if (startBtn) startBtn.style.display = "none";
      if (homeHeroButtons) homeHeroButtons.style.justifyContent = "center";
      if (learnMoreBtn) learnMoreBtn.style.margin = "0 auto";

      startInactivityLogout(accessData);

      loadMemberPlatform();
    } else {
      if (startBtn) startBtn.style.display = "inline-flex";
      if (homeHeroButtons) homeHeroButtons.style.justifyContent = "center";
      if (learnMoreBtn) learnMoreBtn.style.margin = "0";
    }

  } catch (err) {
    console.log("Auth Fehler");

    if (isProtectedPage) {
      window.location.replace("/locked");
      return;
    }

    if (authStatus) authStatus.textContent = "Fehler";
    if (statusDot) statusDot.className = "status-dot status-locked";

    if (startBtn) startBtn.style.display = "inline-flex";
    if (learnMoreBtn) learnMoreBtn.style.margin = "0";
  }

  await trackPageOpen(accessData);
  await trackLessonOpen(accessData);
  setupClickTracking(accessData);
  setupVimeoWatchtimeTracking(accessData);
});

function loadMemberPlatform() {
  if (!document.querySelector('link[href="/member-platform.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/member-platform.css";
    document.head.appendChild(stylesheet);
  }

  if (!document.querySelector('script[src="/member-platform.js"]')) {
    const script = document.createElement("script");
    script.src = "/member-platform.js";
    script.defer = true;
    document.head.appendChild(script);
  }
}

function hasTrackableAccess(accessData) {
  return ["admin", "premium", "longterm"].includes(accessData?.role);
}

function getTrackingEmail(accessData) {
  return accessData?.email || "admin@bullprosperity.local";
}

function getCleanPageName() {
  const path = window.location.pathname
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "")
    .replace(/\.html$/i, "");

  return path || "home";
}

function getReadableClickLabel(element) {
  const rawText = element.textContent || element.getAttribute("aria-label") || element.title || "";
  return rawText.replace(/\s+/g, " ").trim().slice(0, 60) || "Unbenannter Klick";
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
      if (existingScript.dataset.loaded === "true") {
        resolve();
        return;
      }

      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.dataset.bpDynamic = "true";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureSupabaseClient() {
  if (window.supabaseClient) return true;

  try {
    if (!window.supabase) {
      await loadScriptOnce("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
    }

    if (!window.supabaseClient) {
      await loadScriptOnce("/supabase.js");
    }

    return Boolean(window.supabaseClient);
  } catch (err) {
    console.log("Supabase konnte nicht geladen werden:", err);
    return false;
  }
}

async function trackMemberActivity(accessData, action, page) {
  try {
    if (!hasTrackableAccess(accessData)) return;

    const ready = await ensureSupabaseClient();
    if (!ready) return;

    const { error } = await supabaseClient
      .from("member_activity")
      .insert({
        email: getTrackingEmail(accessData),
        role: accessData.role,
        action,
        page: page || getCleanPageName()
      });

    if (error) {
      console.log("Member Tracking Fehler:", error);
    }
  } catch (err) {
    console.log("Member Tracking System Fehler:", err);
  }
}

async function trackPageOpen(accessData) {
  const page = getCleanPageName();

  await trackMemberActivity(accessData, "page_opened", page);
}

function setupClickTracking(accessData) {
  if (!hasTrackableAccess(accessData)) return;

  document.addEventListener("click", (event) => {
    const target = event.target.closest("a, button, [data-track]");
    if (!target) return;

    const label = getReadableClickLabel(target);
    const href = target.getAttribute("href") || target.dataset.track || "";
    const page = `${getCleanPageName()} · ${label}${href ? " → " + href : ""}`.slice(0, 180);

    trackMemberActivity(accessData, "click", page);
  }, true);
}

async function trackLessonOpen(accessData) {
  try {
    const path = window.location.pathname.toLowerCase();

    const isLessonPage = path.includes("lesson");

    if (!isLessonPage) return;

    if (!hasTrackableAccess(accessData)) return;

    const ready = await ensureSupabaseClient();

    if (!ready) {
      console.log("Supabase Client nicht geladen");
      return;
    }

    const userEmail = getTrackingEmail(accessData);

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

async function setupVimeoWatchtimeTracking(accessData) {
  try {
    const path = window.location.pathname.toLowerCase();
    const isLessonPage = path.includes("lesson");

    if (!isLessonPage) return;

    if (!hasTrackableAccess(accessData)) return;

    const ready = await ensureSupabaseClient();

    if (!ready) {
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

          const userEmail = getTrackingEmail(accessData);

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
// ===============================
// AUTO LOGOUT BEI INAKTIVITÄT
// ===============================

let bpInactivityTimer;

async function bpClearSessionAndLock() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    });
  } catch (err) {
    console.log("Logout Fehler:", err);
  }

  localStorage.clear();
  sessionStorage.clear();

  window.location.href = "/locked.html?reason=inactive";
}
function bpResetInactivityTimer() {
  clearTimeout(bpInactivityTimer);

  bpInactivityTimer = setTimeout(() => {
    bpClearSessionAndLock();
  }, 15 * 60 * 1000);
}

["click", "mousemove", "keydown", "scroll", "touchstart"].forEach((event) => {
  document.addEventListener(event, bpResetInactivityTimer);
});

bpResetInactivityTimer();
async function bpLogoutNow() {
  try {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store"
    });
  } catch (err) {
    console.log("Logout Fehler:", err);
  }

  localStorage.clear();
  sessionStorage.clear();

  window.location.href = "/locked.html?reason=logout";
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      bpLogoutNow();
    });
  }
});
