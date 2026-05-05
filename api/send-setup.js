export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      title,
      market,
      bias,
      setupType,
      description,
      name,
      email
    } = req.body;

    if (!title || !market || !bias || !setupType || !description) {
      return res.status(400).json({ error: "Bitte alle Felder ausfüllen." });
    }

    const webhook = process.env.DISCORD_SETUP_WEBHOOK_URL;

    if (!webhook) {
      return res.status(500).json({ error: "Webhook fehlt." });
    }

    const message = {
      embeds: [
        {
          title: "📊 Neues Setup (BullProsperity)",
          color: 16766720,
          fields: [
            { name: "👤 User", value: name || "Unbekannt", inline: true },
            { name: "📧 Email", value: email || "Keine", inline: true },
            { name: "📌 Titel", value: title },
            { name: "📈 Markt", value: market, inline: true },
            { name: "🧠 Bias", value: bias, inline: true },
            { name: "⚙️ Setup", value: setupType, inline: true },
            { name: "📝 Beschreibung", value: description }
          ],
          footer: { text: "BullProsperity FX" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
