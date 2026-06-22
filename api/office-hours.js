import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

const DISCORD_INVITE = "https://discord.gg/qJaeBkTn3n";

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

function validRole(role) {
  return ["admin", "premium", "longterm"].includes(role);
}

async function sendDiscordBooking(slot, booking) {
  const webhook = process.env.DISCORD_OFFICE_HOURS_WEBHOOK_URL;
  if (!webhook) return false;
  const safe = value => clean(value, 1000).replace(/@/g, "@\u200b");
  const response = await fetch(webhook, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      allowed_mentions:{ parse:[] },
      embeds:[{
        title:"Neue Mentor Office Hours Buchung",
        color:15979035,
        fields:[
          { name:"Termin", value:new Date(slot.starts_at).toLocaleString("de-DE", { timeZone:"Europe/Berlin", dateStyle:"medium", timeStyle:"short" }), inline:true },
          { name:"Thema", value:safe(slot.topic), inline:true },
          { name:"Mitglied", value:safe(booking.memberName), inline:true },
          { name:"Discord", value:safe(booking.discordUsername), inline:true },
          { name:"E-Mail", value:safe(booking.email), inline:false },
          { name:"Frage", value:safe(booking.question), inline:false }
        ],
        footer:{ text:"BullProsperity Mentor Office Hours" },
        timestamp:new Date().toISOString()
      }]
    })
  });
  return response.ok;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  const session = getVerifiedSession(req);
  if (!session.valid || !validRole(session.role)) return res.status(401).json({ error:"Kein Zugriff" });
  const { url, headers } = getSupabaseAdmin();
  if (!headers) return res.status(503).json({ error:"Office Hours sind noch nicht konfiguriert" });

  try {
    if (req.method === "GET") {
      const now = new Date().toISOString();
      const [slotsResponse, bookingsResponse] = await Promise.all([
        fetch(`${url}/rest/v1/office_hour_slots?select=id,starts_at,duration_minutes,capacity,topic,discord_channel,status,office_hour_bookings(count)&status=eq.active&starts_at=gte.${encodeURIComponent(now)}&office_hour_bookings.status=eq.confirmed&order=starts_at.asc&limit=40`, { headers }),
        fetch(`${url}/rest/v1/office_hour_bookings?select=id,slot_id,status,discord_username,question,created_at,office_hour_slots(id,starts_at,duration_minutes,topic,discord_channel,status)&email=eq.${encodeURIComponent(session.email)}&status=eq.confirmed&order=created_at.desc&limit=20`, { headers })
      ]);
      const slots = await slotsResponse.json();
      const bookings = await bookingsResponse.json();
      if (!slotsResponse.ok || !bookingsResponse.ok) return res.status(502).json({ error:"Office Hours konnten nicht geladen werden" });
      const normalized = (slots || []).map(slot => ({ ...slot, booked:Number(slot.office_hour_bookings?.[0]?.count || 0), office_hour_bookings:undefined }));
      return res.json({ ok:true, slots:normalized, bookings:bookings || [], discordInvite:process.env.DISCORD_INVITE_URL || DISCORD_INVITE });
    }

    if (req.method === "POST") {
      const slotId = clean(req.body?.slotId, 80);
      const memberName = clean(req.body?.memberName, 80);
      const discordUsername = clean(req.body?.discordUsername, 80);
      const question = clean(req.body?.question, 2000);
      if (!/^[0-9a-f-]{36}$/i.test(slotId) || memberName.length < 2 || discordUsername.length < 2 || question.length < 8) {
        return res.status(400).json({ error:"Bitte Termin, Name, Discord-Benutzername und eine konkrete Frage angeben" });
      }
      const rpcResponse = await fetch(`${url}/rest/v1/rpc/book_office_hour`, {
        method:"POST", headers, body:JSON.stringify({ p_slot_id:slotId, p_email:session.email, p_member_name:memberName, p_discord_username:discordUsername, p_question:question })
      });
      const rpcData = await rpcResponse.json().catch(() => null);
      if (!rpcResponse.ok) return res.status(409).json({ error:rpcData?.message || "Termin konnte nicht gebucht werden" });
      const slotResponse = await fetch(`${url}/rest/v1/office_hour_slots?id=eq.${encodeURIComponent(slotId)}&select=id,starts_at,topic,discord_channel&limit=1`, { headers });
      const slotRows = await slotResponse.json();
      const discordNotified = slotRows[0] ? await sendDiscordBooking(slotRows[0], { email:session.email, memberName, discordUsername, question }).catch(() => false) : false;
      return res.status(201).json({ ok:true, bookingId:rpcData, discordNotified, discordInvite:process.env.DISCORD_INVITE_URL || DISCORD_INVITE });
    }

    if (req.method === "PATCH") {
      const bookingId = clean(req.body?.bookingId, 80);
      if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return res.status(400).json({ error:"Ungültige Buchung" });
      const response = await fetch(`${url}/rest/v1/office_hour_bookings?id=eq.${encodeURIComponent(bookingId)}&email=eq.${encodeURIComponent(session.email)}&status=eq.confirmed`, {
        method:"PATCH", headers:{ ...headers, Prefer:"return=representation" }, body:JSON.stringify({ status:"cancelled", updated_at:new Date().toISOString() })
      });
      const rows = await response.json();
      if (!response.ok || !rows.length) return res.status(404).json({ error:"Buchung wurde nicht gefunden" });
      return res.json({ ok:true });
    }

    res.setHeader("Allow", "GET, POST, PATCH");
    return res.status(405).json({ error:"Methode nicht erlaubt" });
  } catch {
    return res.status(500).json({ error:"Office Hours sind momentan nicht erreichbar" });
  }
}
