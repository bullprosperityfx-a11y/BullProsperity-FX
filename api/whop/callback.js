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

    if (!tokenData.access_token) {
      return res.status(500).send(`No access token returned: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const user = await userRes.json();

    const email =
      user?.email?.toLowerCase() ||
      user?.user?.email?.toLowerCase() ||
      "";

    const membershipRes = await fetch("https://api.whop.com/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const memberships = await membershipRes.json();

    const hasMembership =
      Array.isArray(memberships?.data) ? memberships.data.length > 0 :
      Array.isArray(memberships) ? memberships.length > 0 :
      false;

    const adminEmails = [
      "DEINE_EMAIL_HIER"
    ];

    const isAdmin = adminEmails.includes(email);

    let role = "guest";

    if (isAdmin) {
      role = "admin";
    } else if (hasMembership) {
      role = "premium";
    } else if (email) {
      role = "free";
    }

    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`,
      `bp_email=${encodeURIComponent(email)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`
    ]);

    return res.redirect("/hub.html");
  } catch (error) {
    console.error("WHOP CALLBACK ERROR:", error);
    return res.status(500).send(`OAuth callback failed: ${error.message}`);
  }
};
