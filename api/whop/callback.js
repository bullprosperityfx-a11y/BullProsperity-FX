export default async function handler(req, res) {
  try {
    const { code } = req.query;

    // ❌ Wenn kein Code → zurück zur Startseite
    if (!code) {
      return res.redirect("/");
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
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.log("TOKEN ERROR:", tokenData);
      return res.redirect("/");
    }

    const accessToken = tokenData.access_token;

    // 🔥 USER DATEN HOLEN
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();
    console.log("WHOP USER:", meData);

    // 🔥 EMAIL SAFE AUSLESEN
    const email =
      (meData?.email || meData?.user?.email || "")
        .toLowerCase()
        .trim();

    let role = "guest";

    // 🟡 ADMIN (DEINE MAIL EINTRAGEN!)
    if (email === "bullprosperityfx@gmail.com") {
      role = "admin";
    }

    // 🟢 PREMIUM USER (nur wenn Membership existiert)
    else if (
      Array.isArray(meData?.memberships) &&
      meData.memberships.length > 0
    ) {
      role = "premium";
    }

    // 🔥 COOKIE FIX (INKOGNITO SAFE)
    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; SameSite=Lax`
    ]);

    // ✅ IMMER ZUM HUB
    return res.redirect("/hub.html");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/");
  }
}
