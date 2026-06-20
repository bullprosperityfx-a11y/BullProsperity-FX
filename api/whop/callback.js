import crypto from "crypto";

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

    const authHeaders = { Authorization: `Bearer ${accessToken}` };
    const [userinfoRes, legacyMeRes] = await Promise.all([
      fetch("https://api.whop.com/oauth/userinfo", { headers: authHeaders }),
      fetch("https://api.whop.com/v5/me", { headers: authHeaders })
    ]);

    const userinfo = userinfoRes.ok ? await userinfoRes.json() : {};
    const meData = legacyMeRes.ok ? await legacyMeRes.json() : {};

    // 📧 EMAIL ROBUST HOLEN
    let email = "";

    if (userinfo?.email) {
      email = userinfo.email;
    } else if (meData?.email) {
      email = meData.email;
    } else if (meData?.user?.email) {
      email = meData.user.email;
    } else if (meData?.account?.email) {
      email = meData.account.email;
    }

    email = (email || "").toLowerCase().trim();


    const fullName = (
      userinfo?.name ||
      userinfo?.preferred_username ||
      meData?.name ||
      meData?.username ||
      meData?.user?.name ||
      meData?.user?.username ||
      meData?.account?.name ||
      ""
    ).trim();

    const firstName = (
      userinfo?.given_name ||
      meData?.first_name ||
      meData?.firstName ||
      meData?.user?.first_name ||
      meData?.user?.firstName ||
      fullName.split(/\s+/)[0] ||
      ""
    ).trim();

    const memberId = String(
      userinfo?.sub ||
      meData?.id ||
      meData?.user?.id ||
      meData?.account?.id ||
      ""
    ).trim();

    if (!email) {
      return res.redirect("/?error=whop_email_missing");
    }

    // 🎯 ROLE LOGIC
    let role = "guest";

    const adminEmails = String(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map(value => value.trim().toLowerCase())
      .filter(Boolean);

    const memberships = [
      ...(Array.isArray(meData?.access_passes) ? meData.access_passes : []),
      ...(Array.isArray(meData?.memberships) ? meData.memberships : []),
      ...(Array.isArray(meData?.user?.memberships) ? meData.user.memberships : [])
    ];

    const hasActiveMembership = memberships.some(item => {
      const status = String(item?.status || item?.membership_status || "active").toLowerCase();
      return !["expired", "canceled", "cancelled", "inactive", "past_due"].includes(status);
    });

    if (email && (adminEmails.includes(email) || email.includes("bullprosperityfx"))) {
      role = "admin";
    }
    else if (email && hasActiveMembership) {
      role = "premium";
    }


    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`;
    const sessionSecret = process.env.SESSION_SECRET || process.env.WHOP_CLIENT_SECRET;
    const sessionPayload = `${email}|${role}|${memberId}`;
    const sessionSignature = sessionSecret
      ? crypto.createHmac("sha256", sessionSecret).update(sessionPayload).digest("hex")
      : "";

    res.setHeader("Set-Cookie", [
      `bp_email=${encodeURIComponent(email)}; ${cookieOptions}`,
      `bp_role=${role}; ${cookieOptions}`,
      `bp_name=${encodeURIComponent(fullName)}; ${cookieOptions}`,
      `bp_first_name=${encodeURIComponent(firstName)}; ${cookieOptions}`,
      `bp_member_id=${encodeURIComponent(memberId)}; ${cookieOptions}`,
      `bp_session=${encodeURIComponent(sessionSignature)}; ${cookieOptions}`,
      `whop_verifier=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
      `whop_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
    ]);

    // ✅ Weiter in Hub
    return res.redirect("/hub");

  } catch (err) {
    console.error("CALLBACK ERROR:", err);
    return res.redirect("/?error=callback_failed");
  }
}
