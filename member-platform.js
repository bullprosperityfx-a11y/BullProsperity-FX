(() => {
  "use strict";

  const access = window.BP_ACCESS || {};
  const email = String(access.email || "").toLowerCase();
  const cloudKeys = [
    "bp_completed_lessons",
    "bp_last_lesson",
    "bp_hub_notes",
    "bp_global_notes",
    "bp_setup_library",
    "bp_onboarding_steps",
    "bp_favorites",
    "bullprosperity_trading_journal",
    "bullprosperity_start_balance",
    "bp_pretrade_plans",
    "bp_readiness_history",
    "bp_process_reviews",
    "bp_replay_drills",
    "bp_setup_certifications",
    "bp_personal_rulebook",
    "bp_squad_profile",
    "bp_decision_timeline",
    "bp_coach_history",
    "bp_public_process_profile",
    "bp_daily_os",
    "bp_broker_connections",
    "bp_capture_history",
    "bp_voice_entries",
    "bp_playbooks",
    "bp_challenges",
    "bp_mentor_submissions",
    "bp_public_setup_library",
    "bp_risk_profile",
    "bp_replay_queue",
    "bp_session_plans",
    "bp_rulebook_locks",
    "bp_market_templates",
    "bp_screenshot_timeline",
    "bp_weekly_ai_reviews",
    "bp_accountability_partner",
    "bp_prop_challenge",
    "bp_notification_preferences",
    ...Array.from({ length:33 }, (_, index) => `bullprosperity_notes_${index + 1}`)
  ];
  const catalog = [
    ["Hub", "/hub", "Übersicht, Fortschritt und Mitgliedsbereich", "Bereich"],
    ["Kurs", "/course", "Alle Trading-Lektionen", "Kurs"],
    ["Tools", "/tools", "Rechner, Journal und Trading-Werkzeuge", "Bereich"],
    ["Setup Room", "/setup-room", "Setups und Marktvorbereitung", "Bereich"],
    ["Community", "/community", "Austausch und Discord", "Community"],
    ["Mentor Office Hours", "/office-hours", "Live Mentoring über Discord buchen", "Mentoring"],
    ["Trading Journal", "/journal", "Trades dokumentieren und auswerten", "Tool"],
    ["Lot-Size-Rechner", "/lot-size", "Positionsgröße und Risiko berechnen", "Tool"],
    ["Checkliste", "/checklist", "Trading-Checkliste vor dem Entry", "Tool"],
    ["Replay", "/replay", "Marktsituationen wiederholen", "Tool"],
    ["TradingView", "/tradingview", "Charting und Plattform-Setup", "Tool"],
    ["Broker", "/broker", "Broker-Informationen und MT5", "Partner"],
    ["Live Setups", "/live-setups", "Aktuelle Setups und Analysen", "Setup"],
    ["Setup Austausch", "/setup-austausch", "Setups strukturiert teilen", "Setup"],
    ["Market Structure", "/market-structure", "HH, HL, LH und LL", "SMC"],
    ["Liquidity", "/liquidity", "Buy-Side und Sell-Side Liquidity", "SMC"],
    ["Entry Models", "/entry-models", "Entry-Modelle und Bestätigung", "SMC"],
    ["Buy Side", "/buy-side", "Buy-Side-Liquidity verstehen", "SMC"],
    ["Motivation & Disziplin", "/motivation-disziplin", "Psychologie und Konstanz", "Mindset"],
    ["Trade Review", "/trade-review", "Trades sauber nachbereiten", "Tool"],
    ["Operating System", "/performance-lab", "Tagesplan, Capture, Coach, Replay und Fortschritt", "Training"],
    ["Systemstatus", "/status", "Whop, Cloud, KI und Community prüfen", "Plattform"],
    ["Longterm", "/longterm", "Langfristiger Vermögensaufbau", "Bereich"],
    ...Array.from({ length: 33 }, (_, index) => [
      `Lesson ${index + 1}`,
      `/lesson${index + 1}`,
      `Trading-Ausbildung · Lektion ${index + 1}`,
      "Lektion"
    ])
  ].map(([title, url, description, type]) => ({ title, url, description, type }));

  let notifications = [];
  let activeTab = "search";
  let syncTimer;
  let lastSnapshot = "";

  function icon(name) {
    const paths = {
      search:'<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
      close:'<path d="M6 6l12 12M18 6 6 18"></path>',
      star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.search}</svg>`;
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, character => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
    })[character]);
  }

  function readJson(key, fallback = {}) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  function getFavorites() {
    const stored = readJson("bp_favorites", []);
    return Array.isArray(stored) ? stored : [];
  }

  function setFavorites(favorites) {
    localStorage.setItem("bp_favorites", JSON.stringify([...new Set(favorites)]));
    renderContent();
    queueCloudSync();
    updatePageFavorite();
  }

  function toggleFavorite(url) {
    const favorites = getFavorites();
    setFavorites(favorites.includes(url) ? favorites.filter(item => item !== url) : [...favorites, url]);
  }

  function cleanPath(path = location.pathname) {
    const value = path.replace(/\.html$/i, "").replace(/\/$/, "");
    return value || "/";
  }

  function createInterface() {
    document.body.insertAdjacentHTML("beforeend", `
      <button class="bp-command-trigger" id="bpCommandTrigger" type="button" aria-label="Suche und Mitgliedermenü öffnen" title="Suche (⌘ K)">
        ${icon("search")}
        <span class="bp-command-badge" id="bpCommandBadge" hidden>0</span>
      </button>
      <div class="bp-command-overlay" id="bpCommandOverlay" aria-hidden="true">
        <section class="bp-command-panel" role="dialog" aria-modal="true" aria-label="Mitgliedermenü">
          <div class="bp-command-head">
            ${icon("search")}
            <input class="bp-command-search" id="bpCommandSearch" type="search" placeholder="Bereiche, Lektionen oder Tools suchen" autocomplete="off" />
            <button class="bp-icon-button" id="bpCommandClose" type="button" aria-label="Schließen">${icon("close")}</button>
          </div>
          <div class="bp-command-tabs" role="tablist">
            <button class="bp-command-tab is-active" data-tab="search" type="button">Suche</button>
            <button class="bp-command-tab" data-tab="favorites" type="button">Favoriten</button>
            <button class="bp-command-tab" data-tab="notifications" type="button">Mitteilungen</button>
            <button class="bp-command-tab" data-tab="notes" type="button">Notizen</button>
          </div>
          <div class="bp-command-content" id="bpCommandContent"></div>
        </section>
      </div>
    `);

    if (/\/lesson\d+$/i.test(cleanPath())) {
      document.body.insertAdjacentHTML("beforeend", `
        <button class="bp-favorite-button bp-page-favorite" id="bpPageFavorite" type="button" aria-label="Lektion als Favorit speichern" title="Favorit">★</button>
      `);
    }

    const trigger = document.getElementById("bpCommandTrigger");
    const overlay = document.getElementById("bpCommandOverlay");
    const close = document.getElementById("bpCommandClose");
    const search = document.getElementById("bpCommandSearch");

    trigger.addEventListener("click", openCommand);
    close.addEventListener("click", closeCommand);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeCommand();
    });
    search.addEventListener("input", () => {
      if (activeTab !== "search") setTab("search");
      renderContent();
    });
    document.querySelectorAll(".bp-command-tab").forEach(button => {
      button.addEventListener("click", () => setTab(button.dataset.tab));
    });
    document.getElementById("bpPageFavorite")?.addEventListener("click", () => toggleFavorite(cleanPath()));
    document.addEventListener("keydown", event => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (cleanPath() === "/admin/members" && document.getElementById("memberSearch")) return;
        event.preventDefault();
        openCommand();
      }
      if (event.key === "Escape") closeCommand();
    });

    renderContent();
    updatePageFavorite();
  }

  function openCommand() {
    const overlay = document.getElementById("bpCommandOverlay");
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    setTimeout(() => document.getElementById("bpCommandSearch")?.focus(), 30);
  }

  function closeCommand() {
    const overlay = document.getElementById("bpCommandOverlay");
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
  }

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".bp-command-tab").forEach(button => {
      button.classList.toggle("is-active", button.dataset.tab === tab);
    });
    renderContent();
  }

  function resultMarkup(item) {
    const active = getFavorites().includes(item.url);
    return `
      <article class="bp-command-result">
        <a href="${item.url}">
          <span class="bp-result-title">${escapeHtml(item.title)}</span>
          <span class="bp-result-meta">${escapeHtml(item.type)} · ${escapeHtml(item.description)}</span>
        </a>
        <button class="bp-favorite-button ${active ? "is-active" : ""}" data-favorite="${item.url}" type="button" aria-label="Favorit umschalten">★</button>
      </article>`;
  }

  function renderContent() {
    const content = document.getElementById("bpCommandContent");
    if (!content) return;

    if (activeTab === "notes") {
      const value = localStorage.getItem("bp_global_notes") || "";
      content.innerHTML = `
        <textarea class="bp-note-area" id="bpGlobalNotes" placeholder="Gedanken, Regeln oder wichtige Learnings festhalten …">${escapeHtml(value)}</textarea>
        <div class="bp-note-status"><span class="bp-sync-indicator">Automatisch gespeichert</span><span id="bpNoteCount">${value.length} Zeichen</span></div>`;
      const notes = document.getElementById("bpGlobalNotes");
      notes.addEventListener("input", () => {
        localStorage.setItem("bp_global_notes", notes.value);
        document.getElementById("bpNoteCount").textContent = `${notes.value.length} Zeichen`;
        queueCloudSync();
      });
      return;
    }

    if (activeTab === "notifications") {
      content.innerHTML = notifications.length ? notifications.map(item => `
        <article class="bp-notification-item">
          <strong>${escapeHtml(item.title || "Mitteilung")}</strong>
          <p>${escapeHtml(item.message || item.content || "")}</p>
          <time>${formatDate(item.created_at)}</time>
        </article>`).join("") : '<div class="bp-empty-state">Aktuell gibt es keine neuen Mitteilungen.</div>';
      return;
    }

    let list = catalog;
    if (activeTab === "favorites") {
      const favorites = getFavorites();
      list = catalog.filter(item => favorites.includes(item.url));
    } else {
      const query = (document.getElementById("bpCommandSearch")?.value || "").toLowerCase().trim();
      list = query ? catalog.filter(item => `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(query)) : catalog.slice(0, 12);
    }

    content.innerHTML = list.length ? list.map(resultMarkup).join("") : '<div class="bp-empty-state">Keine passenden Inhalte gefunden.</div>';
    content.querySelectorAll("[data-favorite]").forEach(button => {
      button.addEventListener("click", () => toggleFavorite(button.dataset.favorite));
    });
  }

  function updatePageFavorite() {
    const button = document.getElementById("bpPageFavorite");
    if (button) button.classList.toggle("is-active", getFavorites().includes(cleanPath()));
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString("de-DE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
  }

  async function loadNotifications() {
    try {
      if (!window.supabaseClient && typeof window.ensureSupabaseClient === "function") await window.ensureSupabaseClient();
      if (!window.supabaseClient) return;
      const { data, error } = await window.supabaseClient.from("notifications").select("*").order("created_at", { ascending:false }).limit(20);
      if (error) return;
      notifications = data || [];
      const latest = notifications[0]?.id || notifications[0]?.created_at || "";
      const seen = localStorage.getItem("bp_notifications_seen") || "";
      const badge = document.getElementById("bpCommandBadge");
      if (badge && latest && latest !== seen) {
        badge.hidden = false;
        badge.textContent = String(Math.min(notifications.length, 9));
      }
      document.querySelector('[data-tab="notifications"]')?.addEventListener("click", () => {
        if (latest) localStorage.setItem("bp_notifications_seen", latest);
        if (badge) badge.hidden = true;
      }, { once:true });
    } catch { /* Notifications stay optional. */ }
  }

  function collectState() {
    return cloudKeys.reduce((state, key) => {
      const value = localStorage.getItem(key);
      if (value !== null) state[key] = value;
      return state;
    }, {});
  }

  function applyCloudState(state, overwrite = false) {
    if (!state || typeof state !== "object") return;
    cloudKeys.forEach(key => {
      if ((overwrite || localStorage.getItem(key) === null) && typeof state[key] === "string") localStorage.setItem(key, state[key]);
    });
  }

  async function syncFromCloud() {
    if (!email) return;
    try {
      const response = await fetch("/api/member-state", { credentials:"include", cache:"no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const localUpdatedAt = new Date(localStorage.getItem("bp_cloud_updated_at") || 0).getTime();
      const remoteUpdatedAt = new Date(data?.updatedAt || 0).getTime();
      if (data?.state) applyCloudState(data.state, remoteUpdatedAt > localUpdatedAt);
      if (remoteUpdatedAt) localStorage.setItem("bp_cloud_updated_at", data.updatedAt);
      lastSnapshot = JSON.stringify(collectState());
      window.dispatchEvent(new CustomEvent("bp:cloud-ready"));
    } catch { /* Local storage remains the offline fallback. */ }
  }

  async function syncToCloud() {
    if (!email) return;
    const state = collectState();
    const snapshot = JSON.stringify(state);
    if (snapshot === lastSnapshot) return;
    try {
      const response = await fetch("/api/member-state", {
        method:"POST",
        credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ state })
      });
      if (response.ok) {
        lastSnapshot = snapshot;
        localStorage.setItem("bp_cloud_updated_at", new Date().toISOString());
      }
    } catch { /* The next autosave retries. */ }
  }

  function queueCloudSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(syncToCloud, 900);
  }

  function optimizeMedia() {
    document.querySelectorAll("img").forEach(image => {
      if (!image.hasAttribute("loading")) image.loading = "lazy";
      image.decoding = "async";
    });
    document.querySelectorAll("iframe").forEach(frame => {
      if (!frame.hasAttribute("loading")) frame.loading = "lazy";
    });
    document.addEventListener("mouseover", event => {
      const link = event.target.closest('a[href^="/"]');
      if (!link || link.dataset.bpPrefetched) return;
      link.dataset.bpPrefetched = "true";
      const prefetch = document.createElement("link");
      prefetch.rel = "prefetch";
      prefetch.href = link.href;
      document.head.appendChild(prefetch);
    }, { passive:true });
  }

  async function initialize() {
    createInterface();
    optimizeMedia();
    if (!window.supabaseClient && typeof window.ensureSupabaseClient === "function") await window.ensureSupabaseClient();
    await Promise.allSettled([syncFromCloud(), loadNotifications()]);
    setInterval(syncToCloud, 12000);
    setInterval(syncFromCloud, 120000);
    document.addEventListener("visibilitychange", () => { if (document.hidden) syncToCloud(); else syncFromCloud(); });
    window.addEventListener("beforeunload", syncToCloud);
    window.BullProsperity = { sync:syncToCloud, openSearch:openCommand, catalog };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once:true });
  else initialize();
})();
