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

    if (!code || !state || state !== storedState) {
      return res.redirect("/locked.html");
    }

    // 🔥 TOKEN HOLEN
    const tokenRes = await fetch("https://api.whop.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.WHOP_CLIENT_ID,
        client_secret: process.env.WHOP_CLIENT_SECRET,
        redirect_uri: process.env.WHOP_REDIRECT_URI,
        code,
        code_verifier: verifier
      })
    });

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect("/locked.html");
    }

    // 🔥 USER INFO HOLEN
    const userRes = await fetch("https://api.whop.com/api/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const userData = await userRes.json();
    const email = userData.email || "";

    const secure = process.env.NODE_ENV === "production";

    // 🔥 COOKIES SETZEN
    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_access_token=${accessToken}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`,
      `whop_state=; Path=/; Max-Age=0`,
      `whop_verifier=; Path=/; Max-Age=0`
    ]);

    return res.redirect("/hub.html");

  } catch (err) {
    console.error(err);
    return res.redirect("/locked.html");
  }
}
