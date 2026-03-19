export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const getCookie = (name) => {
      const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
      return match ? decodeURIComponent(match[1]) : "";
    };

    const email = getCookie("bp_email");

    // 🔥 ADMIN BYPASS (GANZ WICHTIG)
    if (email === "bullprosperityfx@gmail.com") {
      return res.status(200).json({
        ok: true,
        role: "admin",
        email
      });
    }

    // Wenn kein Login vorhanden
    if (!email) {
      return res.status(200).json({
        ok: true,
        role: "guest"
      });
    }

    const accessToken = getCookie("whop_access_token");

    if (!accessToken) {
      return res.status(200).json({
        ok: true,
        role: "guest"
      });
    }

    const productId = process.env.WHOP_PRODUCT_ID;

    const check = await fetch(
      `https://api.whop.com/api/v1/me/access/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    let finalRole = "guest";

    if (check.ok) {
      const data = await check.json();

      if (
        data?.has_access === true ||
        data?.status === "active"
      ) {
        finalRole = "premium";
      }
    }

    return res.status(200).json({
      ok: true,
      role: finalRole,
      email
    });

  } catch (err) {
    console.error(err);

    return res.status(200).json({
      ok: false,
      role: "guest"
    });
  }
}
