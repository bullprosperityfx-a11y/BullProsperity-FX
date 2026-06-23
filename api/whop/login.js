import crypto from "crypto";

export default function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send("ENV FEHLT");
    }

    const codeVerifier = crypto.randomBytes(32).toString("hex");

    const codeChallenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const state = crypto.randomBytes(16).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");
    const requestHost = String(req.headers.host || "").split(":")[0].toLowerCase();
    const sharedDomain = requestHost === "bullprosperity.online" || requestHost.endsWith(".bullprosperity.online")
      ? "; Domain=.bullprosperity.online"
      : "";

    res.setHeader("Set-Cookie", [
      `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=Lax${sharedDomain}`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax${sharedDomain}`
    ]);

    const url =
      "https://api.whop.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid profile email",
        state,
        nonce,
        code_challenge: codeChallenge,
        code_challenge_method: "S256"
      }).toString();

    return res.redirect(url);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("LOGIN CRASH: " + err.message);
  }
}
