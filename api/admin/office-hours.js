import { getVerifiedSession, getSupabaseAdmin } from "../_session.js";

function clean(value, max = 500) { return String(value || "").trim().slice(0, max); }

async function notifyDiscord(title, slot) {
  const webhook = process.env.DISCORD_OFFICE_HOURS_WEBHOOK_URL;
  if (!webhook || !slot) return false;
  const response = await fetch(webhook, {
    method:"POST", headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ allowed_mentions:{ parse:[] }, embeds:[{ title, color:15979035, fields:[{ name:"Thema", value:clean(slot.topic,120) },{ name:"Termin", value:new Date(slot.starts_at).toLocaleString("de-DE",{timeZone:"Europe/Berlin",dateStyle:"medium",timeStyle:"short"}), inline:true },{ name:"Kanal", value:clean(slot.discord_channel,80), inline:true }], timestamp:new Date().toISOString() }] })
  });
  return response.ok;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const session = getVerifiedSession(req);
  if (!session.valid || session.role !== "admin") return res.status(403).json({ error:"Nur Admin" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"Office Hours sind noch nicht konfiguriert" });

  try {
    if (req.method === "GET") {
      const [slotsResponse, bookingsResponse] = await Promise.all([
        fetch(`${url}/rest/v1/office_hour_slots?select=*&order=starts_at.desc&limit=100`, { headers }),
        fetch(`${url}/rest/v1/office_hour_bookings?select=*,office_hour_slots(topic,starts_at,discord_channel)&order=created_at.desc&limit=300`, { headers })
      ]);
      const slots = await slotsResponse.json(); const bookings = await bookingsResponse.json();
      if (!slotsResponse.ok || !bookingsResponse.ok) return res.status(502).json({ error:"Office-Hours-Daten nicht erreichbar" });
      return res.json({ ok:true, slots:slots || [], bookings:bookings || [] });
    }

    if (req.method === "POST") {
      const startsAt = new Date(req.body?.startsAt);
      const durationMinutes = Number(req.body?.durationMinutes);
      const capacity = Number(req.body?.capacity);
      const topic = clean(req.body?.topic, 120);
      const discordChannel = clean(req.body?.discordChannel, 80) || "#office-hours";
      if (!Number.isFinite(startsAt.getTime()) || startsAt <= new Date() || durationMinutes < 15 || durationMinutes > 180 || capacity < 1 || capacity > 100 || topic.length < 3) {
        return res.status(400).json({ error:"Bitte einen zukünftigen Termin mit gültiger Dauer, Kapazität und Thema angeben" });
      }
      const response = await fetch(`${url}/rest/v1/office_hour_slots`, {
        method:"POST", headers:{ ...headers, Prefer:"return=representation" }, body:JSON.stringify({ starts_at:startsAt.toISOString(), duration_minutes:durationMinutes, capacity, topic, discord_channel:discordChannel, created_by:session.email })
      });
      const rows = await response.json();
      if (!response.ok) return res.status(502).json({ error:"Termin konnte nicht erstellt werden" });
      const discordNotified = await notifyDiscord("Neue Mentor Office Hours", rows[0]).catch(() => false);
      return res.status(201).json({ ok:true, slot:rows[0], discordNotified });
    }

    if (req.method === "PATCH") {
      const type = clean(req.body?.type, 30);
      if (type === "booking") {
        const bookingId = clean(req.body?.bookingId, 80); const status = clean(req.body?.status, 20);
        if (!/^[0-9a-f-]{36}$/i.test(bookingId) || !["confirmed","attended","no_show","cancelled"].includes(status)) return res.status(400).json({ error:"Ungültige Buchungsänderung" });
        const response = await fetch(`${url}/rest/v1/office_hour_bookings?id=eq.${encodeURIComponent(bookingId)}`, { method:"PATCH", headers:{ ...headers, Prefer:"return=minimal" }, body:JSON.stringify({ status, updated_at:new Date().toISOString() }) });
        if (!response.ok) return res.status(502).json({ error:"Buchung konnte nicht aktualisiert werden" });
        return res.json({ ok:true });
      }
      const slotId = clean(req.body?.slotId, 80); const status = clean(req.body?.status, 20);
      if (!/^[0-9a-f-]{36}$/i.test(slotId) || !["active","cancelled","completed"].includes(status)) return res.status(400).json({ error:"Ungültige Terminänderung" });
      const response = await fetch(`${url}/rest/v1/office_hour_slots?id=eq.${encodeURIComponent(slotId)}`, { method:"PATCH", headers:{ ...headers, Prefer:"return=representation" }, body:JSON.stringify({ status, updated_at:new Date().toISOString() }) });
      const rows = await response.json();
      if (!response.ok) return res.status(502).json({ error:"Termin konnte nicht aktualisiert werden" });
      const discordNotified = status === "cancelled" ? await notifyDiscord("Mentor Office Hours abgesagt", rows[0]).catch(() => false) : false;
      return res.json({ ok:true, discordNotified });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error:"Methode nicht erlaubt" });
  } catch {
    return res.status(500).json({ error:"Office-Hours-Daten nicht erreichbar" });
  }
}
