import { NextResponse } from "next/server";

const premiumRoutes = new Set([
  "hub", "course", "tools", "setup-room", "community", "journal",
  "performance-lab", "office-hours", "checklist", "replay", "setup",
  "setup-austausch", "trade-review", "tradingview", "lot-size",
  "live-setups", "motivation-disziplin", "market-structure", "liquidity",
  "entry-models", "buy-side", "broker", "hub-preview", "status"
]);

const adminRoutes = new Set([
  "admin-signals",
  "ai-review",
  "dashboard"
]);

function normalizePath(pathname) {
  return pathname
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.html$/i, "");
}

function isProtected(path) {
  if (!path) return false;
  if (path === "locked") return false;
  if (path.startsWith("admin")) return true;
  if (path.startsWith("lesson")) return true;

  return (
    premiumRoutes.has(path) ||
    adminRoutes.has(path) ||
    path === "longterm"
  );
}

function allowedRole(path, role) {
  role = String(role || "").toLowerCase();

  if (path.startsWith("admin") || adminRoutes.has(path)) {
    return role === "admin";
  }

  if (path === "longterm") {
    return ["admin", "premium", "longterm"].includes(role);
  }

  return ["admin", "premium"].includes(role);
}

async function createSignature(secret, payload) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeCompare(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

async function validSignature(request) {
  try {
    const email = String(request.cookies.get("bp_email")?.value || "")
      .trim()
      .toLowerCase();

    const role = String(request.cookies.get("bp_role")?.value || "").trim();
    const memberId = String(request.cookies.get("bp_member_id")?.value || "").trim();
    const signature = String(request.cookies.get("bp_session")?.value || "").trim();

    const secrets = [
      process.env.SESSION_SECRET,
      process.env.WHOP_CLIENT_SECRET
    ].filter(Boolean);

    if (!email || !role || !signature || secrets.length === 0) {
      return false;
    }

    const payload = `${email}|${role}|${memberId}`;

    for (const secret of secrets) {
      const expected = await createSignature(secret, payload);
      if (safeCompare(expected, signature)) return true;
    }

    return false;
  } catch (error) {
    console.error("Middleware signature error:", error);
    return false;
  }
}

export default async function middleware(request) {
  try {
    const url = request.nextUrl.clone();
    const path = normalizePath(url.pathname);

    if (!isProtected(path)) {
      return NextResponse.next();
    }

    const role = request.cookies.get("bp_role")?.value || "";

    const sessionIsValid = await validSignature(request);

    if (sessionIsValid && allowedRole(path, role)) {
      return NextResponse.next();
    }

    const lockedUrl = new URL("/locked", request.url);
    lockedUrl.searchParams.set("from", `/${path}`);

    return NextResponse.redirect(lockedUrl);
  } catch (error) {
    console.error("Middleware failed:", error);

    const fallbackUrl = new URL("/locked", request.url);
    fallbackUrl.searchParams.set("error", "middleware");

    return NextResponse.redirect(fallbackUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|favicon.png|icon-192.png|icon-512.png|og-image.png|.*\\.(?:css|js|png|jpg|jpeg|webp|svg|json|xml|txt|ico)$).*)"
  ]
};
