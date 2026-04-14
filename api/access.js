export default function handler(req, res) {
  const cookies = req.headers.cookie || "";

  const getCookie = (name) =>
    cookies
      .split("; ")
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1];

  const email = getCookie("bp_email") || "";
  const role = getCookie("bp_role") || "guest";

  return res.json({
    ok: true,
    role,
    email
  });
}
