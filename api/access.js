export default function handler(req, res) {
  const cookies = req.headers.cookie || "";

  const getCookie = (name) =>
    cookies
      .split("; ")
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1];

  const email = decodeURIComponent(getCookie("bp_email") || "");
  const role = decodeURIComponent(getCookie("bp_role") || "guest");
  const name = decodeURIComponent(getCookie("bp_name") || "");
  const firstName = decodeURIComponent(getCookie("bp_first_name") || "");
  const memberId = decodeURIComponent(getCookie("bp_member_id") || "");

  return res.json({
    ok: true,
    role,
    email,
    name,
    firstName,
    first_name: firstName,
    memberId
  });
}
