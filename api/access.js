export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const normalizeEmail = (value) => (value || "").trim().toLowerCase();

    const adminEmail = "bullprosperityfx@gmail.com";

    let email = normalizeEmail(getCookie("bp_email"));
    const accessToken = getCookie("whop_access_token");

    // 1) Direkter Admin-Bypass über Cookie
    if (email === adminEmail) {
      return res.status(200).json({
        ok: true,
        role: "admin",
        email
      });
    }

    // 2) Falls kein Email-Cookie da ist, aber Token existiert:
    //    User direkt über Whop laden und Email prüfen
    if (accessToken) {
      try {
        const meRes = await fetch("https://api.whop.com/api/v1/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (meRes.ok) {
          const meData = await meRes.json();

          const whopEmail = normalizeEmail(
            meData?.email ||
            meData?.user?.email ||
            meData?.data?.email
          );

          if (whopEmail) {
            email = whopEmail;
          }

          if (email === adminEmail) {
            return res.status(200).json({
              ok: true,
              role: "admin",
              email
            });
          }
        }
      } catch (meErr) {
        console.error("WHOP /me failed:", meErr);
      }
    }

    // 🔥 ADMIN CHECK (ULTRA SAFE FIX)
if (
  email === "bullprosperityfx@gmail.com" ||
  getCookie("bp_email") === "bullprosperityfx@gmail.com"
) {
  return res.status(200).json({
    ok: true,
    role: "admin",
    email: email || "bullprosperityfx@gmail.com"
  });
}
    const productId = process.env.WHOP_PRODUCT_ID;

    let finalRole = "guest";

    if (productId) {
      const check = await fetch(
        `https://api.whop.com/api/v1/me/access/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (check.ok) {
        const data = await check.json();

        if (data?.has_access === true || data?.status === "active") {
          finalRole = "premium";
        }
      }
    }

    return res.status(200).json({
      ok: true,
      role: finalRole,
      email
    });

  } catch (err) {
    console.error("ACCESS API ERROR:", err);

    return res.status(200).json({
      ok: false,
      role: "guest"
    });
  }
}
