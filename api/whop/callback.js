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
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("TOKEN ERROR:", tokenData);
      return res.redirect("/?error=token_failed");
    }

    const accessToken = tokenData.access_token;

    // WICHTIG:
    // Hier die Whop-Me-URL benutzen, die bei dir im funktionierenden Stand lief.
    // Wenn vorher premium angezeigt wurde, dann hat genau diese URL schon funktioniert.
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();
    console.log("WHOP ME:", meData);

    const email =
      (meData?.email || meData?.user?.email || "").toLowerCase().trim();

    let role = "guest";

    // DEINE ADMIN MAIL HIER EXAKT EINTRAGEN
    if (email === "bullprosperityfx@gmail.com") {
      role = "admin";
    } else if (Array.isArray(meData?.memberships) && meData.memberships.length > 0) {
      role = "premium";
    }

    const isProd = process.env.NODE_ENV === "production";

    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; ${isProd ? "Secure;" : ""} SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; ${isProd ? "Secure;" : ""} SameSite=Lax`
    ]);

    return res.redirect("/hub.html");
  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
