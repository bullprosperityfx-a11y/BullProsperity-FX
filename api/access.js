module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";
    const roleMatch = cookie.match(/bp_role=([^;]+)/);

    const role = roleMatch ? decodeURIComponent(roleMatch[1]) : "guest";

    return res.status(200).json({
      ok: true,
      role
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      role: "guest"
    });
  }
};
