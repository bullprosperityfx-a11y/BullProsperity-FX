export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const roleMatch = cookie.match(/(?:^|;\s*)bp_role=([^;]+)/);
    const emailMatch = cookie.match(/(?:^|;\s*)bp_email=([^;]+)/);

    const role = roleMatch ? decodeURIComponent(roleMatch[1]) : "guest";
    const email = emailMatch ? decodeURIComponent(emailMatch[1]) : "";

    return res.status(200).json({
      ok: true,
      role,
      email,
      isAdmin: role === "admin",
      isPremium: role === "admin" || role === "premium",
      statusLabel:
        role === "admin"
          ? "Admin"
          : role === "premium"
          ? "Premium"
          : "Gast"
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      role: "guest",
      email: "",
      isAdmin: false,
      isPremium: false,
      statusLabel: "Gast",
      error: error.message
    });
  }
}
