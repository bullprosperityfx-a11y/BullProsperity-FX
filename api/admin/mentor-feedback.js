import { getVerifiedSession, getSupabaseAdmin } from "../_session.js";

function parse(value, fallback) {
  try { return typeof value === "string" ? JSON.parse(value) : value ?? fallback; }
  catch { return fallback; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || session.role !== "admin") return res.status(403).json({ error:"Nur Admin" });
  const email = String(req.body?.email || "").trim().toLowerCase();
  const submissionId = String(req.body?.submissionId || "");
  const feedback = String(req.body?.feedback || "").trim().slice(0,5000);
  const videoUrl = String(req.body?.videoUrl || "").trim().slice(0,1000);
  if (!email || !submissionId || !feedback) return res.status(400).json({ error:"E-Mail, Anfrage und Feedback fehlen" });
  if (videoUrl && !/^https?:\/\//i.test(videoUrl)) return res.status(400).json({ error:"Video-Link muss mit http oder https beginnen" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"Cloud-Speicher nicht konfiguriert" });
  try {
    const response = await fetch(`${url}/rest/v1/member_state?email=eq.${encodeURIComponent(email)}&select=state&limit=1`, { headers });
    const rows = await response.json();
    if (!response.ok || !rows[0]) return res.status(404).json({ error:"Mitglied nicht gefunden" });
    const state = rows[0].state || {};
    const submissions = parse(state.bp_mentor_submissions, []);
    const item = submissions.find(entry => entry.id === submissionId);
    if (!item) return res.status(404).json({ error:"Mentor-Anfrage nicht gefunden" });
    Object.assign(item, { feedback, videoUrl, status:"answered", answeredAt:new Date().toISOString(), answeredBy:session.email });
    state.bp_mentor_submissions = JSON.stringify(submissions);
    const update = await fetch(`${url}/rest/v1/member_state?email=eq.${encodeURIComponent(email)}`, { method:"PATCH", headers:{ ...headers, Prefer:"return=minimal" }, body:JSON.stringify({ state, updated_at:new Date().toISOString() }) });
    if (!update.ok) return res.status(502).json({ error:"Feedback konnte nicht gespeichert werden" });
    return res.json({ ok:true });
  } catch { return res.status(500).json({ error:"Feedback konnte nicht gespeichert werden" }); }
}
