export default async function handler(req, res) {
  try {
    const { code } = req.query;

    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET
      })
    });

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;

    // 🔥 USER DATEN HOLEN
    const meRes = await fetch("https://api.whop.com/api/v2/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();

    console.log("WHOP ME:", meData);

    const email = meData?.email || "";

    // 🔥 ADMIN CHECK
    let role = "guest";

    if (email === "bullprosperityfx@gmail.com") {
      role = "admin";
    } else {
      role = "premium";
    }

    // 🔥 COOKIES SETZEN (EXTREM WICHTIG)
    res.setHeader("Set-Cookie", [
      `bp_email=${email}; Path=/; HttpOnly; Secure; SameSite=None`,
      `bp_role=${role}; Path=/; HttpOnly; Secure; SameSite=None`
    ]);

    return res.redirect("/");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=login_failed");
  }
}
