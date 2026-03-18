import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const state = crypto.randomBytes(16).toString("hex");
    const verifier = crypto.randomBytes(32).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");

    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      state,
      nonce, // 🔥 DAS IST DER FIX
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    const secure = process.env.NODE_ENV === "production";

    res.setHeader("Set-Cookie", [
      `whop_verifier=${verifier}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_state=${state}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`
    ]);

    return res.redirect(`https://api.whop.com/oauth/authorize?${params.toString()}`);
  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
      message: error.message
    });
  }
}
