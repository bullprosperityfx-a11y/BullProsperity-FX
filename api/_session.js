import crypto from "crypto";

export function readCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const value = cookies.split("; ").find(cookie => cookie.startsWith(`${name}=`))?.split("=").slice(1).join("=");
  return decodeURIComponent(value || "");
}

export function getVerifiedSession(req) {
  const email = readCookie(req, "bp_email").trim().toLowerCase();
  const role = readCookie(req, "bp_role");
  const memberId = readCookie(req, "bp_member_id");
  const signature = readCookie(req, "bp_session");
  const secret = process.env.SESSION_SECRET || process.env.WHOP_CLIENT_SECRET;
  const expected = secret && email
    ? crypto.createHmac("sha256", secret).update(`${email}|${role}|${memberId}`).digest("hex")
    : "";
  const valid = Boolean(expected && signature && expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature)));
  return { valid, email, role, memberId };
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || "https://bygrocbckwjcatrgdook.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key, headers:key ? { apikey:key, Authorization:`Bearer ${key}`, "Content-Type":"application/json" } : null };
}
