import { NextResponse } from "next/server";

const premiumRoutes = new Set([
  "hub", "course", "tools", "setup-room", "community", "journal",
  "performance-lab", "office-hours", "checklist", "replay", "setup",
  "setup-austausch", "trade-review", "tradingview", "lot-size",
  "live-setups", "motivation-disziplin", "market-structure", "liquidity",
  "entry-models", "buy-side", "broker", "ai-review", "admin-signals", "hub-preview", "status"
]);

function cookiesFrom(request) {
  const values = {};
  for (const part of (request.headers.get("cookie") || "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    try { values[key] = decodeURIComponent(value); }
    catch { values[key] = value; }
  }
  return values;
}

function normalizePath(pathname) {
  return pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
}

function isProtected(path) {
  if (/^admin(?:\/|$)/.test(path)) return true;
  if (/^lesson(?:\/|$)/.test(path)) return true;
  if (/^lesson\d+$/.test(path)) return true;
  return premiumRoutes.has(path) || path === "longterm" || path === "dashboard";
}

function allowedRole(path, role) {
  if (/^admin(?:\/|$)/.test(path) || ["admin-signals", "ai-review", "dashboard"].includes(path)) return role === "admin";
  if (path === "longterm") return ["admin", "premium", "longterm"].includes(role);
  return ["admin", "premium"].includes(role);
}

async function validSignature(cookies) {
  const secrets = [...new Set([
    process.env.SESSION_SECRET,
    process.env.WHOP_CLIENT_SECRET
  ].filter(Boolean))];
  const email = String(cookies.bp_email || "").trim().toLowerCase();
  const role = String(cookies.bp_role || "");
  const memberId = String(cookies.bp_member_id || "");
  const signature = String(cookies.bp_session || "");
  if (!secrets.length || !email || !signature) return false;

  for (const secret of secrets) {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name:"HMAC", hash:"SHA-256" },
      false,
      ["sign"]
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${email}|${role}|${memberId}`));
    const expected = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
    if (expected.length !== signature.length) continue;
    let mismatch = 0;
    for (let index = 0; index < expected.length; index += 1) mismatch |= expected.charCodeAt(index) ^ signature.charCodeAt(index);
    if (mismatch === 0) return true;
  }

  return false;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = normalizePath(url.pathname);
  if (!isProtected(path)) return NextResponse.next();

  const cookies = cookiesFrom(request);
  if (await validSignature(cookies) && allowedRole(path, cookies.bp_role)) return NextResponse.next();

  const lockedUrl = new URL("/locked", request.url);
  lockedUrl.searchParams.set("from", `/${path}`);
  return Response.redirect(lockedUrl, 307);
}

export const config = {
  matcher:["/((?!api|favicon.png|icon-192.png|icon-512.png|og-image.png|.*\\.(?:css|js|png|jpg|jpeg|webp|svg|json|xml|txt)$).*)"]
};
