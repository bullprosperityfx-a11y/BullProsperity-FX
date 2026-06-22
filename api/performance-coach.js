import { getVerifiedSession } from "./_session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error:"Methode nicht erlaubt" });
  const session = getVerifiedSession(req);
  if (!session.valid || !["admin", "premium", "longterm"].includes(session.role)) return res.status(401).json({ error:"Kein Zugriff" });

  const { mode, rulebook, scores, dna, recentReviews, recentPlans, recentTrades } = req.body || {};
  const weeklyMode = mode === "weekly";
  if (!weeklyMode && !String(rulebook || "").trim()) return res.status(400).json({ error:"Rulebook fehlt" });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error:"Coach ist noch nicht konfiguriert" });

  const context = `Du bist BullProsperity Process Coach. Du analysierst ausschließlich Lern-, Dokumentations- und Verhaltensprozesse. Keine Marktprognosen, Signale, Anlageberatung oder Gewinnversprechen. Formuliere auf Deutsch, direkt und konstruktiv.

Persönliches Rulebook:
${String(rulebook).slice(0, 6000)}

Process Scores: ${JSON.stringify(scores || {})}
Trading-DNA: ${JSON.stringify({ topMarket:dna?.topMarket, riskSession:dna?.riskSession, emotion:dna?.emotion, quality:dna?.quality, tags:dna?.tags })}
Letzte Reviews: ${JSON.stringify((recentReviews || []).slice(0, 8))}
Letzte Pläne: ${JSON.stringify((recentPlans || []).slice(0, 8))}`;

  const prompt = weeklyMode ? `${context}
Letzte Journal-Einträge: ${JSON.stringify((recentTrades || []).slice(0, 12))}

Erstelle einen kompakten Wochenbericht mit genau fünf Abschnitten:
1. Prozessstärke der Woche
2. Häufigstes dokumentiertes Muster
3. Wichtigste Datenlücke
4. Konkrete Sieben-Tage-Routine
5. Eine präzise Frage für Mentor oder Office Hours

Beziehe dich nur auf vorhandene Daten. Wenn Daten fehlen, benenne das offen.` : `${context}

Antworte mit genau vier Abschnitten:
1. Stärkster Prozess
2. Größtes Verhaltensrisiko
3. Eine konkrete Übung für die nächsten sieben Tage
4. Eine klare No-Trade-/Pause-Frage aus dem eigenen Rulebook`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method:"POST",
      headers:{ Authorization:`Bearer ${apiKey}`, "Content-Type":"application/json" },
      body:JSON.stringify({ model:"gpt-4.1-mini", input:prompt, max_output_tokens:700 })
    });
    const data = await response.json();
    if (!response.ok) return res.status(502).json({ error:data.error?.message || "Coach nicht erreichbar" });
    return res.json({ ok:true, coaching:data.output_text || data.output?.[0]?.content?.[0]?.text || "Keine Auswertung erhalten." });
  } catch {
    return res.status(500).json({ error:"Coach nicht erreichbar" });
  }
}
