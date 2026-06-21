import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

function parseProfile(state) {
  try {
    const value = state?.bp_public_process_profile;
    const profile = typeof value === "string" ? JSON.parse(value) : value;
    if (!profile || typeof profile !== "object") return null;
    return {
      alias:String(profile.alias || "Member").slice(0, 24),
      squadCode:String(profile.squadCode || "").slice(0, 20),
      score:Math.max(0, Math.min(100, Number(profile.score) || 0)),
      lessons:Math.max(0, Math.min(33, Number(profile.lessons) || 0)),
      checkins:Math.max(0, Number(profile.checkins) || 0)
    };
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) return res.status(401).json({ error:"Kein Zugriff" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"Community-Daten sind noch nicht konfiguriert" });
  try {
    const response = await fetch(`${url}/rest/v1/member_state?select=state&limit=500`, { headers });
    const rows = await response.json();
    if (!response.ok) return res.status(502).json({ error:"Community-Daten nicht erreichbar" });
    return res.json({ ok:true, members:(rows || []).map(row => parseProfile(row.state)).filter(Boolean) });
  } catch { return res.status(500).json({ error:"Community-Daten nicht erreichbar" }); }
}
