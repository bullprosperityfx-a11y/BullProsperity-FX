export default async function handler(req, res) {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return res.status(500).send("Missing WHOP_CLIENT_ID or WHOP_REDIRECT_URI");
  }

  const authUrl =
    `https://api.whop.com/oauth/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code&scope=openid%20profile%20email`;

  return res.redirect(authUrl);
}
