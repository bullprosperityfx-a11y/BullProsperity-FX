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

    const codeVerifier = getCookie("whop_verifier");

    // 🔥 TOKEN
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
        code_verifier: codeVerifier
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.log("TOKEN ERROR:", tokenData);
      return res.redirect("/?error=no_token");
    }

    const accessToken = tokenData.access_token;

    // 🔥 USER DATA
    const meRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();

    console.log("WHOP ME:", JSON.stringify(meData, null, 2));

    // 🔥 FIX: EMAIL RICHTIG AUSLESEN
    let email = "";

    if (meData?.email) email = meData.email;
    else if (meData?.user?.email) email = meData.user.email;
    else if (meData?.data?.user?.email) email = meData.data.user.email;

    // 🔥 FALLBACK (WICHTIG!)
    if (!email && meData?.id_token) {
      const payload = JSON.parse(
        Buffer.from(meData.id_token.split(".")[1], "base64").toString()
      );
      email = payload.email || "";
    }

    console.log("FINAL EMAIL:", email);

    // 🍪 COOKIE
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
