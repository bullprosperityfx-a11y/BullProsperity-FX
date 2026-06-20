import crypto from "crypto";

const allowedKeys = new Set([
  "bp_completed_lessons",
  "bp_last_lesson",
  "bp_hub_notes",
  "bp_global_notes",
  "bp_setup_library",
  "bp_onboarding_steps",
  "bp_favorites"
]);

function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const value = cookies.split("; ").find(cookie => cookie.startsWith(`${name}=`))?.split("=").slice(1).join("=");
  return decodeURIComponent(value || "");
}

function cleanState(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  return Object.fromEntries(Object.entries(input).filter(([key, value]) =>
    (allowedKeys.has(key) || /^bullprosperity_notes_([1-9]|[12]\d|3[0-3])$/.test(key)) &&
    typeof value === "string" &&
    value.length <= 50000
  ));
}

export default async function handler(req, res) {
  const role = readCookie(req, "bp_role");
  const email = readCookie(req, "bp_email").trim().toLowerCase();
  const memberId = readCookie(req, "bp_member_id");
  const sessionSignature = readCookie(req, "bp_session");
  const sessionSecret = process.env.SESSION_SECRET || process.env.WHOP_CLIENT_SECRET;
  const expectedSignature = sessionSecret
    ? crypto.createHmac("sha256", sessionSecret).update(`${email}|${role}|${memberId}`).digest("hex")
    : "";
  const hasValidSession = Boolean(
    expectedSignature &&
    sessionSignature &&
    expectedSignature.length === sessionSignature.length &&
    crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(sessionSignature))
  );

  if (!email || !hasValidSession || !["admin", "premium", "longterm"].includes(role)) {
    return res.status(401).json({ ok:false, error:"Kein Zugriff" });
  }

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
