import crypto from "crypto";

export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const state = crypto.randomBytes(16).toString("hex");
    const verifier = crypto.randomBytes(32).toString("hex");

    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url");

    const authUrl = `https://api.whop.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;

    res.setHeader("Set-Cookie", [
      `whop_verifier=${verifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    ]);

    return res.redirect(authUrl);
  } catch (error) {
    return res.status(500).json({
      error: "Whop login failed",
      message: error.message
    });
  }
}
