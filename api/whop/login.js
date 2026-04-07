import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // 🔥 PKCE erzeugen
    const codeVerifier = crypto.randomBytes(32).toString("base64url");

    const challenge = crypto
      .createHash("sha256")
      .update(codeVerifier)
      .digest("base64url");

    const state = crypto.randomBytes(16).toString("hex");

    // 🔥 Cookies setzen (WICHTIG)
    res.setHeader("Set-Cookie", [
      `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=None`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=None`
    ]);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user.profile.read",
      state: state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    return res.redirect(`https://whop.com/oauth/authorize?${params.toString()}`);

  } catch (err) {
    return res.status(500).json({ error: "login_failed" });
  }
}
