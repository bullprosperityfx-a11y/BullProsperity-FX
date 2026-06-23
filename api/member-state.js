import { getVerifiedSession } from "./_session.js";

const allowedKeys = new Set([
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
  "bp_notification_preferences"
]);

function cleanState(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(Object.entries(input).filter(([key, value]) =>
    (allowedKeys.has(key) || /^bullprosperity_notes_([1-9]|[12]\d|3[0-3])$/.test(key)) &&
    typeof value === "string" &&
    value.length <= 500000
  ));
}

function parseJson(value, fallback) {
  try { return typeof value === "string" ? JSON.parse(value) : value ?? fallback; }
  catch { return fallback; }
}

function preserveMentorAnswers(incoming, current) {
  if (!Object.prototype.hasOwnProperty.call(incoming, "bp_mentor_submissions")) return incoming;
  const localItems = parseJson(incoming.bp_mentor_submissions, []);
  const remoteItems = parseJson(current?.bp_mentor_submissions, []);
  if (!Array.isArray(localItems) || !Array.isArray(remoteItems)) return incoming;
  const answered = new Map(remoteItems.filter(item => item?.status === "answered" && item.id).map(item => [item.id, item]));
  const merged = localItems.map(item => answered.get(item?.id) || item);
  answered.forEach((item, id) => { if (!merged.some(entry => entry?.id === id)) merged.push(item); });
  incoming.bp_mentor_submissions = JSON.stringify(merged);
  return incoming;
}

function preserveCompletedOnboarding(incoming, current) {
  const steps = ["profile", "course", "journal", "discord", "broker"];
  const remote = parseJson(current?.bp_onboarding_steps, {});
  if (!steps.every(step => remote?.[step] === true)) return incoming;
  const local = parseJson(incoming.bp_onboarding_steps, {});
  if (!steps.every(step => local?.[step] === true)) {
    incoming.bp_onboarding_steps = JSON.stringify(remote);
  }
  return incoming;
}

export default async function handler(req, res) {
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) {
    return res.status(401).json({ ok:false, error:"Kein Zugriff" });
  }
  const email = session.email;

  const supabaseUrl = process.env.SUPABASE_URL || "https://bygrocbckwjcatrgdook.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return res.status(503).json({ ok:false, error:"Cloud-Speicher ist noch nicht konfiguriert" });
  }

  const endpoint = `${supabaseUrl}/rest/v1/member_state`;
  const headers = {
    apikey:serviceKey,
    Authorization:`Bearer ${serviceKey}`,
    "Content-Type":"application/json"
  };

  try {
    if (req.method === "GET") {
      const response = await fetch(`${endpoint}?email=eq.${encodeURIComponent(email)}&select=state,updated_at&limit=1`, { headers });
      const rows = await response.json();
      if (!response.ok) return res.status(502).json({ ok:false, error:"Cloud-Daten konnten nicht geladen werden" });
      return res.json({ ok:true, state:rows[0]?.state || {}, updatedAt:rows[0]?.updated_at || null });
    }

    if (req.method === "POST") {
      const state = cleanState(req.body?.state);
      const currentResponse = await fetch(`${endpoint}?email=eq.${encodeURIComponent(email)}&select=state&limit=1`, { headers });
      const currentRows = currentResponse.ok ? await currentResponse.json() : [];
      preserveMentorAnswers(state, currentRows[0]?.state || {});
      preserveCompletedOnboarding(state, currentRows[0]?.state || {});
      const response = await fetch(`${endpoint}?on_conflict=email`, {
        method:"POST",
        headers:{ ...headers, Prefer:"resolution=merge-duplicates,return=minimal" },
        body:JSON.stringify({ email, state, updated_at:new Date().toISOString() })
      });
      if (!response.ok) return res.status(502).json({ ok:false, error:"Cloud-Daten konnten nicht gespeichert werden" });
      return res.json({ ok:true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok:false, error:"Methode nicht erlaubt" });
  } catch {
    return res.status(500).json({ ok:false, error:"Cloud-Speicher nicht erreichbar" });
  }
}
