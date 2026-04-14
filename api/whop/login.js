export default async function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const url =
      "https://api.whop.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email"
      }).toString();

    return res.redirect(url);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
}
