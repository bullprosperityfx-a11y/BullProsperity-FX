import crypto from "crypto";

export default async function handler(req, res) {

  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  const codeVerifier = crypto.randomBytes(32).toString("hex");

  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  res.setHeader(
    "Set-Cookie",
    `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=Lax`
  );

  const authUrl =
    `https://api.whop.com/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256` +
    `&scope=openid%20profile%20email`;

  res.redirect(authUrl);
}
