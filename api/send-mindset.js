import { getVerifiedSession } from "./_session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = getVerifiedSession(req);
    if (!session.valid || !["admin", "premium"].includes(session.role)) {
      return res.status(401).json({ error: "Kein Zugriff." });
    }

    const { title, category, text, date } = req.body;

    if (!title || !text) {
      return res.status(400).json({ error: "Titel und Beitrag fehlen." });
    }

    const webhookUrl = process.env.DISCORD_MINDSET_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "Discord Webhook fehlt." });
    }

    const payload = {
      embeds: [
        {
          title: "🧠 Neuer anonymer Mindset Beitrag",
          color: 15979035,
          fields: [
            {
              name: "📌 Titel",
              value: title,
              inline: false
            },
            {
              name: "🏷️ Kategorie",
              value: category || "Allgemein",
              inline: true
            },
            {
              name: "🕒 Datum",
              value: date || new Date().toLocaleString("de-DE"),
              inline: true
            },
            {
              name: "📝 Beitrag",
              value: text.length > 1000 ? text.slice(0, 1000) + "..." : text,
              inline: false
            }
          ],
          footer: {
            text: "BullProsperity Motivation & Disziplin"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!discordRes.ok) {
      return res.status(500).json({ error: "Discord Fehler." });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SEND MINDSET ERROR:", error);
    return res.status(500).json({ error: "Serverfehler." });
  }
}
