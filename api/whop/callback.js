module.exports = async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({
        error: "Missing environment variables",
        WHOP_CLIENT_ID: !!clientId,
        WHOP_CLIENT_SECRET: !!clientSecret,
        WHOP_REDIRECT_URI: !!redirectUri
      });
    }

    const cookie = req.headers.cookie || "";
    const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
    const codeVerifier = verifierMatch ? verifierMatch[1] : null;

    if (!codeVerifier) {
      return res.status(400).json({
        error: "Missing code verifier",
        cookie
      });
    }

    // 1) OAuth Token holen
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
      return res.status(500).json({
        error: "Token exchange failed",
        tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // 2) Whop Userdaten laden
    const userRes = await fetch("https://api.whop.com/api/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = await userRes.json();

    // 3) Memberships laden
    const membershipRes = await fetch("https://api.whop.com/api/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const membershipData = await membershipRes.json();

    // DEBUG-ANTWORT:
    // Diese Ausgabe zeigt dir genau, wo Email / Userdaten wirklich sitzen.
    return res.status(200).json({
      message: "WHOP DEBUG RESPONSE",
      tokenReceived: !!accessToken,
      userStatus: userRes.status,
      membershipStatus: membershipRes.status,
      userData,
      membershipData
    });

  } catch (error) {
    console.error("WHOP CALLBACK DEBUG ERROR:", error);

    return res.status(500).json({
      error: "OAuth callback failed",
      message: error.message,
      stack: error.stack
    });
  }
};
