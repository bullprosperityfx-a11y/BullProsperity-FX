export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/?error=no_code");
    }

    // 🔥 TOKEN HOLEN
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: process.env.WHOP_REDIRECT_URI
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.log("NO TOKEN:", tokenData);
      return res.redirect("/?error=no_token");
    }

    const accessToken = tokenData.access_token;

    // 🔥 USER DATEN HOLEN (WICHTIG)
    const meRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();

    console.log("WHOP USER:", meData);

    const email =
      meData?.email ||
      meData?.user?.email ||
      meData?.data?.email ||
      "";

    // 🔥 COOKIE SETZEN (FIXED)
    res.setHeader("Set-Cookie", [
      `whop_access_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=None`,
      `bp_email=${encodeURIComponent(email)}; Path=/; Secure; SameSite=None`
    ]);

    // 🔥 WICHTIG: IMMER ZUR STARTSEITE
    return res.redirect("/");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
