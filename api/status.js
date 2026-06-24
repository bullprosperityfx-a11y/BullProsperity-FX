import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

async function timedFetch(url, options = {}, timeout = 4500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try { return await fetch(url, { ...options, signal:controller.signal }); }
  finally { clearTimeout(timer); }
}

function item(id, label, state, detail) {
  return { id, label, state, detail };
}

export default async function handler(req, res) {
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) {
    return res.status(401).json({ ok:false, error:"Kein Zugriff" });
  }

  res.setHeader("Cache-Control", "no-store, private");
  const checks = [];
  const supabase = getSupabaseAdmin();

  try {
    if (!supabase.headers) throw new Error("Nicht konfiguriert");
    const response = await timedFetch(`${supabase.url}/rest/v1/member_state?select=email&limit=1`, { headers:supabase.headers });
    checks.push(item("cloud", "Cloud-Speicher", response.ok ? "operational" : "degraded", response.ok ? "Supabase ist erreichbar." : "Supabase antwortet nicht regulär."));
  } catch {
    checks.push(item("cloud", "Cloud-Speicher", "degraded", "Supabase ist pausiert oder nicht erreichbar."));
  }

  try {
    const apiKey = String(process.env.WHOP_API_KEY || "").trim();
    const resourceId = String(process.env.WHOP_RESOURCE_ID || "").trim();
    if (!apiKey || !resourceId || !session.memberId) throw new Error("Nicht konfiguriert");
    const response = await timedFetch(`https://api.whop.com/api/v1/users/${encodeURIComponent(session.memberId)}/access/${encodeURIComponent(resourceId)}`, { headers:{ Authorization:`Bearer ${apiKey}` } });
    checks.push(item("access", "Mitgliederzugang", response.ok ? "operational" : "degraded", response.ok ? "Whop-Zugangsprüfung funktioniert." : "Whop-Zugangsprüfung antwortet nicht regulär."));
  } catch {
    checks.push(item("access", "Mitgliederzugang", "degraded", "Whop-Verbindung ist noch nicht vollständig konfiguriert."));
  }

  try {
    const invite = String(process.env.DISCORD_INVITE_URL || "");
    const code = invite.match(/discord(?:\.gg|\.com\/invite)\/([^/?#]+)/i)?.[1];
    if (!code) throw new Error("Nicht konfiguriert");
    const response = await timedFetch(`https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`);
    checks.push(item("community", "Discord Community", response.ok ? "operational" : "degraded", response.ok ? "Einladungslink ist erreichbar." : "Einladungslink sollte geprüft werden."));
  } catch {
    checks.push(item("community", "Discord Community", "degraded", "Discord-Verbindung ist nicht erreichbar."));
  }

  checks.push(item("ai", "AI Coaching", process.env.OPENAI_API_KEY ? "configured" : "degraded", process.env.OPENAI_API_KEY ? "KI-Funktionen sind konfiguriert." : "OpenAI-Schlüssel fehlt."));
  const mailReady = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
  checks.push(item("mail", "E-Mail-System", mailReady ? "configured" : "degraded", mailReady ? "Willkommensmails sind konfiguriert." : "RESEND_API_KEY oder RESEND_FROM_EMAIL fehlt."));

  try {
    if (!supabase.headers) throw new Error("Nicht konfiguriert");
    const response = await timedFetch(`${supabase.url}/rest/v1/feedback_reports?select=id&limit=1`, { headers:supabase.headers });
    checks.push(item("feedback", "Feedback-System", response.ok ? "operational" : "degraded", response.ok ? "Feedback-Tabelle und API sind erreichbar." : "Feedback-Migration muss geprüft werden."));
  } catch {
    checks.push(item("feedback", "Feedback-System", "degraded", "Feedback-Tabelle ist nicht erreichbar."));
  }
  checks.unshift(item("platform", "BullProsperity Plattform", "operational", "Webseite und geschützte API sind erreichbar."));

  const degraded = checks.filter(check => check.state === "degraded").length;
  return res.json({ ok:true, overall:degraded ? "degraded" : "operational", checks, checkedAt:new Date().toISOString() });
}
