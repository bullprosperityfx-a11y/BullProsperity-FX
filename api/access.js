export default async function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";

    const roleMatch = cookie.match(/bp_role=([^;]+)/);
    const emailMatch = cookie.match(/bp_email=([^;]+)/);

    const role = roleMatch ? decodeURIComponent(roleMatch[1]) : "guest";
    const email = emailMatch ? decodeURIComponent(emailMatch[1]) : "";

    return res.status(200).json({
      ok: true,
      role,
      email
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      role: "guest",
      email: "",
      error: error.message
    });
  }
}
