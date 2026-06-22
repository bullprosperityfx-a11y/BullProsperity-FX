import { getVerifiedSession } from "./_session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = getVerifiedSession(req);
    if (!session.valid || session.role !== "admin") {
      return res.status(403).json({
        error: "Nur Admin darf BullProsperity AI nutzen."
      });
    }

    const { market, bias, entry, sl, tp, notes, imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: "Kein Chart Screenshot hochgeladen."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt in Vercel."
      });
    }

    const prompt = `
Du bist BullProsperity AI, ein interner Trading Review Assistent.

Wichtig:
- Keine Gewinnversprechen; Risiko und Eigenverantwortung klar nennen.
- Nur Education Analyse.
- Bewerte das Setup anhand von Smart Money Concepts.
- Analysiere Chart Screenshot + User Angaben.
- Gib klare, professionelle, kurze Analyse.

User Daten:
Markt: ${market || "-"}
Bias: ${bias || "-"}
Entry: ${entry || "-"}
Stop Loss: ${sl || "-"}
Take Profit: ${tp || "-"}
Notizen: ${notes || "-"}

Bewerte:
1. Marktstruktur
2. Liquidity
3. BOS / CHoCH
4. POI / FVG / Orderblock
5. Entry Qualität
6. Stop Loss Qualität
7. Risk Reward
8. Session Timing
9. Hauptfehler
10. Setup Score 0-100

Antworte auf Deutsch im BullProsperity Premium Stil.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: prompt
              },
              {
                type: "input_image",
                image_url: imageBase64
              }
            ]
          }
        ]
      })
    });

    const result = await openaiRes.json();

    if (!openaiRes.ok) {
      return res.status(500).json({
        error: result.error?.message || "OpenAI Fehler."
      });
    }

    const output =
      result.output_text ||
      result.output?.[0]?.content?.[0]?.text ||
      "Keine Analyse erhalten.";

    return res.status(200).json({
      success: true,
      analysis: output
    });

  } catch (err) {
    return res.status(500).json({
      error: "AI Server Fehler."
    });
  }
}
