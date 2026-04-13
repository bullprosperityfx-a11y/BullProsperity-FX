import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // 🔐 PKCE
    const verifier = crypto.randomBytes(32).toString("hex");
    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const state = crypto.randomBytes(16).toString("hex");

    // 🍪 Cookies setzen
    res.setHeader("Set-Cookie", [
      `whop_verifier=${verifier}; Path=/; HttpOnly; Secure; SameSite=None`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=None`
    ]);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid email",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    return res.redirect(`https://api.whop.com/oauth/authorize?${params.toString()}`);

  } catch (err) {
    return res.status(500).json({ error: "Login failed" });
  }
}
