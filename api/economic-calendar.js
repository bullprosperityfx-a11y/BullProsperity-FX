export default async function handler(req, res) {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        events: [],
        warning: "FINNHUB_API_KEY fehlt."
      });
    }

    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 14);

    const from = req.query.from || today.toISOString().split("T")[0];
    const to = req.query.to || future.toISOString().split("T")[0];

    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({
        events: [],
        error: "Finnhub API Fehler."
      });
    }

    const data = await response.json();

    const rawEvents = data.economicCalendar || data.events || [];

    const events = rawEvents.map((event) => ({
      date: event.date || "",
      time: event.time || "",
      country: event.country || "",
      event: event.event || "",
      impact: event.impact || event.importance || "",
      actual: event.actual || "",
      estimate: event.estimate || "",
      previous: event.prev || event.previous || ""
    }));

    return res.status(200).json({ events });

  } catch (error) {
    console.error("ECONOMIC CALENDAR ERROR:", error);
    return res.status(500).json({
      events: [],
      error: "Serverfehler."
    });
  }
}
