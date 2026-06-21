(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const originalAccessUrl = "/api/access";

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

      return data;
    } catch (error) {
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
        return requestAccess(attempt + 1);
      }
      throw error;
    }
  }

  window.bpAccessPromise = requestAccess();
  window.bpGetAccess = () => window.bpAccessPromise;

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
