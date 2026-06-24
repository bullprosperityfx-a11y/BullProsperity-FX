import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

function clean(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  if (req.method !== "POST") return res.status(405).json({ ok:false });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) {
    return res.status(204).end();
  }

  const type = clean(req.body?.type, 40);
  const page = clean(req.body?.page, 180);
  const detail = clean(req.body?.detail, 600);
  if (!new Set(["client_error", "unhandled_rejection"]).has(type) || !page) {
    return res.status(400).json({ ok:false });
  }

  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(204).end();
  try {
    await fetch(`${url}/rest/v1/member_activity`, {
      method:"POST",
      headers:{ ...headers, Prefer:"return=minimal" },
      body:JSON.stringify({
        email:session.email,
        role:session.role,
        action:type,
        page:`${page} · ${detail}`.slice(0, 780)
      })
    });
  } catch { /* Telemetry must never affect the member experience. */ }
  return res.status(204).end();
}
