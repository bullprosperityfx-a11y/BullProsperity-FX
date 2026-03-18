import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).json({
        error: "Missing required Whop environment variables"
      });
    }

    const state = crypto.randomBytes(16).toString("hex");
    const verifier = crypto.randomBytes(32).toString("hex");

    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "profile email",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    const secure = process.env.NODE_ENV === "production";

    res.setHeader("Set-Cookie", [
      `whop_verifier=${encodeURIComponent(verifier)}; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=600`,
      `whop_state=${encodeURIComponent(state)}; Path=/; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Lax; Max-Age=600`
    ]);

    return res.redirect(`https://api.whop.com/oauth/authorize?${params.toString()}`);
  } catch (error) {
    return res.status(500).json({
      error: "Whop login failed",
      message: error.message
    });
  }
}
