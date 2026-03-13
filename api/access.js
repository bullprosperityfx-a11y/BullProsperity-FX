module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const roleMatch = cookie.match(/bp_role=([^;]+)/);
    const role = roleMatch ? decodeURIComponent(roleMatch[1]) : "guest";

    return res.status(200).json({
      ok: true,
      role,
      rawCookie: cookie || "NO_COOKIE"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      role: "guest",
      error: error.message
    });
  }
};
