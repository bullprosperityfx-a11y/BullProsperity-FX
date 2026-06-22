import { getVerifiedSession } from "./_session.js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = getVerifiedSession(req);
    if (!session.valid || !["admin", "premium"].includes(session.role)) {
      return res.status(403).json({ error: "Kein Premium Zugang." });
    }

    const {
      name,
      email,
      title,
      market,
      bias,
      setupType,
      description,
      date,
      image
    } = req.body;

    if (!title || !market || !bias || !setupType || !description) {
      return res.status(400).json({ error: "Bitte alle Pflichtfelder ausfüllen." });
    }

    const webhookUrl = process.env.DISCORD_SETUP_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "Discord Webhook fehlt in Vercel." });
    }

    const embed = {
      title: "📊 Neues Setup im BullProsperity Setup Austausch",
      color: 16766720,
      fields: [
        { name: "👤 Name", value: name || "Nicht angegeben", inline: true },
        { name: "📧 Email", value: email || "Nicht angegeben", inline: true },
        { name: "📌 Titel", value: title, inline: false },
        { name: "📈 Markt", value: market, inline: true },
        { name: "🧠 Bias", value: bias, inline: true },
        { name: "⚙️ Setup Typ", value: setupType, inline: true },
        { name: "📝 Beschreibung", value: description, inline: false },
        { name: "🕒 Datum", value: date || new Date().toLocaleString("de-DE"), inline: false }
      ],
      footer: {
        text: "BullProsperity FX"
      },
      timestamp: new Date().toISOString()
    };

    if (image && image.startsWith("data:image/")) {
      const match = image.match(/^data:(image\/\w+);base64,(.+)$/);

      if (!match) {
        return res.status(400).json({ error: "Ungültiges Bildformat." });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const extension = mimeType.split("/")[1] || "png";
      const fileName = `bullprosperity-setup.${extension}`;

      embed.image = {
        url: `attachment://${fileName}`
      };

      const formData = new FormData();

      formData.append("payload_json", JSON.stringify({
        embeds: [embed]
      }));

      formData.append(
        "file",
        new Blob([buffer], { type: mimeType }),
        fileName
      );

      const discordRes = await fetch(webhookUrl, {
        method: "POST",
        body: formData
      });

      if (!discordRes.ok) {
        return res.status(500).json({ error: "Discord Fehler beim Bild senden." });
      }

      return res.status(200).json({ success: true });
    }

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        embeds: [embed]
      })
    });

    if (!discordRes.ok) {
      return res.status(500).json({ error: "Discord Fehler." });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SEND SETUP ERROR:", error);
    return res.status(500).json({ error: "Serverfehler." });
  }
}
