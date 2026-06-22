import { getVerifiedSession } from "./_session.js";

function extractText(data) {
  return data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text || "";
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin","premium","longterm"].includes(session.role)) return res.status(401).json({ error:"Kein Zugriff" });
  const image = String(req.body?.image || "");
  if (!/^data:image\/(png|jpeg|webp);base64,/i.test(image)) return res.status(400).json({ error:"Ungültiges Bildformat" });
  if (image.length > 5_600_000) return res.status(413).json({ error:"Bild ist zu groß" });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error:"Screenshot AI ist noch nicht konfiguriert" });

  const instruction = `Analysiere ausschließlich sichtbar lesbare Informationen in diesem Trading-Chart. Keine Prognose, kein Signal und keine Anlageberatung. Antworte ausschließlich als valides JSON mit diesen String-Feldern: market, direction, session, entry, stopLoss, takeProfit, rr, setupType, context. Wenn etwas nicht eindeutig sichtbar ist, verwende einen leeren String.`;
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{ Authorization:`Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type":"application/json" },
      body:JSON.stringify({
        model:"gpt-4.1-mini",
        input:[{ role:"user", content:[{ type:"input_text", text:instruction },{ type:"input_image", image_url:image }] }],
        max_output_tokens:500
      })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error:data.error?.message || "Screenshot AI nicht erreichbar" });
    const raw = extractText(data).replace(/^```json\s*|\s*```$/g, "").trim();
    const trade = JSON.parse(raw);
    const clean = Object.fromEntries(["market","direction","session","entry","stopLoss","takeProfit","rr","setupType","context"].map(key => [key,String(trade?.[key] || "").slice(0,1200)]));
    return res.json({ ok:true, trade:clean });
  } catch {
    return res.status(500).json({ error:"Screenshot konnte nicht ausgewertet werden" });
  }
}
