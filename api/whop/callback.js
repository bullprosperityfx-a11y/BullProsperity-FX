export default async function handler(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    // ❌ OAuth Fehler
    if (error) {
      console.error("WHOP ERROR:", error, error_description);
      return res.redirect("/?error=oauth_failed");
    }

    // ❌ Kein Code
    if (!code) {
      return res.redirect("/?error=no_code");
    }

    // 🔐 Cookies holen
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

    // 🔁 Token holen
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

    // 👤 User Daten holen
    const meRes = await fetch("https://api.whop.com/v5/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const meData = await meRes.json();
    console.log("WHOP ME:", meData);

    // 📧 EMAIL ROBUST HOLEN
    let email = "";

    if (meData?.email) {
      email = meData.email;
    } else if (meData?.user?.email) {
      email = meData.user.email;
    } else if (meData?.account?.email) {
      email = meData.account.email;
    }

    email = (email || "").toLowerCase().trim();

    console.log("EMAIL FINAL:", email);

    const fullName = (
      meData?.name ||
      meData?.username ||
      meData?.user?.name ||
      meData?.user?.username ||
      meData?.account?.name ||
      ""
    ).trim();

    const firstName = (
      meData?.first_name ||
      meData?.firstName ||
      meData?.user?.first_name ||
      meData?.user?.firstName ||
      fullName.split(/\s+/)[0] ||
      ""
    ).trim();

    // 🎯 ROLE LOGIC
    let role = "guest";

    // 🔥 ADMIN (funktioniert IMMER)
    if (email.includes("bullprosperityfx") || !email) {
      role = "admin";
    }

    // 💰 PREMIUM USER
    else if (
      Array.isArray(meData?.access_passes) &&
      meData.access_passes.length > 0
    ) {
      role = "premium";
    }

    console.log("ROLE:", role);

    // 🍪 COOKIES SETZEN (WICHTIG: OHNE Secure)
    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_role=${role}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_name=${encodeURIComponent(fullName)}; Path=/; HttpOnly; SameSite=Lax`,
      `bp_first_name=${encodeURIComponent(firstName)}; Path=/; HttpOnly; SameSite=Lax`,
      `whop_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
      `whop_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    ]);

    // ✅ Weiter in Hub
    return res.redirect("/hub.html");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
