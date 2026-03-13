module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const roleMatch = cookie.match(/bp_role=([^;]+)/);
    const role = roleMatch ? roleMatch[1] : "guest";

    const isAdmin = role === "admin";
    const hasMembership = role === "premium" || role === "admin";

    return res.status(200).json({
      ok: true,
      role,
      isAdmin,
      hasMembership
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      role: "guest",
      isAdmin: false,
      hasMembership: false
    });
  }
};
