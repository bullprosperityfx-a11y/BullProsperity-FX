export const config = {
  api: {
    bodyParser: {
      sizeLimit: "8mb"
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const webhookUrl = process.env.DISCORD_SIGNALS_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "DISCORD_SIGNALS_WEBHOOK_URL fehlt." });
    }

    const {
      pair,
      type,
      signalText,
      analysisLink,
      comment,
      risk,
      imageBase64
    } = req.body;

    if (!pair || !type || !signalText) {
      return res.status(400).json({ error: "Signal Daten fehlen." });
    }

    const embed = {
      title: `📡 BullProsperity Signal | ${pair} ${type}`,
      description: "```" + signalText.slice(0, 3900) + "```",
      color: 15979035,
      fields: [
        {
          name: "⚠️ Risk",
          value: risk || "Nicht angegeben",
          inline: true
        },
        {
          name: "📌 Status",
          value: "Education Signal",
          inline: true
        }
      ],
      footer: {
        text: "BullProsperity FX • Education Platform"
      },
      timestamp: new Date().toISOString()
    };

    if (analysisLink) {
      embed.fields.push({
        name: "🔗 Analyse / Bild Link",
        value: analysisLink,
        inline: false
      });
    }

    if (comment) {
      embed.fields.push({
        name: "📝 Admin Kommentar",
        value: comment.slice(0, 900),
        inline: false
      });
    }

    if (imageBase64 && imageBase64.startsWith("data:image/")) {
      const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);

      if (!match) {
        return res.status(400).json({ error: "Bildformat ungültig." });
      }

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const extension =
        mimeType.includes("png") ? "png" :
        mimeType.includes("webp") ? "webp" :
        "jpg";

      const fileName = `bullprosperity-signal.${extension}`;

      embed.image = {
        url: `attachment://${fileName}`
      };

      const formData = new FormData();

      formData.append("payload_json", JSON.stringify({
        username: "BullProsperity Signals",
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
        const errorText = await discordRes.text();
        console.error("DISCORD SIGNAL IMAGE ERROR:", errorText);
        return res.status(500).json({ error: "Discord Fehler beim Bild-Signal." });
      }

      return res.status(200).json({ success: true });
    }

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: "BullProsperity Signals",
        embeds: [embed]
      })
    });

    if (!discordRes.ok) {
      const errorText = await discordRes.text();
      console.error("DISCORD SIGNAL ERROR:", errorText);
      return res.status(500).json({ error: "Discord Fehler." });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SEND SIGNAL ERROR:", error);
    return res.status(500).json({ error: "Serverfehler." });
  }
}
