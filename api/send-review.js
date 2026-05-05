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
    const {
      name,
      market,
      result,
      title,
      text,
      date,
      tradingViewImage,
      metaTraderImage
    } = req.body;

    if (!name || !title || !text) {
      return res.status(400).json({ error: "Name, Titel und Review fehlen." });
    }

    const webhookUrl = process.env.DISCORD_RESULTS_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "Discord Results Webhook fehlt." });
    }

    async function sendJson(payload) {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DISCORD JSON ERROR:", errorText);
        throw new Error("Discord JSON Fehler");
      }
    }

    async function sendImage(dataUrl, titleText, fileName) {
      if (!dataUrl || !dataUrl.startsWith("data:image/")) return;

      const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);

      if (!match) return;

      const mimeType = match[1];
      const base64Data = match[2];
      const buffer = Buffer.from(base64Data, "base64");

      const formData = new FormData();

      formData.append("payload_json", JSON.stringify({
        embeds: [
          {
            title: titleText,
            color: 15979035,
            image: {
              url: `attachment://${fileName}`
            }
          }
        ]
      }));

      formData.append(
        "file",
        new Blob([buffer], { type: mimeType }),
        fileName
      );

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DISCORD IMAGE ERROR:", errorText);
        throw new Error("Discord Bild Fehler");
      }
    }

    await sendJson({
      embeds: [
        {
          title: "📈 Neues Trade Review",
          color: 15979035,
          fields: [
            { name: "👤 Name", value: name || "Nicht angegeben", inline: true },
            { name: "📊 Markt", value: market || "-", inline: true },
            { name: "🏁 Ergebnis", value: result || "-", inline: true },
            { name: "📌 Titel", value: title, inline: false },
            {
              name: "📝 Review / Erkenntnis",
              value: text.length > 1000 ? text.slice(0, 1000) + "..." : text,
              inline: false
            },
            { name: "🕒 Datum", value: date || new Date().toLocaleString("de-DE"), inline: false }
          ],
          footer: {
            text: "BullProsperity Trade Review"
          },
          timestamp: new Date().toISOString()
        }
      ]
    });

    await sendImage(
      tradingViewImage,
      "📊 TradingView Screenshot",
      "tradingview-screenshot.png"
    );

    await sendImage(
      metaTraderImage,
      "📱 MetaTrader Screenshot",
      "metatrader-screenshot.png"
    );

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("SEND REVIEW ERROR:", error);
    return res.status(500).json({ error: "Serverfehler." });
  }
}
