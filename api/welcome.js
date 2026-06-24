import { getVerifiedSession, getSupabaseAdmin, readCookie } from "./_session.js";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[character]);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  if (req.method !== "POST") return res.status(405).json({ ok:false, error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) {
    return res.status(401).json({ ok:false });
  }

  const resendKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RESEND_FROM_EMAIL || "").trim();
  if (!resendKey || !from) return res.json({ ok:true, sent:false, reason:"not_configured" });

  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.json({ ok:true, sent:false, reason:"cloud_unavailable" });

  try {
    const endpoint = `${url}/rest/v1/member_state?email=eq.${encodeURIComponent(session.email)}`;
    const currentResponse = await fetch(`${endpoint}&select=state&limit=1`, { headers });
    const rows = currentResponse.ok ? await currentResponse.json() : [];
    const state = rows[0]?.state || {};
    if (state.bp_welcome_email_sent === "true") return res.json({ ok:true, sent:false, reason:"already_sent" });

    const firstName = readCookie(req, "bp_first_name") || readCookie(req, "bp_name").split(/\s+/)[0] || "Trader";
    const invite = String(process.env.DISCORD_INVITE_URL || "https://discord.gg/qJaeBkTn3n").trim();
    const mail = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{ Authorization:`Bearer ${resendKey}`, "Content-Type":"application/json" },
      body:JSON.stringify({
        from,
        to:[session.email],
        subject:"Willkommen bei BullProsperity",
        html:`<div style="font-family:Arial,sans-serif;background:#080808;color:#fff;padding:30px"><h1 style="color:#f3d21b">Willkommen, ${escapeHtml(firstName)}.</h1><p>Dein BullProsperity Zugang ist aktiv.</p><p><a style="color:#f3d21b" href="https://bullprosperity.online/hub">Mit dem Hub starten</a> · <a style="color:#f3d21b" href="${escapeHtml(invite)}">Discord beitreten</a></p><p>Arbeite zuerst das Onboarding durch und beginne danach mit der ersten verfügbaren Lektion.</p></div>`
      })
    });
    if (!mail.ok) return res.status(502).json({ ok:false, error:"Willkommensmail konnte nicht gesendet werden" });

    state.bp_welcome_email_sent = "true";
    await fetch(`${url}/rest/v1/member_state?on_conflict=email`, {
      method:"POST",
      headers:{ ...headers, Prefer:"resolution=merge-duplicates,return=minimal" },
      body:JSON.stringify({ email:session.email, state, updated_at:new Date().toISOString() })
    });
    return res.json({ ok:true, sent:true });
  } catch {
    return res.status(500).json({ ok:false, error:"Willkommensmail momentan nicht erreichbar" });
  }
}
