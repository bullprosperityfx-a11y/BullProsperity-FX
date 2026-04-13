export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect("/?error=no_code");
    }

    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const storedState = getCookie("whop_state");
    const codeVerifier = getCookie("whop_verifier");

    if (!storedState || !state || storedState !== state) {
      return res.redirect("/?error=invalid_state");
    }

    if (!codeVerifier) {
      return res.redirect("/?error=no_verifier");
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
      console.error("NO TOKEN:", tokenData);
      return res.redirect("/?error=no_token");
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
      `whop_access_token=${encodeURIComponent(accessToken)}; Path=/; HttpOnly; Secure; SameSite=Lax`,
      `bp_email=${encodeURIComponent(email)}; Path=/; Secure; SameSite=Lax`,
      `whop_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
      `whop_verifier=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    ]);

    return res.redirect("/");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
