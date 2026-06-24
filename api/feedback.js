import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

const categories = new Set(["Fehler", "Verbesserung", "Inhalt", "Sonstiges"]);

function clean(value, max) {
  return String(value || "").trim().slice(0, max);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok:false, error:"Methode nicht erlaubt" });
  }

  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) {
    return res.status(401).json({ ok:false, error:"Bitte erneut anmelden" });
  }

  const category = clean(req.body?.category, 40);
  const message = clean(req.body?.message, 3000);
  const page = clean(req.body?.page, 300);
  if (!categories.has(category) || message.length < 8) {
    return res.status(400).json({ ok:false, error:"Bitte Kategorie und eine kurze Beschreibung angeben" });
  }

  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ ok:false, error:"Feedback-System nicht konfiguriert" });

  try {
    const recentResponse = await fetch(
      `${url}/rest/v1/feedback_reports?email=eq.${encodeURIComponent(session.email)}&select=created_at&order=created_at.desc&limit=1`,
      { headers }
    );
    if (recentResponse.ok) {
      const recent = await recentResponse.json();
      const lastCreated = new Date(recent[0]?.created_at || 0).getTime();
      if (lastCreated && Date.now() - lastCreated < 20000) {
        return res.status(429).json({ ok:false, error:"Bitte kurz warten, bevor du weiteres Feedback sendest" });
      }
    }

    const insert = await fetch(`${url}/rest/v1/feedback_reports`, {
      method:"POST",
      headers:{ ...headers, Prefer:"return=representation" },
      body:JSON.stringify({
        email:session.email,
        role:session.role,
        category,
        message,
        page:page || "unbekannt",
        user_agent:clean(req.headers["user-agent"], 500)
      })
    });
    const rows = await insert.json().catch(() => []);
    if (!insert.ok) return res.status(502).json({ ok:false, error:"Feedback konnte nicht gespeichert werden" });

    let discordNotified = false;
    const webhook = String(process.env.DISCORD_FEEDBACK_WEBHOOK_URL || "").trim();
    if (webhook) {
      try {
        const discord = await fetch(webhook, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body:JSON.stringify({
            content:`**${category}** von ${session.email}\nSeite: ${page || "unbekannt"}\n${message}`.slice(0, 1900)
          })
        });
        discordNotified = discord.ok;
      } catch { /* Supabase remains the source of truth. */ }
    }

    return res.status(201).json({ ok:true, id:rows[0]?.id || null, discordNotified });
  } catch {
    return res.status(500).json({ ok:false, error:"Feedback-System momentan nicht erreichbar" });
  }
}
