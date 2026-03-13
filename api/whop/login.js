export default async function handler(req, res) {

  const clientId = process.env.WHOP_CLIENT_ID;
  const redirectUri = process.env.WHOP_REDIRECT_URI;

  const authUrl =
    `https://api.whop.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;

  res.redirect(authUrl);

}
