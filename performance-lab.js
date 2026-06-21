(() => {
  "use strict";

  const KEYS = {
    plans:"bp_pretrade_plans", readiness:"bp_readiness_history", reviews:"bp_process_reviews",
    drills:"bp_replay_drills", certifications:"bp_setup_certifications", rulebook:"bp_personal_rulebook",
    squad:"bp_squad_profile", timeline:"bp_decision_timeline", coach:"bp_coach_history"
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    setTimeout(() => window.BullProsperity?.sync?.(), 50);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
    })[character]);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function formatDate(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString("de-DE", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" });
  }

  function getTrades() {
    const trades = read("bullprosperity_trading_journal", []);
    return Array.isArray(trades) ? trades : [];
  }

  function getCompletedLessons() {
    const completed = read("bp_completed_lessons", {});
    return Object.keys(completed).filter(key => completed[key]);
  }

  function addTimeline(type, title, detail) {
    const timeline = read(KEYS.timeline, []);
    timeline.unshift({ id:crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`, type, title, detail, createdAt:new Date().toISOString() });
    write(KEYS.timeline, timeline.slice(0, 120));
  }

  function journalQuality(trades) {
    if (!trades.length) return 0;
    const fields = ["market", "direction", "session", "stopLoss", "rr", "setupType", "emotion", "notes"];
    const filled = trades.reduce((total, trade) => total + fields.filter(field => String(trade[field] || "").trim()).length, 0);
    return Math.round((filled / (trades.length * fields.length)) * 100);
  }

  function readinessScore(entry) {
    if (!entry) return 0;
    return Math.round(clamp(entry.sleep * 2.5 + entry.focus * 3 + (11 - entry.stress) * 2.5 + entry.confidence * 2));
  }

  function calculateScores() {
    const plans = read(KEYS.plans, []);
    const reviews = read(KEYS.reviews, []);
    const trades = getTrades();
    const lessons = getCompletedLessons();
    const recentPlans = plans.slice(0, 20);
    const preparation = recentPlans.length ? Math.round(recentPlans.filter(plan => plan.approved).length / recentPlans.length * 100) : 0;
    const discipline = reviews.length ? Math.round(reviews.slice(0, 20).reduce((sum, review) => sum + clamp(review.adherence), 0) / Math.min(reviews.length, 20)) : 0;
    const journal = journalQuality(trades.slice(0, 30));
    const learning = Math.round(Math.min(100, lessons.length / 33 * 100));
    const readiness = readinessScore(read(KEYS.readiness, [])[0]);
    const total = Math.round(preparation * .28 + discipline * .27 + journal * .2 + learning * .15 + readiness * .1);
    return { preparation, discipline, journal, learning, readiness, total };
  }

  function renderScore() {
    const score = calculateScores();
    $("#processScore").textContent = score.total;
    $("#processScoreRing").style.setProperty("--score", `${score.total}%`);
    $("#scorePreparation").textContent = `${score.preparation}%`;
    $("#scoreDiscipline").textContent = `${score.discipline}%`;
    $("#scoreJournal").textContent = `${score.journal}%`;
    $("#scoreLearning").textContent = `${score.learning}%`;
    return score;
  }

  function setupTabs() {
    const tabs = $$(".lab-tab");
    function openView(name, shouldScroll = false) {
      const currentIndex = tabs.findIndex(tab => tab.classList.contains("is-active"));
      const nextIndex = tabs.findIndex(tab => tab.dataset.view === name);
      const direction = nextIndex < currentIndex ? "-22px" : "22px";
      tabs.forEach(tab => {
        const active = tab.dataset.view === name;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      $$(".lab-view").forEach(panel => {
        const active = panel.dataset.panel === name;
        panel.classList.toggle("is-active", active);
        panel.hidden = !active;
        if (active) panel.style.setProperty("--lab-slide-x", direction);
      });
      history.replaceState(null, "", `#${name}`);
      if (shouldScroll) window.scrollTo({ top:$(".lab-tabs").offsetTop - 18, behavior:"smooth" });
    }
    tabs.forEach(tab => tab.addEventListener("click", () => openView(tab.dataset.view)));
    $$('[data-open-view]').forEach(button => button.addEventListener("click", () => openView(button.dataset.openView, true)));
    const requested = location.hash.slice(1);
    if ($(`[data-panel="${requested}"]`)) openView(requested);
    else openView("cockpit");
  }

  function setupReadiness() {
    const ids = ["Sleep", "Focus", "Stress", "Confidence"];
    ids.forEach(name => {
      const input = $(`#ready${name}`);
      input.addEventListener("input", () => $(`#ready${name}Value`).textContent = input.value);
    });
    $("#readinessForm").addEventListener("submit", event => {
      event.preventDefault();
      const history = read(KEYS.readiness, []);
      const entry = {
        date:today(), createdAt:new Date().toISOString(), sleep:+$("#readySleep").value,
        focus:+$("#readyFocus").value, stress:+$("#readyStress").value, confidence:+$("#readyConfidence").value
      };
      entry.score = readinessScore(entry);
      const filtered = history.filter(item => item.date !== entry.date);
      filtered.unshift(entry);
      write(KEYS.readiness, filtered.slice(0, 90));
      addTimeline("readiness", "Readiness gespeichert", `Tageszustand: ${entry.score}/100`);
      renderAll();
    });
  }

  function renderReadiness() {
    const latest = read(KEYS.readiness, [])[0];
    const score = readinessScore(latest);
    $("#readinessHeadline").textContent = latest ? `${score}/100` : "Noch offen";
    $("#readinessCopy").textContent = !latest ? "Bewerte deinen Zustand vor der Session." : score >= 75 ? "Stabiler Zustand. Halte dich trotzdem an dein Rulebook." : score >= 55 ? "Reduziere Komplexität und arbeite besonders bewusst." : "Hohe Belastung. Beobachten und Lernen kann heute sinnvoller sein.";
    $("#readinessStatus").className = `status-box ${score >= 75 ? "good" : score && score < 55 ? "alert" : ""}`;
    $("#readinessStatus").textContent = latest ? `Heute: ${score}/100 · Schlaf ${latest.sleep}, Fokus ${latest.focus}, Stress ${latest.stress}, Vertrauen ${latest.confidence}` : "Noch kein Check-in für heute.";
  }

  function setupGatekeeper() {
    $("#gatekeeperForm").addEventListener("submit", event => {
      event.preventDefault();
      const checks = $$('[data-gate]');
      const completed = checks.filter(check => check.checked).length;
      const risk = +$("#planRisk").value;
      const approved = completed === checks.length && risk > 0 && risk <= 2;
      const plan = {
        id:crypto.randomUUID?.() || String(Date.now()), createdAt:new Date().toISOString(), market:$("#planMarket").value.trim(),
        bias:$("#planBias").value, session:$("#planSession").value, risk, context:$("#planContext").value.trim(),
        invalidation:$("#planInvalidation").value.trim(), completedChecks:completed, totalChecks:checks.length, approved
      };
      const plans = read(KEYS.plans, []);
      plans.unshift(plan);
      write(KEYS.plans, plans.slice(0, 100));
      addTimeline("plan", `${plan.market} · ${approved ? "Plan vollständig" : "Plan unvollständig"}`, `${plan.bias}, ${plan.session}, Risiko ${risk}%`);
      $("#gatekeeperStatus").className = `status-box ${approved ? "good" : "alert"}`;
      $("#gatekeeperStatus").textContent = approved ? "Deine Vorbereitung ist vollständig dokumentiert. Das ist keine Handelsempfehlung; die Entscheidung und das Risiko bleiben bei dir." : risk > 2 ? "Der Plan überschreitet das im Lab gesetzte Prozesslimit von 2 %. Passe dein eigenes Risiko an oder dokumentiere bewusst, warum du nicht fortfährst." : `Noch ${checks.length - completed} Prozesspunkte offen. Der Plan wurde zur späteren Reflexion gespeichert.`;
      renderAll();
    });
    $("#resetGatekeeper").addEventListener("click", () => { $("#gatekeeperForm").reset(); $("#gatekeeperStatus").textContent = "Fülle den Plan vollständig aus."; });
  }

  function renderPlans() {
    const plans = read(KEYS.plans, []);
    $("#planHistory").innerHTML = plans.length ? plans.slice(0, 10).map(plan => `<article class="stack-item ${plan.approved ? "is-complete" : ""}"><strong>${escapeHtml(plan.market)} · ${escapeHtml(plan.bias)}</strong><span>${formatDate(plan.createdAt)} · ${escapeHtml(plan.session)} · Risiko ${escapeHtml(plan.risk)}% · ${plan.completedChecks}/${plan.totalChecks} Checks</span></article>`).join("") : '<div class="status-box">Noch keine Pre-Trade-Pläne vorhanden.</div>';
    $("#reviewPlan").innerHTML = '<option value="">Ohne Planbezug</option>' + plans.slice(0, 30).map(plan => `<option value="${escapeHtml(plan.id)}">${escapeHtml(plan.market)} · ${formatDate(plan.createdAt)}</option>`).join("");
  }

  function setupReviews() {
    $("#reviewForm").addEventListener("submit", event => {
      event.preventDefault();
      const review = { id:crypto.randomUUID?.() || String(Date.now()), planId:$("#reviewPlan").value, adherence:clamp($("#reviewAdherence").value), learning:$("#reviewLearning").value.trim(), createdAt:new Date().toISOString() };
      const reviews = read(KEYS.reviews, []); reviews.unshift(review); write(KEYS.reviews, reviews.slice(0, 150));
      addTimeline("review", `Review · ${review.adherence}% Regelkonformität`, review.learning);
      event.target.reset(); $("#reviewAdherence").value = 80; renderAll();
    });
  }

  function analyzeDNA() {
    const trades = getTrades();
    const frequency = (field, list = trades) => list.reduce((map, trade) => { const key = String(trade[field] || "Unbekannt").trim() || "Unbekannt"; map[key] = (map[key] || 0) + 1; return map; }, {});
    const top = map => Object.entries(map).sort((a,b) => b[1] - a[1])[0]?.[0] || "-";
    const losses = trades.filter(trade => trade.result === "Verlust" || Number(trade.profitLoss) < 0);
    const tags = [];
    if (losses.length >= 3) tags.push(`${losses.length} Verlusttrades prüfen`);
    if (trades.filter(trade => !trade.stopLoss).length) tags.push("Stop-Loss-Dokumentation offen");
    if (trades.filter(trade => /ungeduldig|fomo|stress|emotional/i.test(trade.emotion || "")).length) tags.push("Emotionaler Trigger erkannt");
    if (!trades.length) tags.push("Journal-Daten fehlen");
    return { trades, topMarket:top(frequency("market")), riskSession:top(frequency("session", losses)), emotion:top(frequency("emotion")), quality:journalQuality(trades), tags };
  }

  function renderDNA() {
    const dna = analyzeDNA();
    $("#dnaTopMarket").textContent = dna.topMarket;
    $("#dnaRiskSession").textContent = dna.riskSession;
    $("#dnaEmotion").textContent = dna.emotion;
    $("#dnaQuality").textContent = `${dna.quality}%`;
    $("#dnaTags").innerHTML = dna.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  }

  function setupCoach() {
    $("#personalRulebook").value = localStorage.getItem(KEYS.rulebook) || "";
    $("#personalRulebook").addEventListener("input", event => { localStorage.setItem(KEYS.rulebook, event.target.value); setTimeout(() => window.BullProsperity?.sync?.(), 50); });
    $("#runCoach").addEventListener("click", async () => {
      const button = $("#runCoach"); const output = $("#coachOutput"); const rulebook = $("#personalRulebook").value.trim();
      if (!rulebook) { output.textContent = "Trage zuerst dein persönliches Rulebook ein."; return; }
      button.disabled = true; output.textContent = "Deine Prozessdaten werden ausgewertet …";
      try {
        const response = await fetch("/api/performance-coach", { method:"POST", credentials:"include", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ rulebook, scores:calculateScores(), dna:analyzeDNA(), recentReviews:read(KEYS.reviews, []).slice(0, 8), recentPlans:read(KEYS.plans, []).slice(0, 8) }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Coaching nicht verfügbar");
        output.textContent = data.coaching;
        const history = read(KEYS.coach, []); history.unshift({ text:data.coaching, createdAt:new Date().toISOString() }); write(KEYS.coach, history.slice(0, 20));
      } catch {
        const score = calculateScores(); const dna = analyzeDNA();
        output.textContent = `Prozess-Coaching\n\nStärkster Bereich: ${Object.entries(score).filter(([key]) => key !== "total").sort((a,b)=>b[1]-a[1])[0]?.[0] || "noch offen"}.\nPriorität: ${dna.quality < 70 ? "Journalqualität erhöhen und Entscheidungen vollständiger dokumentieren." : score.discipline < 70 ? "Regelkonformität in jedem Review ehrlich bewerten." : "Stabile Prozesse wiederholen und keine unnötige Komplexität hinzufügen."}\n\nKeine Marktprognose. Arbeite ausschließlich mit deinem Rulebook.`;
      } finally { button.disabled = false; }
    });
  }

  function generateDrills() {
    const existing = read(KEYS.drills, []); const existingKeys = new Set(existing.map(drill => drill.sourceKey));
    const losses = getTrades().filter(trade => trade.result === "Verlust" || Number(trade.profitLoss) < 0);
    losses.slice(0, 30).forEach((trade, index) => {
      const sourceKey = `${trade.date}-${trade.market}-${trade.profitLoss}-${index}`;
      if (existingKeys.has(sourceKey)) return;
      existing.push({ id:crypto.randomUUID?.() || sourceKey, sourceKey, title:`${trade.market || "Trade"}: Entscheidung neu aufbauen`, prompt:`Rekonstruiere den Kontext vor dem Entry. Welche Information hätte die Idee invalidiert und welche Regel hätte die Ausführung verbessert?`, setup:trade.setupType || "Unbekannt", emotion:trade.emotion || "Nicht dokumentiert", completed:false, createdAt:new Date().toISOString() });
    });
    write(KEYS.drills, existing.slice(-80).reverse());
    addTimeline("drill", "Replay-Playlist aktualisiert", `${losses.length} Verlustsituationen analysiert`);
    renderDrills();
  }

  function setupDrills() { $("#generateDrills").addEventListener("click", generateDrills); }

  function renderDrills() {
    const drills = read(KEYS.drills, []);
    $("#drillList").innerHTML = drills.length ? drills.slice(0, 12).map(drill => `<article class="stack-item ${drill.completed ? "is-complete" : ""}"><strong>${escapeHtml(drill.title)}</strong><span>${escapeHtml(drill.prompt)}</span><div class="lab-actions"><button class="lab-btn" data-drill="${escapeHtml(drill.id)}" type="button">${drill.completed ? "Erledigt ✓" : "Als reflektiert markieren"}</button></div></article>`).join("") : '<div class="status-box">Noch keine Drills vorhanden. Journalisiere Trades oder generiere deine Playlist.</div>';
    $$('[data-drill]').forEach(button => button.addEventListener("click", () => { const next = read(KEYS.drills, []); const drill = next.find(item => item.id === button.dataset.drill); if (drill) drill.completed = !drill.completed; write(KEYS.drills, next); renderAll(); }));
    $("#replayPlaylist").innerHTML = drills.filter(drill => !drill.completed).slice(0, 5).map((drill,index) => `<article class="stack-item"><strong>${index + 1}. ${escapeHtml(drill.title)}</strong><span>${escapeHtml(drill.setup)} · Fokus: ${escapeHtml(drill.emotion)}</span></article>`).join("") || '<div class="status-box good">Aktuell sind alle persönlichen Drills abgeschlossen.</div>';
  }

  function renderAcademy() {
    const dna = analyzeDNA(); const lessons = getCompletedLessons(); const drills = read(KEYS.drills, []); let lesson = 1; let reason = "Grundlagen und Plattformstruktur festigen";
    if (/fomo|ungeduldig|stress|emotional/i.test(dna.emotion)) { lesson = 25; reason = "Emotionen und impulsive Entscheidungen reflektieren"; }
    else if (dna.tags.some(tag => tag.includes("Stop-Loss"))) { lesson = 20; reason = "Risk Management und Invalidation verbessern"; }
    else if (drills.filter(item => !item.completed).length > 3) { lesson = 29; reason = "Reviews in kontinuierliche Verbesserung übersetzen"; }
    else if (lessons.length > 20) { lesson = 30; reason = "BullProsperity Marktmodell vertiefen"; }
    $("#academyRecommendation").innerHTML = `<strong>Empfohlen: Lesson ${lesson}</strong><br>${escapeHtml(reason)}<div class="lab-actions"><a class="lab-btn primary" href="/lesson${lesson}">Lesson öffnen</a></div>`;
  }

  function setupCertification() {
    $("#certificationForm").addEventListener("submit", event => {
      event.preventDefault(); const checks = $$('[data-cert]');
      if (checks.some(check => !check.checked)) return alert("Für eine Zertifizierungsprobe müssen alle Prozesspunkte dokumentiert sein.");
      const name = $("#certSetup").value.trim(); const certifications = read(KEYS.certifications, {}); const record = certifications[name] || { name, samples:[], certified:false };
      record.samples.push({ market:$("#certMarket").value.trim(), evidence:$("#certEvidence").value.trim(), createdAt:new Date().toISOString() }); record.certified = record.samples.length >= 5; certifications[name] = record; write(KEYS.certifications, certifications);
      addTimeline("certification", `${name} · Beispiel ${record.samples.length}/5`, record.certified ? "Setup intern zertifiziert" : "Nachweis gespeichert"); event.target.reset(); renderAll();
    });
  }

  function renderCertifications() {
    const records = Object.values(read(KEYS.certifications, {}));
    $("#certificationList").innerHTML = records.length ? records.map(record => `<article class="stack-item ${record.certified ? "is-complete" : ""}"><strong>${escapeHtml(record.name)} ${record.certified ? "· Zertifiziert ✓" : ""}</strong><span>${record.samples.length}/5 dokumentierte Beispiele</span><div class="progress" style="--progress:${Math.min(100,record.samples.length/5*100)}%"><span></span></div></article>`).join("") : '<div class="status-box">Noch keine Setup-Zertifizierung begonnen.</div>';
  }

  function renderTimeline() {
    const timeline = read(KEYS.timeline, []);
    $("#decisionTimeline").innerHTML = timeline.length ? timeline.slice(0, 10).map(item => `<article class="timeline-item"><time>${formatDate(item.createdAt)}</time><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.detail)}</span></div></article>`).join("") : '<div class="status-box">Noch keine Entscheidungen dokumentiert.</div>';
  }

  function renderWeeklyReport() {
    const weekStart = Date.now() - 7 * 86400000; const trades = getTrades().filter(trade => new Date(`${trade.date || today()}T12:00:00`).getTime() >= weekStart); const plans = read(KEYS.plans, []).filter(item => new Date(item.createdAt).getTime() >= weekStart); const drills = read(KEYS.drills, []).filter(item => item.completed); const lessons = Object.values(read("bp_completed_lessons", {})).filter(value => value === true || new Date(value).getTime() >= weekStart);
    const clean = plans.length ? Math.round(plans.filter(plan => plan.approved).length / plans.length * 100) : 0;
    $("#weeklyTrades").textContent = trades.length; $("#weeklyClean").textContent = `${clean}%`; $("#weeklyLessons").textContent = lessons.length; $("#weeklyDrills").textContent = drills.length;
    $("#weeklyReportText").textContent = !trades.length && !plans.length ? "Beginne mit einem Readiness Check-in und einem Pre-Trade-Plan. Daraus entsteht dein erster belastbarer Wochenreport." : clean < 70 ? "Priorität der nächsten Woche: weniger Entscheidungen, dafür vollständigere Vorbereitung und ehrliche Reviews." : "Deine Prozessstabilität entwickelt sich positiv. Wiederhole die sauberen Abläufe und erhöhe nicht unnötig die Komplexität.";
  }

  function setupSquad() {
    const saved = read(KEYS.squad, {}); $("#squadAlias").value = saved.alias || ""; $("#squadCode").value = saved.code || ""; $("#squadGoal").value = saved.goal || ""; $("#shareProcessProfile").checked = Boolean(saved.share);
    $("#squadForm").addEventListener("submit", event => { event.preventDefault(); const squad = { ...read(KEYS.squad, {}), alias:$("#squadAlias").value.trim(), code:$("#squadCode").value.trim().toUpperCase(), goal:$("#squadGoal").value.trim(), share:$("#shareProcessProfile").checked, updatedAt:new Date().toISOString(), checkins:read(KEYS.squad, {}).checkins || [] }; write(KEYS.squad, squad); addTimeline("squad", `Squad ${squad.code}`, `Wochenziel: ${squad.goal}`); renderAll(); loadCommunity(); });
    $("#squadCheckin").addEventListener("click", () => { const squad = read(KEYS.squad, {}); if (!squad.code) return; squad.checkins = squad.checkins || []; if (!squad.checkins.includes(today())) squad.checkins.push(today()); squad.updatedAt = new Date().toISOString(); write(KEYS.squad, squad); addTimeline("squad", "Accountability Check-in", squad.goal); renderAll(); loadCommunity(); });
  }

  function renderSquad() {
    const squad = read(KEYS.squad, {}); $("#squadStatus").className = `status-box ${squad.code ? "good" : ""}`; $("#squadStatus").textContent = squad.code ? `${squad.alias} · Squad ${squad.code} · ${squad.checkins?.length || 0} Check-ins · Ziel: ${squad.goal}` : "Noch keinem Squad beigetreten.";
  }

  async function loadCommunity() {
    try { const response = await fetch("/api/performance-community", { credentials:"include", cache:"no-store" }); const data = await response.json(); if (!response.ok) throw new Error(); renderLeaderboard(data.members || []); }
    catch { renderLeaderboard([{ alias:read(KEYS.squad, {}).alias || "Du", score:calculateScores().total, lessons:getCompletedLessons().length }]); }
  }

  function renderLeaderboard(members) {
    const sorted = members.sort((a,b) => b.score - a.score).slice(0, 20); $("#leaderboard").innerHTML = sorted.length ? sorted.map((member,index) => `<div class="leaderboard-row"><div class="leaderboard-rank">#${index + 1}</div><div><div class="leaderboard-name">${escapeHtml(member.alias || "Member")}</div><span class="lab-text">${member.lessons || 0} Lessons · Prozessdaten</span></div><div class="leaderboard-score">${clamp(member.score)}</div></div>`).join("") : '<div class="status-box">Noch keine freiwillig geteilten Prozessprofile.</div>';
  }

  function renderProfile() {
    const access = window.BP_ACCESS || {}; const score = calculateScores(); const lessons = getCompletedLessons().length; const drills = read(KEYS.drills, []).filter(item => item.completed).length; const certs = Object.values(read(KEYS.certifications, {})).filter(item => item.certified).length; const squad = read(KEYS.squad, {});
    $("#profileName").textContent = `${access.firstName || squad.alias || "Dein"} Kompetenzprofil`;
    const badges = [{name:"Process Score",value:`${score.total}/100`},{name:"Academy",value:`${lessons}/33 Lessons`},{name:"Replay",value:`${drills} Drills`},{name:"Setup Mastery",value:`${certs} Zertifizierungen`},{name:"Accountability",value:`${squad.checkins?.length || 0} Check-ins`}];
    $("#profileBadges").innerHTML = badges.map(badge => `<div class="profile-badge"><strong>${escapeHtml(badge.name)}</strong><span>${escapeHtml(badge.value)}</span></div>`).join("");
  }

  function setupProfileExport() {
    $("#exportProfile").addEventListener("click", () => { const payload = { exportedAt:new Date().toISOString(), processScore:calculateScores(), lessons:getCompletedLessons().length, certifications:read(KEYS.certifications, {}), drillsCompleted:read(KEYS.drills, []).filter(item => item.completed).length }; const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}); const link = document.createElement("a"); link.href=URL.createObjectURL(blob); link.download=`bullprosperity-progress-${today()}.json`; link.click(); URL.revokeObjectURL(link.href); });
  }

  function publishCommunitySnapshot() {
    const squad = read(KEYS.squad, {});
    if (!squad.share) { localStorage.removeItem("bp_public_process_profile"); return; }
    const snapshot = { alias:squad.alias || "Member", squadCode:squad.code || "", goal:squad.goal || "", checkins:squad.checkins?.length || 0, score:calculateScores().total, lessons:getCompletedLessons().length, updatedAt:new Date().toISOString() }; write("bp_public_process_profile", snapshot);
  }

  function renderAll() {
    renderScore(); renderReadiness(); renderPlans(); renderDNA(); renderDrills(); renderAcademy(); renderCertifications(); renderTimeline(); renderWeeklyReport(); renderSquad(); renderProfile(); publishCommunitySnapshot();
  }

  function initialize() {
    setupTabs(); setupReadiness(); setupGatekeeper(); setupReviews(); setupCoach(); setupDrills(); setupCertification(); setupSquad(); setupProfileExport(); renderAll(); loadCommunity();
    window.addEventListener("bp:cloud-ready", () => { renderAll(); loadCommunity(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once:true }); else initialize();
})();
