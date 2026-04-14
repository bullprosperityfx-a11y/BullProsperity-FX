export default function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send("ENV FEHLT");
    }

    const url =
      "https://api.whop.com/oauth/authorize" +
      "?response_type=code" +
      "&client_id=" + encodeURIComponent(clientId) +
      "&redirect_uri=" + encodeURIComponent(redirectUri);

    return res.redirect(url);

  } catch (err) {
    return res.status(500).send("ERROR: " + err.message);
  }
}
