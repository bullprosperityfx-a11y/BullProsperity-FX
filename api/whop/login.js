export default function handler(req, res) {
  try {
    const clientId = process.env.WHOP_CLIENT_ID;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return res.status(500).send("Missing ENV variables");
    }

    const state = Math.random().toString(36).substring(2);

    const url =
      "https://api.whop.com/oauth/authorize?" +
      new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "openid email",
        state: state
      }).toString();

    return res.redirect(url);

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).send("Login failed");
  }
}
