export default async function handler(req, res) {
  const { code } = req.query;

  const clientId = process.env.WHOP_CLIENT_ID;
  const clientSecret = process.env.WHOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  if (!code) {
    return res.status(400).send("Missing code");
  }

  try {
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
        redirect_uri: redirectUri
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

    return res.redirect("/hub.html");
  } catch (error) {
    return res.status(500).send(`Callback error: ${error.message}`);
  }
}
