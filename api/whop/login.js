import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // 🔥 RANDOM STRING (Node sicher)
    const codeVerifier = crypto.randomBytes(32).toString("hex");

    // 🔥 SHA256 → BASE64URL
    const hash = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const state = crypto.randomBytes(16).toString("hex");

    // 🍪 COOKIE (WICHTIG!)
    res.setHeader("Set-Cookie", [
      `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=None`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=None`
    ]);

    const url =
      "https://api.whop.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email",
        state: state,
        code_challenge: hash,
        code_challenge_method: "S256"
      }).toString();

    return res.redirect(url);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
}
