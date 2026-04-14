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
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("TOKEN ERROR:", tokenData);
      return res.redirect("/");
    }

    const accessToken = tokenData.access_token;

    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();
    console.log("WHOP ME:", meData);

    const email = (meData?.email || meData?.user?.email || "").toLowerCase().trim();

    let role = "guest";

    if (email === "bullprosperityfx@gmail.com") {
      role = "admin";
    } else if (Array.isArray(meData?.memberships) && meData.memberships.length > 0) {
      role = "premium";
    }

    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; SameSite=Lax`
    ]);

    return res.redirect("/hub.html");
  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/");
  }
}
