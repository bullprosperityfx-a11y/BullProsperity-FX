export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/?error=no_code");
    }

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
      return res.redirect("/?error=no_token");
    }

    const accessToken = tokenData.access_token;

    // 🔥 COOKIE SETZEN
    res.setHeader("Set-Cookie", [
      `whop_access_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      `bp_role=premium; Path=/; Secure; SameSite=Lax`
    ]);

    // 🔥 HIER ENTSCHEIDEND
    return res.redirect("/hub.html");

  } catch (err) {
    return res.redirect("/?error=callback_failed");
  }
}
