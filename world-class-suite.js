(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const today = () => new Date().toISOString().slice(0, 10);
  const KEYS = {
    prop:"bp_prop_challenge",
    reminders:"bp_notification_preferences",
    reminderLog:"bp_notification_log"
  };

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    setTimeout(() => window.BullProsperity?.sync?.(), 80);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function money(value, currency = "USD") {
    return new Intl.NumberFormat("de-DE", { style:"currency", currency, maximumFractionDigits:2 }).format(Number(value) || 0);
  }

  function zonedTime(timeZone) {
    const parts = new Intl.DateTimeFormat("de-DE", {
      timeZone,
      hour:"2-digit",
      minute:"2-digit",
      hourCycle:"h23"
    }).formatToParts(new Date());
    const get = type => Number(parts.find(part => part.type === type)?.value || 0);
    return { hour:get("hour"), minute:get("minute"), label:`${String(get("hour")).padStart(2,"0")}:${String(get("minute")).padStart(2,"0")}` };
  }

  function sessionLabel(time, start, end) {
    const minutes = time.hour * 60 + time.minute;
    if (minutes >= start && minutes < end) return "Kernsession aktiv";
    if (minutes < start && start - minutes <= 60) return "Vorbereitung";
    return "Außerhalb der Kernsession";
  }

  function renderLiveDesk() {
    const london = zonedTime("Europe/London");
    const newYork = zonedTime("America/New_York");
    $("#deskLondonTime").textContent = london.label;
    $("#deskNewYorkTime").textContent = newYork.label;
    $("#deskLondonState").textContent = sessionLabel(london, 8 * 60, 12 * 60);
    $("#deskNewYorkState").textContent = sessionLabel(newYork, 8 * 60, 12 * 60);

    const plan = read("bp_session_plans", {})[today()];
    const profile = read("bp_risk_profile", { dailyRisk:2, maxTrades:3 });
    const trades = read("bullprosperity_trading_journal", []).filter(item => String(item.date || "").slice(0, 10) === today());
    const lock = Boolean(read("bp_rulebook_locks", {})[today()]);

    $("#deskPlanHeadline").textContent = plan ? `${plan.market} · ${plan.session} · ${plan.bias}` : "Noch nicht vorbereitet";
    $("#deskPlanDetail").textContent = plan
      ? `Max. ${Number(plan.risk || 0)}% · ${plan.newsEvent || plan.news || "News nicht dokumentiert"}`
      : "Tagesplan, News und Risiko dokumentieren.";

    const limitReached = trades.length >= Number(profile.maxTrades || 3);
    $("#deskGuardHeadline").textContent = limitReached ? "Tageslimit erreicht" : lock && plan ? "Prozess vorbereitet" : "Vorbereitung offen";
    $("#deskGuardDetail").textContent = limitReached
      ? `${trades.length}/${profile.maxTrades} dokumentierte Trades`
      : `${lock ? "Rulebook fixiert" : "Rulebook offen"} · ${trades.length}/${profile.maxTrades} Trades`;
  }

  function getPropValues() {
    return {
      currency:$("#propCurrency").value,
      start:Number($("#propStartBalance").value),
      equity:Number($("#propCurrentEquity").value),
      dailyStart:Number($("#propDailyStart").value),
      targetPct:Number($("#propProfitTarget").value),
      dailyLossPct:Number($("#propDailyLoss").value),
      overallLossPct:Number($("#propOverallLoss").value),
      minDays:Number($("#propMinDays").value),
      daysTraded:Number($("#propDaysTraded").value)
    };
  }

  function renderPropChallenge(data = read(KEYS.prop, null)) {
    const metrics = $("#propChallengeMetrics");
    const status = $("#propChallengeStatus");
    if (!data?.start) {
      metrics.innerHTML = "";
      status.className = "status-box";
      status.textContent = "Noch keine Challenge eingerichtet.";
      return;
    }

    const target = data.start * (1 + data.targetPct / 100);
    const dailyFloor = data.dailyStart * (1 - data.dailyLossPct / 100);
    const overallFloor = data.start * (1 - data.overallLossPct / 100);
    const targetProgress = clamp((data.equity - data.start) / Math.max(1, target - data.start) * 100);
    const daysProgress = clamp(data.daysTraded / Math.max(1, data.minDays) * 100);
    const dailyBuffer = data.equity - dailyFloor;
    const overallBuffer = data.equity - overallFloor;
    const breached = dailyBuffer <= 0 || overallBuffer <= 0;
    const completed = data.equity >= target && data.daysTraded >= data.minDays && !breached;

    metrics.innerHTML = `
      <article><span>Ziel-Fortschritt</span><strong>${Math.round(targetProgress)}%</strong><small>Ziel ${money(target, data.currency)}</small><div class="progress" style="--progress:${targetProgress}%"><span></span></div></article>
      <article><span>Tagespuffer</span><strong>${money(dailyBuffer, data.currency)}</strong><small>Grenze ${money(dailyFloor, data.currency)}</small></article>
      <article><span>Gesamtpuffer</span><strong>${money(overallBuffer, data.currency)}</strong><small>Grenze ${money(overallFloor, data.currency)}</small></article>
      <article><span>Handelstage</span><strong>${data.daysTraded}/${data.minDays}</strong><small>${Math.round(daysProgress)}% erfüllt</small></article>`;

    status.className = `status-box ${completed ? "good" : breached ? "alert" : ""}`;
    status.textContent = completed
      ? "Challenge-Kriterien dokumentiert erfüllt. Angaben vor einer Einreichung beim Anbieter prüfen."
      : breached
        ? "Eine eingetragene Verlustgrenze wurde erreicht. Neue Pläne pausieren und Anbieterregeln prüfen."
        : "Challenge läuft. Drawdown-Puffer und Mindesttage bleiben unter Beobachtung.";
  }

  function setupPropChallenge() {
    const saved = read(KEYS.prop, null);
    if (saved) {
      $("#propCurrency").value = saved.currency || "USD";
      $("#propStartBalance").value = saved.start;
      $("#propCurrentEquity").value = saved.equity;
      $("#propDailyStart").value = saved.dailyStart;
      $("#propProfitTarget").value = saved.targetPct;
      $("#propDailyLoss").value = saved.dailyLossPct;
      $("#propOverallLoss").value = saved.overallLossPct;
      $("#propMinDays").value = saved.minDays;
      $("#propDaysTraded").value = saved.daysTraded;
    }
    $("#propChallengeForm").addEventListener("submit", event => {
      event.preventDefault();
      const data = { ...getPropValues(), updatedAt:new Date().toISOString() };
      if (data.start <= 0 || data.equity < 0 || data.dailyStart <= 0) return;
      write(KEYS.prop, data);
      renderPropChallenge(data);
    });
    renderPropChallenge(saved);
  }

  function setupWeeklyReportPrint() {
    $("#printWeeklyReport")?.addEventListener("click", () => {
      document.body.classList.add("print-weekly-report");
      const clean = () => document.body.classList.remove("print-weekly-report");
      window.addEventListener("afterprint", clean, { once:true });
      window.print();
      setTimeout(clean, 1200);
    });
  }

  async function showReminder(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const registration = await navigator.serviceWorker?.getRegistration?.();
    if (registration) return registration.showNotification(title, { body, icon:"/icon-192.png", badge:"/favicon.png", tag:title });
    new Notification(title, { body, icon:"/icon-192.png", tag:title });
  }

  function checkReminders() {
    const settings = read(KEYS.reminders, null);
    if (!("Notification" in window) || !settings?.enabled || Notification.permission !== "granted") return;
    const now = new Date();
    const current = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const log = read(KEYS.reminderLog, {});
    const fire = (key, title, body) => {
      const stamp = `${today()}-${key}`;
      if (log[key] === stamp) return;
      log[key] = stamp;
      write(KEYS.reminderLog, log);
      showReminder(title, body);
    };
    if (current === settings.london) fire("london", "London Vorbereitung", "News, Readiness, Tagesrisiko und Rulebook prüfen.");
    if (current === settings.newYork) fire("new-york", "New York Vorbereitung", "Tagesplan aktualisieren und offene Risiken prüfen.");
    if (settings.weekly && now.getDay() === 0 && current === "18:00") fire("weekly", "Wochenreview", "Prozessqualität, Learnings und nächste Lernschritte reflektieren.");
  }

  function setupReminders() {
    const saved = read(KEYS.reminders, { london:"07:45", newYork:"13:45", weekly:true, enabled:false });
    $("#reminderLondon").value = saved.london;
    $("#reminderNewYork").value = saved.newYork;
    $("#reminderWeekly").checked = saved.weekly;
    $("#saveReminders").addEventListener("click", () => {
      const next = { london:$("#reminderLondon").value, newYork:$("#reminderNewYork").value, weekly:$("#reminderWeekly").checked, enabled:"Notification" in window && Notification.permission === "granted" };
      write(KEYS.reminders, next);
      $("#pwaStatus").textContent = next.enabled ? "Erinnerungszeiten gespeichert. Sie erscheinen bei geöffneter App." : "Zeiten gespeichert. Erlaube zusätzlich Benachrichtigungen.";
    });
    $("#enableReminders").addEventListener("click", () => setTimeout(() => {
      const current = read(KEYS.reminders, saved);
      write(KEYS.reminders, { ...current, enabled:"Notification" in window && Notification.permission === "granted" });
    }, 400));
    checkReminders();
    setInterval(checkReminders, 30000);
  }

  function refresh() {
    renderLiveDesk();
    renderPropChallenge();
  }

  function initialize() {
    setupPropChallenge();
    setupWeeklyReportPrint();
    setupReminders();
    renderLiveDesk();
    setInterval(renderLiveDesk, 30000);
    window.addEventListener("bp:cloud-ready", refresh);
    window.addEventListener("bp:performance-updated", refresh);
    window.addEventListener("storage", refresh);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once:true });
  else initialize();
})();
