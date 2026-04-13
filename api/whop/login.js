import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const state = crypto.randomBytes(16).toString("hex");
    const verifier = crypto.randomBytes(32).toString("base64url");

    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    res.setHeader("Set-Cookie", [
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      `whop_verifier=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax`
    ]);

    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid profile email",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });

    return res.redirect(`https://whop.com/oauth/authorize?${params.toString()}`);
  } catch (err) {
    console.error("WHOP LOGIN ERROR:", err);
    return res.redirect("/?error=login_failed");
  }
}
