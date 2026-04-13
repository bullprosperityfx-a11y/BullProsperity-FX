export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const normalizeEmail = (value) => (value || "").trim().toLowerCase();

    const ADMIN_EMAILS = [
      "bullprosperityfx@gmail.com"
    ];

    const email = normalizeEmail(getCookie("bp_email"));
    const accessToken = getCookie("whop_access_token");

    if (!email || !accessToken) {
      return res.status(200).json({
        ok: true,
        role: "guest",
        email: email || ""
      });
    }

    if (ADMIN_EMAILS.includes(email)) {
      return res.status(200).json({
        ok: true,
        role: "admin",
        email
      });
    }

    const productId = process.env.WHOP_PRODUCT_ID;
    let role = "guest";

    if (productId) {
      try {
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
            role = "premium";
          }
        }
      } catch (e) {
        console.error("WHOP ACCESS CHECK ERROR:", e);
      }
    }

    return res.status(200).json({
      ok: true,
      role,
      email
    });

  } catch (err) {
    console.error("ACCESS API ERROR:", err);

    return res.status(200).json({
      ok: false,
      role: "guest",
      email: ""
    });
  }
}
