export default function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // DEBUG OUTPUT
    if (!clientId) {
      return res.status(500).send("CLIENT_ID FEHLT");
    }

    if (!redirectUri) {
      return res.status(500).send("REDIRECT_URI FEHLT");
    }

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
    return res.status(500).send("LOGIN CRASH: " + err.message);
  }
}
