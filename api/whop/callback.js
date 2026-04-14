export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/");
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
      return res.redirect("/");
    }

    const accessToken = tokenData.access_token;

    // 👉 DIESE URL HAT BEI DIR FUNKTIONIERT
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();

    const email =
      meData?.email ||
      meData?.user?.email ||
      "";

    // 👉 HIER WAR DEIN "PREMIUM" LOGIC
    let role = "premium";

    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; SameSite=Lax`
    ]);

    return res.redirect("/hub.html");

  } catch (err) {
    console.error(err);
    return res.redirect("/");
  }
}
