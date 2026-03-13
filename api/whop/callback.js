export default async function handler(req, res) {

  const { code } = req.query;

  const clientId = process.env.WHOP_CLIENT_ID;
  const clientSecret = process.env.WHOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  const cookie = req.headers.cookie || "";
  const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
  const codeVerifier = verifierMatch ? verifierMatch[1] : null;

  if (!code || !codeVerifier) {
    return res.status(400).send("Missing code or code_verifier");
  }

  const tokenRes = await fetch("https://api.whop.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return res.status(500).send(`Token error: ${JSON.stringify(tokenData)}`);
  }

  const accessToken = tokenData.access_token;

  res.setHeader(
    "Set-Cookie",
    `whop_access_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
  );

  res.redirect("/hub.html");

}
