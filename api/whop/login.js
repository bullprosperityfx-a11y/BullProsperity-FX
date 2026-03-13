const crypto = require("crypto");

function base64url(buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

module.exports = async function handler(req, res) {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );
  const state = base64url(crypto.randomBytes(16));
  const nonce = base64url(crypto.randomBytes(16));

  res.setHeader("Set-Cookie", [
    `whop_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    `whop_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    `whop_nonce=${nonce}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  ]);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256"
  });

  return res.redirect(`https://api.whop.com/oauth/authorize?${params.toString()}`);
};
