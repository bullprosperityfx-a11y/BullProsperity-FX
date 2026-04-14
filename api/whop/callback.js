export default async function handler(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error("WHOP ERROR:", error, error_description);
      return res.redirect("/?error=oauth_failed");
    }

    if (!code) {
      return res.redirect("/?error=no_code");
    }

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const codeVerifier = getCookie("whop_verifier");
    const savedState = getCookie("whop_state");

    if (!codeVerifier) {
      return res.redirect("/?error=no_verifier");
    }

    if (savedState && state && savedState !== state) {
      return res.redirect("/?error=invalid_state");
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
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        code_verifier: codeVerifier
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("TOKEN ERROR:", tokenData);
      return res.redirect("/?error=token_failed");
    }

    const accessToken = tokenData.access_token;

    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();
    console.log("WHOP ME:", meData);

    const email = (
      meData?.email ||
      meData?.user?.email ||
      ""
    ).toLowerCase().trim();

    console.log("EMAIL DEBUG:", email);

    let role = "guest";

    // 🔥 ADMIN FIX (robust – kein exact match Problem mehr)
    if (email.includes("bullprosperityfx")) {
      role = "admin";
    }

    // 🔥 PREMIUM FIX (richtiger Whop Key)
    else if (
      Array.isArray(meData?.access_passes) &&
      meData.access_passes.length > 0
    ) {
      role = "premium";
    }

    // 🔥 COOKIE FIX (wichtig → Secure entfernt)
    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; SameSite=Lax`,
      `whop_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      `whop_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    ]);

    return res.redirect("/hub.html");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
