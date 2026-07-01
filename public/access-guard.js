(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const originalAccessUrl = "/api/access";
  const accessCacheKey = "bp_verified_access";
  const accessCacheMaxAge = 30 * 60 * 1000;
  const memberRoles = new Set(["admin", "premium", "longterm"]);

  function readCachedAccess() {
    try {
      const cached = JSON.parse(sessionStorage.getItem(accessCacheKey) || "null");
      if (!cached || !memberRoles.has(cached.role) || !cached.email) return null;
      if (Date.now() - Number(cached.cachedAt || 0) > accessCacheMaxAge) return null;
      return { ...cached, cached:true };
    } catch {
      return null;
    }
  }

  function storeAccess(data) {
    try {
      if (memberRoles.has(data?.role) && data.email) {
        sessionStorage.setItem(accessCacheKey, JSON.stringify({ ...data, cachedAt:Date.now() }));
      } else {
        sessionStorage.removeItem(accessCacheKey);
      }
    } catch {
      // Session Storage darf die Zugriffskontrolle nicht blockieren.
    }
  }

  function isAccessRequest(input) {
    try {
      const value = typeof input === "string" ? input : input?.url;
      return new URL(value, window.location.origin).pathname === originalAccessUrl;
    } catch {
      return false;
    }
  }

  async function requestAccess(attempt = 0) {
    try {
      const response = await nativeFetch(originalAccessUrl, {
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error(`Access request failed: ${response.status}`);

      const data = await response.json();
      if (!data || typeof data.role !== "string") throw new Error("Invalid access response");

      storeAccess(data);
      document.documentElement.dataset.bpAccessSource = "live";
      return data;
    } catch (error) {
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 300 * (2 ** attempt)));
        return requestAccess(attempt + 1);
      }
      const cached = readCachedAccess();
      if (cached) {
        document.documentElement.dataset.bpAccessSource = "session-cache";
        return cached;
      }

      // Eine geschützte HTML-Seite wurde bereits von der Middleware freigegeben.
      // Ein kurzer API-Ausfall darf deshalb keinen erneuten Login auslösen.
      if (document.documentElement.classList.contains("bp-auth-checking")) {
        const normalizedPath = window.location.pathname.replace(/^\/+|\/+$/g, "").replace(/\.html$/i, "");
        const adminOnly = normalizedPath.startsWith("admin/") || ["admin-signals", "ai-review", "dashboard"].includes(normalizedPath);
        document.documentElement.dataset.bpAccessSource = "server-session";
        return { ok:true, role:adminOnly ? "admin" : "premium", serverAuthorized:true };
      }
      throw error;
    }
  }

  window.bpAccessPromise = requestAccess();
  window.bpGetAccess = () => window.bpAccessPromise;
  window.bpRefreshAccess = () => {
    window.bpAccessPromise = requestAccess();
    return window.bpAccessPromise;
  };

  window.fetch = async function patchedFetch(input, options) {
    if (!isAccessRequest(input)) return nativeFetch(input, options);

    try {
      const data = await window.bpAccessPromise;
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    } catch {
      return new Response(JSON.stringify({ ok:false, role:"guest" }), {
        status: 503,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }
  };
})();
