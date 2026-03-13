export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({
        error: "Missing OAuth code"
      });
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    const cookie = req.headers.cookie || "";

    const verifierMatch = cookie.match(/whop_verifier=([^;]+)/);
    const stateMatch = cookie.match(/whop_state=([^;]+)/);

    const codeVerifier = verifierMatch ? decodeURIComponent(verifierMatch[1]) : null;
    const storedState = stateMatch ? decodeURIComponent(stateMatch[1]) : null;

    if (!codeVerifier) {
      return res.status(400).json({
        error: "Missing code verifier"
      });
    }

    if (!state || !storedState || state !== storedState) {
      return res.status(400).json({
        error: "Invalid OAuth state"
      });
    }

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

    const tokenText = await tokenRes.text();
    const tokenData = tokenText ? JSON.parse(tokenText) : {};

    if (!tokenRes.ok || !tokenData.access_token) {
      return res.status(500).json({
        error: "Token exchange failed",
        tokenData
      });
    }

    const accessToken = tokenData.access_token;

    const userInfoRes = await fetch("https://api.whop.com/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userInfoText = await userInfoRes.text();
    const userInfo = userInfoText ? JSON.parse(userInfoText) : {};

    if (!userInfoRes.ok) {
      return res.status(500).json({
        error: "Failed to fetch userinfo",
        userInfo
      });
    }

    const email = (userInfo.email || "").toLowerCase();

    const membershipRes = await fetch("https://api.whop.com/api/v5/memberships", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const membershipText = await membershipRes.text();
    const membershipData = membershipText ? JSON.parse(membershipText) : {};

    let memberships = [];

    if (Array.isArray(membershipData?.data)) {
      memberships = membershipData.data;
    } else if (Array.isArray(membershipData)) {
      memberships = membershipData;
    }

    const activeMemberships = memberships.filter((membership) => {
      const status = (membership.status || "").toLowerCase();
      return status === "active" || status === "trialing";
    });

    const adminEmails = [
      "bullprosperityfx@gmail.com"
    ].map((e) => e.toLowerCase());

    let role = "guest";

    if (adminEmails.includes(email)) {
      role = "admin";
    } else if (activeMemberships.length > 0) {
      role = "premium";
    } else {
      role = "guest";
    }

    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
      `whop_verifier=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      `whop_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    ]);

    return res.redirect("/hub.html");
  } catch (error) {
    return res.status(500).json({
      error: "OAuth callback failed",
      message: error.message
    });
  }
}
