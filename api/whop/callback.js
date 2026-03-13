export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: code,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: process.env.WHOP_REDIRECT_URI
      })
    });

    const tokenText = await tokenRes.text();

    if (!tokenText) {
      return res.status(500).json({
        error: "Whop returned empty response"
      });
    }

    const tokenData = JSON.parse(tokenText);

    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userText = await userRes.text();
    const userData = JSON.parse(userText);

    const email = userData.email || "";

    let role = "guest";

    if (email === "DEINE_ADMIN_EMAIL") {
      role = "admin";
    } else {
      role = "premium";
    }

    res.setHeader(
      "Set-Cookie",
      `bp_role=${role}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    res.redirect("/hub.html");

  } catch (err) {
    return res.status(500).json({
      error: "OAuth callback failed",
      message: err.message
    });
  }
}
