module.exports = async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const cookie = req.headers.cookie || "";
    const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
    const codeVerifier = verifierMatch ? verifierMatch[1] : null;

    if (!codeVerifier) {
      return res.status(400).send("Missing code verifier");
    }

    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).send(`Token exchange failed: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;

    const membershipRes = await fetch("https://api.whop.com/api/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const membershipData = await membershipRes.json();

    const memberships = Array.isArray(membershipData?.data)
      ? membershipData.data
      : Array.isArray(membershipData)
      ? membershipData
      : [];

    const hasMembership = memberships.length > 0;
    const role = hasMembership ? "premium" : "guest";

    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`,
      `whop_access_token=${encodeURIComponent(accessToken)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`
    ]);

    return res.redirect("/hub.html");
  } catch (error) {
    console.error("WHOP CALLBACK ERROR:", error);
    return res.status(500).send(`OAuth callback failed: ${error.message}`);
  }
};
