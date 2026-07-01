(() => {
  "use strict";

  const KEYS = {
    daily:"bp_daily_os", broker:"bp_broker_connections", captures:"bp_capture_history",
    voice:"bp_voice_entries", playbooks:"bp_playbooks", challenges:"bp_challenges",
    mentor:"bp_mentor_submissions", publicLibrary:"bp_public_setup_library",
    risk:"bp_risk_profile", replay:"bp_replay_queue"
  };
  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    setTimeout(() => window.BullProsperity?.sync?.(), 80);
  }

  function getTrades() {
    const trades = read("bullprosperity_trading_journal", []);
    return Array.isArray(trades) ? trades : [];
  }

  function getPlans() { return read("bp_pretrade_plans", []); }
  function getReviews() { return read("bp_process_reviews", []); }
  function getLessons() { return Object.keys(read("bp_completed_lessons", {})).filter(key => read("bp_completed_lessons", {})[key]); }
  function formatDate(value) { return value ? new Date(value).toLocaleString("de-DE", { dateStyle:"medium", timeStyle:"short" }) : "–"; }
  function isToday(value) { return String(value || "").slice(0, 10) === today(); }

  function detectViolations() {
    const profile = read(KEYS.risk, { dailyRisk:2, maxTrades:3 });
    const trades = getTrades();
    const plans = getPlans();
    const issues = [];
    const todayTrades = trades.filter(trade => isToday(trade.date));
    if (todayTrades.length > Number(profile.maxTrades || 3)) issues.push({ level:"high", title:"Trade-Limit überschritten", detail:`${todayTrades.length}/${profile.maxTrades} Trades heute` });
    plans.slice(0, 20).forEach(plan => {
      if (Number(plan.risk) > Number(profile.dailyRisk || 2)) issues.push({ level:"high", title:`${plan.market}: Risiko über Limit`, detail:`${plan.risk}% statt maximal ${profile.dailyRisk}%` });
      if (!plan.approved) issues.push({ level:"medium", title:`${plan.market}: Plan unvollständig`, detail:`${plan.completedChecks || 0}/${plan.totalChecks || 5} Checks` });
    });
    trades.slice(0, 30).forEach(trade => {
      if (!trade.stopLoss) issues.push({ level:"medium", title:`${trade.market || "Trade"}: Stop Loss fehlt`, detail:trade.date || "Datum unbekannt" });
      if (!trade.notes && (trade.result === "Verlust" || Number(trade.profitLoss) < 0)) issues.push({ level:"low", title:`${trade.market || "Trade"}: Verlust ohne Learning`, detail:"Review ergänzen" });
    });
    return issues.slice(0, 12);
  }

  function renderPersonalizedHome() {
    const access = window.BP_ACCESS || {};
    const readiness = read("bp_readiness_history", [])[0];
    const daily = read(KEYS.daily, {})[today()] || {};
    const done = ["prepare","execute","review"].filter(key => daily[key]).length;
    const issues = detectViolations();
    const lessons = getLessons().length;
    const dayScore = Math.round(done / 3 * 55 + (readiness?.score || 0) * .25 + (issues.length ? 0 : 20));
    $("#osGreeting").textContent = `${access.firstName ? `${access.firstName}, d` : "D"}ein Tagesfokus`;
    $("#osDayScore").textContent = Math.min(100, dayScore);
    $("#osFocusText").textContent = issues.length ? `${issues.length} Prozesshinweise sind offen. Arbeite zuerst den wichtigsten Punkt ab.` : done < 3 ? "Dein System ist ruhig. Schließe den nächsten Prozessschritt ab." : "Tagesprozess vollständig. Jetzt zählt Erholung statt zusätzliche Aktivität.";
    const actions = [
      { n:"01", title:readiness ? "Readiness vorhanden" : "Readiness prüfen", text:readiness ? `${readiness.score || 0}/100 für die aktuelle Session` : "Zustand vor jeder Entscheidung dokumentieren", view:"gatekeeper" },
      { n:"02", title:issues[0]?.title || "Keine kritischen Regelbrüche", text:issues[0]?.detail || "Limits und Dokumentation sind aktuell sauber", view:"dna" },
      { n:"03", title:lessons ? `Lesson-Fortschritt ${lessons}/33` : "Academy starten", text:"Der Lernfokus passt sich an deine Prozessdaten an", view:"academy" }
    ];
    $("#osNextActions").innerHTML = actions.map(action => `<button class="os-next-action" type="button" data-os-view="${action.view}"><small>${action.n}</small><strong>${escapeHtml(action.title)}</strong><span>${escapeHtml(action.text)}</span></button>`).join("");
    $$('[data-os-view]').forEach(button => button.addEventListener("click", () => document.querySelector(`[data-view="${button.dataset.osView}"]`)?.click()));
  }

  function setupDailyRoutine() {
    const all = read(KEYS.daily, {});
    const current = all[today()] || {};
    $$('[data-daily]').forEach(input => {
      input.checked = Boolean(current[input.dataset.daily]);
      input.addEventListener("change", () => {
        const state = read(KEYS.daily, {});
        state[today()] = { ...(state[today()] || {}), [input.dataset.daily]:input.checked, updatedAt:new Date().toISOString() };
        write(KEYS.daily, state); renderDailyRoutine(); renderPersonalizedHome(); renderChallenges();
      });
    });
    renderDailyRoutine();
  }

  function renderDailyRoutine() {
    const current = read(KEYS.daily, {})[today()] || {};
    const done = ["prepare","execute","review"].filter(key => current[key]).length;
    $("#dailyStatus").className = `status-box ${done === 3 ? "good" : ""}`;
    $("#dailyStatus").textContent = done === 3 ? "Tagesprozess vollständig. Keine zusätzliche Aktivität nötig." : `${done}/3 Prozessschritte abgeschlossen.`;
  }

  function setupRiskGuard() {
    const profile = read(KEYS.risk, { dailyRisk:2, maxTrades:3 });
    $("#dailyRiskLimit").value = profile.dailyRisk;
    $("#maxDailyTrades").value = profile.maxTrades;
    $("#riskProfileForm").addEventListener("submit", event => {
      event.preventDefault();
      write(KEYS.risk, { dailyRisk:Number($("#dailyRiskLimit").value), maxTrades:Number($("#maxDailyTrades").value), updatedAt:new Date().toISOString() });
      renderRiskGuard(); renderViolations();
    });
    renderRiskGuard(); loadNewsGuard();
  }

  function renderRiskGuard() {
    const profile = read(KEYS.risk, { dailyRisk:2, maxTrades:3 });
    const plans = getPlans().filter(plan => isToday(plan.createdAt));
    const trades = getTrades().filter(trade => isToday(trade.date));
    const plannedRisk = plans.reduce((sum, plan) => sum + (Number(plan.risk) || 0), 0);
    const alert = plannedRisk > profile.dailyRisk || trades.length >= profile.maxTrades;
    $("#todayRisk").textContent = `${plannedRisk.toFixed(1)}%`;
    $("#todayTradeCount").textContent = trades.length;
    $("#riskGuardState").textContent = alert ? "Limit prüfen" : "Im Rahmen";
    $("#riskGuardState").parentElement.classList.toggle("alert", alert);
  }

  async function loadNewsGuard() {
    try {
      const from = today(); const until = new Date(Date.now() + 86400000).toISOString().slice(0,10);
      const response = await fetch(`/api/economic-calendar?from=${from}&to=${until}`, { credentials:"include", cache:"no-store" });
      const data = await response.json();
      const events = (data.events || []).filter(event => /high|hoch|3/i.test(String(event.impact || "")));
      $("#nextNews").textContent = events[0] ? String(events[0].event || events[0].title || "Event").slice(0,18) : "Keine High News";
    } catch { $("#nextNews").textContent = "Kalender offline"; }
  }

  function parseCsvLine(line, delimiter) {
    const values = []; let value = ""; let quoted = false;
    for (let i=0;i<line.length;i++) { const char=line[i]; if (char === '"' && line[i+1] === '"') { value+='"'; i++; } else if (char === '"') quoted=!quoted; else if (char===delimiter && !quoted) { values.push(value.trim()); value=""; } else value+=char; }
    values.push(value.trim()); return values;
  }

  function normalizeDate(value) {
    const raw = String(value || "").trim();
    const match = raw.match(/(\d{4})[.\/-](\d{2})[.\/-](\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const eu = raw.match(/(\d{2})[.\/-](\d{2})[.\/-](\d{4})/);
    return eu ? `${eu[3]}-${eu[2]}-${eu[1]}` : today();
  }

  function importBrokerCsv(text, fileName) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("Die Datei enthält keine Trade-Zeilen.");
    const delimiter = lines[0].includes("\t") ? "\t" : lines[0].split(";").length > lines[0].split(",").length ? ";" : ",";
    const headers = parseCsvLine(lines[0], delimiter).map(value => value.toLowerCase().replace(/[^a-z0-9äöüß/]+/g,""));
    const find = names => headers.findIndex(header => names.some(name => header.includes(name)));
    const col = { date:find(["time","date","zeit","datum"]), market:find(["symbol","market","instrument"]), direction:find(["type","direction","typ"]), volume:find(["volume","lots","volumen"]), entry:find(["price","entry","openprice"]), sl:find(["s/l","stoploss","sl"]), tp:find(["t/p","takeprofit","tp"]), profit:find(["profit","p/l","gewinn"]) };
    if (col.market < 0) throw new Error("Keine Symbol-/Markt-Spalte erkannt.");
    const existing = getTrades(); const known = new Set(existing.map(trade => trade.sourceId).filter(Boolean)); const imported = [];
    lines.slice(1).forEach((line,index) => {
      const row = parseCsvLine(line, delimiter); const market = row[col.market]; if (!market) return;
      const profit = Number(String(row[col.profit] || "0").replace(/\s/g,"").replace(",",".")) || 0;
      const sourceId = `broker-${fileName}-${row[col.date]}-${market}-${index}`; if (known.has(sourceId)) return;
      imported.push({ sourceId, date:normalizeDate(row[col.date]), market, direction:/sell|short|verkauf/i.test(row[col.direction] || "") ? "Short" : "Long", session:"Import", result:profit>0?"Gewinn":profit<0?"Verlust":"Break Even", profitLoss:profit, entry:row[col.entry] || "", stopLoss:row[col.sl] || "", takeProfit:row[col.tp] || "", rr:"", setupType:"Broker Import", emotion:"Nicht dokumentiert", newsDay:"Nein", newsNote:"", notes:`Importiert aus ${fileName}${row[col.volume] ? ` · Volumen ${row[col.volume]}` : ""}` });
    });
    if (!imported.length) throw new Error("Keine neuen Trades erkannt.");
    write("bullprosperity_trading_journal", [...imported, ...existing]);
    return imported.length;
  }

  function setupBrokerImport() {
    const connection = read(KEYS.broker, {});
    if (connection.bridgeId) $("#brokerSyncState").textContent = `Bridge ${connection.bridgeId.slice(-8)} · CSV bereit`;
    $("#generateBridge").addEventListener("click", () => { const next={ bridgeId:`BP-${uid().toUpperCase()}`, platform:"MetaTrader", createdAt:new Date().toISOString() }; write(KEYS.broker,next); $("#brokerSyncState").textContent=`Bridge ${next.bridgeId.slice(-8)} · CSV bereit`; });
    $("#brokerCsv").addEventListener("change", async event => {
      const file = event.target.files[0]; if (!file) return;
      try { const count=importBrokerCsv(await file.text(),file.name); $("#brokerImportStatus").className="status-box good"; $("#brokerImportStatus").textContent=`${count} neue Trades importiert und mit dem Journal verbunden.`; renderAllOs(); }
      catch(error) { $("#brokerImportStatus").className="status-box alert"; $("#brokerImportStatus").textContent=error.message; }
    });
  }

  let captureDataUrl = ""; let latestCapture = null;
  function setupScreenshotCapture() {
    $("#captureImage").addEventListener("change", event => {
      const file=event.target.files[0]; if (!file) return;
      if (file.size > 4*1024*1024) { $("#captureStatus").textContent="Datei ist größer als 4 MB."; return; }
      const reader=new FileReader(); reader.onload=()=>{captureDataUrl=reader.result; $("#capturePreview").style.backgroundImage=`url("${captureDataUrl}")`; $("#capturePreview").classList.add("has-image"); $("#analyzeCapture").disabled=false; $("#captureStatus").textContent="Screenshot bereit zur Analyse.";}; reader.readAsDataURL(file);
    });
    $("#analyzeCapture").addEventListener("click", async () => {
      if (!captureDataUrl) return; const button=$("#analyzeCapture"); button.disabled=true; $("#captureStatus").textContent="Sichtbare Chart-Informationen werden extrahiert …";
      try { const response=await fetch("/api/trade-capture",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({image:captureDataUrl})}); const data=await response.json(); if(!response.ok)throw new Error(data.error||"Analyse fehlgeschlagen"); latestCapture=data.trade; const history=read(KEYS.captures,[]); history.unshift({...data.trade,id:uid(),createdAt:new Date().toISOString()}); write(KEYS.captures,history.slice(0,30)); $("#captureStatus").className="status-box good"; $("#captureStatus").innerHTML=`<strong>${escapeHtml(data.trade.market||"Chart erkannt")}</strong><br>${escapeHtml(data.trade.direction||"Richtung offen")} · ${escapeHtml(data.trade.setupType||"Setup offen")}<div class="lab-actions"><button class="lab-btn" id="saveCaptureTrade" type="button">Als Journal-Entwurf speichern</button></div>`; $("#saveCaptureTrade").addEventListener("click",saveCaptureTrade); }
      catch(error){$("#captureStatus").className="status-box alert";$("#captureStatus").textContent=`${error.message}. Du kannst den Screenshot weiterhin manuell im Journal dokumentieren.`;} finally{button.disabled=false;}
    });
  }

  function saveCaptureTrade() {
    if (!latestCapture) return; const trades=getTrades(); trades.unshift({ date:today(), market:latestCapture.market||"Screenshot", direction:latestCapture.direction||"Offen", session:latestCapture.session||"Nicht erkannt", result:"Break Even", profitLoss:0, entry:latestCapture.entry||"", stopLoss:latestCapture.stopLoss||"", takeProfit:latestCapture.takeProfit||"", rr:latestCapture.rr||"", setupType:latestCapture.setupType||"AI Capture", emotion:"Nicht dokumentiert", newsDay:"Nein", newsNote:"", notes:`Screenshot-Entwurf: ${latestCapture.context||"Manuell vervollständigen"}` }); write("bullprosperity_trading_journal",trades); $("#captureStatus").textContent="Entwurf im Trading Journal gespeichert. Bitte Angaben dort prüfen und vervollständigen."; renderAllOs();
  }

  function setupVoiceJournal() {
    const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition; let recognition; let recording=false;
    if (SpeechRecognition) { recognition=new SpeechRecognition(); recognition.lang="de-DE"; recognition.continuous=true; recognition.interimResults=true; recognition.onresult=event=>{let text="";for(let i=0;i<event.results.length;i++)text+=event.results[i][0].transcript+" ";$("#voiceTranscript").value=text.trim();}; recognition.onend=()=>{recording=false;renderVoiceButton();}; }
    function renderVoiceButton(){ $("#voiceToggle").classList.toggle("is-recording",recording); $("#voiceToggle strong").textContent=recording?"Aufnahme stoppen":SpeechRecognition?"Aufnahme starten":"Spracheingabe nicht unterstützt"; }
    $("#voiceToggle").addEventListener("click",()=>{if(!recognition)return alert("Dieser Browser unterstützt keine direkte Spracheingabe. Nutze bitte das Textfeld.");recording=!recording;recording?recognition.start():recognition.stop();renderVoiceButton();});
    $("#saveVoiceEntry").addEventListener("click",()=>{const text=$("#voiceTranscript").value.trim();if(!text)return;const entries=read(KEYS.voice,[]);entries.unshift({id:uid(),text,createdAt:new Date().toISOString()});write(KEYS.voice,entries.slice(0,60));$("#voiceTranscript").value="";renderVoiceEntries();}); renderVoiceButton(); renderVoiceEntries();
  }

  function renderVoiceEntries() { const entries=read(KEYS.voice,[]); $("#voiceEntries").innerHTML=entries.slice(0,5).map(entry=>`<article class="stack-item"><strong>Session Review · ${formatDate(entry.createdAt)}</strong><span>${escapeHtml(entry.text)}</span></article>`).join("")||'<div class="status-box">Noch keine Voice Reviews gespeichert.</div>'; }

  function renderViolations() { const issues=detectViolations(); $("#violationList").innerHTML=issues.length?issues.map(issue=>`<article class="stack-item ${issue.level==='high'?'violation-high':''}"><strong>${escapeHtml(issue.title)}</strong><span>${escapeHtml(issue.detail)}</span></article>`).join(""):'<div class="status-box good">Keine dokumentierten Regelverstöße erkannt.</div>'; }

  function compressMentorChart(file) {
    if (!file) return Promise.resolve("");
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type) || file.size > 6 * 1024 * 1024) {
      return Promise.reject(new Error("Bitte nutze PNG, JPG oder WebP mit maximal 6 MB."));
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Chart konnte nicht gelesen werden."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("Chart konnte nicht verarbeitet werden."));
        image.onload = () => {
          const scale = Math.min(1, 900 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", .58));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function setupMentorInbox() {
    const chartInput = $("#mentorChart");
    chartInput?.addEventListener("change", event => {
      const file = event.target.files[0];
      const preview = $("#mentorChartPreview");
      if (!file || !preview) return;
      preview.style.backgroundImage = `url("${URL.createObjectURL(file)}")`;
      preview.classList.add("has-image");
    });
    $("#mentorRequestForm").addEventListener("submit", async event => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      button.textContent = "Wird vorbereitet …";
      try {
        const chart = await compressMentorChart(chartInput?.files?.[0]);
        const items = read(KEYS.mentor, []);
        items.unshift({ id:uid(), trade:$("#mentorTrade").value.trim(), question:$("#mentorQuestion").value.trim(), chart, status:"open", createdAt:new Date().toISOString(), feedback:"", videoUrl:"" });
        while (JSON.stringify(items).length > 450000 || items.length > 30) items.pop();
        write(KEYS.mentor, items);
        event.target.reset();
        $("#mentorChartPreview")?.classList.remove("has-image");
        if ($("#mentorChartPreview")) $("#mentorChartPreview").style.backgroundImage = "";
        renderMentorInbox();
      } catch (error) {
        alert(error.message);
      } finally {
        button.disabled = false;
        button.textContent = "An Mentor senden";
      }
    });
    renderMentorInbox();
  }

  function renderMentorInbox() { const items=read(KEYS.mentor,[]); $("#mentorInbox").innerHTML=items.length?items.slice(0,8).map(item=>{const safeVideo=/^https?:\/\//i.test(item.videoUrl||"")?item.videoUrl:"";const chart=/^data:image\//.test(item.chart||"")?`<img class="mentor-chart-thumb" src="${item.chart}" alt="Chart zur Mentor-Anfrage" />`:"";return`<article class="stack-item ${item.status==='answered'?'is-complete':''}">${chart}<strong>${escapeHtml(item.trade)} · ${item.status==='answered'?'Beantwortet':'Offen'}</strong><span>${escapeHtml(item.question)}</span>${item.feedback?`<div class="mentor-answer">${escapeHtml(item.feedback)}${safeVideo?`<a class="lab-btn" href="${escapeHtml(safeVideo)}" target="_blank" rel="noopener">Video Review öffnen</a>`:""}</div>`:""}</article>`;}).join(""):'<div class="status-box">Noch keine Mentor-Anfragen.</div>'; }

  function setupReplay() {
    const values=[38,62,48,74,56,85,67,92,71,58,80,64]; $("#osReplayBars").innerHTML=values.map((height,index)=>`<span class="os-replay-bar ${index%3===1?'bear':''}" style="height:${height}%"></span>`).join(""); let step=0; const render=()=>{$("#osReplayCover").style.width=`${Math.max(0,100-step/values.length*100)}%`;$("#osReplayCover").textContent=step?`${step}/${values.length} Kerzen sichtbar`:"Nächsten Schritt aufdecken";}; $("#replayNext").addEventListener("click",()=>{step=Math.min(values.length,step+1);render();}); $("#replayReset").addEventListener("click",()=>{step=0;render();}); render();
  }

  function setupPlaybooks() {
    $("#playbookForm").addEventListener("submit",event=>{event.preventDefault();const items=read(KEYS.playbooks,[]);items.unshift({id:uid(),name:$("#playbookName").value.trim(),rules:$("#playbookRules").value.trim(),share:$("#sharePlaybook").checked,createdAt:new Date().toISOString(),samples:0});write(KEYS.playbooks,items.slice(0,40));event.target.reset();publishSetupLibrary();renderPlaybooks();loadVerifiedLibrary();});renderPlaybooks();
  }

  function renderPlaybooks(){const items=read(KEYS.playbooks,[]);$("#playbookList").innerHTML=items.length?items.map(item=>`<article class="stack-item"><strong>${escapeHtml(item.name)} ${item.share?'· Library':''}</strong><span>${escapeHtml(item.rules)}</span></article>`).join(""):'<div class="status-box">Noch kein Playbook erstellt.</div>';}
  function publishSetupLibrary(){const shared=read(KEYS.playbooks,[]).filter(item=>item.share).map(item=>({name:item.name,rules:item.rules,samples:item.samples||0}));const alias=read("bp_squad_profile",{}).alias||"Member";const current=read(KEYS.publicLibrary,{});if(JSON.stringify({alias:current.alias,setups:current.setups||[]})!==JSON.stringify({alias,setups:shared}))write(KEYS.publicLibrary,{alias,setups:shared,updatedAt:new Date().toISOString()});}

  function renderChallenges(){const daily=read(KEYS.daily,{});const reviews=getReviews();const plans=getPlans();const challengeData=[{id:"routine",title:"7-Tage-Prozess",text:"Sieben vollständige Daily-OS-Tage",value:Object.values(daily).filter(day=>day.prepare&&day.execute&&day.review).length,target:7},{id:"clean",title:"10 saubere Reviews",text:"Regelkonformität von mindestens 90 %",value:reviews.filter(item=>Number(item.adherence)>=90).length,target:10},{id:"plans",title:"5 vollständige Pläne",text:"Vorbereitung vor Ausführung",value:plans.filter(item=>item.approved).length,target:5}];$("#challengeGrid").innerHTML=challengeData.map(item=>{const value=Math.min(item.target,item.value),complete=value>=item.target;return`<article class="challenge-card ${complete?'is-complete':''}"><div class="lab-badge">${complete?'Abgeschlossen':'Challenge'}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><div class="progress" style="--progress:${value/item.target*100}%"><span></span></div><strong>${value}/${item.target}</strong></article>`}).join("");if(JSON.stringify(read(KEYS.challenges,[]))!==JSON.stringify(challengeData))write(KEYS.challenges,challengeData);}

  async function loadVerifiedLibrary(){try{const response=await fetch("/api/setup-library",{credentials:"include",cache:"no-store"});const data=await response.json();if(!response.ok)throw new Error();renderVerifiedLibrary(data.setups||[]);}catch{const own=read(KEYS.publicLibrary,{});renderVerifiedLibrary((own.setups||[]).map(setup=>({...setup,alias:own.alias||"Du"})));}}
  function renderVerifiedLibrary(items){$("#verifiedLibrary").innerHTML=items.length?items.slice(0,12).map(item=>`<article class="stack-item"><strong>${escapeHtml(item.name)} · ${escapeHtml(item.alias||"Member")}</strong><span>${escapeHtml(item.rules)}</span></article>`).join(""):'<div class="status-box">Noch keine freiwillig veröffentlichten Playbooks.</div>';}

  let installPrompt;
  function setupPwa(){if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;$("#pwaStatus").textContent="Installation ist auf diesem Gerät verfügbar.";});$("#installPwa").addEventListener("click",async()=>{if(!installPrompt){$("#pwaStatus").textContent="Öffne das Browser-Menü und wähle „Zum Home-Bildschirm“ oder „App installieren“.";return;}installPrompt.prompt();const choice=await installPrompt.userChoice;$("#pwaStatus").textContent=choice.outcome==="accepted"?"BullProsperity wurde installiert.":"Installation wurde nicht abgeschlossen.";installPrompt=null;});$("#enableReminders").addEventListener("click",async()=>{if(!("Notification"in window)){return $("#pwaStatus").textContent="Benachrichtigungen werden hier nicht unterstützt.";}const permission=await Notification.requestPermission();$("#pwaStatus").textContent=permission==="granted"?"Erinnerungen sind aktiviert. Sie erscheinen nur über Funktionen, die du selbst startest.":"Benachrichtigungen wurden nicht erlaubt.";});if(matchMedia("(display-mode: standalone)").matches)$("#pwaStatus").textContent="BullProsperity läuft bereits als installierte App.";else $("#pwaStatus").textContent="Installation über Browser oder Home-Bildschirm verfügbar.";}

  function setupPassport(){$("#printPassport").addEventListener("click",()=>window.print());}

  function renderAllOs(){renderPersonalizedHome();renderDailyRoutine();renderRiskGuard();renderVoiceEntries();renderViolations();renderMentorInbox();renderPlaybooks();renderChallenges();publishSetupLibrary();}
  function initialize(){setupDailyRoutine();setupRiskGuard();setupBrokerImport();setupScreenshotCapture();setupVoiceJournal();setupMentorInbox();setupReplay();setupPlaybooks();setupPwa();setupPassport();renderAllOs();loadVerifiedLibrary();window.addEventListener("bp:cloud-ready",()=>{renderAllOs();loadVerifiedLibrary();});window.addEventListener("bp:performance-updated",renderAllOs);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});else initialize();
})();
