module.exports = async function handler(req, res) {
  try {

    const { code } = req.query;

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const cookie = req.headers.cookie || "";
    const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
    const codeVerifier = verifierMatch ? verifierMatch[1] : null;

    // TOKEN holen
   const params = new URLSearchParams();

params.append("client_id", clientId);
params.append("client_secret", clientSecret);
params.append("code", code);
params.append("grant_type", "authorization_code");
params.append("redirect_uri", redirectUri);
params.append("code_verifier", codeVerifier);

const tokenRes = await fetch("https://api.whop.com/oauth/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: params.toString()
});

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;

    // USER laden
    const userRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = await userRes.json();

    // MEMBERSHIP laden
    const membershipRes = await fetch("https://api.whop.com/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const membershipData = await membershipRes.json();

    return res.status(200).json({
      tokenReceived: true,
      userData,
      membershipData
    });

  } catch (err) {

    return res.status(500).json({
      error: err.message
    });

  }
};
