export default async function handler(req, res) {
  try {
    const { code, error, error_description, state } = req.query;

    // 🔥 echten OAuth-Fehler sichtbar machen
    if (error) {
      const msg = encodeURIComponent(
        `${error}${error_description ? `: ${error_description}` : ""}`
      );
      return res.redirect(`/?oauth_error=${msg}`);
    }

    if (!code) {
      return res.redirect("/?oauth_error=no_code_returned");
    }

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const verifier = getCookie("whop_verifier");
    const savedState = getCookie("whop_state");

    if (!verifier) {
      return res.redirect("/?oauth_error=no_verifier_cookie");
    }

    if (savedState && state && savedState !== state) {
      return res.redirect("/?oauth_error=invalid_state");
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
        code_verifier: verifier
      })
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.redirect(
        `/?oauth_error=${encodeURIComponent(
          tokenData.error || "no_token"
        )}`
      );
    }

    const accessToken = tokenData.access_token;

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

    res.setHeader("Set-Cookie", [
      `whop_access_token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; Secure; SameSite=None`,
      `bp_email=${encodeURIComponent(email)}; Path=/; Secure; SameSite=None`,
      `whop_verifier=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`,
      `whop_state=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0`
    ]);

    return res.redirect("/");
  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?oauth_error=callback_failed");
  }
}
