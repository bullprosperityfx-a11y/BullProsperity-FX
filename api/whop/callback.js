module.exports = async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Missing OAuth code");
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const cookie = req.headers.cookie || "";
    const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
    const stateMatch = cookie.match(/whop_state=([^;]+)/);

    const codeVerifier = verifierMatch ? verifierMatch[1] : null;
    const storedState = stateMatch ? stateMatch[1] : null;

    if (!codeVerifier) {
      return res.status(400).send("Missing code verifier");
    }

    if (!state || !storedState || state !== storedState) {
      return res.status(400).send("Invalid OAuth state");
    }

    // 1) OAuth Token holen
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
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

    // 2) Userinfo holen
    const userInfoRes = await fetch("https://api.whop.com/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userInfo = await userInfoRes.json();

    if (!userInfoRes.ok) {
      return res.status(500).json({
        error: "Failed to fetch userinfo",
        userInfo
      });
    }

    const email = (userInfo.email || "").toLowerCase();

    // 3) Memberships holen
    const membershipRes = await fetch("https://api.whop.com/api/v5/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const membershipData = await membershipRes.json();

    if (!membershipRes.ok) {
      return res.status(500).json({
        error: "Failed to fetch memberships",
        membershipData
      });
    }

    const memberships = Array.isArray(membershipData?.data)
      ? membershipData.data
      : Array.isArray(membershipData)
      ? membershipData
      : [];

    // Nur aktive Memberships zählen
    const activeMemberships = memberships.filter((membership) => {
      const status = (membership.status || "").toLowerCase();
      return status === "active" || status === "trialing";
    });

    // 4) Admin + Premium Logik
    const adminEmails = [
      "bullprosperityfx@gmail.com"
    ].map((e) => e.toLowerCase());

    let role = "guest";

    if (adminEmails.includes(email)) {
      role = "admin";
    } else if (activeMemberships.length > 0) {
      role = "premium";
    }

    // 5) Cookies setzen
    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`
    ]);

    return res.redirect("/hub.html");
  } catch (error) {
    return res.status(500).json({
      error: "OAuth callback failed",
      message: error.message
    });
  }
};
