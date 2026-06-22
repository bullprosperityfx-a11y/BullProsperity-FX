import { getVerifiedSession, getSupabaseAdmin } from "../_session.js";

function parse(value, fallback) {
  try { return typeof value === "string" ? JSON.parse(value) : value ?? fallback; }
  catch { return fallback; }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || session.role !== "admin") return res.status(403).json({ error:"Nur Admin" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"SUPABASE_SERVICE_ROLE_KEY fehlt" });
  try {
    const response = await fetch(`${url}/rest/v1/member_state?select=email,state,updated_at&order=updated_at.desc&limit=500`, { headers });
    const rows = await response.json();
    if (!response.ok) return res.status(502).json({ error:"Performance-Daten nicht erreichbar" });
    const mentorRequests = [];
    const members = (rows || []).map(row => {
      const state = row.state || {};
      const profile = parse(state.bp_public_process_profile, {});
      const plans = parse(state.bp_pretrade_plans, []);
      const reviews = parse(state.bp_process_reviews, []);
      const readiness = parse(state.bp_readiness_history, []);
      const drills = parse(state.bp_replay_drills, []);
      const mentor = parse(state.bp_mentor_submissions, []);
      const mentorOpen = mentor.filter(item => item?.status !== "answered").length;
      mentor.filter(item => item?.status !== "answered").forEach(item => mentorRequests.push({
        id:String(item.id || ""),
        email:row.email,
        trade:String(item.trade || "Trade Review").slice(0,160),
        question:String(item.question || "").slice(0,3000),
        createdAt:item.createdAt || row.updated_at
      }));
      const lessons = Object.keys(parse(state.bp_completed_lessons, {})).length;
      const adherence = reviews.length ? Math.round(reviews.slice(0,20).reduce((sum,item) => sum + (Number(item.adherence) || 0),0) / Math.min(20,reviews.length)) : 0;
      const approved = plans.length ? Math.round(plans.slice(0,20).filter(item => item.approved).length / Math.min(20,plans.length) * 100) : 0;
      const readinessScore = Number(readiness[0]?.score) || 0;
      const score = Number(profile?.score) || Math.round(approved * .4 + adherence * .4 + Math.min(100,lessons / 33 * 100) * .2);
      const alerts = [];
      if (plans.length && approved < 60) alerts.push("Vorbereitung unter 60 %");
      if (reviews.length && adherence < 60) alerts.push("Regelkonformität unter 60 %");
      if (readinessScore && readinessScore < 50) alerts.push("Niedrige Readiness");
      if (drills.filter(item => !item.completed).length >= 5) alerts.push("Drill-Rückstand");
      if (mentorOpen) alerts.push(`${mentorOpen} offene Mentor-Anfrage${mentorOpen === 1 ? "" : "n"}`);
      return { email:row.email, alias:profile?.alias || row.email.split("@")[0], score, approved, adherence, readiness:readinessScore, lessons, drillsOpen:drills.filter(item => !item.completed).length, mentorOpen, alerts, updatedAt:row.updated_at };
    });
    mentorRequests.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    return res.json({ ok:true, members, mentorRequests });
  } catch { return res.status(500).json({ error:"Performance-Daten nicht erreichbar" }); }
}
