import crypto from "crypto";
import { getVerifiedSession, getSupabaseAdmin } from "./_session.js";

const ALLOWED_ROLES = new Set(["admin", "premium"]);
const MAX_RAW_PAYLOAD_BYTES = 50000;

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

function getHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : String(value || "");
}

function integrationToken(req) {
  const explicit = getHeader(req, "x-bullprosperity-token");
  const authorization = getHeader(req, "authorization");
  return explicit || authorization.replace(/^Bearer\s+/i, "").trim();
}

function parseBody(body) {
  if (body && typeof body === "object" && !Array.isArray(body)) return body;
  if (typeof body === "string") {
    try { return JSON.parse(body); }
    catch { return null; }
  }
  return null;
}

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function optionalNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeDirection(value) {
  const direction = cleanText(value, 12).toLowerCase();
  if (["buy", "long"].includes(direction)) return "long";
  if (["sell", "short"].includes(direction)) return "short";
  return "";
}

function validDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function validateTrade(body, sessionEmail) {
  const sourceTradeId = cleanText(body.sourceTradeId ?? body.source_trade_id ?? body.ticket, 180);
  const memberEmail = cleanText(sessionEmail || body.memberEmail || body.member_email, 254).toLowerCase();
  const symbol = cleanText(body.symbol ?? body.market, 40).toUpperCase();
  const direction = normalizeDirection(body.direction ?? body.type);
  const profit = optionalNumber(body.profit ?? body.profitLoss ?? body.pnl);

  if (!sourceTradeId) return { error:"sourceTradeId oder ticket fehlt." };
  if (!memberEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberEmail)) return { error:"Gültige memberEmail fehlt." };
  if (!symbol || !/^[A-Z0-9._-]{1,40}$/.test(symbol)) return { error:"Ungültiges Symbol." };
  if (!direction) return { error:"direction muss buy, sell, long oder short sein." };
  if (profit === null) return { error:"profit muss eine Zahl sein." };

  const rawPayload = JSON.stringify(body);
  if (Buffer.byteLength(rawPayload, "utf8") > MAX_RAW_PAYLOAD_BYTES) return { error:"Payload ist zu groß." };

  return {
    trade: {
      sourceTradeId,
      memberEmail,
      accountId:cleanText(body.accountId ?? body.account_id ?? body.login, 100),
      symbol,
      direction,
      volume:optionalNumber(body.volume ?? body.lots),
      entryPrice:optionalNumber(body.entryPrice ?? body.entry_price ?? body.openPrice),
      exitPrice:optionalNumber(body.exitPrice ?? body.exit_price ?? body.closePrice),
      stopLoss:optionalNumber(body.stopLoss ?? body.stop_loss ?? body.sl),
      takeProfit:optionalNumber(body.takeProfit ?? body.take_profit ?? body.tp),
      profit,
      currency:cleanText(body.currency || "USD", 8).toUpperCase(),
      openedAt:validDate(body.openedAt ?? body.opened_at ?? body.openTime),
      closedAt:validDate(body.closedAt ?? body.closed_at ?? body.closeTime) || new Date().toISOString(),
      rawPayload:body
    }
  };
}

async function notifyDiscord(trade) {
  const webhookUrl = process.env.DISCORD_RESULTS_WEBHOOK_URL || process.env.DISCORD_SETUP_WEBHOOK_URL;
  if (!webhookUrl) return { sent:false, reason:"not_configured" };

  const resultLabel = trade.profit > 0 ? "Positiv" : trade.profit < 0 ? "Negativ" : "Break-even";
  const response = await fetch(webhookUrl, {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      username:"BullProsperity Trade Results",
      allowed_mentions:{ parse:[] },
      embeds:[{
        title:"Neues Trade-Ergebnis dokumentiert",
        color:trade.profit >= 0 ? 15979035 : 16737894,
        fields:[
          { name:"Markt", value:trade.symbol, inline:true },
          { name:"Richtung", value:trade.direction === "long" ? "Long" : "Short", inline:true },
          { name:"Ergebnis", value:`${trade.profit} ${trade.currency} · ${resultLabel}`, inline:true },
          { name:"Mitglied", value:trade.memberEmail, inline:false },
          { name:"Referenz", value:trade.sourceTradeId, inline:false }
        ],
        footer:{ text:"BullProsperity Prozessdokumentation" },
        timestamp:new Date().toISOString()
      }]
    })
  });

  return { sent:response.ok, reason:response.ok ? null : `discord_${response.status}` };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, private");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok:false, error:"Method Not Allowed" });
  }

  const session = getVerifiedSession(req);
  const memberSession = session.valid && ALLOWED_ROLES.has(session.role);
  const configuredSecret = process.env.TRADE_RESULT_SECRET || "";
  const trustedIntegration = safeEqual(integrationToken(req), configuredSecret);

  if (!memberSession && !trustedIntegration) {
    return res.status(401).json({ ok:false, error:"Nicht autorisiert" });
  }

  const body = parseBody(req.body);
  if (!body) return res.status(400).json({ ok:false, error:"Ungültiger JSON-Body" });

  const validation = validateTrade(body, memberSession ? session.email : "");
  if (validation.error) return res.status(400).json({ ok:false, error:validation.error });

  const { url, headers } = getSupabaseAdmin();
  if (!url || !headers) return res.status(503).json({ ok:false, error:"Supabase Service Role ist nicht konfiguriert" });

  const trade = validation.trade;
  try {
    const supabaseResponse = await fetch(`${url}/rest/v1/rpc/ingest_trade_result`, {
      method:"POST",
      headers:{ ...headers, Prefer:"return=representation" },
      body:JSON.stringify({
        p_source_trade_id:trade.sourceTradeId,
        p_member_email:trade.memberEmail,
        p_account_id:trade.accountId || null,
        p_symbol:trade.symbol,
        p_direction:trade.direction,
        p_volume:trade.volume,
        p_entry_price:trade.entryPrice,
        p_exit_price:trade.exitPrice,
        p_stop_loss:trade.stopLoss,
        p_take_profit:trade.takeProfit,
        p_profit:trade.profit,
        p_currency:trade.currency,
        p_opened_at:trade.openedAt,
        p_closed_at:trade.closedAt,
        p_raw_payload:trade.rawPayload
      })
    });
    const result = await supabaseResponse.json().catch(() => null);
    if (!supabaseResponse.ok) {
      console.error("TRADE RESULT SUPABASE ERROR:", result);
      return res.status(502).json({ ok:false, error:"Trade konnte nicht gespeichert werden. SQL-Migration prüfen." });
    }

    let discord = { sent:false, reason:"duplicate" };
    if (result?.inserted !== false) {
      try { discord = await notifyDiscord(trade); }
      catch (error) {
        console.error("TRADE RESULT DISCORD ERROR:", error);
        discord = { sent:false, reason:"request_failed" };
      }
    }

    return res.status(result?.inserted === false ? 200 : 201).json({
      ok:true,
      inserted:result?.inserted !== false,
      sourceTradeId:trade.sourceTradeId,
      notificationCreated:result?.notification_created === true,
      discordNotified:discord.sent
    });
  } catch (error) {
    console.error("TRADE RESULT ERROR:", error);
    return res.status(500).json({ ok:false, error:"Trade-Integration ist momentan nicht erreichbar" });
  }
}
