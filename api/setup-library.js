import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

function parse(value, fallback) {
  try { return typeof value === "string" ? JSON.parse(value) : value ?? fallback; }
  catch { return fallback; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  if (req.method !== "GET") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin","premium","longterm"].includes(session.role)) return res.status(401).json({ error:"Kein Zugriff" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"Setup Library ist noch nicht konfiguriert" });
  try {
    const response = await fetch(`${url}/rest/v1/member_state?select=state&limit=500`, { headers });
    const rows = await response.json();
    if (!response.ok) return res.status(502).json({ error:"Setup Library nicht erreichbar" });
    const setups = [];
    (rows || []).forEach(row => {
      const profile = parse(row.state?.bp_public_setup_library, {});
      (Array.isArray(profile.setups) ? profile.setups : []).slice(0,10).forEach(setup => setups.push({
        alias:String(profile.alias || "Member").slice(0,24),
        name:String(setup.name || "Setup").slice(0,80),
        rules:String(setup.rules || "").slice(0,1600),
        samples:Math.max(0,Math.min(100,Number(setup.samples)||0))
      }));
    });
    return res.json({ ok:true, setups:setups.slice(0,100) });
  } catch { return res.status(500).json({ error:"Setup Library nicht erreichbar" }); }
}
