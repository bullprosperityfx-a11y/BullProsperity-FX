export default async function handler(req, res) {
  try {
    const event = req.body;

    // Debug
    console.log("WHOP WEBHOOK:", JSON.stringify(event, null, 2));

    const userEmail = event?.data?.user?.email;
    const status = event?.data?.status;

    // Beispiel Status:
    // active
    // canceled
    // expired
    // past_due

    let role = "guest";

    if (status === "active") {
      role = "premium";
    }

    // 🍪 Cookie setzen (optional fallback)
    const secure = process.env.NODE_ENV === "production";

    res.setHeader("Set-Cookie", [
      `bp_role=${encodeURIComponent(role)}; Path=/; HttpOnly; ${secure ? "Secure;" : ""} SameSite=Lax`
    ]);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
