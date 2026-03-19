export default async function handler(req, res) {
  try {
    const {
      code,
      state
    } = req.query;

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const storedState = getCookie("whop_state");
    const verifier = getCookie("whop_verifier");

    if (!code || !state || !storedState || !verifier || state !== storedState) {
      return res.redirect("/locked.html");
    }

    const clientId = process.env.WHOP_CLIENT_ID;
    const clientSecret = process.env.WHOP_CLIENT_SECRET;
    const redirectUri = process.env.WHOP_REDIRECT_URI;

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
      const errText = await tokenRes.text();
      console.error("Whop token exchange failed:", errText);
      return res.redirect("/locked.html");
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect("/locked.html");
    }

    // Nutzerdaten laden
    const userRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userRes.ok) {
      const errText = await userRes.text();
      console.error("Whop user fetch failed:", errText);
      return res.redirect("/locked.html");
    }

    const userData = await userRes.json();

    // Passe das an deine echte Produkt-ID an
    const productId = process.env.WHOP_PRODUCT_ID;

    // Zugriff auf Produkt prüfen
    const accessRes = await fetch(
      `https://api.whop.com/api/v1/users/${userData.id}/access/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let role = "guest";

    if (accessRes.ok) {
      const accessData = await accessRes.json();

      // robust: verschiedene mögliche Access-Antworten tolerieren
      const hasAccess =
        accessData?.has_access === true ||
        accessData?.access === true ||
        accessData?.access_level === "full" ||
        accessData?.status === "active";

      if (hasAccess) {
        role = "premium";
      }
    } else {
      const errText = await accessRes.text();
      console.error("Whop access check failed:", errText);
    }

    const secure = process.env.NODE_ENV === "production";

    const cookies = [
      `bp_role=${encodeURIComponent(role)}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `bp_email=${encodeURIComponent(userData.email || "")}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_state=; Path=/; HttpOnly; Max-Age=0; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_verifier=; Path=/; HttpOnly; Max-Age=0; ${secure ? "Secure;" : ""} SameSite=Lax`
    ];

    res.setHeader("Set-Cookie", cookies);

    // gekauft = Hub, sonst locked
    return res.redirect(role === "premium" ? "/hub.html" : "/locked.html");
  } catch (error) {
    console.error("Whop callback error:", error);
    return res.redirect("/locked.html");
  }
}
