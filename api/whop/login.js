export default function handler(req, res) {
  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

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
}
