import { NextResponse } from "next/server";

const premiumRoutes = new Set([
  "hub",
  "course",
  "tools",
  "setup-room",
  "community",
  "journal",
  "performance-lab",
  "office-hours",
  "checklist",
  "replay",
  "setup",
  "setup-austausch",
  "trade-review",
  "tradingview",
  "lot-size",
  "live-setups",
  "motivation-disziplin",
  "market-structure",
  "liquidity",
  "entry-models",
  "buy-side",
  "broker",
  "hub-preview",
  "status"
]);

const adminRoutes = new Set([
  "admin-signals",
  "ai-review",
  "dashboard"
]);

function normalizePath(pathname) {
  return pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
}

function isProtected(path) {
  if (!path || path === "locked") return false;
  if (path.startsWith("admin")) return true;
  if (path.startsWith("lesson")) return true;
  return premiumRoutes.has(path) || adminRoutes.has(path) || path === "longterm";
}

function allowedRole(path, role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (path.startsWith("admin") || adminRoutes.has(path)) {
    return normalizedRole === "admin";
  }

  if (path === "longterm") {
    return ["admin", "premium", "longterm"].includes(normalizedRole);
  }

  return ["admin", "premium"].includes(normalizedRole);
}

function hasSessionCookies(request) {
  return Boolean(
    request.cookies.get("bp_email")?.value &&
    request.cookies.get("bp_role")?.value &&
    request.cookies.get("bp_session")?.value
  );
}

export function middleware(request) {
  try {
    const path = normalizePath(request.nextUrl.pathname);

    if (!isProtected(path)) {
      return NextResponse.next();
    }

    const role = request.cookies.get("bp_role")?.value || "";

    if (hasSessionCookies(request) && allowedRole(path, role)) {
      return NextResponse.next();
    }

    const lockedUrl = new URL("/locked", request.url);
    lockedUrl.searchParams.set("from", `/${path}`);
    return NextResponse.redirect(lockedUrl);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|favicon.png|icon-192.png|icon-512.png|og-image.png|.*\\.(?:css|js|png|jpg|jpeg|webp|svg|json|xml|txt|ico)$).*)"
  ]
};
