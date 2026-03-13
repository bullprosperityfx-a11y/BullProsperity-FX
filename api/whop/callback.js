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

    // Token von Whop holen
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
      return res.status(500).send("Failed to retrieve access token");
    }

    const accessToken = tokenData.access_token;

    // Whop User Daten abrufen
    const userRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const user = await userRes.json();
    const email = user.email ? user.email.toLowerCase() : null;

    // Membership prüfen
    const membershipRes = await fetch("https://api.whop.com/v5/me/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const memberships = await membershipRes.json();
    const hasMembership = memberships?.data?.length > 0;

    // Admin Emails
    const adminEmails = [
      "bullprosperityfx@gmail.com"
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

    // Cookie setzen
    res.setHeader(
      "Set-Cookie",
      `bp_role=${role}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    return res.redirect("/hub.html");

  } catch (error) {

    console.error(error);

    return res.status(500).send("OAuth callback failed");

  }
};
