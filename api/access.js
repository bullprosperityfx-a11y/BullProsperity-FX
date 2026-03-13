module.exports = async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const bpRoleMatch = cookie.match(/bp_role=([^;]+)/);
    const whopRoleMatch = cookie.match(/whop_role=([^;]+)/);
    const emailMatch = cookie.match(/bp_email=([^;]+)/);
    const membershipMatch = cookie.match(/bp_membership=([^;]+)/);

    const role = bpRoleMatch
      ? decodeURIComponent(bpRoleMatch[1])
      : whopRoleMatch
      ? decodeURIComponent(whopRoleMatch[1])
      : "guest";

    const email = emailMatch ? decodeURIComponent(emailMatch[1]) : "";
    const membership = membershipMatch ? decodeURIComponent(membershipMatch[1]) : "false";

    return res.status(200).json({
      ok: true,
      role,
      email,
      hasMembership: membership === "true",
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
