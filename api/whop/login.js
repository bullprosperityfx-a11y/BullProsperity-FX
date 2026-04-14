export default function handler(req, res) {
  const url = "https://api.whop.com/oauth/authorize?response_type=code"
    + "&client_id=" + process.env.WHOP_CLIENT_ID
    + "&redirect_uri=" + process.env.WHOP_REDIRECT_URI;

  res.redirect(url);
}
