export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("/?error=no_code");
    }

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    // 🔥 DAS FEHLT BEI DIR
    const codeVerifier = getCookie("whop_verifier");

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
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        code_verifier: codeVerifier // 🔥 HIER IST DER FIX
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect("/?error=no_token");
    }

    const accessToken = tokenData.access_token;

    // 🔥 USER DATEN
    const meRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();

    const email =
      meData?.email ||
      meData?.user?.email ||
      meData?.data?.email ||
      "";

    // 🍪 COOKIES
    res.setHeader("Set-Cookie", [
      `whop_access_token=${accessToken}; Path=/; HttpOnly; Secure; SameSite=None`,
      `bp_email=${encodeURIComponent(email)}; Path=/; Secure; SameSite=None`
    ]);

    return res.redirect("/hub.html");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
