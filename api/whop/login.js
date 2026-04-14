export default function handler(req, res) {
  const clientId = process.env.WHOP_CLIENT_ID;

  const redirectUri =
    "https://bull-prosperity-fx.vercel.app/api/whop/callback";

  const url =
    "https://api.whop.com/oauth/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid email"
    }).toString();

  res.redirect(url);
}
