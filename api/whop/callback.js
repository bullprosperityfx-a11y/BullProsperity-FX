export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const storedState = getCookie("whop_state");
    const verifier = getCookie("whop_verifier");

    // 🔒 Sicherheitscheck
    if (!code || !state || state !== storedState || !verifier) {
      return res.redirect("/locked.html");
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

    // 🔁 Token holen
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: verifier
      })
    });

    if (!tokenRes.ok) {
      console.error(await tokenRes.text());
      return res.redirect("/locked.html");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 👤 User holen
    const userRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userRes.ok) {
      console.error(await userRes.text());
      return res.redirect("/locked.html");
    }

    const user = await userRes.json();

    // 🔥 HIER PASSIERT DER MAGIC (KAUF CHECK)
    const productId = process.env.WHOP_PRODUCT_ID;

    const accessCheck = await fetch(
      `https://api.whop.com/api/v1/users/${user.id}/access/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let role = "guest";

    if (accessCheck.ok) {
      const data = await accessCheck.json();

      const hasAccess =
        data?.has_access === true ||
        data?.access === true ||
        data?.status === "active" ||
        data?.access_level === "full";

      if (hasAccess) {
        role = "premium";
      }
    } else {
      console.error("Access check failed:", await accessCheck.text());
    }

    const secure = process.env.NODE_ENV === "production";

    // 🍪 COOKIES SETZEN
    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `bp_email=${encodeURIComponent(user.email || "")}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_access_token=${accessToken}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_state=; Path=/; Max-Age=0; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_verifier=; Path=/; Max-Age=0; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`
    ]);

    // 🚀 Weiterleitung
    if (role === "premium") {
      return res.redirect("/hub.html");
    } else {
      return res.redirect("/locked.html");
    }

  } catch (err) {
    console.error("Callback Error:", err);
    return res.redirect("/locked.html");
  }
}
